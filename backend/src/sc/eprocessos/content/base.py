"""Base class for e-Processos facade content types."""

from __future__ import annotations

from plone.dexterity.content import Container
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from sc.eprocessos.content.items.base import EProcessosItem


class EProcessosFacade(Container):
    """Base Dexterity content type for e-Processos facades.

    Subclasses set:
      - service_name: which client service to use (e.g. "normas")
      - display_form: whether to show a search form or list results directly
      - item_class: the EProcessosItem subclass to return on traversal
    """

    service_name: str = ""
    display_form: bool = False
    item_class: type[EProcessosItem] | None = None

    def __getitem__(self, key):
        # Try standard container lookup first (real content, etc.)
        try:
            return super().__getitem__(key)
        except KeyError:
            pass

        # Don't intercept service (@) or view (@@) names —
        # let them fall through to the normal adapter lookup
        if key.startswith("@"):
            raise KeyError(key)

        # Fall back to creating a non-persistent API item
        if self.item_class is None:
            raise KeyError(key)

        item = self.item_class(item_id=key)
        item._facade = self
        return item.__of__(self)
