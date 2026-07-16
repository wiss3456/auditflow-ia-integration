from fastapi import FastAPI
from app.routers.verification import router as router1
from app.routers.get_program import router as router2   # ← C'est ici que ça plante   # ← C'est ici que ça plante
from app.config import settings

app = FastAPI(
    title="AuditFlow - Verification Program Microservice",
    version="1.0.0",
    description="Génération automatique de programmes de vérification"
)

app.include_router(router1)
app.include_router(router2)

@app.get("/")
async def health_check():
    return {
        "status": "running",
        "service": "verification-program"
    }