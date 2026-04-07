"""Test fixtures for the e-Processos client tests."""

from __future__ import annotations

from pathlib import Path
from sc.eprocessos.client.client import EProcessosClient

import httpx
import os
import pytest


BASE_URL = "https://e-processos.camarauberlandia.mg.gov.br"
CASSETTES_DIR = Path(__file__).parent / "cassettes"


@pytest.fixture()
def base_url() -> str:
    """Base URL for the e-Processos instance."""
    return os.environ.get("EPROCESSOS_BASE_URL", BASE_URL)


@pytest.fixture()
def client(base_url: str) -> EProcessosClient:
    """An EProcessosClient instance."""
    with EProcessosClient(base_url=base_url) as c:
        yield c


@pytest.fixture()
def http_client() -> httpx.Client:
    """A plain httpx.Client for BaseService tests."""
    with httpx.Client() as c:
        yield c
