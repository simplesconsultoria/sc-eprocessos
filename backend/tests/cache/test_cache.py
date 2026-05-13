"""Tests for sc.eprocessos.cache."""

from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from Products.CMFPlone.Portal import PloneSite
from sc.eprocessos import cache as cache_module
from sc.eprocessos.client.exceptions import EProcessosConnectionError
from sc.eprocessos.content.items.vereador import VereadorItem
from typing import Any
from unittest.mock import patch

import pytest


REGISTRY_SETTINGS: dict[str, str | int | float] = {
    "eprocessos.base_url": "https://e-processos.example.com",
    "eprocessos.default_timeout": 30,
    "eprocessos.max_retries": 1,
    "eprocessos.retry_delay": 0.0,
    "eprocessos.cache_ttl": 300,
}


@pytest.fixture()
def portal(integration: dict[str, Any]) -> PloneSite:
    portal = integration["portal"]
    setRoles(portal, TEST_USER_ID, ["Manager"])
    return portal


@pytest.fixture(autouse=True)
def _setup_registry(portal: PloneSite) -> None:
    for key, value in REGISTRY_SETTINGS.items():
        api.portal.set_registry_record(key, value)


@pytest.fixture()
def vereadores_facade(portal, content_factory):
    return content_factory(portal, "Vereadores", id="vereadores", title="Vereadores")


class TestFetchDataCache:
    """The ``EProcessosItem.fetch_data`` decorator should memoize across
    instances and share entries keyed by (class, service, id, sub_item)."""

    def test_hit_same_item(self, vereadores_facade):
        """Two accesses to the same item only trigger one upstream call."""
        expected = {"id": "1", "title": "Test", "@id": "/@@vereadores/1"}

        with patch("sc.eprocessos.content.items.base.get_client") as mock_get_client:
            mock_get_client.return_value.vereadores.get.return_value = expected

            a = VereadorItem(item_id="1")
            a._facade = vereadores_facade
            b = VereadorItem(item_id="1")
            b._facade = vereadores_facade

            assert a.data == expected
            assert b.data == expected
            assert mock_get_client.return_value.vereadores.get.call_count == 1

    def test_miss_different_ids(self, vereadores_facade):
        """Different item_ids produce distinct cache entries."""
        with patch("sc.eprocessos.content.items.base.get_client") as mock_get_client:
            mock_get_client.return_value.vereadores.get.side_effect = [
                {"id": "1", "title": "A", "@id": "/@@vereadores/1"},
                {"id": "2", "title": "B", "@id": "/@@vereadores/2"},
            ]

            a = VereadorItem(item_id="1")
            a._facade = vereadores_facade
            b = VereadorItem(item_id="2")
            b._facade = vereadores_facade

            assert a.data["title"] == "A"
            assert b.data["title"] == "B"
            assert mock_get_client.return_value.vereadores.get.call_count == 2

    def test_invalidate_all_forces_refetch(self, vereadores_facade):
        """``invalidate_all`` clears the cache, causing the next access to refetch."""
        expected = {"id": "1", "title": "First", "@id": "/@@vereadores/1"}
        expected_after = {"id": "1", "title": "Second", "@id": "/@@vereadores/1"}

        with patch("sc.eprocessos.content.items.base.get_client") as mock_get_client:
            mock_get_client.return_value.vereadores.get.side_effect = [
                expected,
                expected_after,
            ]

            a = VereadorItem(item_id="1")
            a._facade = vereadores_facade
            assert a.data == expected

            cache_module.invalidate_all()

            # A fresh item instance must re-fetch after the flush
            # (the old instance still holds _data from the local cache).
            b = VereadorItem(item_id="1")
            b._facade = vereadores_facade
            assert b.data == expected_after
            assert mock_get_client.return_value.vereadores.get.call_count == 2

    def test_errors_are_not_cached(self, vereadores_facade):
        """A failed fetch should not stick in the cache (no negative caching in v1)."""
        with patch("sc.eprocessos.content.items.base.get_client") as mock_get_client:
            mock_get_client.return_value.vereadores.get.side_effect = [
                EProcessosConnectionError("upstream down"),
                {"id": "1", "title": "Recovered", "@id": "/@@vereadores/1"},
            ]

            a = VereadorItem(item_id="1")
            a._facade = vereadores_facade
            with pytest.raises(EProcessosConnectionError):
                _ = a.data

            # A new instance should try again — the error must not have
            # been cached as if it were a successful response.
            b = VereadorItem(item_id="1")
            b._facade = vereadores_facade
            assert b.data["title"] == "Recovered"
            assert mock_get_client.return_value.vereadores.get.call_count == 2


class TestFormDataCache:
    """The parameterized list endpoint should cache by (service, params)."""

    def test_hit_same_params(self):
        from sc.eprocessos.services import formdata

        expected = {"items": [{"id": "1"}], "description": "ok"}
        with patch("sc.eprocessos.services.formdata.get_client") as mock_get_client:
            mock_get_client.return_value.normas.list.return_value = expected
            a = formdata._fetch_form_list("normas", ano=2026, tipo=1)
            b = formdata._fetch_form_list("normas", ano=2026, tipo=1)
            assert a == b == expected
            assert mock_get_client.return_value.normas.list.call_count == 1

    def test_miss_different_params(self):
        from sc.eprocessos.services import formdata

        with patch("sc.eprocessos.services.formdata.get_client") as mock_get_client:
            mock_get_client.return_value.normas.list.side_effect = [
                {"items": [{"id": "1"}], "description": "2025"},
                {"items": [{"id": "2"}], "description": "2026"},
            ]
            a = formdata._fetch_form_list("normas", ano=2025, tipo=1)
            b = formdata._fetch_form_list("normas", ano=2026, tipo=1)
            assert a["description"] == "2025"
            assert b["description"] == "2026"
            assert mock_get_client.return_value.normas.list.call_count == 2

    def test_miss_different_service(self):
        from sc.eprocessos.services import formdata

        with patch("sc.eprocessos.services.formdata.get_client") as mock_get_client:
            mock_get_client.return_value.normas.list.return_value = {
                "items": [],
                "description": "normas",
            }
            mock_get_client.return_value.materias.list.return_value = {
                "items": [],
                "description": "materias",
            }
            a = formdata._fetch_form_list("normas", ano=2026, tipo=1)
            b = formdata._fetch_form_list("materias", ano=2026, tipo=6)
            assert a["description"] == "normas"
            assert b["description"] == "materias"


class TestCacheSettings:
    """The cache TTL should track the registry record at lookup time."""

    def test_ttl_syncs_from_registry(self, portal: PloneSite):
        api.portal.set_registry_record("eprocessos.cache_ttl", 120)
        cache_module._sync_ttl_from_registry()
        assert cache_module.get_ttl() == 120

    def test_ttl_updates_on_next_lookup(self, portal: PloneSite, vereadores_facade):
        """Changing the registry value is reflected on the next cache call."""
        api.portal.set_registry_record("eprocessos.cache_ttl", 600)

        with patch("sc.eprocessos.content.items.base.get_client") as mock_get_client:
            mock_get_client.return_value.vereadores.get.return_value = {
                "id": "1",
                "title": "X",
                "@id": "/@@vereadores/1",
            }
            item = VereadorItem(item_id="1")
            item._facade = vereadores_facade
            _ = item.data  # triggers _get_cache, which syncs TTL

        assert cache_module.get_ttl() == 600

    def test_invalidate_all_idempotent(self):
        """Flushing an empty cache is a no-op, not an error."""
        cache_module.invalidate_all()
        cache_module.invalidate_all()
