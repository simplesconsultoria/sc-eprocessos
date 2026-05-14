"""Mesas facade content type."""

from sc.eprocessos.content.base import EProcessosFacade
from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.content.items.mesa import MesaItem
from sc.eprocessos.interfaces import IMesas
from zope.interface import implementer


@implementer(IMesas)
class Mesas(EProcessosFacade):
    """Facade for executive board periods."""

    service_name: str = "mesas"
    item_class: type[EProcessosItem] = MesaItem
