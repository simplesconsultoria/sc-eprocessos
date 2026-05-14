"""Image field processing utilities."""

from __future__ import annotations

from copy import deepcopy
from plone import api
from typing import Any
from urllib.parse import parse_qs
from urllib.parse import urlparse


SAPL_DOWNLOAD_VIEW = "@@sapl_documentos_download"


def _local_proxy_url(download: str, eprocessos_root: str) -> str:
    """Convert an upstream download URL into a local ``@@images/...`` path.

    Handles two upstream shapes:
    * legacy path-style: ``/sapl_documentos/<path>``
    * new query-string:  ``/@@sapl_documentos_download?path=<path>``

    The query-string form is converted to ``@@images/sapl_documentos_download/<path>``
    so Zope's traversal can walk it; the scaling view rebuilds the upstream
    query when fetching.
    """
    proxy_url = "@@images/"
    parsed = urlparse(download)
    path = parsed.path
    query = parse_qs(parsed.query)
    url = download
    if path.endswith(SAPL_DOWNLOAD_VIEW) or path.endswith("/sapl_documentos_download"):
        upstream_path = (query.get("path") or [""])[0]
        url = f"{proxy_url}sapl_documentos_download/{upstream_path.lstrip('/')}"
    elif download.startswith(eprocessos_root):
        url = download.replace(eprocessos_root, proxy_url)
    elif download.startswith("/"):
        url = proxy_url + download.lstrip("/")
    return url


def process_image_field(
    field_name: str, image_field: list[dict[str, Any]]
) -> tuple[str, dict[str, list[dict[str, Any]]]]:
    """Process an e-Processos image field for REST API serialization.

    Takes a raw image field (list of image dicts from e-Processos) and
    returns a tuple of ``(field_name, scales_mapping)`` where the download
    URLs are rewritten to use the local ``@@images`` proxy and Plone's
    configured image scales are included.

    Returns ``("", {})`` when the image field is empty.
    """
    if not image_field:
        return "", {}
    eprocessos_root: str = api.portal.get_registry_record("eprocessos.base_url")
    main_image = deepcopy(image_field[0])
    download = _local_proxy_url(main_image.get("download", ""), eprocessos_root)
    main_image["download"] = download

    scales: dict[str, dict[str, Any]] = {}
    for scale_def in api.portal.get_registry_record("plone.allowed_sizes"):
        scale_name, scale_wh = scale_def.split(" ")
        width, _ = scale_wh.split(":")
        scales[scale_name] = {
            "download": download,
            "width": int(width),
            "height": int(width),
        }
    main_image["scales"] = scales
    return field_name, {field_name: [main_image]}


def process_image(image_data: list[dict[str, Any]]) -> list[dict[str, Any]]:
    eprocessos_root: str = api.portal.get_registry_record("eprocessos.base_url")
    results = []
    for raw_item in image_data:
        item = deepcopy(raw_item)
        download = item.get("download", "")
        image_url = _local_proxy_url(download, eprocessos_root)
        item["download"] = f"{image_url}"
        results.append(item)
    return results


def image_from_url_foto(url_foto: str) -> list[dict[str, Any]]:
    eprocessos_root: str = api.portal.get_registry_record("eprocessos.base_url")
    filename = url_foto.split("/")[-1]
    image_url = _local_proxy_url(url_foto, eprocessos_root)
    item = {
        "content-type": "image/jpeg",
        "download": f"{image_url}",
        "filename": filename,
        "height": 0,
        "size": 0,
        "width": 0,
    }
    return [item]
