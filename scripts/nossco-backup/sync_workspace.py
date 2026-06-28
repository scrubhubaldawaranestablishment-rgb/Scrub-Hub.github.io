#!/usr/bin/env python3
"""
NOSSCO Nexxus — Base44 → Google Workspace sync.

Exports all Base44 entity records as JSON and compliance document files
into a Google Workspace Shared Drive folder (required for service accounts).

Required:
  BASE44_API_TOKEN
  google-credentials.json (service account with Shared Drive access)

Optional env:
  BASE44_APP_ID=6a1ae5a11195cab07d9a51af
  GOOGLE_DRIVE_FOLDER_ID=<Shared Drive folder ID>
  WORKSPACE_SYNC_ENTITIES=comma-separated entity names (default: all core)
  BACKUP_DRY_RUN=1

Usage:
  python3 scripts/nossco-backup/sync_workspace.py
"""

from __future__ import annotations

import json
import logging
import os
import sys
from datetime import date, datetime, timezone
from io import BytesIO
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

# Reuse helpers from document backup module
sys.path.insert(0, str(Path(__file__).resolve().parent))
from backup_documents import (  # noqa: E402
    DEFAULT_API_BASE,
    DEFAULT_APP_ID,
    DEFAULT_CREDENTIALS,
    DEFAULT_DRIVE_FOLDER,
    build_drive_service,
    ensure_dated_folder,
    fetch_documents,
    parse_config as parse_backup_config,
    resolve_document_source,
    upload_from_url,
    build_filename,
    slugify,
)

load_dotenv()
LOG = logging.getLogger("nossco-workspace-sync")

DEFAULT_ENTITIES = (
    "Vendor",
    "Client",
    "ComplianceDocument",
    "VendorApplication",
    "Ticket",
    "ServiceRequest",
    "WorkOrder",
    "ClientInvoice",
    "VendorPayout",
)


def fetch_entity(base_url: str, app_id: str, token: str, entity: str) -> list[dict[str, Any]]:
    url = f"{base_url}/{app_id}/entities/{entity}"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers, timeout=120)
    response.raise_for_status()
    data = response.json()
    if not isinstance(data, list):
        raise ValueError(f"Unexpected response for {entity}: {type(data)!r}")
    return data


def upload_json(
    drive_service,
    folder_id: str,
    filename: str,
    payload: Any,
    dry_run: bool,
) -> str | None:
    body = json.dumps(payload, indent=2, default=str).encode("utf-8")
    if dry_run:
        LOG.info("[dry-run] Would upload %s (%d bytes)", filename, len(body))
        return None

    stream = BytesIO(body)
    media = MediaIoBaseUpload(stream, mimetype="application/json", resumable=True)
    request = drive_service.files().create(
        body={"name": filename, "parents": [folder_id]},
        media_body=media,
        fields="id,name,webViewLink",
        supportsAllDrives=True,
    )
    result = None
    while result is None:
        _, result = request.next_chunk()
    file_id = result.get("id")
    LOG.info("Uploaded %s -> %s", filename, file_id)
    return file_id


def list_shared_drives(drive_service) -> list[dict[str, Any]]:
    try:
        resp = drive_service.drives().list(pageSize=20).execute()
        return resp.get("drives", [])
    except Exception as exc:
        LOG.warning("Could not list shared drives: %s", exc)
        return []


def sync_workspace() -> int:
    cfg = parse_backup_config()
    entities = tuple(
        e.strip()
        for e in os.getenv("WORKSPACE_SYNC_ENTITIES", ",".join(DEFAULT_ENTITIES)).split(",")
        if e.strip()
    )

    drive_service = build_drive_service(cfg.credentials_file)
    shared = list_shared_drives(drive_service)
    if not shared and not cfg.dry_run:
        LOG.warning(
            "Service account sees 0 Shared Drives. Add %s as Content manager "
            "on a Shared Drive, then put GOOGLE_DRIVE_FOLDER_ID inside it.",
            json.load(open(cfg.credentials_file)).get("client_email", "service-account"),
        )

    export_root = ensure_dated_folder(drive_service, cfg.drive_folder_id, cfg.backup_date)
    data_folder_name = "data-export"
    files_folder_name = "compliance-files"

    if cfg.dry_run:
        data_folder_id = export_root
        files_folder_id = export_root
    else:
        data_folder_id = ensure_dated_folder(drive_service, export_root, data_folder_name)
        files_folder_id = ensure_dated_folder(drive_service, export_root, files_folder_name)

    manifest: dict[str, Any] = {
        "app": "NOSSCO Nexxus",
        "source": "base44",
        "sync_date": cfg.backup_date,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "entities": {},
        "files": {"uploaded": 0, "skipped": 0, "failed": 0},
        "shared_drives_visible": [d.get("name") for d in shared],
    }

    failures = 0

    # JSON export for each entity
    for entity in entities:
        try:
            rows = fetch_entity(
                cfg.base44_api_base,
                cfg.base44_app_id,
                cfg.base44_token,
                entity,
            )
            filename = f"{slugify(entity, entity.lower())}.json"
            upload_json(drive_service, data_folder_id, filename, rows, cfg.dry_run)
            manifest["entities"][entity] = {"count": len(rows), "status": "ok"}
            LOG.info("Exported %s: %d records", entity, len(rows))
        except Exception as exc:
            failures += 1
            manifest["entities"][entity] = {"count": 0, "status": "failed", "error": str(exc)}
            LOG.exception("Failed to export %s: %s", entity, exc)

    # Compliance document files
    if "ComplianceDocument" in entities:
        records = fetch_documents(cfg)
        for record in records:
            doc_id = str(record.get("id", "unknown"))
            source = resolve_document_source(record)
            if source is None:
                manifest["files"]["skipped"] += 1
                continue
            vendor = slugify(str(record.get("vendor_name") or record.get("vendor_id") or "vendor"))
            doc_type = slugify(str(record.get("document_type") or "document"))
            subfolder = f"{vendor}__{doc_type}"
            target = (
                ensure_dated_folder(drive_service, files_folder_id, subfolder)
                if not cfg.dry_run
                else files_folder_id
            )
            filename = build_filename(record, source)
            try:
                upload_from_url(
                    drive_service,
                    target,
                    filename,
                    source.value,
                    source.mime_type or "application/octet-stream",
                    cfg.chunk_size,
                    cfg.dry_run,
                )
                manifest["files"]["uploaded"] += 1
            except Exception as exc:
                failures += 1
                manifest["files"]["failed"] += 1
                LOG.exception("File backup failed for %s: %s", doc_id, exc)

    upload_json(drive_service, data_folder_id, "sync_manifest.json", manifest, cfg.dry_run)

    LOG.info(
        "Workspace sync done: entity_failures=%d files_uploaded=%d files_failed=%d",
        failures,
        manifest["files"]["uploaded"],
        manifest["files"]["failed"],
    )
    return 1 if failures else 0


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    raise SystemExit(sync_workspace())


if __name__ == "__main__":
    main()
