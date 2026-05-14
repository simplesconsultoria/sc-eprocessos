"""Vereadores facade content type."""

from sc.eprocessos.content.base import EProcessosFacade
from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.content.items.vereador import VereadorItem
from sc.eprocessos.interfaces import IVereadores
from zope.interface import implementer


@implementer(IVereadores)
class Vereadores(EProcessosFacade):
    """Facade for city councilors."""

    service_name: str = "vereadores"
    item_class: type[EProcessosItem] = VereadorItem
