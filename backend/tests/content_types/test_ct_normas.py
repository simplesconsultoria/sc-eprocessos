"""Tests for the Normas content type."""

from plone.dexterity.fti import DexterityFTI
from sc.eprocessos.content.base import EProcessosFacade
from sc.eprocessos.content.items.norma import NormaItem
from sc.eprocessos.content.normas import Normas
from sc.eprocessos.interfaces import IEProcessosFacade
from sc.eprocessos.interfaces import INormas
from typing import Any

import pytest


@pytest.fixture(scope="module")
def portal_type():
    return "Normas"


EXPECTED_BEHAVIORS = (
    "plone.basic",
    "plone.namefromtitle",
    "plone.shortname",
    "plone.excludefromnavigation",
    "plone.versioning",
    "volto.blocks",
)


class TestFTI:
    """Test Factory Type Information registration for Normas."""

    @pytest.fixture(autouse=True)
    def _setup(self, get_fti_class, portal_type):
        self.fti = get_fti_class(portal_type)

    def test_fti_exists(self):
        """Normas FTI is registered as a DexterityFTI."""
        assert self.fti is not None
        assert isinstance(self.fti, DexterityFTI)

    @pytest.mark.parametrize(
        "attribute,expected",
        (
            ("title", "Normas"),
            ("global_allow", True),
            ("filter_content_types", True),
            ("allowed_content_types", ()),
            ("klass", "sc.eprocessos.content.normas.Normas"),
            ("add_permission", "sc.eprocessos.AddNormas"),
            ("behaviors", EXPECTED_BEHAVIORS),
        ),
    )
    def test_attributes(self, attribute: str, expected: Any):
        """FTI attributes match expected values."""
        assert getattr(self.fti, attribute) == expected


class TestContentType:
    """Test Normas content type creation and class attributes."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal, content_factory, portal_type):
        self.portal = portal
        self.content = content_factory(portal, portal_type, id="normas", title="Normas")

    def test_create(self, portal_type):
        """Content is created with the correct portal_type."""
        assert self.content.portal_type == portal_type

    def test_instance_class(self):
        """Content is an instance of Normas and EProcessosFacade."""
        assert isinstance(self.content, Normas)
        assert isinstance(self.content, EProcessosFacade)

    def test_provides_marker_interface(self):
        """Content provides both INormas and IEProcessosFacade."""
        assert INormas.providedBy(self.content)
        assert IEProcessosFacade.providedBy(self.content)

    def test_service_name(self):
        """Normas facade maps to the 'normas' client service."""
        assert self.content.service_name == "normas"

    def test_display_form(self):
        """Normas requires a search form (ano + tipo)."""
        assert self.content.display_form is True

    def test_item_class(self):
        """Traversed items are NormaItem instances."""
        assert self.content.item_class is NormaItem

    def test_type_in_navigation(self, type_in_navigation, portal_type):
        assert type_in_navigation(portal_type) is True


class TestPermissions:
    """Test add permission for Normas."""

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
    def test_roles_with_add_permission(
        self, role, can_add, roles_with_permission, permission_add
    ):
        """Only Manager and Site Administrator can add Normas."""
        container = self.portal
        assert (role in roles_with_permission(container, permission_add)) is can_add
