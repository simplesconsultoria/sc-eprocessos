"""Recording proxy — forwards requests to upstream e-Processos and stores responses."""

from __future__ import annotations

import json
import logging

import httpx

from app import storage
from app.settings import UPSTREAM_URL

logger = logging.getLogger(__name__)

_client: httpx.AsyncClient | None = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(base_url=UPSTREAM_URL, timeout=30.0)
    return _client


async def close_client() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None


def _rewrite_upstream_urls(data: dict | list) -> dict | list:
    """Replace all occurrences of the upstream URL with an empty root path.

    This makes recorded data portable: @id and download URLs become
    relative to whatever host serves them (e.g., ``/@@vereadores/123``
    instead of ``https://e-processos.example.com/@@vereadores/123``).
    """
    if not UPSTREAM_URL:
        logger.warning("UPSTREAM_URL is empty, skipping URL rewrite")
        return data
    raw = json.dumps(data, ensure_ascii=False)
    count = raw.count(UPSTREAM_URL)
    if count:
        logger.info("Rewriting %d upstream URL(s) (%s)", count, UPSTREAM_URL)
        raw = raw.replace(UPSTREAM_URL, "")
    return json.loads(raw)


async def proxy_json(
    path: str,
    endpoint: str,
    item_id: str | None = None,
    **params: str,
) -> dict | list:
    """Forward a request to upstream, store the JSON response, and return it."""
    client = get_client()
    logger.info("Recording %s %s", path, params or "")
    response = await client.get(path, params=params or None)
    response.raise_for_status()
    data = _rewrite_upstream_urls(response.json())
    storage.store(endpoint, data, item_id=item_id, **params)
    return data


async def proxy_binary(
    path: str,
    endpoint: str,
    item_id: str | None = None,
    **params: str,
) -> tuple[bytes, str]:
    """Forward a binary request to upstream, store the response, and return (bytes, content_type)."""
    client = get_client()
    logger.info("Recording binary %s %s", path, params or "")
    response = await client.get(path, params=params or None)
    response.raise_for_status()
    content_type = response.headers.get("content-type", "application/octet-stream")
    storage.store(
        endpoint,
        response.content,
        item_id=item_id,
        binary=True,
        content_type=content_type,
    )
    return response.content, content_type
