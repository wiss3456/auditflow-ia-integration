from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    N_RISKS_PER_SUBOBJECT: int = 2

    GROQ_REQUESTS_PER_MIN: int = 27    # leave ~10% headroom below hard limit
    GROQ_MAX_WORKERS:      int = 1     # 1 = safe for free tier; raise on paid

    TAXONOMY_PATH: Path = BASE_DIR / "data" / "process_taxonomy.yaml"
    GLOSSARY_PATH: Path = BASE_DIR / "data" / "oncf_glossary.yaml"
    PROMPTS_DIR:   Path = BASE_DIR / "prompts"
    OUTPUT_DIR:    Path = BASE_DIR / "output"

    CACHE_ENABLED: bool = True


settings = Settings()