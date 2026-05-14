"""Normas facade content type."""

from sc.eprocessos.content.base import EProcessosSearchableFacade
from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.content.items.norma import NormaItem
from sc.eprocessos.interfaces import INormas
from zope.interface import implementer


@implementer(INormas)
class Normas(EProcessosSearchableFacade):
    """Facade for legislative norms (leis, resoluções, decretos)."""

    service_name: str = "normas"
    item_class: type[EProcessosItem] = NormaItem
    _form_config_title: str = "Filtrar normas"
