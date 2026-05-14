"""Legislaturas facade content type."""

from sc.eprocessos.content.base import EProcessosFacade
from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.content.items.legislatura import LegislaturaItem
from sc.eprocessos.interfaces import ILegislaturas
from zope.interface import implementer


@implementer(ILegislaturas)
class Legislaturas(EProcessosFacade):
    """Facade for legislative terms."""

    service_name: str = "legislaturas"
    item_class: type[EProcessosItem] = LegislaturaItem
