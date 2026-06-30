from fastapi import APIRouter, HTTPException

from app.models.schemas import ApiResponse, SqlServerObjectRequest, SqlServerQueryRequest, SqlServerRelatedSearchRequest
from app.services.sqlserver_service import sqlserver_service
from app.utils.logging import get_logger

router = APIRouter(prefix="/sqlserver", tags=["sqlserver"])
logger = get_logger(__name__)


@router.get("/connection", response_model=ApiResponse)
def get_connection_info() -> ApiResponse:
    return ApiResponse(status="success", message="Connection info retrieved", data=sqlserver_service.connection_info())


@router.post("/query", response_model=ApiResponse)
def run_readonly_query(request: SqlServerQueryRequest) -> ApiResponse:
    try:
        results = sqlserver_service.execute_select(request.query)
        return ApiResponse(status="success", message="Query executed", data=results)
    except Exception as exc:
        logger.exception("SQL Server query failed")
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/object", response_model=ApiResponse)
def read_object(request: SqlServerObjectRequest) -> ApiResponse:
    try:
        results = sqlserver_service.read_object(
            request.schema_name,
            request.object_name,
            request.object_type,
            request.limit,
        )
        return ApiResponse(status="success", message="Object read succeeded", data=results)
    except Exception as exc:
        logger.exception("SQL Server object read failed")
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/related/{master_id}", response_model=ApiResponse)
def read_related_records(master_id: str, limit: int = 100) -> ApiResponse:
    try:
        results = sqlserver_service.get_related_by_master_id(master_id, limit)
        return ApiResponse(status="success", message="Related records retrieved", data=results)
    except Exception as exc:
        logger.exception("SQL Server related lookup failed")
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/related-search", response_model=ApiResponse)
def search_related_records(request: SqlServerRelatedSearchRequest) -> ApiResponse:
    try:
        criteria = request.normalized_criteria()
        logger.info("SQL Server related-search payload received: %s", criteria)
        if not criteria:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "At least one search criterion is required",
                    "received_payload": {
                        "name": request.name,
                        "address": request.address,
                        "parent_id": request.parent_id,
                        "limit": request.limit,
                    },
                    "normalized_criteria": criteria,
                },
            )
        results = sqlserver_service.search_related_records(request)
        return ApiResponse(status="success", message="Related records retrieved", data=results)
    except Exception as exc:
        logger.exception("SQL Server criteria lookup failed")
        if isinstance(exc, HTTPException):
            raise exc
        raise HTTPException(
            status_code=400,
            detail={
                "message": str(exc),
                "received_payload": {
                    "name": request.name,
                    "address": request.address,
                    "parent_id": request.parent_id,
                    "limit": request.limit,
                },
                "normalized_criteria": request.normalized_criteria(),
            },
        ) from exc
