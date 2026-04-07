"""Tests for NormaItem serialization."""

from pathlib import Path

import pytest


_CASSETTES = Path(__file__).parent.parent / "client" / "cassettes"


def _c(name: str) -> str:
    return str(_CASSETTES / "test_normas" / f"{name}.yaml")


@pytest.fixture()
def facade(portal, content_factory):
    return content_factory(portal, "Normas", title="Normas")


class TestNormaSerialization:
    """Test NormaItem serialization via ISerializeToJson."""

    @pytest.mark.vcr(_c("TestNormasGet.test_get_single_norma"))
    def test_serialized_output(self, facade, traverse_to_item, serialize):
        """Serialize a single norma and inspect the output."""
        item = traverse_to_item(facade, "18503")
        data = serialize(item)
        assert data["@type"] == "Norma"
        assert "title" in data
        assert "parent" in data
        assert data["parent"]["title"] == "Normas"
