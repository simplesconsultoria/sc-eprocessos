"""Tests for the Comissoes content type."""

from plone.dexterity.fti import DexterityFTI
from sc.eprocessos.content.base import EProcessosFacade
from sc.eprocessos.content.comissoes import Comissoes
from sc.eprocessos.content.items.comissao import ComissaoItem
from sc.eprocessos.interfaces import IComissoes
from sc.eprocessos.interfaces import IEProcessosFacade
from typing import Any

import pytest


PORTAL_TYPE = "Comissoes"
PERMISSION_ADD = "sc.eprocessos: Add Comissoes"
EXPECTED_BEHAVIORS = (
    "plone.basic",
    "plone.namefromtitle",
    "plone.shortname",
    "plone.excludefromnavigation",
    "plone.versioning",
    "volto.blocks",
)


class TestFTI:
    """Test Factory Type Information registration for Comissoes."""

    @pytest.fixture(autouse=True)
    def _setup(self, get_fti_class):
        self.fti = get_fti_class(PORTAL_TYPE)

    def test_fti_exists(self):
        """Comissoes FTI is registered as a DexterityFTI."""
        assert self.fti is not None
        assert isinstance(self.fti, DexterityFTI)

    @pytest.mark.parametrize(
        "attribute,expected",
        (
            ("title", "Comissões"),
            ("global_allow", True),
            ("filter_content_types", True),
            ("allowed_content_types", ()),
            ("klass", "sc.eprocessos.content.comissoes.Comissoes"),
            ("add_permission", "sc.eprocessos.AddComissoes"),
            ("behaviors", EXPECTED_BEHAVIORS),
        ),
    )
    def test_attributes(self, attribute: str, expected: Any):
        """FTI attributes match expected values."""
        assert getattr(self.fti, attribute) == expected


class TestContentType:
    """Test Comissoes content type creation and class attributes."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal, content_factory):
        self.portal = portal
        self.content = content_factory(portal, PORTAL_TYPE, title="Comissões")

    def test_create(self):
        """Content is created with the correct portal_type."""
        assert self.content.portal_type == PORTAL_TYPE

    def test_instance_class(self):
        """Content is an instance of Comissoes and EProcessosFacade."""
        assert isinstance(self.content, Comissoes)
        assert isinstance(self.content, EProcessosFacade)

    def test_provides_marker_interface(self):
        """Content provides both IComissoes and IEProcessosFacade."""
        assert IComissoes.providedBy(self.content)
        assert IEProcessosFacade.providedBy(self.content)

    def test_service_name(self):
        """Comissoes facade maps to the 'comissoes' client service."""
        assert self.content.service_name == "comissoes"

    def test_display_form(self):
        """Comissoes lists results directly (no search form)."""
        assert self.content.display_form is False

    def test_item_class(self):
        """Traversed items are ComissaoItem instances."""
        assert self.content.item_class is ComissaoItem


class TestPermissions:
    """Test add permission for Comissoes."""

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
        """Only Manager and Site Administrator can add Comissoes."""
        container = self.portal
        assert (role in roles_with_permission(container, PERMISSION_ADD)) is can_add
