"""Non-persistent item for a single legislative term."""

from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.interfaces import ILegislaturaItem
from zope.interface import implementer


@implementer(ILegislaturaItem)
class LegislaturaItem(EProcessosItem):
    portal_type = "Legislatura"
    service_name = "legislaturas"
