"""Normas facade content type."""

from sc.eprocessos.content.base import EProcessosFacade
from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.content.items.norma import NormaItem
from sc.eprocessos.interfaces import INormas
from zope.interface import implementer


@implementer(INormas)
class Normas(EProcessosFacade):
    """Facade for legislative norms (leis, resoluções, decretos)."""

    service_name: str = "normas"
    display_form: bool = True
    item_class: type[EProcessosItem] = NormaItem
