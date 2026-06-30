from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.utils.config import settings


class Base(DeclarativeBase):
    pass


postgres_engine = create_engine(settings.postgres_url, future=True, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=postgres_engine, autoflush=False, autocommit=False, future=True)

