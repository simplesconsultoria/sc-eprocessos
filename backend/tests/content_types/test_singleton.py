"""Tests for the singleton pattern on facade content types."""

from plone import api
from zExceptions import BadRequest

import pytest


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

    @pytest.mark.parametrize("portal_type", ALL_TYPES)
    def test_permission_removed_after_creation(self, portal_type, content_factory):
        content_factory(
            self.portal,
            portal_type,
            id=f"test-{portal_type}",
            title=f"Test {portal_type}",
        )
        roles = self._permission_roles(portal_type)
        assert "Manager" not in roles
        assert "Site Administrator" not in roles

    @pytest.mark.parametrize("portal_type", ALL_TYPES)
    def test_permission_restored_after_deletion(self, portal_type, content_factory):
        content = content_factory(
            self.portal,
            portal_type,
            id=f"test-{portal_type}",
            title=f"Test {portal_type}",
        )
        with api.env.adopt_roles(["Manager"]):
            api.content.delete(obj=content)
        roles = self._permission_roles(portal_type)
        assert "Manager" in roles
        assert "Site Administrator" in roles


class TestSingletonAllowsMoveAndRename:
    """Enforcement must not block move/rename of the existing instance."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal):
        self.portal = portal

    @pytest.mark.parametrize("portal_type", ALL_TYPES)
    def test_rename_is_allowed(self, portal_type, content_factory):
        content_factory(
            self.portal,
            portal_type,
            id=f"test-{portal_type}",
            title=f"Test {portal_type}",
        )
        new_id = f"renamed-{portal_type}"
        with api.env.adopt_roles(["Manager"]):
            api.content.rename(
                obj=self.portal[f"test-{portal_type}"],
                new_id=new_id,
            )
        assert new_id in self.portal.objectIds()
        assert f"test-{portal_type}" not in self.portal.objectIds()

    @pytest.mark.parametrize("portal_type", ALL_TYPES)
    def test_move_is_allowed(self, portal_type, content_factory):
        folder = content_factory(
            self.portal,
            "Document",
            id=f"folder-{portal_type}",
            title=f"Folder for {portal_type}",
        )
        content = content_factory(
            self.portal,
            portal_type,
            id=f"test-{portal_type}",
            title=f"Test {portal_type}",
        )
        with api.env.adopt_roles(["Manager"]):
            api.content.move(source=content, target=folder)
        assert f"test-{portal_type}" in folder.objectIds()
        assert f"test-{portal_type}" not in self.portal.objectIds()

    @pytest.mark.parametrize("portal_type", ALL_TYPES)
    def test_copy_paste_is_blocked(self, portal_type, content_factory):
        """Copy/paste tries to create a *new* instance, so the singleton wins."""
        content_factory(
            self.portal,
            portal_type,
            id=f"test-{portal_type}",
            title=f"Test {portal_type}",
        )
        with api.env.adopt_roles(["Manager"]), pytest.raises(BadRequest):
            api.content.copy(
                source=self.portal[f"test-{portal_type}"],
                target=self.portal,
                safe_id=True,
            )
