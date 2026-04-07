"""Tests for the MesasService."""

from __future__ import annotations

from sc.eprocessos.client.client import EProcessosClient

import pytest


@pytest.mark.vcr()
class TestMesasList:
    def test_list(self, client: EProcessosClient):
        result = client.mesas.list()
        assert "items" in result
        assert "description" in result
        assert isinstance(result["items"], list)
        assert len(result["items"]) > 0

    def test_list_items_have_expected_fields(self, client: EProcessosClient):
        result = client.mesas.list()
        item = result["items"][0]
        assert "id" in item
        assert "legislatura" in item
        assert "start" in item
        assert "end" in item


@pytest.mark.vcr()
class TestMesasGet:
    def test_get_single_mesa(self, client: EProcessosClient):
        result = client.mesas.get(item_id="7")
        assert "title" in result or "legislatura" in result
