from __future__ import annotations

from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL

from app.models.schemas import SqlServerConnectionInfo, SqlServerRelatedTableResult
from app.utils.config import settings
from app.utils.logging import get_logger
from app.utils.validators import validate_select_query, validate_sql_identifier

logger = get_logger(__name__)


class SqlServerService:
    def _engine(self):
        return create_engine(self._build_connection_url(), future=True, pool_pre_ping=True)

    def _build_connection_url(self) -> URL:
        query_params = {
            "driver": settings.sqlserver_driver,
            "TrustServerCertificate": "yes",
        }
        if settings.sqlserver_trusted_connection:
            query_params["trusted_connection"] = "yes"
            return URL.create(
                "mssql+pyodbc",
                host=settings.sqlserver_host,
                port=settings.sqlserver_port,
                database=settings.sqlserver_database,
                query=query_params,
            )
        return URL.create(
            "mssql+pyodbc",
            username=settings.sqlserver_username or None,
            password=settings.sqlserver_password or None,
            host=settings.sqlserver_host,
            port=settings.sqlserver_port,
            database=settings.sqlserver_database,
            query=query_params,
        )

    def connection_info(self) -> SqlServerConnectionInfo:
        return SqlServerConnectionInfo(
            use_trusted_connection=settings.sqlserver_trusted_connection,
            database=settings.sqlserver_database,
            host=settings.sqlserver_host,
            port=settings.sqlserver_port or 0,
        )

    def execute_select(self, query: str) -> list[dict]:
        safe_query = validate_select_query(query)
        with self._engine().connect() as connection:
            result = connection.execute(text(safe_query))
            return [dict(row._mapping) for row in result]

    def read_object(self, schema_name: str, object_name: str, object_type: str, limit: int) -> list[dict]:
        safe_schema = validate_sql_identifier(schema_name)
        safe_object = validate_sql_identifier(object_name)
        safe_query = (
            f"SELECT TOP {int(limit)} * FROM [{safe_schema}].[{safe_object}]"
            if object_type in {"table", "view"}
            else ""
        )
        return self.execute_select(safe_query)

    def get_related_by_master_id(self, master_id: str, limit: int = 100) -> list[SqlServerRelatedTableResult]:
        master_key = validate_sql_identifier(settings.sqlserver_master_id_column)
        results: list[SqlServerRelatedTableResult] = []
        with self._engine().connect() as connection:
            for table_ref in settings.sqlserver_related_tables[:3]:
                parts = table_ref.split(".", 1)
                if len(parts) != 2:
                    raise ValueError(f"Invalid related table configuration: {table_ref}")
                schema_name = validate_sql_identifier(parts[0])
                table_name = validate_sql_identifier(parts[1])
                query = text(
                    f"SELECT TOP {int(limit)} * FROM [{schema_name}].[{table_name}] WHERE [{master_key}] = :master_id"
                )
                rows = [dict(row._mapping) for row in connection.execute(query, {"master_id": master_id})]
                results.append(
                    SqlServerRelatedTableResult(
                        table_name=f"{schema_name}.{table_name}",
                        rows=rows,
                    )
                )
        return results


sqlserver_service = SqlServerService()
