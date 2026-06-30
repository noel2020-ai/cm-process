from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.files import router as files_router
from app.api.postgres_crud import router as postgres_router
from app.api.research import router as research_router
from app.api.sqlserver_readonly import router as sqlserver_router
from app.models.database import Base, postgres_engine
from app.utils.config import settings
from app.utils.logging import configure_logging, get_logger

configure_logging(settings.log_level)
logger = get_logger(__name__)

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(files_router, prefix=settings.api_v1_prefix)
app.include_router(postgres_router, prefix=settings.api_v1_prefix)
app.include_router(sqlserver_router, prefix=settings.api_v1_prefix)
app.include_router(research_router, prefix=settings.api_v1_prefix)


@app.on_event("startup")
def on_startup() -> None:
    with postgres_engine.begin() as connection:
        connection.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{settings.postgres_schema}"'))
    Base.metadata.create_all(bind=postgres_engine)
    logger.info("Application startup complete")


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "success", "message": "Service is healthy", "data": "ok"}
