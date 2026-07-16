"""services/controls.py"""

from utils.load_prompt import load_prompt
from utils.llm_request import llm_request_batch
from config.logging_conf import get_logger

logger = get_logger(__name__)


BATCH_SIZE = 8


def enrich_with_controls(
    mission: str,
    risks: list[dict],
) -> list[dict]:

    
    chunks = [risks[i: i + BATCH_SIZE] for i in range(0, len(risks), BATCH_SIZE)]
    tasks  = []

    for chunk_idx, chunk in enumerate(chunks):
        risks_text = "\n".join(
            f"{idx+1}. Objet: {r.get('objet_auditable','')} | "
            f"Sous-objet: {r.get('sous_objet_auditable','')} | "
            f"Risque: {r.get('risque','')}"
            for idx, r in enumerate(chunk)
        )
        prompt = load_prompt(
            "controls",
            mission=mission,
            risks=risks_text,
        )
        tasks.append({
            "system":      prompt["system"],
            "user":        prompt["user"],
            "temperature": 0.3,
            "max_tokens":  2000,
            "_meta":       {"chunk_idx": chunk_idx, "chunk": chunk},
        })

    logger.info("controls: firing batched calls",
                total_risks=len(risks),
                total_tasks=len(tasks),
                batch_size=BATCH_SIZE)

    batch_results = llm_request_batch(tasks)

   
    enriched = [dict(r) for r in risks]

    for res in batch_results:
        if res is None:
            continue

        meta      = res.get("_meta", {})
        chunk_idx = meta.get("chunk_idx", 0)
        base_i    = chunk_idx * BATCH_SIZE

        items = res.get("_items", []) if "_items" in res else (
            res if isinstance(res, list) else []
        )

        for local_i, enrichment in enumerate(items):
            if not isinstance(enrichment, dict):
                continue
            global_i = base_i + local_i
            if global_i >= len(enriched):
                break
            risk = enriched[global_i]
            risk["type_controle"]       = enrichment.get("type_controle", "Préventif")
            risk["bonne_pratique"]      = enrichment.get(
                "bonne_pratique_enrichie", risk.get("bonne_pratique", "")
            )
           
            

    logger.info("controls_done", total=len(enriched))
    return enriched