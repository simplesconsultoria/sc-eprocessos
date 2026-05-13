"""Tests for ComissaoItem serialization."""

from pathlib import Path

import pytest


_CASSETTES = Path(__file__).parent.parent / "client" / "cassettes"


def _c(name: str) -> str:
    return str(_CASSETTES / "test_comissoes" / f"{name}.yaml")


@pytest.fixture()
def facade(portal, content_factory):
    return content_factory(portal, "Comissoes", id="comissoes", title="Comissões")


class TestComissaoSerialization:
    """Test ComissaoItem serialization via ISerializeToJson."""

    @pytest.mark.vcr(_c("TestComissoesGet.test_get_single_comissao"))
    def test_serialized_output(self, facade, traverse_to_item, serialize):
        """Serialize a single comissao and inspect the output."""
        item = traverse_to_item(facade, "22")
        data = serialize(item)
        assert data["@type"] == "Comissao"
        assert "title" in data
        assert "parent" in data
        assert data["parent"]["title"] == "Comissões"
