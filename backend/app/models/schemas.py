from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class ApiResponse(BaseModel):
    status: Literal["success", "error"]
    message: str
    data: Any = None


class FileEntry(BaseModel):
    name: str
    relative_path: str
    extension: str
    size_bytes: int
    modified_at: datetime


class FilePreview(BaseModel):
    file: FileEntry
    headers: list[str]
    inferred_types: dict[str, str]
    rows: list[dict[str, Any]]
    row_count: int
    validation_errors: list[str]


class FileLoadRequest(BaseModel):
    relative_path: str
    table_name: str
    mode: Literal["append", "overwrite", "truncate_reload"] = "append"


class FileLoadResult(BaseModel):
    table_name: str
    filename: str
    row_count: int
    status: str
    errors: list[str] = Field(default_factory=list)


class PostgresTableRequest(BaseModel):
    table_name: str


class PostgresRecordCreate(BaseModel):
    table_name: str
    record: dict[str, Any]


class PostgresRecordUpdate(BaseModel):
    table_name: str
    record_id: int
    record: dict[str, Any]


class PostgresListRequest(BaseModel):
    table_name: str
    search: str | None = None
    limit: int = 100
    offset: int = 0


class SqlServerConnectionInfo(BaseModel):
    use_trusted_connection: bool
    database: str
    host: str
    port: int


class SqlServerQueryRequest(BaseModel):
    query: str


class SqlServerObjectRequest(BaseModel):
    schema_name: str = "dbo"
    object_name: str
    object_type: Literal["table", "view"] = "table"
    limit: int = 100


class SqlServerRelatedTableResult(BaseModel):
    table_name: str
    rows: list[dict[str, Any]]


class ResearchRequest(BaseModel):
    query: str
    max_results: int = 5


class ResearchResultItem(BaseModel):
    source: str
    title: str
    url: str
    snippet: str
    status: str
    searched_at: datetime
