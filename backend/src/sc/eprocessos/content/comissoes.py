"""Comissoes facade content type."""

from sc.eprocessos.content.base import EProcessosFacade
from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.content.items.comissao import ComissaoItem
from sc.eprocessos.interfaces import IComissoes
from zope.interface import implementer


@implementer(IComissoes)
class Comissoes(EProcessosFacade):
    """Facade for committees."""

    service_name: str = "comissoes"
    item_class: type[EProcessosItem] = ComissaoItem
