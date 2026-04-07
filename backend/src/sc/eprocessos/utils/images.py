"""Image field processing utilities."""

from __future__ import annotations

from copy import deepcopy
from plone import api
from typing import Any


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
    proxy_url = "@@images/"
    download = main_image.get("download", "")
    if download.startswith(eprocessos_root):
        download = download.replace(eprocessos_root, proxy_url)
    elif download.startswith("/"):
        download = proxy_url + download.lstrip("/")
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
