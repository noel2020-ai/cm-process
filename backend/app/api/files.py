from fastapi import APIRouter, HTTPException

from app.models.schemas import ApiResponse, FileLoadRequest
from app.services.file_reader import file_reader_service
from app.services.postgres_service import postgres_service
from app.utils.logging import get_logger

router = APIRouter(prefix="/files", tags=["files"])
logger = get_logger(__name__)


@router.get("/scan", response_model=ApiResponse)
def scan_shared_folder() -> ApiResponse:
    files = file_reader_service.scan_files()
    return ApiResponse(status="success", message="Files scanned", data=files)


@router.get("/preview", response_model=ApiResponse)
def preview_file(relative_path: str) -> ApiResponse:
    try:
        preview = file_reader_service.preview_file(relative_path)
        return ApiResponse(status="success", message="File preview loaded", data=preview)
    except Exception as exc:
        logger.exception("File preview failed")
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/load", response_model=ApiResponse)
def load_file(request: FileLoadRequest) -> ApiResponse:
    row_count = 0
    try:
        dataframe = file_reader_service.read_dataframe(request.relative_path)
        row_count = postgres_service.load_dataframe(dataframe, request.table_name, request.mode)
        postgres_service.log_ingestion(request.relative_path, request.table_name, row_count, "success")
        return ApiResponse(
            status="success",
            message="File loaded into PostgreSQL",
            data={
                "table_name": request.table_name,
                "filename": request.relative_path,
                "row_count": row_count,
                "status": "success",
                "errors": [],
            },
        )
    except Exception as exc:
        postgres_service.log_ingestion(request.relative_path, request.table_name, row_count, "error", str(exc))
        logger.exception("File load failed")
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/logs", response_model=ApiResponse)
def list_load_logs() -> ApiResponse:
    return ApiResponse(status="success", message="Load logs retrieved", data=postgres_service.get_logs())

