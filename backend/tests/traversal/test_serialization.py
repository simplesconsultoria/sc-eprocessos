"""Integration tests for item serialization, formdata, and error handling.

These tests run in-process (no WSGI server) so VCR cassettes and
mocks work correctly for intercepting external API calls.
"""

from pathlib import Path
from plone import api
from plone.restapi.interfaces import ISerializeToJson
from sc.eprocessos.client.exceptions import EProcessosConnectionError
from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.traversal import EProcessosFacadeTraverser
from unittest.mock import patch
from zope.component import queryMultiAdapter
from zope.interface import directlyProvidedBy
from zope.interface import directlyProvides

import pytest


CLIENT_CASSETTES = Path(__file__).parent.parent / "client" / "cassettes"

REGISTRY_SETTINGS = {
    "eprocessos.base_url": "https://e-processos.camarauberlandia.mg.gov.br",
    "eprocessos.default_timeout": 30,
    "eprocessos.max_retries": 1,
    "eprocessos.retry_delay": 0.0,
}


def _cassette(service: str, name: str) -> str:
    """Build full path to a client test cassette."""
    return str(CLIENT_CASSETTES / f"test_{service}" / f"{name}.yaml")


@pytest.fixture()
def _setup_registry(portal):
    """Apply registry settings and browser layer."""
    for key, value in REGISTRY_SETTINGS.items():
        api.portal.set_registry_record(key, value)


@pytest.fixture()
def request_with_layer(http_request):
    """Request with IBrowserLayer applied."""
    directlyProvides(http_request, IBrowserLayer, *directlyProvidedBy(http_request))
    return http_request


class TestItemSerialization:
    """Test that traversed items serialize correctly via ISerializeToJson."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal, _setup_registry, request_with_layer):
        self.portal = portal
        self.request = request_with_layer

    def _get_item(self, facade, item_id):
        """Traverse to create an item from a facade."""
        traverser = EProcessosFacadeTraverser(facade, self.request)
        return traverser.publishTraverse(self.request, item_id)

    def _serialize(self, obj):
        """Serialize an object to JSON."""
        serializer = queryMultiAdapter((obj, self.request), ISerializeToJson)
        assert serializer is not None, f"No serializer for {obj}"
        return serializer()

    @pytest.mark.vcr(
        _cassette("vereadores", "TestVereadoresGet.test_get_single_vereador")
    )
    def test_vereador_item(self, vereadores_facade):
        """Serializing a VereadorItem fetches data from the API."""
        item = self._get_item(vereadores_facade, "546914")
        data = self._serialize(item)
        assert data["@type"] == "Vereador"
        assert "title" in data
        assert "parent" in data
        assert data["parent"]["title"] == "Vereadores"

    @pytest.mark.vcr(
        _cassette("vereadores", "TestVereadoresGet.test_get_single_vereador")
    )
    def test_vereador_sub_item(self, vereadores_facade):
        """Sub-item serialization returns the nested data."""
        item = self._get_item(vereadores_facade, "546914")
        item.sub_item = "comissoes"
        data = self._serialize(item)
        assert data["@type"] == "Vereador"
        assert "data" in data

    @pytest.mark.vcr(_cassette("normas", "TestNormasGet.test_get_single_norma"))
    def test_norma_item(self, normas_facade):
        """Serializing a NormaItem fetches data from the API."""
        item = self._get_item(normas_facade, "18503")
        data = self._serialize(item)
        assert data["@type"] == "Norma"
        assert "title" in data

    @pytest.mark.vcr(_cassette("sessoes", "TestSessoesGet.test_get_with_expanders"))
    def test_sessao_item_with_expanders(self, sessoes_facade):
        """Sessao serializer fetches expanders (presenca, votacao)."""
        item = self._get_item(sessoes_facade, "1636")
        data = self._serialize(item)
        assert data["@type"] == "Sessao"
        assert "title" in data

    @pytest.mark.vcr(_cassette("sessoes", "TestSessoesGet.test_get_with_expanders"))
    def test_sessao_sub_item_presenca(self, sessoes_facade):
        """Sessao sub-item presenca fetches the expander."""
        item = self._get_item(sessoes_facade, "1636")
        item.sub_item = "presenca"
        data = self._serialize(item)
        assert data["@type"] == "Sessao"


class TestErrorHandling:
    """Test error responses when the external API is unavailable."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal, _setup_registry, request_with_layer):
        self.portal = portal
        self.request = request_with_layer

    def test_item_raises_502_on_api_failure(self, vereadores_facade):
        """When the API is down, serialization raises HTTPBadGateway."""
        from zExceptions import HTTPBadGateway

        traverser = EProcessosFacadeTraverser(vereadores_facade, self.request)
        item = traverser.publishTraverse(self.request, "12345")

        with patch("sc.eprocessos.content.items.base.get_client") as mock:
            mock.return_value.vereadores.get.side_effect = EProcessosConnectionError(
                "Connection refused"
            )
            serializer = queryMultiAdapter((item, self.request), ISerializeToJson)
            with pytest.raises(HTTPBadGateway):
                serializer()
