from collections import defaultdict
from config.logging_conf import get_logger

logger = get_logger(__name__)

# Ordre de pertinence décroissant
_EVAL_ORDER = {"Critique": 5, "Très élevé": 4, "Élevé": 3, "Moyen": 2, "Faible": 1}


def _sort_risks(risks: list[dict]) -> list[dict]:
    
    return sorted(risks, key=lambda r: _EVAL_ORDER.get(r.get("evaluation", ""), 0), reverse=True)


def structure_output(
    mission: str,
    context: dict,
    risks: list[dict],
) -> dict:

    
    risks = _sort_risks(risks)

    grouped: dict[str, dict[str, list]] = defaultdict(lambda: defaultdict(list))
    for risk in risks:
        objet      = risk.get("objet_auditable", "Non classifié")
        sous_objet = risk.get("sous_objet_auditable", "Non classifié")
        grouped[objet][sous_objet].append(risk)

    tari_table = []
    for objet, sous_objets in grouped.items():
        objet_entry = {
            "objet_auditable": objet,
            "sous_objets": [],
        }
        for sous_objet, risk_list in sous_objets.items():
            objet_entry["sous_objets"].append({
                "sous_objet_auditable": sous_objet,
                "risques": risk_list,   
            })
        tari_table.append(objet_entry)

    eval_counts = defaultdict(int)
    ctrl_counts = defaultdict(int)
    for r in risks:
        eval_counts[r.get("evaluation", "Non défini")] += 1
        ctrl_counts[r.get("type_controle", "Non défini")] += 1

    stats = {
        "total_risques":           len(risks),
        "total_objets_auditables": len(grouped),
        "total_sous_objets":       sum(len(v) for v in grouped.values()),
        "par_evaluation":          dict(eval_counts),
        "par_type_controle":       dict(ctrl_counts),
    }

    flat_risks = []
    for r in risks:
        flat_risks.append({
            "Objet Auditable":                     r.get("objet_auditable", ""),
            "Sous-Objet Auditable":                r.get("sous_objet_auditable", ""),
            "Objectifs Opérationnels de Contrôle": r.get("objectif_operationnel_controle", ""),
            "Risques":                             r.get("risque", ""),
            "Bonnes Pratiques":                    r.get("bonne_pratique", ""),
            "Likelihood":                          r.get("likelihood", ""),
            "Impact":                              r.get("impact", ""),
            "Évaluation":                          r.get("evaluation", ""),
            "Type de Contrôle":                    r.get("type_controle", ""),
        })

    result = {
        "metadata": {
            "mission":           mission,
            "famille_processus": context["famille_processus"],
            "code_processus":    context["code_processus"],
            "libelle_processus": context["libelle_processus"],
            "mission_type":      context["mission_type"],
            "source_tari":       "ia",
        },
        "statistics":  stats,
        "tari_table":  tari_table,
        "flat_risks":  flat_risks,
    }

    logger.info("structurer: done", total_risks=len(risks), objets=len(tari_table))
    return result