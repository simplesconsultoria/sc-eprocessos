"""Tests for the ComissoesService."""

from __future__ import annotations

from sc.eprocessos.client.client import EProcessosClient

import pytest


@pytest.mark.vcr()
class TestComissoesList:
    def test_list(self, client: EProcessosClient):
        result = client.comissoes.list()
        assert "items" in result
        assert "description" in result
        assert isinstance(result["items"], list)
        assert len(result["items"]) > 0

    def test_list_items_have_expected_fields(self, client: EProcessosClient):
        result = client.comissoes.list()
        item = result["items"][0]
        assert "id" in item
        assert "title" in item
        assert "tipo" in item


@pytest.mark.vcr()
class TestComissoesGet:
    def test_get_single_comissao(self, client: EProcessosClient):
        result = client.comissoes.get(item_id="22")
        assert "title" in result
