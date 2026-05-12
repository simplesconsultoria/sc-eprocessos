"""Tests for SessaoItem serialization."""

from pathlib import Path

import pytest


_CASSETTES = Path(__file__).parent.parent / "client" / "cassettes"


def _c(name: str) -> str:
    return str(_CASSETTES / "test_sessoes" / f"{name}.yaml")


@pytest.fixture()
def facade(portal, content_factory):
    return content_factory(portal, "Sessoes", id="sessoes", title="Sessões Plenárias")


class TestSessaoSerialization:
    """Test SessaoItem serialization via ISerializeToJson.

    Sessoes use expanders (presenca, votacao) that trigger
    additional API requests.
    """

    @pytest.mark.vcr(_c("TestSessoesGet.test_get_with_expanders"))
    def test_serialized_output(self, facade, traverse_to_item, serialize):
        """Serialize a single sessao with all expanders."""
        item = traverse_to_item(facade, "1636")
        data = serialize(item)
        assert data["@type"] == "Sessao"
        assert "title" in data
        assert "date" in data
        assert "parent" in data
        assert data["parent"]["title"] == "Sessões Plenárias"

    @pytest.mark.vcr(_c("TestSessoesGet.test_get_with_expanders"))
    def test_sub_item_presenca(self, facade, traverse_to_item, serialize):
        """Serialize the presenca sub-item of a sessao."""
        item = traverse_to_item(facade, "1636")
        item.sub_item = "presenca"
        data = serialize(item)
        assert data["@type"] == "Sessao"
        assert "data" in data

    @pytest.mark.vcr(_c("TestSessoesGet.test_get_with_expanders"))
    def test_sub_item_votacao(self, facade, traverse_to_item, serialize):
        """Serialize the votacao sub-item of a sessao."""
        item = traverse_to_item(facade, "1636")
        item.sub_item = "votacao"
        data = serialize(item)
        assert data["@type"] == "Sessao"
        assert "data" in data
