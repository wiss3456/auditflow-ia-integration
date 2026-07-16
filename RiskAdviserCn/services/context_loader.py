import yaml
import json
from pathlib import Path
from config.settings import settings
from config.logging_conf import get_logger

logger = get_logger(__name__)

def _load_yaml(path: Path) -> dict | list:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)
def _detect_mission_type(mission: str, taxonomy: dict) -> dict:
   
    mission_lower = mission.lower()
    best_match = None
    best_score = 0

    for mission_type in taxonomy["missions"]:
        if mission_type["type"] == "generique":
            continue
        score = sum(1 for kw in mission_type["keywords"] if kw.lower() in mission_lower)
        if score > best_score:
            best_score = score
            best_match = mission_type

    if best_match is None:
       
        best_match = next(m for m in taxonomy["missions"] if m["type"] == "generique")
        logger.warning("context_loader: no match, using generique", mission=mission[:60])
    else:
        logger.info("context_loader: detected", type=best_match["type"], score=best_score)

    return best_match


def _build_oncf_terms(glossary: dict) -> str:
    lines = []
    for category, terms in glossary.items():
        if category in ("few_shot_risks", "familles_processus"):
            continue
        if isinstance(terms, dict):
            for abbr, definition in terms.items():
                lines.append(f"- {abbr.replace('_', ' ')}: {definition}")
    return "\n".join(lines)


def _build_few_shot(glossary: dict) -> str:
   
    examples = glossary.get("few_shot_risks", [])
    parts = []
    for ex in examples:
        parts.append(
            f"Exemple :\n"
            f"  Objet : {ex['objet']}\n"
            f"  Sous-objet : {ex['sous_objet']}\n"
            f"  Risque : {ex['risque']}\n"
            f"  Objectif contrôle : {ex['objectif_controle']}\n"
            f"  Bonne pratique : {ex['bonne_pratique']}"
        )
    return "\n\n".join(parts)


def load_context(mission: str) -> dict:
    
    taxonomy = _load_yaml(settings.TAXONOMY_PATH)
    glossary = _load_yaml(settings.GLOSSARY_PATH)

    mission_config = _detect_mission_type(mission, taxonomy)
    oncf_terms     = _build_oncf_terms(glossary)
    few_shot       = _build_few_shot(glossary)

    return {
        "mission_type":      mission_config["type"],
        "famille_processus": mission_config["famille_processus"],
        "code_processus":    mission_config["code_processus"],
        "libelle_processus": mission_config["libelle_processus"],
        "objets_auditables": mission_config["objets_auditables"],
        "oncf_terms":        oncf_terms,
        "few_shot_examples": few_shot,
        "objets_json":       json.dumps(
            mission_config["objets_auditables"],
            ensure_ascii=False, indent=2
        ),
    }
