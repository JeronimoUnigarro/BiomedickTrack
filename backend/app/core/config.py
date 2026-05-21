from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "BiomedicTrack API"
    api_prefix: str = "/api"
    environment: str = "development"
    debug: bool = Field(default=True, validation_alias="APP_DEBUG")

    database_url: str = Field(
        default="mysql+pymysql://biomedic:biomedic@localhost:3306/biomedictrack"
    )

    jwt_secret_key: str = Field(default="change-me-in-production")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 480

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    dev_2fa_code: str | None = "123456"
    two_factor_expire_minutes: int = 10
    frontend_url: str = "http://localhost:5173"
    recovery_token_ttl_minutes: int = 30
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_secure: bool = False
    smtp_user: str | None = None
    smtp_pass: str | None = None
    smtp_from: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
