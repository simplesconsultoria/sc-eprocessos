"""Traversal adapters for e-Processos facade content types."""

from __future__ import annotations

from zExceptions import NotFound
from ZPublisher.BaseRequest import DefaultPublishTraverse


class EProcessosFacadeTraverser(DefaultPublishTraverse):
    """Traversal adapter for EProcessosFacade content types.

    Intercepts path segments after the facade object and creates
    non-persistent EProcessosItem instances.

    URL patterns:
      /facade/12345          → item_class(item_id="12345")
      /facade/12345/votacao  → handled by EProcessosItemTraverser
    """

    def publishTraverse(self, request, name):
        try:
            return super().publishTraverse(request, name)
        except (AttributeError, KeyError, NotFound):
            pass
        # Create a non-persistent item from the path segment
        item_class = self.context.item_class
        if item_class is None:
            raise KeyError(name)

        item = item_class(item_id=name)
        item._facade = self.context
        return item.__of__(self.context)


class EProcessosItemTraverser(DefaultPublishTraverse):
    """Traversal adapter for EProcessosItem objects.

    Handles sub-item paths like /facade/12345/votacao
    by setting sub_item on the existing item.
    """

    def publishTraverse(self, request, name):
        # Try standard traversal first (for @@-prefixed services)
        try:
            return super().publishTraverse(request, name)
        except (KeyError, AttributeError):
            pass

        # Set sub_item on the existing item
        self.context.sub_item = name
        return self.context
