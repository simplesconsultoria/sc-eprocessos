"""Detect whether the current request is running under plone.exportimport.

``plone.exportimport`` applies :class:`IExportImportRequestMarker` to the
request while it walks the portal for export or replays an import. Code
that talks to the upstream e-Processos API should short-circuit during
those phases — an export bundle must capture the *persistent* shape of the
site, not the live upstream data, and an import must not try to call the
API before the catalog/data dir are even consistent.
"""

from __future__ import annotations

from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from ZPublisher.HTTPRequest import HTTPRequest


try:
    from plone.exportimport.interfaces import IExportImportRequestMarker
except ImportError:  # pragma: no cover - plone.exportimport is a soft dep
    IExportImportRequestMarker = None  # type: ignore[assignment]


def is_exportimport_request(request: HTTPRequest | None) -> bool:
    """Return ``True`` when ``plone.exportimport`` has marked the request.

    Returns ``False`` when ``request`` is ``None``, when
    ``plone.exportimport`` is not installed, or when the marker is absent.
    """
    if request is None or IExportImportRequestMarker is None:
        return False
    return IExportImportRequestMarker.providedBy(request)
