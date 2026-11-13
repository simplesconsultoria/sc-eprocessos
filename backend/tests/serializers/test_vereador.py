"""Tests for VereadorItem serialization."""

from pathlib import Path
from sc.eprocessos.cache import invalidate_all
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
    facade = content_factory(portal, "Vereadores", id="vereadores", title="Vereadores")
    # The listing is cached in RAM; flush it so each test hits its cassette.
    invalidate_all()
    return facade


class TestVereadoresListingSerialization:
    """Test the serialization of the councilors listed by the facade.

    Listed items carry ``partido`` (a list of ``{token, title}``) and
    neither ``partido_atual`` nor ``filiacoes``.
    """

    pytestmark = pytest.mark.vcr(_c("TestVereadoresList.test_list"))

    @pytest.fixture(autouse=True)
    def _setup(self, vcr, facade, serialize):
        self.data = serialize(facade)
        self.items = {item["id"]: item for item in self.data["items"]}

    def test_items_total(self):
        assert self.data["items_total"] == 27
        assert len(self.items) == 27

    @pytest.mark.parametrize(
        "item_id,fullname,expected",
        [
            ("546914", "Abatenio de Andrade Marquez Neto", "PP"),
            ("25988", None, "AVANTE"),
            ("26010", None, "PL"),
            ("552091", None, "PT"),
            ("537436", None, "União Brasil"),
        ],
    )
    def test_item_description_is_partido(
        self, item_id: str, fullname: str | None, expected: str
    ):
        item = self.items[item_id]
        assert item["@type"] == "Vereador"
        assert item["description"] == expected
        if fullname:
            assert item["fullname"] == fullname

    def test_every_item_has_partido(self):
        missing = [i for i, item in self.items.items() if not item["description"]]
        assert missing == []


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
            ({"partido": [{"token": "PP", "title": "PROGRESSISTAS"}]}, "PP"),
            ({"partido": [], "filiacoes": _FILIACOES}, "PL"),
            (
                {
                    "partido_atual": _PARTIDO_ATUAL,
                    "partido": [{"token": "PT", "title": "PARTIDO DOS TRABALHADORES"}],
                },
                "PL",
            ),
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
            "listing-partido",
            "empty-partido-uses-current-filiacao",
            "partido-atual-wins-over-partido",
        ],
    )
    def test_filiacao(self, data: dict, expected: str):
        assert filiacao(data) == expected
