"""Tests for the Legislaturas content type."""

from plone.dexterity.fti import DexterityFTI
from sc.eprocessos.content.base import EProcessosFacade
from sc.eprocessos.content.items.legislatura import LegislaturaItem
from sc.eprocessos.content.legislaturas import Legislaturas
from sc.eprocessos.interfaces import IEProcessosFacade
from sc.eprocessos.interfaces import ILegislaturas
from typing import Any

import pytest


PORTAL_TYPE = "Legislaturas"
PERMISSION_ADD = "sc.eprocessos: Add Legislaturas"
EXPECTED_BEHAVIORS = (
    "plone.basic",
    "plone.namefromtitle",
    "plone.shortname",
    "plone.excludefromnavigation",
    "plone.versioning",
    "volto.blocks",
)


class TestFTI:
    """Test Factory Type Information registration for Legislaturas."""

    @pytest.fixture(autouse=True)
    def _setup(self, get_fti_class):
        self.fti = get_fti_class(PORTAL_TYPE)

    def test_fti_exists(self):
        """Legislaturas FTI is registered as a DexterityFTI."""
        assert self.fti is not None
        assert isinstance(self.fti, DexterityFTI)

    @pytest.mark.parametrize(
        "attribute,expected",
        (
            ("title", PORTAL_TYPE),
            ("global_allow", True),
            ("filter_content_types", True),
            ("allowed_content_types", ()),
            ("klass", "sc.eprocessos.content.legislaturas.Legislaturas"),
            ("add_permission", "sc.eprocessos.AddLegislaturas"),
            ("behaviors", EXPECTED_BEHAVIORS),
        ),
    )
    def test_attributes(self, attribute: str, expected: Any):
        """FTI attributes match expected values."""
        assert getattr(self.fti, attribute) == expected


class TestContentType:
    """Test Legislaturas content type creation and class attributes."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal, content_factory):
        self.portal = portal
        self.content = content_factory(portal, PORTAL_TYPE, title="Legislaturas")

    def test_create(self):
        """Content is created with the correct portal_type."""
        assert self.content.portal_type == PORTAL_TYPE

    def test_instance_class(self):
        """Content is an instance of Legislaturas and EProcessosFacade."""
        assert isinstance(self.content, Legislaturas)
        assert isinstance(self.content, EProcessosFacade)

    def test_provides_marker_interface(self):
        """Content provides both ILegislaturas and IEProcessosFacade."""
        assert ILegislaturas.providedBy(self.content)
        assert IEProcessosFacade.providedBy(self.content)

    def test_service_name(self):
        """Legislaturas facade maps to the 'legislaturas' client service."""
        assert self.content.service_name == "legislaturas"

    def test_display_form(self):
        """Legislaturas lists results directly (no search form)."""
        assert self.content.display_form is False

    def test_item_class(self):
        """Traversed items are LegislaturaItem instances."""
        assert self.content.item_class is LegislaturaItem


class TestPermissions:
    """Test add permission for Legislaturas."""

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
        """Only Manager and Site Administrator can add Legislaturas."""
        container = self.portal
        assert (role in roles_with_permission(container, PERMISSION_ADD)) is can_add
