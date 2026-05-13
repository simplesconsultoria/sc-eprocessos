"""Tests for MesaItem serialization."""

from pathlib import Path

import pytest


_CASSETTES = Path(__file__).parent.parent / "client" / "cassettes"


def _c(name: str) -> str:
    return str(_CASSETTES / "test_mesas" / f"{name}.yaml")


@pytest.fixture()
def facade(portal, content_factory):
    return content_factory(portal, "Mesas", id="mesas", title="Mesas Diretoras")


class TestMesaSerialization:
    """Test MesaItem serialization via ISerializeToJson."""

    @pytest.mark.vcr(_c("TestMesasGet.test_get_single_mesa"))
    def test_serialized_output(self, facade, traverse_to_item, serialize):
        """Serialize a single mesa and inspect the output."""
        item = traverse_to_item(facade, "7")
        data = serialize(item)
        assert data["@type"] == "Mesa"
        assert "parent" in data
        assert data["parent"]["title"] == "Mesas Diretoras"
