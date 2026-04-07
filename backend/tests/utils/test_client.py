"""Tests for sc.eprocessos.utils.client."""

from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from Products.CMFPlone.Portal import PloneSite
from sc.eprocessos.client import EProcessosClient
from sc.eprocessos.utils.client import get_client
from typing import Any

import pytest


REGISTRY_SETTINGS: dict[str, str | int | float] = {
    "eprocessos.base_url": "https://e-processos.example.com",
    "eprocessos.default_timeout": 15,
    "eprocessos.max_retries": 2,
    "eprocessos.retry_delay": 0.5,
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


class TestGetClient:
    """Test get_client factory."""

    def test_returns_eprocessos_client(self):
        client = get_client()
        assert isinstance(client, EProcessosClient)
        client.close()

    def test_uses_registry_base_url(self):
        client = get_client()
        assert client._config.base_url == "https://e-processos.example.com"
        client.close()

    def test_uses_registry_timeout(self):
        client = get_client()
        assert client._config.timeout == 15.0
        client.close()

    def test_uses_registry_max_retries(self):
        client = get_client()
        assert client._config.max_retries == 2
        client.close()

    def test_uses_registry_retry_delay(self):
        client = get_client()
        assert client._config.retry_delay == 0.5
        client.close()

    def test_different_settings(self, portal: PloneSite):
        """Changing registry values produces a different client config."""
        api.portal.set_registry_record("eprocessos.base_url", "https://other.host")
        api.portal.set_registry_record("eprocessos.default_timeout", 60)
        client = get_client()
        assert client._config.base_url == "https://other.host"
        assert client._config.timeout == 60.0
        client.close()
