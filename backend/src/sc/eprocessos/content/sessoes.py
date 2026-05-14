"""Sessoes facade content type."""

from sc.eprocessos.content.base import EProcessosSearchableFacade
from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.content.items.sessao import SessaoItem
from sc.eprocessos.interfaces import ISessoes
from zope.interface import implementer


@implementer(ISessoes)
class Sessoes(EProcessosSearchableFacade):
    """Facade for plenary sessions."""

    service_name: str = "sessoes"
    item_class: type[EProcessosItem] = SessaoItem
    _form_config_title: str = "Filtrar sessões"
