"""Tests for sc.eprocessos.utils.urls.facade_urls."""

from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from Products.CMFPlone.Portal import PloneSite
from sc.eprocessos.utils.urls import facade_urls
from typing import Any

import pytest


@pytest.fixture()
def portal(integration: dict[str, Any]) -> PloneSite:
    portal = integration["portal"]
    setRoles(portal, TEST_USER_ID, ["Manager"])
    return portal


class TestFacadeUrls:
    """Test facade_urls catalog lookup."""

    def test_empty_when_no_facades(self, portal: PloneSite):
        result = facade_urls()
        assert result == {}

    def test_returns_vereadores_url(self, portal: PloneSite, content_factory):
        content_factory(portal, "Vereadores", title="Vereadores")
        result = facade_urls()
        assert "vereadores" in result
        assert result["vereadores"].endswith("/vereadores")

    def test_returns_multiple_facades(self, portal: PloneSite, content_factory):
        content_factory(portal, "Vereadores", title="Vereadores")
        content_factory(portal, "Normas", title="Normas")
        result = facade_urls()
        assert "vereadores" in result
        assert "normas" in result

    def test_keys_are_lowercase(self, portal: PloneSite, content_factory):
        content_factory(portal, "Vereadores", title="Vereadores")
        result = facade_urls()
        for key in result:
            assert key == key.lower()
