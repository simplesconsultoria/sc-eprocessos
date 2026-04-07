"""Tests for the LegislaturasService."""

from __future__ import annotations

from sc.eprocessos.client.client import EProcessosClient

import pytest


@pytest.mark.vcr()
class TestLegislaturasList:
    def test_list(self, client: EProcessosClient):
        result = client.legislaturas.list()
        assert "items" in result
        assert "description" in result
        assert isinstance(result["items"], list)
        assert len(result["items"]) > 0

    def test_list_items_have_expected_fields(self, client: EProcessosClient):
        result = client.legislaturas.list()
        item = result["items"][0]
        assert "id" in item
        assert "title" in item
        assert "atual" in item


@pytest.mark.vcr()
class TestLegislaturasGet:
    def test_get_single_legislatura(self, client: EProcessosClient):
        result = client.legislaturas.get(item_id="20")
        assert "title" in result
