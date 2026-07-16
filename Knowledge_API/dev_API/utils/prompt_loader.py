import yaml
from pathlib import Path
from fastapi import HTTPException
import os

def load_prompt(prompt_name: str):
    """
    Loads a prompt YAML file from the prompt/ folder by name.
    Args:
        prompt_name (str): The filename without .yaml extension.
        e.g. "prompt_expansion"
    Returns:
        dict: The prompt content with keys: key, desc, system, prompt.
    Raises:
        FileNotFoundError: If the prompt file does not exist.
    """
    BASE_DIR = Path(__file__).resolve().parent.parent
    prompt_path = os.path.join(BASE_DIR, "prompt", f"{prompt_name}.yaml")

    if not os.path.exists(prompt_path):
        raise HTTPException(
            status_code=404,
            detail=f"Prompt file not found: {prompt_path}")

    with open(prompt_path, "r") as f:
        prompt = yaml.safe_load(f)

    return prompt
