"""Materias facade content type."""

from sc.eprocessos.content.base import EProcessosFacade
from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.content.items.materia import MateriaItem
from sc.eprocessos.interfaces import IMaterias
from zope.interface import implementer


@implementer(IMaterias)
class Materias(EProcessosFacade):
    """Facade for legislative matters."""

    service_name: str = "materias"
    display_form: bool = True
    item_class: type[EProcessosItem] = MateriaItem
