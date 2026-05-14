"""Materias facade content type."""

from sc.eprocessos.content.base import EProcessosSearchableFacade
from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.content.items.materia import MateriaItem
from sc.eprocessos.interfaces import IMaterias
from zope.interface import implementer


@implementer(IMaterias)
class Materias(EProcessosSearchableFacade):
    """Facade for legislative matters."""

    service_name: str = "materias"
    item_class: type[EProcessosItem] = MateriaItem
    _form_config_title: str = "Filtrar matérias"
