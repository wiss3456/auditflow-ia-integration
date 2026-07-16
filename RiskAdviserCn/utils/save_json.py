import json
from pathlib import Path
from config.settings import settings

def save_risk_table(request_id: str, data: dict) -> Path:
  
    folder = settings.OUTPUT_DIR / request_id
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / "risk_table.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return path
def load_risk_table(request_id: str) -> dict | None:
    path = settings.OUTPUT_DIR / request_id / "risk_table.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))

def request_exists(request_id: str) -> bool:
    
    return (settings.OUTPUT_DIR / request_id / "risk_table.json").exists()

      
    
       