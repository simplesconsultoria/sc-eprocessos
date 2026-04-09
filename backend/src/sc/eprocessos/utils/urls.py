"""URL parsing and rewriting utilities."""

from __future__ import annotations

from dataclasses import dataclass
from plone import api

import re


@dataclass
class EProcessosItemURL:
    """Structured URL components for an e-Processos item."""

    prefix: str
    service: str
    item_id: str


_EPROCESSOS_URL_PATTERN = re.compile(
    r"^(?P<prefix>.*/@@(?P<service>[^/]+).*)/(?P<item_id>\d+)$"
)


def parse_eprocessos_url(url: str) -> EProcessosItemURL | None:
    """Parse an e-Processos item URL into structured components.

    Matches URLs like ``https://host/@@vereadores/12345`` and returns
    an ``EProcessosItemURL`` with prefix, service, and item_id.
    Returns ``None`` if the URL doesn't match the expected pattern.
    """
    match = _EPROCESSOS_URL_PATTERN.match(url)
    if match:
        prefix = match.group("prefix")
        service = match.group("service")
        item_id = match.group("item_id")
        return EProcessosItemURL(prefix=prefix, service=service, item_id=item_id)
    return None


def facade_urls() -> dict[str, str]:
    """Return a mapping of portal_type (lowercase) to facade absolute URL.

    Searches the catalog for all objects providing ``IEProcessosFacade``
    and builds a dict like ``{"vereadores": "http://..../vereadores"}``.
    """
    brains = api.content.find(
        object_provides="sc.eprocessos.interfaces.IEProcessosFacade",
        sort_on="portal_type",
    )
    return {brain.portal_type.lower(): brain.getURL() for brain in brains}
