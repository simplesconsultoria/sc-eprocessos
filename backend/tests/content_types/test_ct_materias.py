"""Tests for the Materias content type."""

from plone.dexterity.fti import DexterityFTI
from sc.eprocessos.content.base import EProcessosFacade
from sc.eprocessos.content.items.materia import MateriaItem
from sc.eprocessos.content.materias import Materias
from sc.eprocessos.interfaces import IEProcessosFacade
from sc.eprocessos.interfaces import IMaterias
from typing import Any

import pytest


@pytest.fixture(scope="module")
def portal_type():
    return "Materias"


EXPECTED_BEHAVIORS = (
    "plone.basic",
    "plone.namefromtitle",
    "plone.shortname",
    "plone.excludefromnavigation",
    "plone.versioning",
    "volto.blocks",
)


class TestFTI:
    """Test Factory Type Information registration for Materias."""

    @pytest.fixture(autouse=True)
    def _setup(self, get_fti_class, portal_type):
        self.fti = get_fti_class(portal_type)

    def test_fti_exists(self):
        """Materias FTI is registered as a DexterityFTI."""
        assert self.fti is not None
        assert isinstance(self.fti, DexterityFTI)

    @pytest.mark.parametrize(
        "attribute,expected",
        (
            ("title", "Matérias Legislativas"),
            ("global_allow", True),
            ("filter_content_types", True),
            ("allowed_content_types", ()),
            ("klass", "sc.eprocessos.content.materias.Materias"),
            ("add_permission", "sc.eprocessos.AddMaterias"),
            ("behaviors", EXPECTED_BEHAVIORS),
        ),
    )
    def test_attributes(self, attribute: str, expected: Any):
        """FTI attributes match expected values."""
        assert getattr(self.fti, attribute) == expected


class TestContentType:
    """Test Materias content type creation and class attributes."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal, content_factory, portal_type):
        self.portal = portal
        self.content = content_factory(
            portal, portal_type, id="materias", title="Matérias Legislativas"
        )

    def test_create(self, portal_type):
        """Content is created with the correct portal_type."""
        assert self.content.portal_type == portal_type

    def test_instance_class(self):
        """Content is an instance of Materias and EProcessosFacade."""
        assert isinstance(self.content, Materias)
        assert isinstance(self.content, EProcessosFacade)

    def test_provides_marker_interface(self):
        """Content provides both IMaterias and IEProcessosFacade."""
        assert IMaterias.providedBy(self.content)
        assert IEProcessosFacade.providedBy(self.content)

    def test_service_name(self):
        """Materias facade maps to the 'materias' client service."""
        assert self.content.service_name == "materias"

    def test_display_form(self):
        """Materias requires a search form (ano + tipo)."""
        assert self.content.display_form is True

    def test_item_class(self):
        """Traversed items are MateriaItem instances."""
        assert self.content.item_class is MateriaItem

    def test_type_in_navigation(self, type_in_navigation, portal_type):
        assert type_in_navigation(portal_type) is True


class TestPermissions:
    """Test add permission for Materias."""

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
        """Only Manager and Site Administrator can add Materias."""
        container = self.portal
        assert (role in roles_with_permission(container, permission_add)) is can_add
