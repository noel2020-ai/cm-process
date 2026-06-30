from __future__ import annotations

from datetime import datetime
from io import BytesIO
from typing import Any

import pandas as pd
from sqlalchemy import DateTime, Integer, MetaData, String, Table, Text, func, inspect, or_, select, text, update
from sqlalchemy.orm import Session, Mapped, mapped_column

from app.models.database import Base, SessionLocal, postgres_engine
from app.utils.config import settings
from app.utils.logging import get_logger
from app.utils.validators import sanitize_table_name

logger = get_logger(__name__)
metadata = MetaData(schema=settings.postgres_schema)


class IngestionLog(Base):
    __tablename__ = "ingestion_logs"
    __table_args__ = {"schema": settings.postgres_schema}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(255))
    table_name: Mapped[str] = mapped_column(String(255))
    row_count: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(50))
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ResearchResult(Base):
    __tablename__ = "research_results"
    __table_args__ = {"schema": settings.postgres_schema}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source: Mapped[str] = mapped_column(String(100))
    query: Mapped[str] = mapped_column(String(255))
    title: Mapped[str] = mapped_column(String(500))
    url: Mapped[str] = mapped_column(Text)
    snippet: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PostgresService:
    def __init__(self) -> None:
        self.engine = postgres_engine

    def create_session(self) -> Session:
        return SessionLocal()

    def list_tables(self) -> list[str]:
        return inspect(self.engine).get_table_names(schema=settings.postgres_schema)

    def _get_table(self, table_name: str) -> Table:
        return Table(table_name, MetaData(schema=settings.postgres_schema), autoload_with=self.engine)

    def _next_id_value(self, table_name: str) -> int:
        inspector = inspect(self.engine)
        if not inspector.has_table(table_name, schema=settings.postgres_schema):
            return 1
        table = self._get_table(table_name)
        if "id" not in table.columns:
            return 1
        with self.engine.connect() as connection:
            current_max = connection.execute(select(func.max(table.c.id))).scalar_one_or_none()
            return int(current_max or 0) + 1

    def load_dataframe(self, dataframe: pd.DataFrame, table_name: str, mode: str) -> int:
        normalized_table = sanitize_table_name(table_name)
        if_exists = "append"
        inspector = inspect(self.engine)

        if mode == "overwrite":
            if_exists = "replace"
        elif mode == "truncate_reload":
            with self.engine.begin() as connection:
                if inspector.has_table(normalized_table, schema=settings.postgres_schema):
                    connection.execute(text(f'TRUNCATE TABLE "{settings.postgres_schema}"."{normalized_table}"'))

        dataframe.columns = [sanitize_table_name(str(column)) for column in dataframe.columns]
        dataframe = dataframe.where(pd.notnull(dataframe), None)
        original_count = len(dataframe.index)
        dataframe = dataframe.drop_duplicates().reset_index(drop=True)
        duplicate_count = original_count - len(dataframe.index)
        if duplicate_count:
            logger.info("Dropped %s duplicate rows before loading %s", duplicate_count, normalized_table)
        if "id" not in dataframe.columns:
            start_id = 1 if mode in {"overwrite", "truncate_reload"} else self._next_id_value(normalized_table)
            dataframe.insert(0, "id", range(start_id, start_id + len(dataframe.index)))
        dataframe.to_sql(
            normalized_table,
            self.engine,
            schema=settings.postgres_schema,
            if_exists=if_exists,
            index=False,
            method="multi",
        )
        return len(dataframe.index)

    def log_ingestion(self, filename: str, table_name: str, row_count: int, status: str, error_message: str | None = None) -> None:
        with self.create_session() as session:
            session.add(
                IngestionLog(
                    filename=filename,
                    table_name=table_name,
                    row_count=row_count,
                    status=status,
                    error_message=error_message,
                )
            )
            session.commit()

    def get_logs(self) -> list[dict[str, Any]]:
        with self.engine.connect() as connection:
            result = connection.execute(
                text(
                    f"""
                    SELECT id, filename, table_name, row_count, status, error_message, created_at
                    FROM "{settings.postgres_schema}".ingestion_logs
                    ORDER BY created_at DESC
                    LIMIT 100
                    """
                )
            )
            return [dict(row._mapping) for row in result]

    def fetch_rows(self, table_name: str, search: str | None, limit: int, offset: int) -> dict[str, Any]:
        normalized_table = sanitize_table_name(table_name)
        table = self._get_table(normalized_table)
        query = select(table).limit(limit).offset(offset)
        count_query = select(func.count()).select_from(table)

        if search:
            clauses = [func.cast(column, String).ilike(f"%{search}%") for column in table.columns]
            query = query.where(or_(*clauses))
            count_query = count_query.where(or_(*clauses))

        with self.engine.connect() as connection:
            rows = [dict(row._mapping) for row in connection.execute(query)]
            total = connection.execute(count_query).scalar_one()
            return {"rows": rows, "total": total, "columns": [column.name for column in table.columns]}

    def insert_row(self, table_name: str, record: dict[str, Any]) -> None:
        normalized_table = sanitize_table_name(table_name)
        table = self._get_table(normalized_table)
        with self.engine.begin() as connection:
            if "id" in table.columns and "id" not in record:
                record["id"] = self._next_id_value(normalized_table)
            connection.execute(table.insert().values(record))

    def update_row(self, table_name: str, record_id: int, record: dict[str, Any]) -> None:
        normalized_table = sanitize_table_name(table_name)
        table = self._get_table(normalized_table)
        with self.engine.begin() as connection:
            connection.execute(update(table).where(table.c.id == record_id).values(record))

    def delete_row(self, table_name: str, record_id: int) -> None:
        normalized_table = sanitize_table_name(table_name)
        table = self._get_table(normalized_table)
        with self.engine.begin() as connection:
            connection.execute(table.delete().where(table.c.id == record_id))

    def export_rows(self, table_name: str, format_name: str) -> tuple[bytes, str]:
        dataset = self.fetch_rows(table_name, None, limit=100000, offset=0)
        dataframe = pd.DataFrame(dataset["rows"])
        if format_name == "csv":
            payload = dataframe.to_csv(index=False).encode("utf-8")
            return payload, "text/csv"

        output = BytesIO()
        dataframe.to_excel(output, index=False, engine="openpyxl")
        return output.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    def save_research_results(self, query_text: str, results: list[dict[str, Any]]) -> None:
        with self.create_session() as session:
            for item in results:
                session.add(
                    ResearchResult(
                        source=item["source"],
                        query=query_text,
                        title=item["title"],
                        url=item["url"],
                        snippet=item["snippet"],
                        status=item["status"],
                    )
                )
            session.commit()

    def list_research_results(self) -> list[dict[str, Any]]:
        with self.create_session() as session:
            rows = session.query(ResearchResult).order_by(ResearchResult.created_at.desc()).limit(100).all()
            return [
                {
                    "id": row.id,
                    "source": row.source,
                    "query": row.query,
                    "title": row.title,
                    "url": row.url,
                    "snippet": row.snippet,
                    "status": row.status,
                    "created_at": row.created_at,
                }
                for row in rows
            ]


postgres_service = PostgresService()
