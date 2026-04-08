"""Base serializer for EProcessosItem objects."""

from __future__ import annotations

from collections.abc import Callable
from copy import deepcopy
from plone.restapi.interfaces import ISerializeToJson
from plone.restapi.serializer.expansion import expandable_elements
from sc.eprocessos import logger
from sc.eprocessos.client.exceptions import EProcessosError
from sc.eprocessos.utils import facade_urls
from sc.eprocessos.utils import parse_eprocessos_url
from zope.interface import implementer


@implementer(ISerializeToJson)
class BaseItemSerializer:
    """Base serializer for non-persistent e-Processos items.

    Data fetching is handled by the content item itself (``context.data``).
    This serializer focuses on transforming the data for the REST API response.

    Subclasses add ``_transform_*`` methods that receive ``(data, result)``
    where ``data`` is the original (read-only) API dict and ``result`` is
    the mutable output dict.  Transformers run in alphabetical order.
    """

    collections: tuple[str, ...] = ()

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def rewrite_id(self, value: str) -> str:
        """Rewrite an e-Processos @id URL to the local facade URL."""
        parts = parse_eprocessos_url(value)
        if parts:
            urls = facade_urls()
            repl = urls.get(parts.service)
            if parts.prefix and repl:
                return value.replace(parts.prefix, repl, 1)
        return value

    def _transform_id(self, data: dict, result: dict) -> None:
        result["@id"] = self.rewrite_id(data["@id"])

    def _transform_collections(self, data: dict, result: dict) -> None:
        for attr in self.collections:
            value: list[dict] = []
            raw_value = data.get(attr, [])
            for item in raw_value:
                item_path = item.get("@id", "")
                if item_path:
                    item["@id"] = self.rewrite_id(item_path)
                value.append(item)
            result[attr] = value

    def list_transformers(self) -> list[Callable]:
        """Return transformation methods (``_transform_*``), sorted by name."""
        names = [method for method in dir(self) if method.startswith("_transform_")]
        return [getattr(self, name) for name in names]

    def _process_data(self, data: dict) -> dict:
        """Process the raw data from the context, rewriting IDs and adding metadata."""
        result = deepcopy(data)
        result["@type"] = self.context.portal_type
        result["parent"] = {
            "@id": self.context.facade.absolute_url(),
            "title": self.context.facade.Title(),
        }
        for transformer in self.list_transformers():
            transformer(data, result)
        # Include plone.restapi expandable elements (breadcrumbs, navigation, etc.)
        result.update(expandable_elements(self.context, self.request))
        return result

    def __call__(self, version=None, include_items=True):
        try:
            data = self.context.data
        except EProcessosError as exc:
            logger.exception(
                "Failed to fetch %s/%s",
                self.context.service_name,
                self.context.item_id,
            )
            from zExceptions import HTTPBadGateway

            raise HTTPBadGateway(
                f"Could not fetch data from e-Processos for "
                f"{self.context.service_name}/{self.context.item_id}"
            ) from exc

        # If a sub_item was requested, extract that portion
        if self.context.sub_item:
            sub_data = data.get(self.context.sub_item, {})
            return {
                "@id": self.rewrite_id(data["@id"]),
                "@type": self.context.portal_type,
                "parent": {
                    "@id": self.context.facade.absolute_url(),
                    "title": self.context.facade.Title(),
                },
                "data": sub_data,
            }

        return self._process_data(data)
