"""Tests for VereadorItem serialization."""

from pathlib import Path

import pytest


_CASSETTES = Path(__file__).parent.parent / "client" / "cassettes"


def _c(name: str) -> str:
    return str(_CASSETTES / "test_vereadores" / f"{name}.yaml")


@pytest.fixture()
def facade(portal, content_factory):
    return content_factory(portal, "Vereadores", title="Vereadores")


class TestVereadorSerialization:
    """Test VereadorItem serialization via ISerializeToJson."""

    @pytest.mark.vcr(_c("TestVereadoresGet.test_get_single_vereador"))
    def test_serialized_output(self, facade, traverse_to_item, serialize):
        """Serialize a single vereador and inspect the output."""
        item = traverse_to_item(facade, "546914")
        data = serialize(item)
        assert data["@type"] == "Vereador"
        assert "title" in data
        assert "parent" in data
        assert data["parent"]["title"] == "Vereadores"
        assert "partido" in data or "biografia" in data

    @pytest.mark.vcr(_c("TestVereadoresGet.test_get_single_vereador"))
    def test_sub_item_comissoes(self, facade, traverse_to_item, serialize):
        """Serialize a vereador's comissoes sub-item."""
        item = traverse_to_item(facade, "546914")
        item.sub_item = "comissoes"
        data = serialize(item)
        assert data["@type"] == "Vereador"
        assert "data" in data
        assert isinstance(data["data"], list)
