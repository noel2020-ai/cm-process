from __future__ import annotations

from datetime import datetime

import requests

from app.utils.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)


class GoogleSearchService:
    SEARCH_URL = "https://www.googleapis.com/customsearch/v1"

    def search(self, query: str, max_results: int) -> list[dict]:
        if not settings.google_search_api_key or not settings.google_search_engine_id:
            return [
                {
                    "source": "google",
                    "title": "Search API not configured",
                    "url": "",
                    "snippet": "Provide Google API credentials in the environment to enable live search.",
                    "status": "not_configured",
                    "searched_at": datetime.utcnow(),
                }
            ]

        response = requests.get(
            self.SEARCH_URL,
            params={
                "key": settings.google_search_api_key,
                "cx": settings.google_search_engine_id,
                "q": query,
                "num": min(max_results, 10),
            },
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
        items = payload.get("items", [])
        return [
            {
                "source": "google",
                "title": item.get("title", ""),
                "url": item.get("link", ""),
                "snippet": item.get("snippet", ""),
                "status": "success",
                "searched_at": datetime.utcnow(),
            }
            for item in items
        ]


google_search_service = GoogleSearchService()

