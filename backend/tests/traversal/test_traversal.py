"""Integration tests for the traversal adapters."""

from Products.CMFCore.interfaces import IContentish
from sc.eprocessos.content.items.sessao import SessaoItem
from sc.eprocessos.content.items.vereador import VereadorItem
from sc.eprocessos.interfaces import IEProcessosItem
from sc.eprocessos.interfaces import ISessaoItem
from sc.eprocessos.interfaces import IVereadorItem
from sc.eprocessos.traversal import EProcessosFacadeTraverser
from sc.eprocessos.traversal import EProcessosItemTraverser

import pytest


class TestEProcessosFacadeTraverser:
    """Test the facade traversal adapter."""

    @pytest.fixture(autouse=True)
    def _setup(self, portal):
        self.portal = portal

    def test_traverser_creates_item(self, vereadores_facade, http_request):
        """Traversing a path segment creates a typed item."""
        traverser = EProcessosFacadeTraverser(vereadores_facade, http_request)
        item = traverser.publishTraverse(http_request, "12345")
        assert isinstance(item, VereadorItem)
        assert item.item_id == "12345"

    def test_traversed_item_provides_contentish(self, vereadores_facade, http_request):
        """Traversed items provide IContentish for RESTWrapper compatibility."""
        traverser = EProcessosFacadeTraverser(vereadores_facade, http_request)
        item = traverser.publishTraverse(http_request, "12345")
        assert IContentish.providedBy(item)

    def test_traversed_item_provides_typed_interface(
        self, vereadores_facade, http_request
    ):
        """Traversed items provide their specific marker interface."""
        traverser = EProcessosFacadeTraverser(vereadores_facade, http_request)
        item = traverser.publishTraverse(http_request, "12345")
        assert IVereadorItem.providedBy(item)
        assert IEProcessosItem.providedBy(item)

    def test_traversed_item_has_facade_reference(self, vereadores_facade, http_request):
        """Traversed items hold a reference to their parent facade."""
        traverser = EProcessosFacadeTraverser(vereadores_facade, http_request)
        item = traverser.publishTraverse(http_request, "12345")
        # Acquisition wrapping means identity (is) won't match,
        # but the facade reference should point to the same object
        assert item.facade.absolute_url() == vereadores_facade.absolute_url()
        assert item.facade.portal_type == "Vereadores"

    def test_sessoes_traverser_creates_sessao_item(self, sessoes_facade, http_request):
        """Sessoes facade creates SessaoItem on traversal."""
        traverser = EProcessosFacadeTraverser(sessoes_facade, http_request)
        item = traverser.publishTraverse(http_request, "1636")
        assert isinstance(item, SessaoItem)
        assert ISessaoItem.providedBy(item)

    def test_no_item_class_raises_keyerror(self, portal, content_factory, http_request):
        """A facade with no item_class raises KeyError on traversal."""
        facade = content_factory(portal, "Vereadores", id="test", title="Test")
        facade.item_class = None
        traverser = EProcessosFacadeTraverser(facade, http_request)
        with pytest.raises(KeyError):
            traverser.publishTraverse(http_request, "12345")


class TestEProcessosItemTraverser:
    """Test the sub-item traversal adapter."""

    @pytest.fixture()
    def vereador_item(self, vereadores_facade, http_request):
        traverser = EProcessosFacadeTraverser(vereadores_facade, http_request)
        return traverser.publishTraverse(http_request, "12345")

    def test_sub_item_traversal(self, vereador_item, http_request):
        """Traversing a sub-path sets sub_item on the existing item."""
        traverser = EProcessosItemTraverser(vereador_item, http_request)
        result = traverser.publishTraverse(http_request, "comissoes")
        assert result is vereador_item
        assert result.sub_item == "comissoes"

    def test_sub_item_is_none_initially(self, vereador_item, http_request):
        """Items start with no sub_item."""
        assert vereador_item.sub_item is None


class TestEProcessosItem:
    """Test the base EProcessosItem class."""

    def test_item_id(self, vereadores_facade):
        """Item stores and exposes its ID."""
        item = VereadorItem(item_id="546914")
        item._facade = vereadores_facade
        item = item.__of__(vereadores_facade)
        assert item.item_id == "546914"
        assert item.id == "546914"

    def test_portal_type(self, vereadores_facade):
        """Item has the correct portal_type."""
        item = VereadorItem(item_id="546914")
        item._facade = vereadores_facade
        item = item.__of__(vereadores_facade)
        assert item.portal_type == "Vereador"

    def test_title(self, vereadores_facade):
        """Title returns the item ID."""
        item = VereadorItem(item_id="546914")
        item._facade = vereadores_facade
        item = item.__of__(vereadores_facade)
        assert item.Title() == "546914"

    def test_physical_path(self, vereadores_facade):
        """Physical path appends item_id to facade path."""
        item = VereadorItem(item_id="546914")
        item._facade = vereadores_facade
        item = item.__of__(vereadores_facade)
        facade_path = vereadores_facade.getPhysicalPath()
        expected = (*facade_path, "546914")
        assert item.getPhysicalPath() == expected

    def test_physical_path_with_sub_item(self, vereadores_facade):
        """Physical path appends both item_id and sub_item."""
        item = VereadorItem(item_id="546914", sub_item="comissoes")
        item._facade = vereadores_facade
        item = item.__of__(vereadores_facade)
        facade_path = vereadores_facade.getPhysicalPath()
        expected = (*facade_path, "546914", "comissoes")
        assert item.getPhysicalPath() == expected
