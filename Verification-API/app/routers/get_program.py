from fastapi import APIRouter, HTTPException
from pathlib import Path
import json
from fastapi.responses import FileResponse



router = APIRouter(
    prefix="/api/v1",
    tags=["Verification"]
)


@router.get("/verification/{request_id}")
async def verify_request(request_id: str):

    cache_dir = Path(__file__).resolve().parent.parent / "cache"

    filename = f"request_{request_id}.json"

    filepath = cache_dir / filename

    # check if request exists
    if not filepath.exists():

        raise HTTPException(
            status_code=404,
            detail=f"Request ID '{request_id}' not found"
        )
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    return data
