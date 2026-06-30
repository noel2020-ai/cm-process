from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

from app.models.schemas import FileEntry, FilePreview
from app.utils.config import settings
from app.utils.logging import get_logger
from app.utils.validators import SUPPORTED_EXTENSIONS, validate_shared_file_path

logger = get_logger(__name__)


class FileReaderService:
    def __init__(self, shared_folder: str) -> None:
        self.shared_folder = Path(shared_folder).resolve()

    def scan_files(self) -> list[FileEntry]:
        if not self.shared_folder.exists():
            logger.warning("Shared folder does not exist")
            return []

        files: list[FileEntry] = []
        for path in self.shared_folder.rglob("*"):
            if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
                stat = path.stat()
                files.append(
                    FileEntry(
                        name=path.name,
                        relative_path=str(path.relative_to(self.shared_folder)),
                        extension=path.suffix.lower(),
                        size_bytes=stat.st_size,
                        modified_at=pd.Timestamp(stat.st_mtime, unit="s").to_pydatetime(),
                    )
                )
        return sorted(files, key=lambda file_item: file_item.modified_at, reverse=True)

    def read_dataframe(self, relative_path: str) -> pd.DataFrame:
        file_path = validate_shared_file_path(str(self.shared_folder), relative_path)
        logger.info("Reading file %s", file_path.name)
        if file_path.suffix.lower() == ".csv":
            return pd.read_csv(file_path)
        if file_path.suffix.lower() == ".xls":
            return pd.read_excel(file_path, engine="xlrd")
        return pd.read_excel(file_path, engine="openpyxl")

    def preview_file(self, relative_path: str, rows: int = 20) -> FilePreview:
        dataframe = self.read_dataframe(relative_path)
        file_path = validate_shared_file_path(str(self.shared_folder), relative_path)
        entry = FileEntry(
            name=file_path.name,
            relative_path=relative_path,
            extension=file_path.suffix.lower(),
            size_bytes=file_path.stat().st_size,
            modified_at=pd.Timestamp(file_path.stat().st_mtime, unit="s").to_pydatetime(),
        )
        validation_errors = self._validate_dataframe(dataframe)
        cleaned = dataframe.where(pd.notnull(dataframe), None)
        rows_payload = cleaned.head(rows).to_dict(orient="records")
        inferred_types = {column: str(dtype) for column, dtype in cleaned.dtypes.items()}
        return FilePreview(
            file=entry,
            headers=[str(column) for column in cleaned.columns.tolist()],
            inferred_types=inferred_types,
            rows=rows_payload,
            row_count=len(cleaned.index),
            validation_errors=validation_errors,
        )

    def _validate_dataframe(self, dataframe: pd.DataFrame) -> list[str]:
        errors: list[str] = []
        columns = [str(column).strip() for column in dataframe.columns]
        if any(not column for column in columns):
            errors.append("Blank headers are not allowed")
        if len(columns) != len(set(columns)):
            errors.append("Duplicate headers detected")
        if dataframe.empty:
            errors.append("The file has no data rows")

        for column, dtype in dataframe.dtypes.items():
            if "datetime" in str(dtype).lower():
                continue
            sample_values = dataframe[column].dropna().head(20).tolist()
            if sample_values and all(isinstance(value, str) and not value.strip() for value in sample_values):
                errors.append(f"Column '{column}' contains only blank string samples")
        return errors


file_reader_service = FileReaderService(settings.shared_folder_path)

