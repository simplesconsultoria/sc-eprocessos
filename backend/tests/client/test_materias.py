"""Tests for the MateriasService."""

from __future__ import annotations

from sc.eprocessos.client.client import EProcessosClient
from sc.eprocessos.client.enums import TipoMateria
from sc.eprocessos.client.exceptions import EProcessosServerError
from unittest.mock import patch

import httpx
import pytest


@pytest.mark.vcr()
class TestMateriasList:
    def test_list_with_ano_and_tipo(self, client: EProcessosClient):
        result = client.materias.list(ano=2025, tipo=TipoMateria.PROJETO_LEI)
        assert "items" in result
        assert "description" in result
        assert isinstance(result["items"], list)

    def test_list_with_ano_only(self, client: EProcessosClient):
        result = client.materias.list(ano=2025)
        assert "items" in result

    def test_list_items_have_expected_fields(self, client: EProcessosClient):
        result = client.materias.list(ano=2025, tipo=TipoMateria.PROJETO_LEI)
        if result["items"]:
            item = result["items"][0]
            assert "id" in item
            assert "title" in item


class TestMateriasGet:
    def test_get_single_materia(self, client: EProcessosClient):
        """Test get with a mocked successful response."""
        request = httpx.Request("GET", "https://example.com")
        response = httpx.Response(
            200,
            json={
                "id": "12345",
                "title": "Projeto de Lei nº 1/2025",
                "description": "Test materia",
                "@type": "Materia",
            },
            request=request,
        )
        with patch.object(client.materias._http, "request", return_value=response):
            result = client.materias.get(item_id="12345")
        assert result["id"] == "12345"
        assert result["title"] == "Projeto de Lei nº 1/2025"

    @pytest.mark.vcr()
    def test_get_returns_server_error(self, client: EProcessosClient):
        """Some e-Processos instances don't support single materia retrieval."""
        with pytest.raises(EProcessosServerError):
            client.materias.get(item_id="241369")
