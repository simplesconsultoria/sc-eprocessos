"""Serializer for VereadorItem."""

from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.interfaces import IVereadorItem
from sc.eprocessos.serializers.items.base import BaseItemSerializer
from sc.eprocessos.utils import process_image_field
from zope.component import adapter

import html


def filiacao(data: dict) -> str:
    """Construct a filiacao string from the data."""
    filiacao = ""

    if partido := data.get("partido", ""):
        filiacao = (
            partido[0]["token"]
            if isinstance(partido, list) and len(partido) > 0
            else ""
        )
    elif (filiacoes := data.get("filiacoes", [])) and len(filiacoes) > 0:
        filiacao = filiacoes[0].get("token", "")

    return filiacao


@adapter(IVereadorItem, IBrowserLayer)
class SerializeVereadorItemToJson(BaseItemSerializer):
    collections: tuple[str, ...] = ("mandatos", "mesas", "comissoes")

    def _transform_biografia(self, data: dict, result: dict) -> None:
        raw_biografia = data.get("biografia", "")
        result["biografia"] = html.unescape(raw_biografia)

    def _transform_image(self, data: dict, result: dict) -> None:
        image = data.get("image", [])
        image_field, image_scales = process_image_field("image", image)
        result["image_field"] = image_field
        result["image_scales"] = image_scales
        if image_field:
            result["image"] = image_scales[image_field]

    def _transform_description(self, data: dict, result: dict) -> None:
        result["fullname"] = result.pop("description", "")
        result["description"] = filiacao(data)
