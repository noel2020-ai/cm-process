from __future__ import annotations

from datetime import datetime

import requests

from app.utils.config import settings


class HooversService:
    def search(self, query: str, max_results: int) -> list[dict]:
        if not settings.hoovers_api_base_url or not settings.hoovers_api_key:
            return [
                {
                    "source": "hoovers",
                    "title": "Integration placeholder",
                    "url": "",
                    "snippet": "Configure the official integration credentials to enable this source.",
                    "status": "not_configured",
                    "searched_at": datetime.utcnow(),
                }
            ]

        response = requests.get(
            f"{settings.hoovers_api_base_url.rstrip('/')}/search",
            params={"query": query, "limit": max_results},
            headers={"Authorization": f"Bearer {settings.hoovers_api_key}"},
            timeout=20,
        )
        response.raise_for_status()
        payload = response.json()
        return [
            {
                "source": "hoovers",
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "snippet": item.get("snippet", ""),
                "status": "success",
                "searched_at": datetime.utcnow(),
            }
            for item in payload.get("items", [])
        ]


hoovers_service = HooversService()

