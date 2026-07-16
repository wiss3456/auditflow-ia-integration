from uuid import uuid4
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from pathlib import Path
import json
from app.models.shemas import GenerateRequest 
from app.services.verification_generator import VerificationGenerator

router = APIRouter(
    prefix="/api/v1",
    tags=["Verification"]
)

generator = VerificationGenerator()



@router.post("/verification/generate")
async def generate_verification_program(
    request: str
) :

    try:

        request_id = str(uuid4().hex)[:4]
        Filename = f"request_{request_id}.json" 

        path = Path(__file__).resolve().parent.parent / "cache"
        path.mkdir(parents=True, exist_ok=True)


        program = await generator.generate(
            mission_id=request.mission_id,
            risk_table=request.final_risk_table
        )

        filepath = path / Filename
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(program, f, ensure_ascii=False, indent=2)
        print(f"✅ program saved: {filepath}")



        return {
            "request_id": request_id,
            # "mission_id": request.mission_id,
            # "total_tasks": len(program),
            # "tasks": program
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération : {str(e)}"
        )