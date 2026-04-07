"""Non-persistent item for a single executive board period."""

from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.interfaces import IMesaItem
from zope.interface import implementer


@implementer(IMesaItem)
class MesaItem(EProcessosItem):
    portal_type = "Mesa"
    service_name = "mesas"
