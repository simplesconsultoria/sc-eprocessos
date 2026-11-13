"""Serializer for VereadorItem."""

from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.interfaces import IVereadorItem
from sc.eprocessos.serializers.items.base import BaseItemSerializer
from sc.eprocessos.utils import process_image_field
from zope.component import adapter

import html


def filiacao(data: dict) -> str:
    """Return the acronym of the councilor's current party.

    The acronym comes from ``partido_atual`` (councilor detail). When it is
    missing, the first entry of ``partido`` (listing items) is used, and
    then the current entry of ``filiacoes``.

    :param data: The councilor data returned by e-Processos.
    :returns: The party acronym, or an empty string when there is none.
    """
    partido_atual = data.get("partido_atual")
    if isinstance(partido_atual, dict) and (sigla := partido_atual.get("sgl")):
        return sigla
    partido = data.get("partido")
    if isinstance(partido, list) and partido and (token := partido[0].get("token")):
        return token
    filiacoes = data.get("filiacoes") or []
    atuais = [f for f in filiacoes if f.get("filiacao_atual")]
    return atuais[0].get("token", "") if atuais else ""


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
