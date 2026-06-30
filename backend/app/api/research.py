from fastapi import APIRouter, HTTPException

from app.models.schemas import ApiResponse, ResearchRequest
from app.services.google_search_service import google_search_service
from app.services.hoovers_service import hoovers_service
from app.services.postgres_service import postgres_service
from app.utils.logging import get_logger

router = APIRouter(prefix="/research", tags=["research"])
logger = get_logger(__name__)


@router.post("/search", response_model=ApiResponse)
def search_sources(request: ResearchRequest) -> ApiResponse:
    try:
        google_results = google_search_service.search(request.query, request.max_results)
        hoovers_results = hoovers_service.search(request.query, request.max_results)
        combined = google_results + hoovers_results
        postgres_service.save_research_results(request.query, combined)
        return ApiResponse(status="success", message="Research completed", data=combined)
    except Exception as exc:
        logger.exception("Research search failed")
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/results", response_model=ApiResponse)
def get_research_results() -> ApiResponse:
    return ApiResponse(status="success", message="Research results retrieved", data=postgres_service.list_research_results())

