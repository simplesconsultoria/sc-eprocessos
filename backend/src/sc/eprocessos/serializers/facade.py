"""Serializers for EProcessosFacade content types."""

from __future__ import annotations

from plone.restapi.interfaces import ISerializeToJson
from plone.restapi.serializer.dxcontent import SerializeFolderToJson
from sc.eprocessos import logger
from sc.eprocessos.cache import cache
from sc.eprocessos.client import EProcessosClient
from sc.eprocessos.client.exceptions import EProcessosError
from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.interfaces import IEProcessosFacade
from sc.eprocessos.interfaces import IEProcessosSearchableFacade
from sc.eprocessos.utils import get_client
from sc.eprocessos.utils import is_exportimport_request
from typing import Any
from zope.component import adapter
from zope.component import queryMultiAdapter
from zope.interface import implementer


_ALLOWED_PARAM_CASTS: dict[str, type] = {
    "ano": int,
    "tipo": int,
}


def _list_items_cache_key(fun, service_name: str, **params: Any) -> tuple:
    """Cache key for :func:`_list_items` — keyed by service + sorted params."""
    return ("list_items", service_name, tuple(sorted(params.items())))


@cache(_list_items_cache_key)
def _list_items(service_name: str, **params: Any) -> dict[str, Any]:
    """Fetch a service listing, with or without filter parameters.

    Extracted as a module-level function so ``plone.memoize`` can cache
    it independently of the serializer instance. Keyed by service name
    plus any filter params (sorted), so e.g. ``sessoes`` with
    ``ano=2026 tipo=1`` is a distinct cache entry from ``sessoes`` with
    no params.
    """
    client = get_client()
    try:
        service = getattr(client, service_name)
        return service.list(**params)
    finally:
        client.close()


def _parse_search_params(form: dict[str, Any]) -> dict[str, Any]:
    """Cast known querystring filters to the types each service expects.

    Unknown keys are dropped; invalid casts (e.g. ``ano=abc``) drop the
    offending key rather than failing the whole request — listing falls
    back to the unfiltered behavior.
    """
    out: dict[str, Any] = {}
    for key, cast in _ALLOWED_PARAM_CASTS.items():
        raw = form.get(key)
        if raw in (None, ""):
            continue
        try:
            out[key] = cast(raw)
        except (TypeError, ValueError):
            logger.warning("Ignoring invalid filter value %s=%r", key, raw)
    return out


class _SerializeFacadeBase(SerializeFolderToJson):
    """Shared scaffolding for the two facade serializers.

    Subclasses implement ``__call__`` to wire the fetch policy specific
    to searchable vs. non-searchable facades. Both share ``service_name``
    enrichment and the item-list expansion via ``serialize_items``.
    """

    @property
    def client(self) -> EProcessosClient:
        """Return an e-Processos API client."""
        return get_client()

    def serialize_items(self, raw_items: list[dict]) -> list[dict]:
        """Fetch and serialize items from the external API."""
        items: list[dict] = []
        item_class = getattr(self.context, "item_class", None)
        if item_class is None:
            logger.warning(
                "Context %s does not define an item_class, cannot serialize items",
                self.context.absolute_url(),
            )
            return raw_items
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

    def _fetch_into(self, result: dict, **params: Any) -> None:
        """Run the upstream list call and fold the items into ``result``."""
        try:
            data = _list_items(self.context.service_name, **params)
            result["items"] = self.serialize_items(data.get("items", []))
            result["items_total"] = len(data.get("items", []))
        except EProcessosError:
            logger.exception("Failed to fetch data for %s", self.context.absolute_url())
            result["items"] = []
            result["external_error"] = True


@implementer(ISerializeToJson)
@adapter(IEProcessosFacade, IBrowserLayer)
class SerializeFacadeToJson(_SerializeFacadeBase):
    """Serialize a non-searchable e-Processos facade.

    Always lists every item the upstream service returns (no filter
    params). For searchable facades, the more specific
    :class:`SerializeSearchableFacadeToJson` adapter is selected by ZCA
    via interface inheritance.
    """

    def __call__(self, version=None, include_items=True):
        result = super().__call__(version=version, include_items=include_items)
        result["service_name"] = self.context.service_name
        if is_exportimport_request(self.request):
            return result
        self._fetch_into(result)
        return result


@implementer(ISerializeToJson)
@adapter(IEProcessosSearchableFacade, IBrowserLayer)
class SerializeSearchableFacadeToJson(_SerializeFacadeBase):
    """Serialize a searchable e-Processos facade.

    Adds ``form_config`` to the payload and only triggers an upstream
    listing when filter params are present in the querystring — without
    params the frontend renders the form and waits for the user to
    submit. Under ``plone.exportimport`` neither ``form_config`` nor
    ``items`` are included, so the export bundle captures only the
    persistent facade state.
    """

    def __call__(self, version=None, include_items=True):
        result = super().__call__(version=version, include_items=include_items)
        result["service_name"] = self.context.service_name
        if is_exportimport_request(self.request):
            return result
        result["form_config"] = self.context.form_config
        params = _parse_search_params(dict(self.request.form))
        if not params:
            return result
        self._fetch_into(result, **params)
        return result
