"""Serializer for EProcessosFacade content types."""

from __future__ import annotations

from plone.restapi.interfaces import ISerializeToJson
from plone.restapi.serializer.dxcontent import SerializeFolderToJson
from sc.eprocessos import logger
from sc.eprocessos.cache import cache
from sc.eprocessos.client import EProcessosClient
from sc.eprocessos.client.exceptions import EProcessosError
from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.interfaces import IEProcessosFacade
from sc.eprocessos.utils import get_client
from typing import Any
from zope.component import adapter
from zope.component import queryMultiAdapter
from zope.interface import implementer


def _list_items_cache_key(fun, service_name: str) -> tuple[str, str]:
    """Cache key for :func:`_list_items` — keyed by service name."""
    return ("list_items", service_name)


@cache(_list_items_cache_key)
def _list_items(service_name: str) -> dict[str, Any]:
    """Fetch the unparameterized list endpoint for a given service.

    Extracted as a module-level function so ``plone.memoize`` can cache
    it independently of the serializer instance. Keyed by service name
    only (these endpoints take no query parameters).
    """
    client = get_client()
    try:
        service = getattr(client, service_name)
        return service.list()
    finally:
        client.close()


@implementer(ISerializeToJson)
@adapter(IEProcessosFacade, IBrowserLayer)
class SerializeFacadeToJson(SerializeFolderToJson):
    """Serialize an EProcessosFacade to JSON.

    Adds service metadata and, for facades without a form,
    fetches and includes items from the external API.
    """

    @property
    def client(self) -> EProcessosClient:
        """Return an e-Processos API client."""
        return get_client()

    def serialize_items(self, raw_items: list[dict]) -> list[dict]:
        """Fetch and serialize items from the external API."""
        items = []
        item_class = getattr(self.context, "item_class", None)
        if item_class is None:
            logger.warning(
                "Context %s does not define an item_class, cannot serialize items",
                self.context.absolute_url(),
            )
            items = raw_items
        else:
            for raw in raw_items:
                item = item_class.from_data(raw, self.context)
                serializer = queryMultiAdapter((item, self.request), ISerializeToJson)
                if serializer is not None:
                    items.append(serializer())
                else:
                    logger.warning(
                        "No serializer found for item %s of type %s",
                        item.absolute_url(),
                        type(item),
                    )
        return items

    def __call__(self, version=None, include_items=True):
        result = super().__call__(version=version, include_items=include_items)

        result["display_form"] = self.context.display_form
        result["service_name"] = self.context.service_name

        # If no form required, fetch items directly (cached via _list_items)
        if not self.context.display_form:
            try:
                data = _list_items(self.context.service_name)
                result["items"] = self.serialize_items(data.get("items", []))
            except EProcessosError:
                logger.exception(
                    "Failed to fetch data for %s", self.context.absolute_url()
                )
                result["items"] = []
                result["external_error"] = True

        return result
