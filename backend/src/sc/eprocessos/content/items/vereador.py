"""Non-persistent item for a single councilor."""

from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.interfaces import IVereadorItem
from zope.interface import implementer


@implementer(IVereadorItem)
class VereadorItem(EProcessosItem):
    portal_type = "Vereador"
    service_name = "vereadores"
