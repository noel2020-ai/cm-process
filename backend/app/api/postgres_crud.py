from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

from app.models.schemas import ApiResponse, PostgresRecordCreate, PostgresRecordUpdate
from app.services.postgres_service import postgres_service
from app.utils.logging import get_logger

router = APIRouter(prefix="/postgres", tags=["postgres"])
logger = get_logger(__name__)


@router.get("/tables", response_model=ApiResponse)
def list_tables() -> ApiResponse:
    return ApiResponse(status="success", message="Tables retrieved", data=postgres_service.list_tables())


@router.get("/records/{table_name}", response_model=ApiResponse)
def get_records(table_name: str, search: str | None = None, limit: int = Query(default=100, le=1000), offset: int = 0) -> ApiResponse:
    try:
        data = postgres_service.fetch_rows(table_name, search, limit, offset)
        return ApiResponse(status="success", message="Records retrieved", data=data)
    except Exception as exc:
        logger.exception("PostgreSQL fetch failed")
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/records", response_model=ApiResponse)
def create_record(request: PostgresRecordCreate) -> ApiResponse:
    try:
        postgres_service.insert_row(request.table_name, request.record)
        return ApiResponse(status="success", message="Record created", data=None)
    except Exception as exc:
        logger.exception("PostgreSQL create failed")
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.put("/records", response_model=ApiResponse)
def update_record(request: PostgresRecordUpdate) -> ApiResponse:
    try:
        postgres_service.update_row(request.table_name, request.record_id, request.record)
        return ApiResponse(status="success", message="Record updated", data=None)
    except Exception as exc:
        logger.exception("PostgreSQL update failed")
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/records/{table_name}/{record_id}", response_model=ApiResponse)
def delete_record(table_name: str, record_id: int) -> ApiResponse:
    try:
        postgres_service.delete_row(table_name, record_id)
        return ApiResponse(status="success", message="Record deleted", data=None)
    except Exception as exc:
        logger.exception("PostgreSQL delete failed")
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/export/{table_name}")
def export_records(table_name: str, format_name: str = Query(pattern="^(csv|xlsx)$")) -> Response:
    try:
        payload, content_type = postgres_service.export_rows(table_name, format_name)
        extension = "csv" if format_name == "csv" else "xlsx"
        return Response(
            content=payload,
            media_type=content_type,
            headers={"Content-Disposition": f'attachment; filename="{table_name}.{extension}"'},
        )
    except Exception as exc:
        logger.exception("PostgreSQL export failed")
        raise HTTPException(status_code=400, detail=str(exc)) from exc

