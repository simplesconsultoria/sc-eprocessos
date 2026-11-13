"""Tests for VereadorItem serialization."""

from pathlib import Path
from sc.eprocessos.serializers.items.vereador import filiacao
from unittest.mock import patch

import pytest


_CASSETTES = Path(__file__).parent.parent / "client" / "cassettes"


def _c(name: str) -> str:
    return str(_CASSETTES / "test_vereadores" / f"{name}.yaml")


# Shapes as e-Processos returns them: partido_atual is an object, and the
# first entry of filiacoes is an old affiliation, not the current one.
_PARTIDO_ATUAL = {
    "sgl": "PL",
    "nome": "PARTIDO LIBERAL",
    "cod_partido": 11,
    "url_logo": "",
}

_FILIACOES = [
    {"filiacao_atual": False, "token": "MOBILIZA"},
    {"filiacao_atual": False, "token": "PSDB"},
    {"filiacao_atual": True, "token": "PL"},
]


@pytest.fixture()
def facade(portal, content_factory):
    return content_factory(portal, "Vereadores", id="vereadores", title="Vereadores")


class TestVereadorSerialization:
    """Test VereadorItem serialization via ISerializeToJson."""

    @pytest.mark.vcr(_c("TestVereadoresGet.test_get_single_vereador"))
    def test_serialized_output(self, facade, traverse_to_item, serialize):
        """Serialize a single vereador and inspect the output."""
        item = traverse_to_item(facade, "546914")
        data = serialize(item)
        assert data["@type"] == "Vereador"
        assert data["description"] == "PP"
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

    def test_description_from_partido_atual(self, facade, traverse_to_item, serialize):
        """The description is the acronym in partido_atual, not the first filiacao."""
        item = traverse_to_item(facade, "26010")
        mock_data = {
            "id": "26010",
            "@id": "https://example.com/@@vereadores/26010",
            "@type": "Vereador",
            "title": "Vereador",
            "description": "Nome Completo",
            "partido": None,
            "partido_atual": _PARTIDO_ATUAL,
            "filiacoes": _FILIACOES,
        }
        with patch("sc.eprocessos.content.items.base.get_client") as mock:
            mock.return_value.vereadores.get.return_value = mock_data
            data = serialize(item)
        assert data["description"] == "PL"
        assert data["fullname"] == "Nome Completo"


class TestFiliacao:
    """Test the filiacao helper."""

    @pytest.mark.parametrize(
        "data,expected",
        [
            ({"partido_atual": _PARTIDO_ATUAL, "filiacoes": _FILIACOES}, "PL"),
            ({"partido_atual": _PARTIDO_ATUAL}, "PL"),
            (
                {
                    "partido_atual": {"sgl": "PT"},
                    "filiacoes": [{"filiacao_atual": True, "token": "PL"}],
                },
                "PT",
            ),
            ({"partido_atual": None, "filiacoes": _FILIACOES}, "PL"),
            ({"filiacoes": _FILIACOES}, "PL"),
            ({"partido_atual": {"sgl": ""}, "filiacoes": _FILIACOES}, "PL"),
            ({"partido_atual": {}, "filiacoes": _FILIACOES}, "PL"),
            (
                {
                    "partido_atual": None,
                    "filiacoes": [{"filiacao_atual": False, "token": "PSDB"}],
                },
                "",
            ),
            ({"partido_atual": None, "filiacoes": []}, ""),
            ({"partido_atual": None, "filiacoes": None}, ""),
            ({"filiacoes": [{"filiacao_atual": True}]}, ""),
            ({}, ""),
        ],
        ids=[
            "partido-atual",
            "partido-atual-without-filiacoes",
            "partido-atual-wins-over-filiacoes",
            "null-partido-atual-uses-current-filiacao",
            "missing-partido-atual-uses-current-filiacao",
            "empty-sgl-uses-current-filiacao",
            "empty-partido-atual-uses-current-filiacao",
            "no-current-filiacao",
            "empty-filiacoes",
            "null-filiacoes",
            "current-filiacao-without-token",
            "no-data",
        ],
    )
    def test_filiacao(self, data: dict, expected: str):
        assert filiacao(data) == expected
