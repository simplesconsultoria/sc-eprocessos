"""Client factory for e-Processos API."""

from __future__ import annotations

from plone import api
from sc.eprocessos.client import EProcessosClient


def get_client() -> EProcessosClient:
    """Create an EProcessosClient from Plone registry settings."""
    base_url = api.portal.get_registry_record("eprocessos.base_url")
    timeout = api.portal.get_registry_record("eprocessos.default_timeout")
    max_retries = api.portal.get_registry_record("eprocessos.max_retries")
    retry_delay = api.portal.get_registry_record("eprocessos.retry_delay")
    return EProcessosClient(
        base_url=base_url,
        timeout=float(timeout),
        max_retries=max_retries,
        retry_delay=float(retry_delay),
    )
