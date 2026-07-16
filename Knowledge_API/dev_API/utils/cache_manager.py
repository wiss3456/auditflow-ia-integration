import json 
import time 
from pathlib import Path 

# Cache directory relative to the Knowledge_api root, not current working directory
CACHE_DIR = Path(__file__).resolve().parent.parent / "cache"


def get_cache_path(mission_id:str,filename)-> Path:
    return CACHE_DIR / mission_id / f"{filename}.json"



def save_cache(mission_id:str,filename:str,data:dict[str,list])-> None:
    cache_dir = get_cache_path(mission_id,filename)
    cache_dir.parent.mkdir(parents=True,exist_ok=True)

    with open(cache_dir,"w",encoding="utf-8") as f :
        json.dump(data, f,indent=4,ensure_ascii=False)
    

def load_cache(mission_id:str,filename:str):
    path = get_cache_path(mission_id,filename)

    if not Path(path).exists():
        raise FileExistsError(
            f"the {filename} does not exist in location {path}")

    with open(path,"r",encoding="utf-8") as f :
        data = json.load(f)
    return data

def clear_cache(max_time):
    """
    """
    
    return None

