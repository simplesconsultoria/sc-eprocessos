"""Tests for LegislaturaItem serialization."""

from pathlib import Path

import pytest


_CASSETTES = Path(__file__).parent.parent / "client" / "cassettes"


def _c(name: str) -> str:
    return str(_CASSETTES / "test_legislaturas" / f"{name}.yaml")


@pytest.fixture()
def facade(portal, content_factory):
    return content_factory(portal, "Legislaturas", title="Legislaturas")


class TestLegislaturaSerialization:
    """Test LegislaturaItem serialization via ISerializeToJson."""

    @pytest.mark.vcr(_c("TestLegislaturasGet.test_get_single_legislatura"))
    def test_serialized_output(self, facade, traverse_to_item, serialize):
        """Serialize a single legislatura and inspect the output."""
        item = traverse_to_item(facade, "20")
        data = serialize(item)
        assert data["@type"] == "Legislatura"
        assert "title" in data
        assert "parent" in data
        assert data["parent"]["title"] == "Legislaturas"
