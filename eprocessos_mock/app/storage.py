"""Filesystem-based storage for recorded API responses."""

from __future__ import annotations

from pathlib import Path

from app.settings import DATA_DIR

import json
import logging
import hashlib


logger = logging.getLogger(__name__)


def _key_path(endpoint: str, item_id: str | None = None, **params: str) -> Path:
    """Build a deterministic file path for a request.

    Layout:
      {DATA_DIR}/{endpoint}/list.json
      {DATA_DIR}/{endpoint}/list_{hash}.json   (when query params present)
      {DATA_DIR}/{endpoint}/{item_id}.json
    """
    base = Path(DATA_DIR) / endpoint
    if item_id:
        return base / f"{item_id}.json"
    if params:
        # Deterministic hash of sorted query params
        param_str = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
        h = hashlib.sha256(param_str.encode()).hexdigest()[:12]
        return base / f"list_{h}.json"
    return base / "list.json"


def store(
    endpoint: str,
    data: dict | list | bytes,
    item_id: str | None = None,
    *,
    binary: bool = False,
    content_type: str = "",
    **params: str,
) -> None:
    """Persist a response to disk."""
    if binary:
        path = _key_path(endpoint, item_id, **params).with_suffix("")
        # Store binary data alongside a metadata sidecar
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        meta_path = Path(f"{path}.meta")
        meta_path.write_text(json.dumps({"content_type": content_type}))
        logger.info("Stored binary %s", path)
    else:
        path = _key_path(endpoint, item_id, **params)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2))
        logger.info("Stored %s", path)


def load(
    endpoint: str,
    item_id: str | None = None,
    *,
    binary: bool = False,
    **params: str,
) -> dict | list | bytes | None:
    """Load a stored response from disk. Returns None if not found."""
    if binary:
        path = _key_path(endpoint, item_id, **params).with_suffix("")
        meta_path = Path(f"{path}.meta")
        if path.exists():
            data = path.read_bytes()
            meta = {}
            if meta_path.exists():
                meta = json.loads(meta_path.read_text())
            return {"data": data, "content_type": meta.get("content_type", "application/octet-stream")}
        return None
    path = _key_path(endpoint, item_id, **params)
    if not path.exists():
        return None
    return json.loads(path.read_text())
