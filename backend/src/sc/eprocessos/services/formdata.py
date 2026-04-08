"""@@formdata service for form-based facade queries."""

from __future__ import annotations

from plone.restapi.services import Service
from sc.eprocessos import logger
from sc.eprocessos.cache import cache
from sc.eprocessos.client.exceptions import EProcessosError
from sc.eprocessos.utils import get_client
from typing import Any
from zExceptions import HTTPBadGateway


def _formdata_cache_key(fun, service_name: str, **params) -> tuple:
    """Cache key for :func:`_fetch_form_list` — keyed by service + params."""
    return (service_name, tuple(sorted(params.items())))


@cache(_formdata_cache_key)
def _fetch_form_list(service_name: str, **params: Any) -> dict[str, Any]:
    """Fetch a parameterized list endpoint and cache the result.

    Keyed by ``(service_name, sorted(params))`` so e.g. a query for
    normas ano=2025 tipo=1 is distinct from normas ano=2026 tipo=1.
    """
    client = get_client()
    try:
        service = getattr(client, service_name)
        return service.list(**params)
    finally:
        client.close()


class FormDataGet(Service):
    """Return query results for form-based facades.

    URL: /legislativo/normas/@@formdata?ano=2025&tipo=1
    """

    def reply(self):
        params = dict(self.request.form)
        service_name = self.context.service_name

        # Normalize query-string params to the types each service expects
        if "ano" in params:
            params["ano"] = int(params["ano"])
        if "tipo" in params:
            params["tipo"] = int(params["tipo"])

        try:
            data = _fetch_form_list(service_name, **params)
        except EProcessosError as exc:
            logger.exception("Failed to query %s", service_name)
            raise HTTPBadGateway(
                f"Could not fetch data from e-Processos for {service_name}"
            ) from exc

        return {
            "@id": f"{self.context.absolute_url()}/@formdata",
            "items": data.get("items", []),
            "items_total": len(data.get("items", [])),
            "description": data.get("description", ""),
        }
