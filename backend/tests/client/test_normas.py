"""Tests for the NormasService."""

from __future__ import annotations

from sc.eprocessos.client.client import EProcessosClient
from sc.eprocessos.client.enums import TipoNorma

import pytest


@pytest.mark.vcr()
class TestNormasList:
    def test_list_with_ano_and_tipo(self, client: EProcessosClient):
        result = client.normas.list(ano=2025, tipo=TipoNorma.LEI)
        assert "items" in result
        assert "description" in result
        assert isinstance(result["items"], list)

    def test_list_with_ano_only(self, client: EProcessosClient):
        result = client.normas.list(ano=2025)
        assert "items" in result
        assert isinstance(result["items"], list)

    def test_list_items_have_expected_fields(self, client: EProcessosClient):
        result = client.normas.list(ano=2025, tipo=TipoNorma.LEI)
        if result["items"]:
            item = result["items"][0]
            assert "id" in item
            assert "title" in item

    def test_list_with_int_tipo(self, client: EProcessosClient):
        result = client.normas.list(ano=2025, tipo=1)
        assert "items" in result


@pytest.mark.vcr()
class TestNormasGet:
    def test_get_single_norma(self, client: EProcessosClient):
        result = client.normas.get(item_id="18503")
        assert "id" in result or "@id" in result
        assert "title" in result
