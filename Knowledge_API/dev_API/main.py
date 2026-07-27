from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from dotenv import load_dotenv
from typing import Optional
import json
from datetime import datetime
from sentence_transformers import SentenceTransformer, CrossEncoder

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Knowledge API",
    description="API pour générer des dossiers de connaissances (RAG pipeline)",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("API_key", "test_api_key_123")
logger.info(f"API_KEY: {'*' * len(API_KEY)}")

# --- modèles chargés une seule fois au démarrage ---
emb_model: SentenceTransformer | None = None
encoder_model: CrossEncoder | None = None

@app.on_event("startup")
async def load_models():
    global emb_model, encoder_model
    logger.info("Loading embedding and cross-encoder models...")
    emb_model = SentenceTransformer("all-MiniLM-L6-v2")
    encoder_model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
    logger.info("Models loaded successfully.")


def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Invalid API Key"
        )
    return x_api_key

class KnowledgeRequest(BaseModel):
    mission_id: str
    mission_topic: str
    max_results: Optional[int] = 10

class RegenerateRequest(BaseModel):
    mission_id: str
    mission_topic: str

class DossierResponse(BaseModel):
    status: str
    mission_id: str
    knowledge_dossier: dict
    generated_at: Optional[str] = None

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "Knowledge_API",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/initail_generation", response_model=DossierResponse)
async def initial_generation(
    mission_id: str,
    mission_topic: str,
    api_key: str = Depends(verify_api_key)
):
    try:
        logger.info(f"Initial generation: mission_id={mission_id}, topic={mission_topic}")

        from dev_API.orchestrater import initial_generation_pipeline

        result = initial_generation_pipeline(mission_id, mission_topic, emb_model, encoder_model)

        logger.info(f"Generation completed for mission_id={mission_id}")

        return {
            "status": "success",
            "mission_id": mission_id,
            "knowledge_dossier": result,
            "generated_at": datetime.now().isoformat()
        }

    except ImportError as e:
        logger.error(f"Import error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Module import error: {str(e)}. Vérifiez que tous les fichiers existent."
        )
    except FileNotFoundError as e:
        logger.error(f"File not found: {str(e)}")
        raise HTTPException(
            status_code=404,
            detail=f"Fichier non trouvé: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération: {str(e)}"
        )

@app.get("/get_Knowledge_dossier", response_model=DossierResponse)
async def get_knowledge_dossier(
    mission_id: str,
    api_key: str = Depends(verify_api_key)
):
    try:
        logger.info(f"Fetching dossier for mission_id={mission_id}")

        from dev_API.utils.cache_manager import load_knowledge_dossier

        dossier = load_knowledge_dossier(mission_id)

        if dossier is None:
            raise HTTPException(
                status_code=404,
                detail=f"Dossier not found for mission_id='{mission_id}'"
            )

        return {
            "status": "success",
            "mission_id": mission_id,
            "knowledge_dossier": dossier,
            "generated_at": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except ImportError as e:
        logger.error(f"Import error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Module import error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error fetching dossier: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération: {str(e)}"
        )

@app.post("/regenate_Knowledge", response_model=DossierResponse)
async def regenerate_knowledge(
    mission_id: str,
    mission_topic: str,
    api_key: str = Depends(verify_api_key)
):
    try:
        logger.info(f"Regenerating dossier: mission_id={mission_id}")

        from dev_API.orchestrater import regeneration_pipeline

        result = regeneration_pipeline(mission_id, mission_topic, emb_model, encoder_model)

        logger.info(f"Regeneration completed for mission_id={mission_id}")

        return {
            "status": "success",
            "mission_id": mission_id,
            "knowledge_dossier": result,
            "generated_at": datetime.now().isoformat()
        }

    except FileNotFoundError as e:
        logger.error(f"Cache not found: {str(e)}")
        raise HTTPException(
            status_code=404,
            detail=f"Cache not found: {str(e)}"
        )
    except ImportError as e:
        logger.error(f"Import error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Module import error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Regeneration error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la régénération: {str(e)}"
        )

@app.delete("/delete_Knowledge_dossier")
async def delete_knowledge_dossier(
    mission_id: str,
    api_key: str = Depends(verify_api_key)
):
    try:
        logger.info(f"Deleting dossier for mission_id={mission_id}")

        from dev_API.utils.cache_manager import delete_knowledge_dossier

        result = delete_knowledge_dossier(mission_id)

        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Dossier not found for mission_id='{mission_id}'"
            )

        return {
            "status": "success",
            "mission_id": mission_id,
            "message": f"Dossier supprimé avec succès"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting dossier: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )

@app.get("/list_missions")
async def list_missions(
    api_key: str = Depends(verify_api_key)
):
    try:
        logger.info("Listing all missions")

        from dev_API.utils.cache_manager import list_mission_dossiers

        missions = list_mission_dossiers()

        return {
            "status": "success",
            "total": len(missions),
            "missions": missions
        }

    except Exception as e:
        logger.error(f"Error listing missions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération des missions: {str(e)}"
        )

@app.get("/metrics")
async def get_metrics(
    api_key: str = Depends(verify_api_key)
):
    try:
        logger.info("Fetching metrics")

        from dev_API.utils.cache_manager import get_metrics

        metrics = get_metrics()

        return {
            "status": "success",
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Error fetching metrics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération des métriques: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8001))

    uvicorn.run(
        "dev_API.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )