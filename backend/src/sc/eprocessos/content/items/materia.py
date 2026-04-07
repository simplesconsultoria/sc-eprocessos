"""Non-persistent item for a single legislative matter."""

from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.interfaces import IMateriaItem
from zope.interface import implementer


@implementer(IMateriaItem)
class MateriaItem(EProcessosItem):
    portal_type = "Materia"
    service_name = "materias"
