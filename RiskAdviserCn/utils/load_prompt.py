import yaml
from pathlib import Path
from config.settings import settings


def load_prompt(prompt_name: str, **kwargs) -> dict:
   
    path = settings.PROMPTS_DIR / f"{prompt_name}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Prompt not found: {path}")

    with open(path, encoding="utf-8") as f:
        raw = yaml.safe_load(f)

    system = raw.get("system", "")
    user   = raw.get("user", "")

    
    for key, value in kwargs.items():
        system = system.replace("{" + key + "}", str(value))
        user   = user.replace("{" + key + "}", str(value))

    return {"system": system.strip(), "user": user.strip()}
