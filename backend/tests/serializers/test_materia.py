"""Tests for MateriaItem serialization.

Note: the single-item GET endpoint (/@@materias/{id}) returns 500 on
the reference e-Processos instance, so the get test uses a mock.
"""

from pathlib import Path
from unittest.mock import patch

import pytest


_CASSETTES = Path(__file__).parent.parent / "client" / "cassettes"


def _c(name: str) -> str:
    return str(_CASSETTES / "test_materias" / f"{name}.yaml")


@pytest.fixture()
def facade(portal, content_factory):
    return content_factory(
        portal, "Materias", id="materias", title="Matérias Legislativas"
    )


class TestMateriaSerialization:
    """Test MateriaItem serialization via ISerializeToJson."""

    def test_serialized_output_mocked(self, facade, traverse_to_item, serialize):
        """Serialize a single materia with mocked API response."""
        item = traverse_to_item(facade, "12345")
        mock_data = {
            "id": "12345",
            "@id": "https://example.com/@@materias/12345",
            "@type": "Materia",
            "title": "Projeto de Lei nº 1/2025",
            "description": "Test materia",
        }
        with patch("sc.eprocessos.content.items.base.get_client") as mock:
            mock.return_value.materias.get.return_value = mock_data
            data = serialize(item)
        assert data["@type"] == "Materia"
        assert data["title"] == "Projeto de Lei nº 1/2025"
        assert "parent" in data
        assert data["parent"]["title"] == "Matérias Legislativas"

    @pytest.mark.vcr(_c("TestMateriasGet.test_get_returns_server_error"))
    def test_server_error_raises_502(self, facade, traverse_to_item, serialize):
        """When the API returns 500, serialization raises HTTPBadGateway."""
        from zExceptions import HTTPBadGateway

        item = traverse_to_item(facade, "241369")
        with pytest.raises(HTTPBadGateway):
            serialize(item)
