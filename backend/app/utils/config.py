from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    app_name: str = "Operations Data Dashboard"
    api_v1_prefix: str = "/api/v1"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    frontend_origin: str = "http://localhost:5173"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])
    shared_folder_path: str = "C:/shared/data"
    postgres_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/operations_dashboard"
    postgres_schema: str = "public"
    sqlserver_host: str = "localhost"
    sqlserver_port: int = 1433
    sqlserver_database: str = "source_db"
    sqlserver_driver: str = "ODBC Driver 18 for SQL Server"
    sqlserver_trusted_connection: bool = True
    sqlserver_username: str = ""
    sqlserver_password: str = ""
    sqlserver_master_id_column: str = "MasterId"
    sqlserver_related_tables: list[str] = Field(default_factory=lambda: ["dbo.related_table_one", "dbo.related_table_two", "dbo.related_table_three"])
    google_search_api_key: str = ""
    google_search_engine_id: str = ""
    hoovers_api_base_url: str = ""
    hoovers_api_key: str = ""
    log_level: str = "INFO"
    config_yaml_path: str = ""

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> list[str] | Any:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("sqlserver_related_tables", mode="before")
    @classmethod
    def parse_related_tables(cls, value: Any) -> list[str] | Any:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


def _load_yaml_overrides(path: str) -> dict[str, Any]:
    if not path:
        return {}

    config_path = Path(path)
    if not config_path.exists():
        return {}

    with config_path.open("r", encoding="utf-8") as config_file:
        data = yaml.safe_load(config_file) or {}

    return data if isinstance(data, dict) else {}


settings = Settings()
yaml_overrides = _load_yaml_overrides(settings.config_yaml_path)
if yaml_overrides:
    settings = Settings(**yaml_overrides)
