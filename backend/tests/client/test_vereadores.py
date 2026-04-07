"""Tests for the VereadoresService."""

from __future__ import annotations

from sc.eprocessos.client.client import EProcessosClient

import pytest


@pytest.mark.vcr()
class TestVereadoresList:
    def test_list(self, client: EProcessosClient):
        result = client.vereadores.list()
        assert "items" in result
        assert "description" in result
        assert isinstance(result["items"], list)
        assert len(result["items"]) > 0

    def test_list_items_have_expected_fields(self, client: EProcessosClient):
        result = client.vereadores.list()
        item = result["items"][0]
        assert "id" in item
        assert "title" in item
        assert "partido" in item


@pytest.mark.vcr()
class TestVereadoresGet:
    def test_get_single_vereador(self, client: EProcessosClient):
        result = client.vereadores.get(item_id="546914")
        assert "title" in result
        assert "comissoes" in result
        assert isinstance(result["comissoes"], list)
