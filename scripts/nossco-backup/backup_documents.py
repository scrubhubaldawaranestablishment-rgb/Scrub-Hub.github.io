#!/usr/bin/env python3
"""
NOSSCO Nexxus document backup script.

Fetches compliance document records from Supabase (Base44 backend), resolves file
payloads from URL downloads or Base64-encoded columns, and uploads them to a
date-stamped subfolder in Google Drive using streaming I/O to limit memory use.

Required environment variables:
  SUPABASE_URL              Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY Service role key (recommended for backups)

Optional environment variables:
  SUPABASE_TABLE            Table name (default: ComplianceDocument)
  GOOGLE_CREDENTIALS_FILE   Path to service account JSON (default: google-credentials.json)
  GOOGLE_DRIVE_FOLDER_ID      Target shared folder ID
  BACKUP_CHUNK_SIZE           Stream chunk size in bytes (default: 262144)
  BACKUP_DRY_RUN              Set to "1" to list actions without uploading
  BACKUP_MANIFEST             Set to "0" to skip manifest.json upload (default: upload)

Usage:
  pip install -r scripts/nossco-backup/requirements.txt
  export SUPABASE_URL=...
  export SUPABASE_SERVICE_ROLE_KEY=...
  export GOOGLE_DRIVE_FOLDER_ID=1saHGqanqHjrapVHUV0WaJ15cmuQcil0N
  python scripts/nossco-backup/backup_documents.py
"""

from __future__ import annotations

import binascii
import json
import logging
import mimetypes
import os
import re
import sys
import tempfile
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, BinaryIO, Iterator, Mapping, Optional
from urllib.parse import urlparse

import requests
from dotenv import load_dotenv
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
from supabase import Client, create_client

load_dotenv()

LOG = logging.getLogger("nossco-backup")

DEFAULT_TABLE = "ComplianceDocument"
DEFAULT_CREDENTIALS = "google-credentials.json"
DEFAULT_DRIVE_FOLDER = "1saHGqanqHjrapVHUV0WaJ15cmuQcil0N"
DEFAULT_CHUNK_SIZE = 256 * 1024

# Columns checked for embedded Base64 payloads (first match wins).
BASE64_FIELD_CANDIDATES = (
    "file_base64",
    "file_data",
    "content_base64",
    "base64_content",
    "document_base64",
    "file_content",
)

URL_FIELD_CANDIDATES = (
    "file_url",
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
    kind: str  # "url" | "base64"
    value: str
    mime_type: Optional[str] = None
    filename_hint: Optional[str] = None


@dataclass(frozen=True)
class BackupConfig:
    supabase_url: str
    supabase_key: str
    table_name: str
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
        content_length = response.headers.get("Content-Length")
        self.size = int(content_length) if content_length else None

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
        if self._closed and not self._buffer:
            return result
        return result

    def close(self) -> None:
        self._closed = True
        if hasattr(self._iterator, "close"):
            self._iterator.close()  # type: ignore[attr-defined]


def parse_config() -> BackupConfig:
    supabase_url = os.getenv("SUPABASE_URL", "").strip()
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not supabase_url or not supabase_key:
        raise SystemExit(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. "
            "Set both before running the backup."
        )

    credentials_file = Path(
        os.getenv("GOOGLE_CREDENTIALS_FILE", DEFAULT_CREDENTIALS)
    ).expanduser()
    drive_folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID", DEFAULT_DRIVE_FOLDER).strip()
    chunk_size = int(os.getenv("BACKUP_CHUNK_SIZE", str(DEFAULT_CHUNK_SIZE)))
    dry_run = os.getenv("BACKUP_DRY_RUN", "").strip() in {"1", "true", "True", "yes"}
    upload_manifest = os.getenv("BACKUP_MANIFEST", "1").strip() not in {
        "0",
        "false",
        "False",
        "no",
    }

    return BackupConfig(
        supabase_url=supabase_url,
        supabase_key=supabase_key,
        table_name=os.getenv("SUPABASE_TABLE", DEFAULT_TABLE).strip(),
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


def normalize_base64_payload(raw_value: str) -> tuple[str, Optional[str]]:
    value = raw_value.strip()
    mime_type = None
    if value.startswith("data:"):
        header, _, payload = value.partition(",")
        if ";" in header:
            mime_type = header[5:].split(";", 1)[0] or None
        value = payload
    return value, mime_type


def spool_base64_to_tempfile(
    encoded: str,
    chunk_size: int,
) -> tuple[Path, int, Optional[str]]:
    payload, mime_type = normalize_base64_payload(encoded)
    payload = re.sub(r"\s+", "", payload)

    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        temp_path = Path(tmp.name)
        total = 0
        # Base64 decode must respect 4-character alignment.
        carry = ""
        for idx in range(0, len(payload), chunk_size):
            segment = carry + payload[idx : idx + chunk_size]
            usable = len(segment) - (len(segment) % 4)
            if usable == 0:
                carry = segment
                continue
            to_decode = segment[:usable]
            carry = segment[usable:]
            try:
                decoded = binascii.a2b_base64(to_decode.encode("ascii"))
            except binascii.Error as exc:
                tmp.close()
                temp_path.unlink(missing_ok=True)
                raise ValueError(f"Invalid Base64 payload: {exc}") from exc
            tmp.write(decoded)
            total += len(decoded)

        if carry:
            try:
                decoded = binascii.a2b_base64(carry.encode("ascii"))
            except binascii.Error as exc:
                tmp.close()
                temp_path.unlink(missing_ok=True)
                raise ValueError(f"Invalid Base64 payload tail: {exc}") from exc
            tmp.write(decoded)
            total += len(decoded)

    return temp_path, total, mime_type


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
    for field in BASE64_FIELD_CANDIDATES:
        raw = first_present(record, (field,))
        if isinstance(raw, str) and raw.strip():
            _, mime_type = normalize_base64_payload(raw)
            filename_hint = first_present(record, ("file_name", "filename"))
            return DocumentSource(
                kind="base64",
                value=raw,
                mime_type=mime_type,
                filename_hint=str(filename_hint) if filename_hint else None,
            )

    file_url = first_present(record, URL_FIELD_CANDIDATES)
    if isinstance(file_url, str) and file_url.strip():
        return DocumentSource(
            kind="url",
            value=file_url.strip(),
            filename_hint=Path(urlparse(file_url).path).name or None,
        )

    return None


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


def find_child_folder(
    drive_service,
    parent_id: str,
    folder_name: str,
) -> Optional[str]:
    escaped = folder_name.replace("'", "\\'")
    query = (
        f"'{parent_id}' in parents and "
        f"name = '{escaped}' and "
        "mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    )
    response = (
        drive_service.files()
        .list(q=query, fields="files(id,name)", pageSize=1, supportsAllDrives=True, includeItemsFromAllDrives=True)
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

    with requests.get(url, stream=True, timeout=120) as response:
        response.raise_for_status()
        resolved_mime = response.headers.get("Content-Type", mime_type).split(";")[0]
        reader = HTTPStreamReader(response, chunk_size=chunk_size)
        try:
            return upload_stream(
                drive_service,
                folder_id,
                filename,
                reader,
                resolved_mime,
                chunk_size,
                dry_run=False,
            )
        finally:
            reader.close()


def upload_from_base64(
    drive_service,
    folder_id: str,
    filename: str,
    encoded: str,
    mime_type: str,
    chunk_size: int,
    dry_run: bool,
) -> Optional[str]:
    if dry_run:
        LOG.info("[dry-run] Would decode Base64 and upload %s", filename)
        return None

    temp_path, _, detected_mime = spool_base64_to_tempfile(encoded, chunk_size)
    final_mime = detected_mime or mime_type
    try:
        with temp_path.open("rb") as handle:
            return upload_stream(
                drive_service,
                folder_id,
                filename,
                handle,
                final_mime,
                chunk_size,
                dry_run=False,
            )
    finally:
        temp_path.unlink(missing_ok=True)


def build_filename(record: Mapping[str, Any], source: DocumentSource) -> str:
    doc_id = str(record.get("id") or record.get("_id") or "unknown")
    vendor = slugify(str(record.get("vendor_name") or record.get("vendor_id") or "vendor"))
    doc_type = slugify(str(record.get("document_type") or record.get("title") or "document"))
    ext = guess_extension(source.mime_type, source.value if source.kind == "url" else None, source.filename_hint)
    return f"{vendor}__{doc_type}__{doc_id}{ext}"


def fetch_documents(client: Client, table_name: str) -> list[dict[str, Any]]:
    page_size = 500
    offset = 0
    rows: list[dict[str, Any]] = []

    while True:
        query = client.table(table_name).select("*")
        response = query.range(offset, offset + page_size - 1).execute()
        batch = response.data or []
        if not batch:
            break
        rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size

    rows.sort(
        key=lambda row: str(row.get("updated_date") or row.get("created_date") or ""),
        reverse=True,
    )
    return rows


def upload_manifest(
    drive_service,
    folder_id: str,
    records: list[dict[str, Any]],
    results: list[dict[str, Any]],
    config: BackupConfig,
) -> None:
    manifest = {
        "app": "NOSSCO Nexxus",
        "backup_date": config.backup_date,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "record_count": len(records),
        "uploaded_count": sum(1 for item in results if item.get("drive_file_id")),
        "skipped_count": sum(1 for item in results if item.get("status") == "skipped"),
        "failed_count": sum(1 for item in results if item.get("status") == "failed"),
        "records": results,
    }
    payload = json.dumps(manifest, indent=2, default=str).encode("utf-8")

    if config.dry_run:
        LOG.info("[dry-run] Would upload manifest.json (%d bytes)", len(payload))
        return

    from io import BytesIO

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
    client = create_client(config.supabase_url, config.supabase_key)
    drive_service = build_drive_service(config.credentials_file)
    target_folder_id = ensure_dated_folder(
        drive_service,
        config.drive_folder_id,
        config.backup_date,
    )

    LOG.info("Fetching documents from Supabase table %s", config.table_name)
    records = fetch_documents(client, config.table_name)
    LOG.info("Fetched %d document records", len(records))

    results: list[dict[str, Any]] = []
    failures = 0

    for record in records:
        doc_id = str(record.get("id") or record.get("_id") or "unknown")
        source = resolve_document_source(record)
        metadata = {field: record.get(field) for field in METADATA_FIELDS if field in record}

        if source is None:
            LOG.warning("Skipping %s: no file_url or Base64 payload found", doc_id)
            results.append(
                {
                    "id": doc_id,
                    "status": "skipped",
                    "reason": "no_file_source",
                    "metadata": metadata,
                }
            )
            continue

        filename = build_filename(record, source)
        mime_type = source.mime_type or mimetypes.guess_type(filename)[0] or "application/octet-stream"

        try:
            if source.kind == "url":
                drive_file_id = upload_from_url(
                    drive_service,
                    target_folder_id,
                    filename,
                    source.value,
                    mime_type,
                    config.chunk_size,
                    config.dry_run,
                )
            else:
                drive_file_id = upload_from_base64(
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
                    "status": "uploaded" if drive_file_id or config.dry_run else "uploaded",
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

    if config.upload_manifest:
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
