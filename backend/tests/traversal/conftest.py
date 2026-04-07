"""Fixtures for traversal tests."""

from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from Products.CMFPlone.Portal import PloneSite
from sc.eprocessos.content.base import EProcessosFacade
from typing import Any

import pytest


@pytest.fixture()
def portal(integration: dict[str, Any]) -> PloneSite:
    portal = integration["portal"]
    setRoles(portal, TEST_USER_ID, ["Manager"])
    return portal


@pytest.fixture()
def http_request(integration: dict[str, Any]) -> Any:
    return integration["request"]


@pytest.fixture()
def vereadores_facade(portal: PloneSite, content_factory) -> EProcessosFacade:
    """Create a Vereadores facade in the portal."""
    return content_factory(portal, "Vereadores", title="Vereadores")


@pytest.fixture()
def normas_facade(portal: PloneSite, content_factory) -> EProcessosFacade:
    """Create a Normas facade in the portal."""
    return content_factory(portal, "Normas", title="Normas")


@pytest.fixture()
def sessoes_facade(portal: PloneSite, content_factory) -> EProcessosFacade:
    """Create a Sessoes facade in the portal."""
    return content_factory(portal, "Sessoes", title="Sessões Plenárias")
