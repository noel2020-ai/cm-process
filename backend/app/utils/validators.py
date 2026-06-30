from __future__ import annotations

import re
from pathlib import Path

SUPPORTED_EXTENSIONS = {".xlsx", ".xls", ".csv"}
BLOCKED_SQL_KEYWORDS = {
    "insert",
    "update",
    "delete",
    "drop",
    "alter",
    "truncate",
    "merge",
    "exec",
    "execute",
    "create",
    "replace",
    "grant",
    "revoke",
}


def validate_shared_file_path(base_folder: str, relative_path: str) -> Path:
    base_path = Path(base_folder).resolve()
    candidate = (base_path / relative_path).resolve()
    if not str(candidate).startswith(str(base_path)):
        raise ValueError("Invalid file path")
    if not candidate.exists() or not candidate.is_file():
        raise ValueError("File does not exist")
    if candidate.suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise ValueError("Unsupported file type")
    return candidate


def sanitize_table_name(name: str) -> str:
    sanitized = re.sub(r"[^a-zA-Z0-9_]+", "_", name.strip()).lower()
    sanitized = re.sub(r"_+", "_", sanitized).strip("_")
    if not sanitized:
        raise ValueError("Table name is required")
    return sanitized


def validate_sql_identifier(name: str) -> str:
    cleaned = name.strip()
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", cleaned):
        raise ValueError("Invalid SQL identifier")
    return cleaned


def validate_select_query(query: str) -> str:
    cleaned = query.strip()
    lowered = cleaned.lower()

    if not lowered.startswith("select"):
        raise ValueError("Only SELECT statements are allowed")
    if ";" in cleaned.rstrip(";"):
        raise ValueError("Multiple SQL statements are not allowed")
    if re.search(r"--|/\*|\*/", cleaned):
        raise ValueError("Commented SQL is not allowed")
    if any(re.search(rf"\b{re.escape(keyword)}\b", lowered) for keyword in BLOCKED_SQL_KEYWORDS):
        raise ValueError("Blocked SQL keyword detected")
    return cleaned.rstrip(";")
