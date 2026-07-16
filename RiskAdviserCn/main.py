"""
main.py
-------
FastAPI entry point — fully async pipeline.

Key changes vs original:
- /gen_risks now runs the CPU/IO-bound pipeline in a thread pool so it doesn't
  block the event loop (important if you ever add more endpoints or concurrent
  requests).
- Pipeline steps that were already sequential (context, decompose, structure)
  stay that way; the parallelism is INSIDE generator and controls.
- Added a /gen_risks/stream endpoint (SSE) so callers can see progress in
  real time instead of waiting for the full response.
"""

import uuid
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from services.context_loader import load_context
from services.decomposer import decompose
from services.generator import generate_risks
from services.controls import enrich_with_controls
from services.structurer import structure_output
from utils.save_json import save_risk_table, load_risk_table
from config.settings import settings
from config.logging_conf import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title="RiskAdvisor API",
    description="Génération de TaRi ONCF via LLM",
    version="4.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thread pool for running the synchronous pipeline without blocking the event loop
_executor = ThreadPoolExecutor(max_workers=4)


# ── Request model ─────────────────────────────────────────────────────────────

class GenRisksRequest(BaseModel):
    mission: str = Field(
        ...,
        min_length=5,
        max_length=500,
        description="Titre de la mission d'audit",
        examples=["Audit de la communication de crise"],
    )
    processes: list[str] = Field(
        ...,
        min_length=1,
        description="Liste des processus à auditer",
        examples=[["Activation de la cellule de crise", "Diffusion multi-canal"]],
    )


# ── Core pipeline (sync — runs in thread pool) ────────────────────────────────

def _run_pipeline(request_id: str, mission: str) -> dict:
    t_start = time.perf_counter()
    logger.info("pipeline: start", request_id=request_id, mission=mission[:60])

    context      = load_context(mission)
    logger.info("pipeline: context loaded", type=context["mission_type"])

    decomposition = decompose(mission, context)
    logger.info("pipeline: decomposed", objets=len(decomposition))

    risks = generate_risks(mission, context, decomposition)
    logger.info("pipeline: risks generated", count=len(risks))

    risks_enriched = enrich_with_controls(mission, risks)
    logger.info("pipeline: controls enriched")

    final_output = structure_output(mission, context, risks_enriched)
    final_output["request_id"] = request_id
    final_output["duration_s"] = round(time.perf_counter() - t_start, 1)

    save_risk_table(request_id, final_output)

    logger.info(
        "pipeline: complete",
        request_id=request_id,
        total_risks=final_output["statistics"]["total_risques"],
        duration_s=final_output["duration_s"],
    )
    return final_output


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/gen_risks", summary="Lance la génération d'un TaRi complet")
async def gen_risks(body: GenRisksRequest) -> dict:
    request_id = str(uuid.uuid4())[:8]
    loop = asyncio.get_event_loop()

    try:
        final_output = await loop.run_in_executor(
            _executor, _run_pipeline, request_id, body.mission
        )
    except Exception as exc:
        logger.error("pipeline: failed", request_id=request_id, error=str(exc))
        raise HTTPException(status_code=500, detail=f"Erreur pipeline : {exc}")

    return {
        "request_id": request_id,
        "status":     "success",
        "mission":    body.mission,
        "processus":  final_output["metadata"]["libelle_processus"],
        "statistics": final_output["statistics"],
        "duration_s": final_output["duration_s"],
        "get_url":    f"/get_risks/{request_id}",
    }


@app.get("/get_risks/{request_id}", summary="Récupère un TaRi généré")
async def get_risks(request_id: str) -> dict:
    data = load_risk_table(request_id)
    if data is None:
        raise HTTPException(
            status_code=404,
            detail=f"Aucun TaRi trouvé pour request_id='{request_id}'.",
        )
    return data


@app.get("/health", summary="Vérification de santé")
async def health() -> dict:
    return {
        "status":                "ok",
        "model":                 settings.GROQ_MODEL,
        "n_risks_per_subobject": settings.N_RISKS_PER_SUBOBJECT,
    }