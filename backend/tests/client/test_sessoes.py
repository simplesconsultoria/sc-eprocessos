"""Tests for the SessoesService."""

from __future__ import annotations

from sc.eprocessos.client.client import EProcessosClient
from sc.eprocessos.client.enums import TipoSessao
from sc.eprocessos.client.services.sessoes import SessoesService
from unittest.mock import patch

import httpx
import pytest


@pytest.mark.vcr()
class TestSessoesList:
    def test_list(self, client: EProcessosClient):
        result = client.sessoes.list(ano=2025, tipo=TipoSessao.ORDINARIA)
        assert "items" in result
        assert "description" in result
        assert isinstance(result["items"], list)
        assert len(result["items"]) > 0

    def test_list_items_have_expected_fields(self, client: EProcessosClient):
        result = client.sessoes.list(ano=2025, tipo=TipoSessao.ORDINARIA)
        item = result["items"][0]
        assert "id" in item
        assert "title" in item
        assert "date" in item


@pytest.mark.vcr()
class TestSessoesGet:
    def test_get_single_sessao(self, client: EProcessosClient):
        result = client.sessoes.get(item_id="1636")
        assert "title" in result
        assert "date" in result

    def test_get_with_expanders(self, client: EProcessosClient):
        result = client.sessoes.get(item_id="1636", expanders=["presenca", "votacao"])
        assert "title" in result
        # Expanders should have been fetched
        assert "presenca" in result or "votacao" in result


class TestSessoesExpanderMissing:
    def test_missing_expander_url_logs_warning(
        self, http_client: httpx.Client, base_url: str, caplog: pytest.LogCaptureFixture
    ):
        """When an expander URL is not in the response, a warning is logged."""
        service = SessoesService(
            http_client=http_client,
            base_url=base_url,
            max_retries=1,
            retry_delay=0.0,
        )
        request = httpx.Request("GET", base_url)
        # Response without @id_presenca
        session_data = {
            "id": "999",
            "title": "Test Session",
            "date": "2025-01-01",
        }
        response = httpx.Response(200, json=session_data, request=request)
        with patch.object(service._http, "request", return_value=response):
            result = service.get(item_id="999", expanders=["presenca"])
        assert "presenca" not in result
        assert "Expander 'presenca' URL not found" in caplog.text
