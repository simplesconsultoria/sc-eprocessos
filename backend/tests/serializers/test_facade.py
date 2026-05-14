"""Tests for the facade serializers.

Covers the two-serializer split — :class:`SerializeFacadeToJson` for
non-searchable facades and :class:`SerializeSearchableFacadeToJson` for
searchable ones — and the short-circuit behavior under
``plone.exportimport``.
"""

from plone.exportimport.interfaces import IExportImportRequestMarker
from sc.eprocessos.cache import invalidate_all
from sc.eprocessos.content.base import EProcessosFacade
from typing import Any
from unittest.mock import patch
from zope.interface import alsoProvides

import pytest


@pytest.fixture()
def vereadores_facade(portal, content_factory) -> EProcessosFacade:
    facade = content_factory(portal, "Vereadores", id="vereadores", title="Vereadores")
    # Dexterity may have triggered form_config (and thus _get_filtros) during
    # schema validation at creation, populating the RAM cache. Flush so the
    # per-test mocks are observed.
    invalidate_all()
    return facade


@pytest.fixture()
def sessoes_facade(portal, content_factory) -> EProcessosFacade:
    facade = content_factory(portal, "Sessoes", id="sessoes", title="Sessoes Plenarias")
    invalidate_all()
    return facade


class TestSerializeFacadeToJson:
    """``SerializeFacadeToJson`` is registered for ``IEProcessosFacade``.

    Non-searchable facades (Vereadores, Comissoes, Mesas, Legislaturas)
    should always fetch every upstream item — no form_config, no params.
    """

    def test_fetches_all_items_no_params(
        self, vereadores_facade: EProcessosFacade, serialize
    ) -> None:
        listing = {
            "items": [{"id": "1", "@id": "/@@vereadores/1", "title": "Alice"}],
            "description": "ok",
        }
        with patch("sc.eprocessos.serializers.facade.get_client") as mock_get_client:
            mock_get_client.return_value.vereadores.list.return_value = listing
            data = serialize(vereadores_facade)

        assert data["service_name"] == "vereadores"
        assert data["items_total"] == 1
        assert "form_config" not in data
        # Non-searchable facades fetch unfiltered — no params forwarded.
        mock_get_client.return_value.vereadores.list.assert_called_once_with()

    def test_external_error_marks_payload(
        self, vereadores_facade: EProcessosFacade, serialize
    ) -> None:
        from sc.eprocessos.client.exceptions import EProcessosConnectionError

        with patch("sc.eprocessos.serializers.facade.get_client") as mock_get_client:
            mock_get_client.return_value.vereadores.list.side_effect = (
                EProcessosConnectionError("upstream down")
            )
            data = serialize(vereadores_facade)

        assert data["items"] == []
        assert data["external_error"] is True


class TestSerializeSearchableFacadeToJson:
    """``SerializeSearchableFacadeToJson`` is registered for
    ``IEProcessosSearchableFacade``.

    Adds ``form_config`` to the payload and only triggers an upstream
    fetch when filter params are present in the querystring.
    """

    def _stub_filtros(self, mock_get_client) -> None:
        mock_get_client.return_value.sessoes.vocabularies.return_value = {
            "ano": [{"id": 2026, "title": "2026"}],
            "tipo": [{"id": 1, "title": "Ordinaria"}],
        }

    def test_form_config_uses_subclass_title(
        self,
        sessoes_facade: EProcessosFacade,
        serialize,
    ) -> None:
        """``form_config["title"]`` reflects the subclass's
        ``_form_config_title`` — not the base default."""
        with (
            patch("sc.eprocessos.serializers.facade.get_client"),
            patch("sc.eprocessos.content.base.get_client") as mock_voc,
        ):
            self._stub_filtros(mock_voc)
            data = serialize(sessoes_facade)

        assert data["form_config"]["title"] == "Filtrar sessões"
        # Choices were taken from the upstream vocabularies stub.
        assert data["form_config"]["properties"]["ano"]["choices"] == [["2026", "2026"]]

    def test_no_params_no_fetch(
        self,
        sessoes_facade: EProcessosFacade,
        request_with_layer,
        serialize,
    ) -> None:
        """Without filter params, the listing endpoint is not called."""
        with (
            patch("sc.eprocessos.serializers.facade.get_client") as mock_list,
            patch("sc.eprocessos.content.base.get_client") as mock_voc,
        ):
            self._stub_filtros(mock_voc)
            data = serialize(sessoes_facade)

        mock_list.return_value.sessoes.list.assert_not_called()
        assert data["service_name"] == "sessoes"
        assert "external_error" not in data

    def test_params_trigger_fetch(
        self,
        sessoes_facade: EProcessosFacade,
        request_with_layer,
        serialize,
    ) -> None:
        """``?ano=2026&tipo=1`` triggers the upstream listing call."""
        request_with_layer.form["ano"] = "2026"
        request_with_layer.form["tipo"] = "1"
        listing: dict[str, Any] = {"items": [], "description": "ok"}

        with (
            patch("sc.eprocessos.serializers.facade.get_client") as mock_list,
            patch("sc.eprocessos.content.base.get_client") as mock_voc,
        ):
            self._stub_filtros(mock_voc)
            mock_list.return_value.sessoes.list.return_value = listing
            data = serialize(sessoes_facade)

        assert data["items"] == []
        assert data["items_total"] == 0
        mock_list.return_value.sessoes.list.assert_called_once_with(ano=2026, tipo=1)


class TestExportImportMarkerGuard:
    """Both serializers must skip the upstream client when
    ``IExportImportRequestMarker`` is on the request.

    The contractual guarantee is "no client calls during export/import" —
    the rest of the payload (schema-derived fields like ``items: []`` or
    a default ``form_config``) is the default Dexterity serializer's
    output and isn't the addon's concern.
    """

    def test_non_searchable_facade_does_not_call_client(
        self,
        vereadores_facade: EProcessosFacade,
        request_with_layer,
        serialize,
    ) -> None:
        alsoProvides(request_with_layer, IExportImportRequestMarker)

        with patch("sc.eprocessos.serializers.facade.get_client") as mock_get_client:
            data = serialize(vereadores_facade)

        mock_get_client.assert_not_called()
        assert data["service_name"] == "vereadores"
        # Upstream-driven flags are absent.
        assert "external_error" not in data

    def test_searchable_facade_does_not_call_client(
        self,
        sessoes_facade: EProcessosFacade,
        request_with_layer,
        serialize,
    ) -> None:
        """Even with filter params, no upstream call fires under the marker."""
        request_with_layer.form["ano"] = "2026"
        request_with_layer.form["tipo"] = "1"
        alsoProvides(request_with_layer, IExportImportRequestMarker)

        with (
            patch("sc.eprocessos.serializers.facade.get_client") as mock_list,
            patch("sc.eprocessos.content.base.get_client") as mock_voc,
        ):
            data = serialize(sessoes_facade)

        mock_list.assert_not_called()
        mock_voc.assert_not_called()
        assert data["service_name"] == "sessoes"
        # Upstream-driven flags are absent.
        assert "external_error" not in data
