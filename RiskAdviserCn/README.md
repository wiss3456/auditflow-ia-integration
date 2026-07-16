# RiskAdvisor_API

> Internal audit risk generation API  process decomposition, LLM-driven risk generation, normalization, control mapping and GRC export.

---

## Table of contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Pipeline](#pipeline)
- [Project structure](#project-structure)
- [Tech stack](#tech-stack)
- [Environment variables](#environment-variables)
- [Running the API](#running-the-api)
- [Endpoints](#endpoints)
- [Output schema](#output-schema)
- [Risk taxonomy](#risk-taxonomy)
- [Prompt templates](#prompt-templates)
- [Future improvements](#future-improvements)

---

## Overview

RiskAdvisor API generates a structured audit risk table (TARI) from a mission name and a list of process steps. It runs a 7-stage pipeline:

1. Receive mission + process list as JSON
2. Decompose each process into audit sub-objects (LLM)
3. Generate risks per sub-object using a risk taxonomy (LLM)
4. Normalize risks into standard audit language
5. Map mitigation controls and best practices (LLM)
6. Structure everything into a nested `tari_table`
7. Persist as JSON  ready for Excel  export

**Main use case:** generate a complete, normalized audit risk table for any mission in seconds, with full traceability from process → sub-object → risk → control.

---

## Architecture

```
FastAPI layer     →  exposes /gen_risks and /get_risks
Services layer    →  decomposer → generator → controls → structurer
Utils layer       →  LLM request wrapper, prompt loader, JSON persistence
Prompt layer      →  YAML templates for each LLM call
Data layer        →  domain glossary + process taxonomy for context injection
Cache / storage   →  output/<request_id>/risk_table.json
```

 F
 low:

```
Mission + Process[]
  → Process decomposition       (services/decomposer.py)
  → Risk generation             (services/generator.py)
  → Risk normalization          (inline, prompt-driven)
  → Control mapping             (services/controls.py)
  → Structuring                 (services/structurer.py)
  → output/<request_id>/risk_table.json
```

---

## Pipeline

| Stage | Service | Description |
|-------|---------|-------------|
| 1 — Input | `main.py` | Validates `mission` (non-empty string) and `process[]` (non-empty array) |
| 2 — Process decomposition | `services/decomposer.py` | LLM expands each process step into audit sub-objects using `prompts/decomposition.yaml` |
| 3 — Risk generation | `services/generator.py` | For each sub-object, LLM generates typed risks using `prompts/risk_generation.yaml` + domain context from `data/` |
| 4 — Risk normalization | prompt-driven | Standardizes wording — "Risque de…", one cause per risk, no vague language, consistent format |
| 5 — Control mapping | `services/controls.py` | Second LLM call via `prompts/controls.yaml` — adds `bonne_pratique`, `type_controle`, `outil_mecanisme` per risk |
| 6 — Structuring | `services/structurer.py` | Assembles `metadata`, `statistics`, and nested `tari_table`; computes likelihood/impact/evaluation scores |
| 7 — Output | `utils/save_json.py` | Persists `risk_table.json` under `output/<request_id>/` and returns the `request_id` |

---

## Project structure

```
RiskAdvisor_API/
  data/
    oncf_glossary.yaml           # domain glossary injected into prompts
    process_taxonomy.yaml        # process taxonomy reference (APQC / ITIL / ISO9001)
  output/
    risk_id/
      risk_table.json
    risk_id/
      risk_table.json
  prompts/
    controls.yaml                # control + best practice generation prompt
    decomposition.yaml           # process → sub-objects prompt
    risk_generation.yaml         # sub-objects → risks prompt
  services/
    context_loader.py            # loads data/ context into LLM prompts
    controls.py                  # enrich_with_controls(mission, risks) → list[dict]
    decomposer.py                # decompose_process(mission, process) → list[str]
    generator.py                 # generate_risks(mission, sub_objects) → list[dict]
    structurer.py                # build_tari_table(...) → final output dict
  tests/
  utils/
    llm_request.py               # LLM call wrapper (prompt → response)
    load_prompt.py               # YAML prompt loader
    save_json.py                 # output/<request_id>/ persistence
  main.py                        # FastAPI app entry point
  .env
  requirements.txt
  runtime.txt
```

---

## Tech stack

| Component | Library |
|-----------|---------|
| API framework | FastAPI + Uvicorn |
| LLM provider | OpenAI API |
| Excel export | Pandas + OpenPyXL |
| Prompt templates | PyYAML |
| Environment variables | python-dotenv |
| GRC integrations | ServiceNow, Archer, Riskonnect (export-ready JSON) |

---
## Authentication
API key header: X-API-Key
The server compares it to environment variable API_key.
Example header:
X-API-Key: <your_api_key>
## Environment variables

Create a `.env` file at the project root:

```env
API_key=your_api_key_here
LLM_API_key=your_llm_key
```

| Variable | Purpose |
|----------|---------|
| `API_key` | FastAPI auth — compared against `X-API-Key` header on every request |
| `LLM_API_KEY` | OpenAI LLM key used by all three generation stages |

---

## Running the API

```bash
uvicorn main:app --reload
```

API available at `http://localhost:8090`.

---

## Endpoints

All endpoints require:

```
X-API-Key: <your_api_key>
```

Returns `403 Forbidden` if the key is missing or invalid.

---

### `GET /health`

Health check — no auth required.

**Response**
```json
{"status": "ok"}
```

---

### `POST /gen_risks`

Run the full pipeline. Returns a `request_id` you use to fetch the result.

**Request body**

```json
{
  "mission": "Audit de la communication de crise",
  "process": [
    "Activation de la cellule de crise",
    "Production des messages",
    "Validation des messages",
    "Diffusion multi-canal",
    "Gestion des retours externes"
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mission` | string | ✓ | Audit mission name — must not be empty |
| `process` | string[] | ✓ | Process steps to analyse — must not be empty |

**Example**

```bash
curl -X POST "http://localhost:8090/gen_risks" \
  -H "X-API-Key: your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "mission": "Audit de la communication de crise",
    "process": ["Activation de la cellule de crise", "Production des messages"]
  }'
```

**Response**

```json
{"request_id": "1521"}
```

The result is saved at `output/1521/risk_table.json`.

**Errors**

| Code | Reason |
|------|--------|
| `403` | Invalid API key |
| `422` | Empty `mission` or `process` list |
| `500` | LLM or pipeline failure |

---

### `GET /get_risks`

Fetch the generated risk table for a `request_id`.

**Query parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `request_id` | string | ✓ | ID returned by `/gen_risks` |

**Example**

```bash
curl "http://localhost:8090/get_risks?request_id=1521" \
  -H "X-API-Key: your_key"
```

**Errors**

| Code | Reason |
|------|--------|
| `403` | Invalid API key |
| `404` | `output/<request_id>/risk_table.json` not found |

---

## Output schema

```json
{
  "metadata": {
    "mission": "Audit de la communication de crise",
    "famille_processus": "Support",
    "code_processus": "S4",
    "libelle_processus": "S4 — Communication",
    "mission_type": "communication_de_crise",
    "source_tari": "ia"
  },
  "statistics": {
    "total_risques": 60,
    "total_objets_auditables": 3,
    "total_sous_objets": 30,
    "par_evaluation": {
      "Élevé": 31,
      "Critique": 17,
      "Moyen": 12
    },
    "par_type_controle": {
      "Préventif": 60
    }
  },
  "tari_table": [
    {
      "objet_auditable": "Pré-crise (Anticipation)",
      "sous_objets": [
        {
          "sous_objet_auditable": "Cartographie des crises",
          "risques": [
            {
              "objet_auditable": "...",
              "sous_objet_auditable": "...",
              "objectif_operationnel_controle": "...",
              "risque": "Risque de ...",
              "bonne_pratique": "...",
              "likelihood": "Modéré",
              "impact": "Majeur",
              "evaluation": "Élevé",
              "type_controle": "Préventif",
              "taches_verification": []
            }
          ]
        }
      ]
    }
  ]
}
```

### Field reference

**metadata**

| Field | Description |
|-------|-------------|
| `mission` | Audit mission name |
| `famille_processus` | Process family (e.g. "Support") |
| `code_processus` | Process code (e.g. "S4") |
| `libelle_processus` | Process label |
| `mission_type` | Slug identifier for the mission type |
| `source_tari` | `"ia"` for LLM-generated |

**statistics**

| Field | Description |
|-------|-------------|
| `total_risques` | Total number of risks generated |
| `total_objets_auditables` | Number of top-level auditable objects |
| `total_sous_objets` | Total sub-objects across all objects |
| `par_evaluation` | Risk count by severity level |
| `par_type_controle` | Risk count by control type |

**risk object (inside `tari_table[].sous_objets[].risques[]`)**

| Field | Values | Description |
|-------|--------|-------------|
| `objet_auditable` | string | Top-level auditable object |
| `sous_objet_auditable` | string | Decomposed sub-object |
| `objectif_operationnel_controle` | string | Operational control objective |
| `risque` | string | Normalized risk — always starts with "Risque de…" |
| `bonne_pratique` | string | Mitigation best practice |
| `likelihood` | `Faible` / `Modéré` / `Élevé` | Probability of occurrence |
| `impact` | `Modéré` / `Majeur` / `Critique` | Severity of impact |
| `evaluation` | `Moyen` / `Élevé` / `Critique` | Combined risk score |
| `type_controle` | `Préventif` / `Détectif` | Control type |
| `taches_verification` | array | Verification tasks — empty by default |

---

## Risk taxonomy

The risk generation stage uses the following risk types:

| Type | Description |
|------|-------------|
| Execution risk | Risk of failing to carry out the process correctly |
| Quality risk | Risk of substandard outputs or deliverables |
| Compliance risk | Risk of non-conformance with regulations or standards |
| Communication risk | Risk of information gaps or miscommunication |
| Control risk | Risk that existing controls are absent or ineffective |

Risk normalization rules enforced by prompt:
- Must start with **"Risque de…"**
- One risk = one cause (no compound risks)
- No vague wording
- Consistent audit language throughout

---

## Prompt templates

| File | Stage | Description |
|------|-------|-------------|
| `prompts/decomposition.yaml` | Stage 2 | Expands a process step into audit sub-objects |
| `prompts/risk_generation.yaml` | Stage 3 | Generates typed risks per sub-object using domain context |
| `prompts/controls.yaml` | Stage 5 | Maps mitigation controls and best practices to each risk |

Domain context from `data/oncf_glossary.yaml` and `data/process_taxonomy.yaml` is injected into prompts by `services/context_loader.py`.

---

## Future improvements

- Excel (XLSX) export endpoint via Pandas + OpenPyXL
- GRC push endpoint (ServiceNow / Archer / Riskonnect)
- PowerBI-ready dataset export
- RACI matrix generation per mission
- Streaming LLM responses
- Pydantic request models for stronger input validation
- Dedicated test suite under `tests/`