"""
services/decomposer.py  — Étape 2
----------------------------------
"""
from utils.load_prompt import load_prompt
from utils.llm_request import llm_request
from config.logging_conf import get_logger

logger = get_logger(__name__)


def decompose(mission: str, context: dict) -> list[dict]:
    """
    Validates and enriches the decomposition: process → auditable sub-objects.

    Parameters
    ----------
    mission : audit mission title
    context : dict returned by context_loader.load_context()

    Returns
    -------
    list of dicts:
      [{"objet_auditable": str, "sous_objets": [str, ...]}, ...]

    Flow
    ----
    1. Load decomposition.yaml prompt with injected ONCF context
    2. Single Groq call to validate/enrich sub-objects
    3. On failure → fallback to taxonomy.yaml directly
    """
    prompt = load_prompt(
        "decomposition",
        mission=mission,
        libelle_processus=context["libelle_processus"],
        oncf_terms=context["oncf_terms"],
        objets_auditables_json=context["objets_json"],
    )

    result = llm_request(
        system=prompt["system"],
        user=prompt["user"],
        temperature=0.3,
        max_tokens=2000,
    )

    if result and isinstance(result, list):
        logger.info("decomposer: groq ok", objets=len(result))
        return result

    logger.warning("decomposer: groq failed, using taxonomy fallback")
    return [
        {
            "objet_auditable": obj["label"],
            "sous_objets":     obj["sous_objets"],
        }
        for obj in context["objets_auditables"]
    ]