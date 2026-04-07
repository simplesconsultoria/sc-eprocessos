"""Tests for the Sessoes content type."""

from plone.dexterity.fti import DexterityFTI
from sc.eprocessos.content.base import EProcessosFacade
from sc.eprocessos.content.items.sessao import SessaoItem
from sc.eprocessos.content.sessoes import Sessoes
from sc.eprocessos.interfaces import IEProcessosFacade
from sc.eprocessos.interfaces import ISessoes
from typing import Any

import pytest


PORTAL_TYPE = "Sessoes"
PERMISSION_ADD = "sc.eprocessos: Add Sessoes"
EXPECTED_BEHAVIORS = (
    "plone.basic",
    "plone.namefromtitle",
    "plone.shortname",
    "plone.excludefromnavigation",
    "plone.versioning",
    "volto.blocks",
)


class TestFTI:
    """Test Factory Type Information registration for Sessoes."""

    @pytest.fixture(autouse=True)
    def _setup(self, get_fti_class):
        self.fti = get_fti_class(PORTAL_TYPE)

    def test_fti_exists(self):
        """Sessoes FTI is registered as a DexterityFTI."""
        assert self.fti is not None
        assert isinstance(self.fti, DexterityFTI)

    @pytest.mark.parametrize(
        "attribute,expected",
        (
            ("title", "Sessões Plenárias"),
            ("global_allow", True),
            ("filter_content_types", True),
            ("allowed_content_types", ()),
            ("klass", "sc.eprocessos.content.sessoes.Sessoes"),
            ("add_permission", "sc.eprocessos.AddSessoes"),
            ("behaviors", EXPECTED_BEHAVIORS),
        ),
    )
    def test_attributes(self, attribute: str, expected: Any):
        """FTI attributes match expected values."""
        assert getattr(self.fti, attribute) == expected


class TestContentType:
    """Test Sessoes content type creation and class attributes."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal, content_factory):
        self.portal = portal
        self.content = content_factory(portal, PORTAL_TYPE, title="Sessões Plenárias")

    def test_create(self):
        """Content is created with the correct portal_type."""
        assert self.content.portal_type == PORTAL_TYPE

    def test_instance_class(self):
        """Content is an instance of Sessoes and EProcessosFacade."""
        assert isinstance(self.content, Sessoes)
        assert isinstance(self.content, EProcessosFacade)

    def test_provides_marker_interface(self):
        """Content provides both ISessoes and IEProcessosFacade."""
        assert ISessoes.providedBy(self.content)
        assert IEProcessosFacade.providedBy(self.content)

    def test_service_name(self):
        """Sessoes facade maps to the 'sessoes' client service."""
        assert self.content.service_name == "sessoes"

    def test_display_form(self):
        """Sessoes requires a search form (ano + tipo)."""
        assert self.content.display_form is True

    def test_item_class(self):
        """Traversed items are SessaoItem instances."""
        assert self.content.item_class is SessaoItem


class TestPermissions:
    """Test add permission for Sessoes."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal):
        self.portal = portal

    @pytest.mark.parametrize(
        "role,can_add",
        (
            ("Manager", True),
            ("Site Administrator", True),
            ("Reviewer", False),
            ("Editor", False),
            ("Contributor", False),
            ("Reader", False),
        ),
    )
    def test_roles_with_add_permission(self, role, can_add, roles_with_permission):
        """Only Manager and Site Administrator can add Sessoes."""
        container = self.portal
        assert (role in roles_with_permission(container, PERMISSION_ADD)) is can_add
