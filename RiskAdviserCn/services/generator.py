"""services/generator.py"""

from utils.load_prompt import load_prompt
from utils.llm_request import llm_request_batch
from config.logging_conf import get_logger

logger = get_logger(__name__)

# 3 sous-objets × 3 risks × ~150 tokens ≈ 1,350 output tokens — safe for 8b
BATCH_SIZE = 3


def generate_risks(
    mission: str,
    context: dict,
    decomposition: list[dict],
    n_risks: int = 3,
) -> list[dict]:

    pairs = []
    for obj in decomposition:
        for sous_objet in obj["sous_objets"]:
            pairs.append({
                "objet_auditable": obj["objet_auditable"],
                "sous_objet":      sous_objet,
            })

    tasks = []
    chunks = [pairs[i: i + BATCH_SIZE] for i in range(0, len(pairs), BATCH_SIZE)]

    for chunk in chunks:
        items_text = "\n".join(
            f"{idx+1}. Objet: {p['objet_auditable']} | Sous-objet: {p['sous_objet']}"
            for idx, p in enumerate(chunk)
        )
        prompt = load_prompt(
            "risk_generation",
            mission=mission,
            libelle_processus=context["libelle_processus"],
            oncf_terms=context["oncf_terms"],
            few_shot_examples=context["few_shot_examples"],
            n_risks=n_risks,
            items=items_text,
        )
        tasks.append({
            "system":      prompt["system"],
            "user":        prompt["user"],
            "temperature": 0.4,
            "max_tokens":  2000,
            "_meta":       {"chunk": chunk},
        })

    logger.info("risk_generation: firing batch",
                total_tasks=len(tasks),
                total_pairs=len(pairs),
                batch_size=BATCH_SIZE)

    batch_results = llm_request_batch(tasks)

    risks: list[dict] = []

    for res in batch_results:
        if res is None:
            continue

        chunk = res.get("_meta", {}).get("chunk", [])
        items = res.get("_items", []) if "_items" in res else (
            res if isinstance(res, list) else []
        )
        pair_by_sous = {p["sous_objet"]: p for p in chunk}

        for risk in items:
            if not isinstance(risk, dict):
                continue
            risk.pop("_meta", None)
            sous = risk.get("sous_objet_auditable", "")
            pair = pair_by_sous.get(sous) or (chunk[0] if chunk else {})
            risk.setdefault("objet_auditable",      pair.get("objet_auditable", ""))
            risk.setdefault("sous_objet_auditable",  pair.get("sous_objet", ""))
            risks.append(risk)

    logger.info("risk_generation_done", total=len(risks))
    return risks