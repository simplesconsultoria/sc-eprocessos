"""Fixtures for content type tests."""

from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from plone.dexterity.content import DexterityContent
from plone.dexterity.fti import DexterityFTI
from plone.dexterity.interfaces import IDexterityFTI
from Products.CMFPlone.Portal import PloneSite
from pytest_plone import _types as t
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
