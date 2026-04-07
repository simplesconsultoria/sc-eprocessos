"""Sessoes facade content type."""

from sc.eprocessos.content.base import EProcessosFacade
from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.content.items.sessao import SessaoItem
from sc.eprocessos.interfaces import ISessoes
from zope.interface import implementer


@implementer(ISessoes)
class Sessoes(EProcessosFacade):
    """Facade for plenary sessions."""

    service_name: str = "sessoes"
    display_form: bool = True
    item_class: type[EProcessosItem] = SessaoItem
