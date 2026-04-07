"""Serializer for EProcessosFacade content types."""

from __future__ import annotations

from plone.restapi.interfaces import ISerializeToJson
from plone.restapi.serializer.dxcontent import SerializeFolderToJson
from sc.eprocessos.client import EProcessosClient
from sc.eprocessos.client.exceptions import EProcessosError
from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.interfaces import IEProcessosFacade
from sc.eprocessos.utils import get_client
from zope.component import adapter
from zope.component import queryMultiAdapter
from zope.interface import implementer

import logging


logger = logging.getLogger(__name__)


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

        # If no form required, fetch items directly
        if not self.context.display_form:
            client = self.client
            try:
                service = getattr(client, self.context.service_name)
                data = service.list()
                items = self.serialize_items(data.get("items", []))
                result["items"] = items
            except EProcessosError:
                logger.exception(
                    "Failed to fetch data for %s", self.context.absolute_url()
                )
                result["items"] = []
                result["external_error"] = True
            finally:
                client.close()

        return result
