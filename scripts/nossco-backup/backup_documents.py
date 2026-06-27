#!/usr/bin/env python3
"""
NOSSCO Nexxus document backup script.

Fetches ComplianceDocument records directly from Base44, downloads files
from file_url, and uploads them to a date-stamped Google Drive subfolder.

Primary backup route: Base44 -> Google Drive (no Supabase required).

Required environment variables:
  BASE44_API_TOKEN          Base44 API token (or Base44_API_Token)
  GOOGLE_CREDENTIALS_FILE   Service account JSON path (default: google-credentials.json)

Optional environment variables:
  BASE44_APP_ID             Default: 6a1ae5a11195cab07d9a51af (NOSSCO Nexxus)
  BASE44_ENTITY             Default: ComplianceDocument
  BASE44_API_BASE           Default: https://base44.app/api/apps
  GOOGLE_DRIVE_FOLDER_ID    Default: 1saHGqanqHjrapVHUv0WaJ15cmuQcil0N
  BACKUP_CHUNK_SIZE         Stream chunk size in bytes (default: 262144)
  BACKUP_DRY_RUN            Set to "1" to list actions without uploading
  BACKUP_MANIFEST           Set to "0" to skip manifest.json upload (default: upload)

Usage:
  pip install -r scripts/nossco-backup/requirements.txt
  export BASE44_API_TOKEN=...
  export GOOGLE_DRIVE_FOLDER_ID=1saHGqanqHjrapVHUv0WaJ15cmuQcil0N
  python3 scripts/nossco-backup/backup_documents.py
"""

from __future__ import annotations

import json
import logging
import mimetypes
import os
import re
import sys
from dataclasses import dataclass
from datetime import date, datetime, timezone
from io import BytesIO
from pathlib import Path
from typing import Any, BinaryIO, Iterator, Mapping, Optional
from urllib.parse import urlparse

import requests
from dotenv import load_dotenv
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

load_dotenv()

LOG = logging.getLogger("nossco-backup")

DEFAULT_APP_ID = "6a1ae5a11195cab07d9a51af"
DEFAULT_ENTITY = "ComplianceDocument"
DEFAULT_API_BASE = "https://base44.app/api/apps"
DEFAULT_CREDENTIALS = "google-credentials.json"
DEFAULT_DRIVE_FOLDER = "1saHGqanqHjrapVHUv0WaJ15cmuQcil0N"
DEFAULT_CHUNK_SIZE = 256 * 1024

URL_FIELD_CANDIDATES = (
    "file_url",
    "legacy_file_url",
    "document_url",
    "url",
    "storage_url",
)

METADATA_FIELDS = (
    "id",
    "title",
    "document_type",
    "document_number",
    "vendor_id",
    "vendor_name",
    "vendor_email",
    "status",
    "verification_status",
    "issue_date",
    "expiry_date",
    "created_date",
    "updated_date",
    "file_url",
)


@dataclass(frozen=True)
class DocumentSource:
    kind: str  # "url"
    value: str
    mime_type: Optional[str] = None
    filename_hint: Optional[str] = None


@dataclass(frozen=True)
class BackupConfig:
    base44_app_id: str
    base44_entity: str
    base44_api_base: str
    base44_token: str
    credentials_file: Path
    drive_folder_id: str
    chunk_size: int
    dry_run: bool
    upload_manifest: bool
    backup_date: str


class HTTPStreamReader:
    """File-like reader over a streaming HTTP response body."""

    def __init__(self, response: requests.Response, chunk_size: int) -> None:
        self._iterator: Iterator[bytes] = response.iter_content(chunk_size=chunk_size)
        self._buffer = b""
        self._closed = False

    def read(self, size: int = -1) -> bytes:
        if self._closed:
            return b""

        if size is None or size < 0:
            chunks = [self._buffer]
            self._buffer = b""
            for chunk in self._iterator:
                if chunk:
                    chunks.append(chunk)
            self._closed = True
            return b"".join(chunks)

        while len(self._buffer) < size:
            try:
                chunk = next(self._iterator)
            except StopIteration:
                self._closed = True
                break
            if chunk:
                self._buffer += chunk

        result, self._buffer = self._buffer[:size], self._buffer[size:]
        return result

    def close(self) -> None:
        self._closed = True


def parse_config() -> BackupConfig:
    base44_token = (
        os.getenv("BASE44_API_TOKEN")
        or os.getenv("Base44_API_Token")
        or os.getenv("BASE44_API_KEY")
        or ""
    ).strip()
    if not base44_token:
        raise SystemExit(
            "Missing BASE44_API_TOKEN. Set your Base44 API token from the dashboard."
        )

    credentials_file = Path(
        os.getenv("GOOGLE_CREDENTIALS_FILE", DEFAULT_CREDENTIALS)
    ).expanduser()
    drive_folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID", DEFAULT_DRIVE_FOLDER).strip()
    chunk_size = int(os.getenv("BACKUP_CHUNK_SIZE", str(DEFAULT_CHUNK_SIZE)))
    dry_run = os.getenv("BACKUP_DRY_RUN", "").strip().lower() in {"1", "true", "yes"}
    upload_manifest = os.getenv("BACKUP_MANIFEST", "1").strip().lower() not in {
        "0",
        "false",
        "no",
    }

    return BackupConfig(
        base44_app_id=os.getenv("BASE44_APP_ID", DEFAULT_APP_ID).strip(),
        base44_entity=os.getenv("BASE44_ENTITY", DEFAULT_ENTITY).strip(),
        base44_api_base=os.getenv("BASE44_API_BASE", DEFAULT_API_BASE).strip().rstrip("/"),
        base44_token=base44_token,
        credentials_file=credentials_file,
        drive_folder_id=drive_folder_id,
        chunk_size=chunk_size,
        dry_run=dry_run,
        upload_manifest=upload_manifest,
        backup_date=date.today().isoformat(),
    )


def slugify(value: str, fallback: str = "unknown") -> str:
    cleaned = re.sub(r"[^\w\s.-]", "", value, flags=re.UNICODE).strip()
    cleaned = re.sub(r"\s+", "_", cleaned)
    return cleaned[:80] if cleaned else fallback


def guess_extension(
    mime_type: Optional[str],
    url: Optional[str] = None,
    filename_hint: Optional[str] = None,
) -> str:
    if filename_hint:
        suffix = Path(filename_hint).suffix
        if suffix:
            return suffix

    if url:
        path_suffix = Path(urlparse(url).path).suffix
        if path_suffix:
            return path_suffix

    if mime_type:
        ext = mimetypes.guess_extension(mime_type.split(";")[0].strip())
        if ext:
            return ext

    return ".bin"


def first_present(record: Mapping[str, Any], keys: tuple[str, ...]) -> Optional[Any]:
    lowered = {str(k).lower(): v for k, v in record.items()}
    for key in keys:
        value = record.get(key)
        if value is None:
            value = lowered.get(key.lower())
        if value not in (None, "", "null"):
            return value
    return None


def resolve_document_source(record: Mapping[str, Any]) -> Optional[DocumentSource]:
    file_url = first_present(record, URL_FIELD_CANDIDATES)
    if not isinstance(file_url, str) or not file_url.strip():
        return None
    if file_url.strip().startswith("https://example.com"):
        return None

    mime_type = first_present(record, ("mime_type",))
    filename_hint = first_present(record, ("original_filename", "file_name", "filename"))
    if not filename_hint:
        filename_hint = Path(urlparse(file_url).path).name

    return DocumentSource(
        kind="url",
        value=file_url.strip(),
        mime_type=str(mime_type) if mime_type else None,
        filename_hint=str(filename_hint) if filename_hint else None,
    )


def build_drive_service(credentials_file: Path):
    if not credentials_file.is_file():
        raise SystemExit(
            f"Google credentials file not found: {credentials_file}. "
            "Save your service account JSON as google-credentials.json or set "
            "GOOGLE_CREDENTIALS_FILE."
        )

    credentials = service_account.Credentials.from_service_account_file(
        str(credentials_file),
        scopes=["https://www.googleapis.com/auth/drive.file"],
    )
    return build("drive", "v3", credentials=credentials, cache_discovery=False)


def find_child_folder(drive_service, parent_id: str, folder_name: str) -> Optional[str]:
    escaped = folder_name.replace("'", "\\'")
    query = (
        f"'{parent_id}' in parents and "
        f"name = '{escaped}' and "
        "mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    )
    response = (
        drive_service.files()
        .list(
            q=query,
            fields="files(id,name)",
            pageSize=1,
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
        )
        .execute()
    )
    files = response.get("files", [])
    return files[0]["id"] if files else None


def create_child_folder(drive_service, parent_id: str, folder_name: str) -> str:
    metadata = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_id],
    }
    created = (
        drive_service.files()
        .create(body=metadata, fields="id", supportsAllDrives=True)
        .execute()
    )
    return created["id"]


def ensure_dated_folder(drive_service, parent_id: str, folder_name: str) -> str:
    existing = find_child_folder(drive_service, parent_id, folder_name)
    if existing:
        LOG.info("Using existing Drive folder: %s (%s)", folder_name, existing)
        return existing

    folder_id = create_child_folder(drive_service, parent_id, folder_name)
    LOG.info("Created Drive folder: %s (%s)", folder_name, folder_id)
    return folder_id


def upload_stream(
    drive_service,
    folder_id: str,
    filename: str,
    stream: BinaryIO,
    mime_type: str,
    chunk_size: int,
    dry_run: bool,
) -> Optional[str]:
    if dry_run:
        LOG.info("[dry-run] Would upload %s (%s)", filename, mime_type)
        return None

    media = MediaIoBaseUpload(stream, mimetype=mime_type, chunksize=chunk_size, resumable=True)
    request = drive_service.files().create(
        body={"name": filename, "parents": [folder_id]},
        media_body=media,
        fields="id,name,webViewLink",
        supportsAllDrives=True,
    )

    response = None
    while response is None:
        _, response = request.next_chunk()

    file_id = response.get("id")
    LOG.info("Uploaded %s -> Drive file %s", filename, file_id)
    return file_id


def upload_from_url(
    drive_service,
    folder_id: str,
    filename: str,
    url: str,
    mime_type: str,
    chunk_size: int,
    dry_run: bool,
) -> Optional[str]:
    if dry_run:
        LOG.info("[dry-run] Would download and upload %s from %s", filename, url)
        return None

    import tempfile

    with requests.get(url, stream=True, timeout=120) as response:
        response.raise_for_status()
        resolved_mime = response.headers.get("Content-Type", mime_type).split(";")[0]
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            temp_path = Path(tmp.name)
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    tmp.write(chunk)

    try:
        with temp_path.open("rb") as handle:
            return upload_stream(
                drive_service,
                folder_id,
                filename,
                handle,
                resolved_mime,
                chunk_size,
                dry_run=False,
            )
    finally:
        temp_path.unlink(missing_ok=True)


def build_filename(record: Mapping[str, Any], source: DocumentSource) -> str:
    doc_id = str(record.get("id") or record.get("_id") or "unknown")
    vendor = slugify(str(record.get("vendor_name") or record.get("vendor_id") or "vendor"))
    doc_type = slugify(str(record.get("document_type") or record.get("title") or "document"))
    ext = guess_extension(source.mime_type, source.value, source.filename_hint)
    return f"{vendor}__{doc_type}__{doc_id}{ext}"


def fetch_documents(config: BackupConfig) -> list[dict[str, Any]]:
    url = f"{config.base44_api_base}/{config.base44_app_id}/entities/{config.base44_entity}"
    headers = {"Authorization": f"Bearer {config.base44_token}"}

    LOG.info("Fetching documents from Base44: %s", url)
    response = requests.get(url, headers=headers, timeout=120)
    response.raise_for_status()
    records = response.json()
    if not isinstance(records, list):
        raise ValueError(f"Unexpected Base44 response type: {type(records)!r}")

    records.sort(
        key=lambda row: str(row.get("updated_date") or row.get("created_date") or ""),
        reverse=True,
    )
    return records


def upload_manifest(
    drive_service,
    folder_id: str,
    records: list[dict[str, Any]],
    results: list[dict[str, Any]],
    config: BackupConfig,
) -> None:
    manifest = {
        "app": "NOSSCO Nexxus",
        "source": "base44",
        "backup_date": config.backup_date,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "record_count": len(records),
        "uploaded_count": sum(1 for item in results if item.get("status") == "uploaded"),
        "skipped_count": sum(1 for item in results if item.get("status") == "skipped"),
        "failed_count": sum(1 for item in results if item.get("status") == "failed"),
        "records": results,
    }
    payload = json.dumps(manifest, indent=2, default=str).encode("utf-8")

    if config.dry_run:
        LOG.info("[dry-run] Would upload manifest.json (%d bytes)", len(payload))
        return

    stream = BytesIO(payload)
    upload_stream(
        drive_service,
        folder_id,
        "manifest.json",
        stream,
        "application/json",
        config.chunk_size,
        dry_run=False,
    )


def backup_documents(config: BackupConfig) -> int:
    records = fetch_documents(config)
    LOG.info("Fetched %d ComplianceDocument records from Base44", len(records))

    drive_service = None
    target_folder_id = config.drive_folder_id
    if config.dry_run and not config.credentials_file.is_file():
        LOG.warning(
            "Dry-run without google-credentials.json — will validate Base44 records only"
        )
    else:
        drive_service = build_drive_service(config.credentials_file)
        target_folder_id = ensure_dated_folder(
            drive_service,
            config.drive_folder_id,
            config.backup_date,
        )

    results: list[dict[str, Any]] = []
    failures = 0

    for record in records:
        doc_id = str(record.get("id") or record.get("_id") or "unknown")
        source = resolve_document_source(record)
        metadata = {
            field: record.get(field)
            for field in METADATA_FIELDS
            if field in record
        }

        if source is None:
            LOG.warning("Skipping %s: no valid file_url found", doc_id)
            results.append(
                {
                    "id": doc_id,
                    "status": "skipped",
                    "reason": "no_file_url",
                    "metadata": metadata,
                }
            )
            continue

        filename = build_filename(record, source)
        mime_type = source.mime_type or mimetypes.guess_type(filename)[0] or "application/octet-stream"

        try:
            if drive_service is None:
                # Validate file_url is reachable in list-only dry-run
                head = requests.head(source.value, timeout=30, allow_redirects=True)
                if head.status_code >= 400:
                    head = requests.get(source.value, stream=True, timeout=30)
                    head.raise_for_status()
                    head.close()
                drive_file_id = None
                LOG.info("[dry-run] OK %s -> %s", doc_id, source.value)
            else:
                drive_file_id = upload_from_url(
                    drive_service,
                    target_folder_id,
                    filename,
                    source.value,
                    mime_type,
                    config.chunk_size,
                    config.dry_run,
                )
            results.append(
                {
                    "id": doc_id,
                    "status": "uploaded",
                    "filename": filename,
                    "source_kind": source.kind,
                    "drive_file_id": drive_file_id,
                    "metadata": metadata,
                }
            )
        except Exception as exc:
            failures += 1
            LOG.exception("Failed to backup document %s: %s", doc_id, exc)
            results.append(
                {
                    "id": doc_id,
                    "status": "failed",
                    "filename": filename,
                    "source_kind": source.kind,
                    "error": str(exc),
                    "metadata": metadata,
                }
            )

    if config.upload_manifest and drive_service is not None:
        upload_manifest(drive_service, target_folder_id, records, results, config)

    uploaded = sum(1 for item in results if item.get("status") == "uploaded")
    skipped = sum(1 for item in results if item.get("status") == "skipped")
    LOG.info(
        "Backup finished: uploaded=%d skipped=%d failed=%d folder=%s",
        uploaded,
        skipped,
        failures,
        config.backup_date,
    )
    return 1 if failures else 0


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )
    config = parse_config()
    exit_code = backup_documents(config)
    raise SystemExit(exit_code)


if __name__ == "__main__":
    main()
