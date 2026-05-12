"""Fixtures for content type tests."""

from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from plone.dexterity.content import DexterityContent
from plone.dexterity.fti import DexterityFTI
from plone.dexterity.interfaces import IDexterityFTI
from Products.CMFPlone.Portal import PloneSite
from pytest_plone import _types as t
from sc.eprocessos import PACKAGE_NAME
from typing import Any
from zope.component import queryUtility

import pytest


@pytest.fixture()
def portal(integration: dict[str, Any]) -> PloneSite:
    portal = integration["portal"]
    setRoles(portal, TEST_USER_ID, ["Manager"])
    return portal


class RolesWithPermission(t.Protocol):
    def __call__(self, container: DexterityContent, permission: str) -> list[str]: ...


@pytest.fixture
def roles_with_permission() -> RolesWithPermission:
    def func(container: DexterityContent, permission: str) -> list[str]:
        roles_info = container.rolesOfPermission(permission)
        return [r["name"] for r in roles_info if r["selected"] == "SELECTED"]

    return func


@pytest.fixture(scope="class")
def get_fti_class(portal_class: PloneSite) -> t.FTIGetter:
    def get_fti(name: str) -> DexterityFTI:
        """Get the Factory Type Information for a type by name."""
        return queryUtility(IDexterityFTI, name=name)

    return get_fti


@pytest.fixture
def type_in_navigation():
    def func(portal_type: str) -> bool:
        return portal_type in api.portal.get_registry_record("plone.displayed_types")

    return func


@pytest.fixture(scope="class")
def permission_add(portal_type: str) -> str:
    """Construct the add permission string for a given portal type."""
    return f"{PACKAGE_NAME}: Add {portal_type}"
