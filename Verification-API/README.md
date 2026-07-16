Architecture:
```
FastAPI Layer
    │
    ▼
API Routes (/verification, /get_program)
    │
    ▼
Verification Service (verification_generator.py)
    │
    ▼
Prompt Engine (generate_verification.yaml)
    │
    ▼
LLM Provider (Grok)
    │
    ▼
JSON Formatter
    │
    ▼
Cache Storage (cache/request_id.json)
```
Flow:
```
Mission ID + Final Risk Table
    │
    ▼
POST /verification
    │
    ▼
Prompt Construction
    │
    ▼
LLM Generation (Grok)
    │
    ▼
Verification Tasks Generation
    │
    ▼
JSON Formatting
    │
    ▼
cache/request_id.json
    │
    ▼
GET /get_program

```
Project Structure:
```
ASHAUDITFLOW-VERIFICATION-SERVICE/

app/
├── cache/
│   └── request_xxxx.json
├── models/
│   └── schemas.py
├── prompts/
│   └── generate_verification.yaml
├── routers/
│   ├── verification.py
│   └── get_program.py
├── services/
│   └── verification_generator.py
├── config.py
├── main.py

.env
requirements.txt
run.py

```
Tech Stack:
| Composant     | Technologie   |
| ------------- | ------------- |
| API Framework | FastAPI       |
| IA Générative | Grok LLM      |
| Validation    | Pydantic      |
| Configuration | Python-dotenv |
| Stockage      | JSON Cache    |
| Serveur       | Uvicorn       |



Pipeline:
```
le microservice exécute les étapes suivantes :

1-Réception du Mission ID et de la table finale des risques.
2-Validation de la requête via les schémas Pydantic.
3-Chargement du prompt depuis generate_verification.yaml.
4-Envoi du contexte au modèle Grok.
5-Génération des tâches de vérification.
6-Structuration des résultats en JSON.
7-Sauvegarde dans le dossier cache.
8-Consultation via l'endpoint GET
```
Endpoints:
```
Vérifie la disponibilité du service.
	Response:
{
  "status": "ok"
}

POST /verification:
Génère un programme de vérification.
	Request:
{
  "mission_id": "1001",
  "final_risk_table": {}
}
	Response:
{
  "request_id": "a57a"
}
```
GET /get_program:
```
Récupère le programme généré.
	Request :
GET /get_program?request_id=a57a
	Response :
{
  "mission_id": "1001",
  "tasks": [
    {
      "tache": "...",
      "objectif": "...",
      "methodologie": "..."
    }
  ]
}
```
Diagramme d'architecture professionnel pour le rapport:
```
AuditFlow Platform
        │
        ▼
Verification API (FastAPI)
        │
        ▼
Routers (verification.py, get_program.py)
        │
        ▼
Verification Service
        │
        ▼
Prompt Layer (YAML Templates)
        │
        ▼
Grok LLM
        │
        ▼
JSON Cache (request_id.json)
```
