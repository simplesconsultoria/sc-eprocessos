"""Base class for non-persistent e-Processos items."""

from __future__ import annotations

from Products.CMFCore.interfaces import IContentish
from sc.eprocessos.cache import cache
from sc.eprocessos.utils import get_client
from typing import Any
from typing import TYPE_CHECKING
from zope.globalrequest import getRequest
from zope.interface import implementer

import Acquisition


def _fetch_data_cache_key(fun, self) -> tuple[str, ...]:
    """Cache key for ``EProcessosItem.fetch_data``.

    Keys by class name (so subclasses that override ``fetch_data``
    don't collide), service name, item id, and sub_item.
    """
    return (
        type(self).__name__,
        self.service_name,
        self.item_id,
        self.sub_item or "",
    )


if TYPE_CHECKING:
    from sc.eprocessos.content.base import EProcessosFacade


@implementer(IContentish)
class EProcessosItem(Acquisition.Implicit):
    """Non-persistent item resolved from the e-Processos API.

    Returned by the IPublishTraverse adapter on EProcessosFacade.
    Acquisition wrapping gives access to the parent facade context.

    The facade reference is stored explicitly via ``_facade`` because
    ``aq_parent`` walks the full acquisition chain (including
    RequestContainer), which is not what we want.
    """

    portal_type: str = "EProcessosItem"
    service_name: str = ""
    _facade: EProcessosFacade | None = None
    _data: dict[str, Any] | None = None

    def __init__(self, item_id: str, sub_item: str | None = None) -> None:
        self.item_id = item_id
        self.sub_item = sub_item

    @classmethod
    def from_data(
        cls, data: dict[str, Any], facade: EProcessosFacade
    ) -> EProcessosItem:
        """Create an item with pre-loaded data, skipping the API fetch.

        Used by collection serializers to wrap list-response items
        as content objects that go through the standard serialization.
        """
        item_id = str(data.get("id", ""))
        instance = cls(item_id=item_id)
        instance._facade = facade
        instance._data = data
        return instance.__of__(facade)

    @property
    def facade(self) -> EProcessosFacade:
        """The parent facade content object."""
        if self._facade is not None:
            return self._facade
        # Fallback: walk acquisition to find the facade
        from sc.eprocessos.interfaces import IEProcessosFacade

        parent = self.aq_parent
        while parent is not None:
            if IEProcessosFacade.providedBy(parent):
                return parent
            parent = getattr(parent, "aq_parent", None)
        raise AttributeError("EProcessosItem has no facade in its acquisition chain")

    @property
    def data(self) -> dict[str, Any]:
        """Fetch and cache item data from the e-Processos API."""
        if self._data is None:
            self._data = self.fetch_data()
        return self._data

    @cache(_fetch_data_cache_key)
    def fetch_data(self) -> dict[str, Any]:
        """Fetch item data from the e-Processos API.

        Override in subclasses for services that need special handling
        (e.g., sessoes with expanders).

        Responses are cached via ``sc.eprocessos.cache`` keyed by
        ``(class_name, service_name, item_id, sub_item)``.
        """
        client = get_client()
        try:
            service = getattr(client, self.service_name)
            return service.get(item_id=self.item_id)
        finally:
            client.close()

    @property
    def id(self) -> str:
        """Object id used by Zope traversal."""
        return self.item_id

    def getPhysicalPath(self) -> tuple[str, ...]:
        """Build physical path for URL generation."""
        base = list(self.facade.getPhysicalPath())
        base.append(self.item_id)
        if self.sub_item:
            base.append(self.sub_item)
        return tuple(base)

    def absolute_url(self) -> str:
        request = getRequest()
        return request.physicalPathToURL(self.getPhysicalPath())

    def virtual_url_path(self) -> str:
        request = getRequest()
        return request.physicalPathToVirtualPath(self.getPhysicalPath())

    def Title(self) -> str:
        # Use cached data when available, but never trigger a fetch from
        # Title() — it's called in many display contexts where blocking
        # on the network is undesirable.
        if self._data is not None:
            return self._data.get("title") or self.item_id
        return self.item_id
