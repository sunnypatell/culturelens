"""application configuration and environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """application settings loaded from environment variables."""

    # api settings
    api_v1_prefix: str = "/api/v1"
    project_name: str = "culturelens"
    version: str = "0.1.0"
    debug: bool = False

    # cors settings
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://culturelens.vercel.app",
    ]

    # elevenlabs
    elevenlabs_api_key: str = ""

    # openai (for future whisper/gpt integration)
    openai_api_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
