from pydantic import BaseModel
from typing import Dict, List, Any

class GenerateRequest(BaseModel):
    mission_id: str
    final_risk_table: Dict[str, Any]

class VerificationTask(BaseModel):
    tache: str
    objectif: str
    methodologie: str

class VerificationProgram(BaseModel):
    mission_id: str
    tasks: List[VerificationTask]