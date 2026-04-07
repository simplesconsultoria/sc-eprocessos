"""Non-persistent item for a single norm."""

from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.interfaces import INormaItem
from zope.interface import implementer


@implementer(INormaItem)
class NormaItem(EProcessosItem):
    portal_type = "Norma"
    service_name = "normas"
