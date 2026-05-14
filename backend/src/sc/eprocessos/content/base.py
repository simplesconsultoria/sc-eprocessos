"""Base class for e-Processos facade content types."""

from __future__ import annotations

from plone.dexterity.content import Container
from sc.eprocessos import logger
from sc.eprocessos.cache import cache
from sc.eprocessos.utils import get_client
from sc.eprocessos.utils import is_exportimport_request
from typing import TYPE_CHECKING
from zope.globalrequest import getRequest


if TYPE_CHECKING:
    from sc.eprocessos.content.items.base import EProcessosItem


class EProcessosFacade(Container):
    """Base Dexterity content type for e-Processos facades.

    Subclasses set:
      - service_name: which client service to use (e.g. "normas")
      - item_class: the EProcessosItem subclass to return on traversal
    """

    service_name: str = ""
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


def _filtros_cache_key(fun, self) -> tuple[str, str, str]:
    """Cache key for ``EProcessosSearchableFacade._get_filtros``.

    Keys by class name (so subclasses can't collide), service name, and a
    constant suffix to namespace the entry against other cached calls
    that may share the same ``(class, service)`` prefix.
    """
    return (type(self).__name__, self.service_name, "filtros")


class EProcessosSearchableFacade(EProcessosFacade):
    """Searchable e-Processos facade with a dynamic filter form."""

    _form_config_title: str = "Filtrar"

    def _get_filtros(self) -> dict[str, list[list[str]]]:
        """Return filter vocabularies for the form, keyed by field name.

        Short-circuits to ``{}`` when the current request is marked by
        ``plone.exportimport`` — the upstream client must not be hit
        during export bundle creation or import replay, even when the
        ``form_config`` property is accessed transitively by the default
        Dexterity serializer's schema iteration.

        The actual fetch lives in :meth:`_fetch_filtros` so that the
        empty payload returned during export does not get cached for
        regular requests.
        """
        if is_exportimport_request(getRequest()):
            return {}
        return self._fetch_filtros()

    @cache(_filtros_cache_key)
    def _fetch_filtros(self) -> dict[str, list[list[str]]]:
        """Fetch and normalize the upstream ``filtros`` payload.

        Calls the service's root endpoint (e.g. ``/@@sessoes``), which
        upstream answers with a ``filtros`` payload of the shape
        ``{field: [{"id": ..., "title": ...}, ...]}``. The result is
        normalized to ``{field: [[id, title], ...]}`` so it can be
        dropped straight into a JSON-schema ``choices`` list.

        Cached via :mod:`sc.eprocessos.cache`. Returns ``{}`` on any
        upstream failure so the form still renders.
        """
        try:
            client = get_client()
            try:
                service = getattr(client, self.service_name)
                filtros = service.vocabularies()
            finally:
                client.close()
        except Exception:
            logger.warning(
                "Could not fetch filtros for service '%s'",
                self.service_name,
                exc_info=True,
            )
            return {}
        return {
            field: [[str(entry["id"]), entry["title"]] for entry in entries]
            for field, entries in filtros.items()
        }

    @property
    def form_config(self) -> dict:
        """Return the JSON configuration for the filter form."""
        filtros = self._get_filtros()
        anos = filtros.get("ano", [])
        tipos = filtros.get("tipo", [])
        return {
            "title": self._form_config_title,
            "fieldsets": [
                {
                    "id": "default",
                    "title": "default",
                    "fields": ["ano", "tipo"],
                },
            ],
            "properties": {
                "ano": {
                    "title": "Ano",
                    "type": "string",
                    "choices": anos,
                    "default": "",
                },
                "tipo": {
                    "title": "Tipo",
                    "type": "string",
                    "choices": tipos,
                    "default": "",
                },
            },
            "required": ["tipo", "ano"],
        }

    @form_config.setter
    def form_config(self, value: dict):
        """Prevent setting form_config, as it's derived from the schema."""
        pass
