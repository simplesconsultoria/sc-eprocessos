"""Tests for the singleton pattern on facade content types.

These tests require the singleton subscribers to be enabled in
subscribers/configure.zcml. They are marked as xfail while disabled.
"""

from plone import api

import pytest


_xfail_subscriber_disabled = pytest.mark.xfail(
    reason="Singleton subscribers are disabled in subscribers/configure.zcml",
    strict=False,
)

ALL_TYPES = [
    "Normas",
    "Vereadores",
    "Legislaturas",
    "Mesas",
    "Comissoes",
    "Materias",
    "Sessoes",
]


class TestSingletonEnforce:
    @pytest.fixture(autouse=True)
    def _setup(self, portal):
        self.portal = portal

    def _permission_roles(self, portal_type: str) -> list[str]:
        permission = f"sc.eprocessos: Add {portal_type}"
        roles_info = self.portal.rolesOfPermission(permission)
        return [r["name"] for r in roles_info if r["selected"] == "SELECTED"]

    @pytest.mark.parametrize("portal_type", ALL_TYPES)
    def test_permission_exists_before_creation(self, portal_type):
        roles = self._permission_roles(portal_type)
        assert "Manager" in roles
        assert "Site Administrator" in roles

    @_xfail_subscriber_disabled
    @pytest.mark.parametrize("portal_type", ALL_TYPES)
    def test_permission_removed_after_creation(self, portal_type, content_factory):
        content_factory(self.portal, portal_type, title=f"Test {portal_type}")
        roles = self._permission_roles(portal_type)
        assert "Manager" not in roles
        assert "Site Administrator" not in roles

    @_xfail_subscriber_disabled
    @pytest.mark.parametrize("portal_type", ALL_TYPES)
    def test_permission_restored_after_deletion(self, portal_type, content_factory):
        content = content_factory(self.portal, portal_type, title=f"Test {portal_type}")
        with api.env.adopt_roles(["Manager"]):
            api.content.delete(obj=content)
        roles = self._permission_roles(portal_type)
        assert "Manager" in roles
        assert "Site Administrator" in roles
