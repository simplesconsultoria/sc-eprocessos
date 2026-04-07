"""Fixtures for item serialization tests."""

from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from plone.restapi.interfaces import ISerializeToJson
from Products.CMFPlone.Portal import PloneSite
from sc.eprocessos.content.base import EProcessosFacade
from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.traversal import EProcessosFacadeTraverser
from typing import Any
from typing import Protocol
from zope.component import queryMultiAdapter
from zope.interface import directlyProvidedBy
from zope.interface import directlyProvides

import pytest


REGISTRY_SETTINGS: dict[str, str | int | float] = {
    "eprocessos.base_url": "https://e-processos.camarauberlandia.mg.gov.br",
    "eprocessos.default_timeout": 30,
    "eprocessos.max_retries": 1,
    "eprocessos.retry_delay": 0.0,
}


class Serializer(Protocol):
    def __call__(self, obj: Any) -> dict[str, Any]: ...


class ItemTraverser(Protocol):
    def __call__(self, facade: EProcessosFacade, item_id: str) -> EProcessosItem: ...


@pytest.fixture()
def portal(integration: dict[str, Any]) -> PloneSite:
    portal = integration["portal"]
    setRoles(portal, TEST_USER_ID, ["Manager"])
    return portal


@pytest.fixture()
def http_request(integration: dict[str, Any]) -> Any:
    return integration["request"]


@pytest.fixture(autouse=True)
def _setup_registry(portal: PloneSite) -> None:
    """Apply registry settings."""
    for key, value in REGISTRY_SETTINGS.items():
        api.portal.set_registry_record(key, value)


@pytest.fixture()
def request_with_layer(http_request: Any) -> Any:
    """Request with IBrowserLayer applied."""
    directlyProvides(http_request, IBrowserLayer, *directlyProvidedBy(http_request))
    return http_request


@pytest.fixture()
def serialize(request_with_layer: Any) -> Serializer:
    """Serialize an object to JSON via ISerializeToJson."""

    def func(obj: Any) -> dict[str, Any]:
        serializer = queryMultiAdapter((obj, request_with_layer), ISerializeToJson)
        assert serializer is not None, f"No serializer found for {obj}"
        return serializer()

    return func


@pytest.fixture()
def traverse_to_item(request_with_layer: Any) -> ItemTraverser:
    """Traverse a facade to create an item."""

    def func(facade: EProcessosFacade, item_id: str) -> EProcessosItem:
        traverser = EProcessosFacadeTraverser(facade, request_with_layer)
        return traverser.publishTraverse(request_with_layer, item_id)

    return func
