"""Non-persistent item for a single committee."""

from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.interfaces import IComissaoItem
from zope.interface import implementer


@implementer(IComissaoItem)
class ComissaoItem(EProcessosItem):
    portal_type = "Comissao"
    service_name = "comissoes"
