"""Non-persistent item for a single plenary session."""

from __future__ import annotations

from sc.eprocessos.content.items.base import EProcessosItem
from sc.eprocessos.interfaces import ISessaoItem
from sc.eprocessos.utils import get_client
from typing import Any
from zope.interface import implementer


SESSAO_EXPANDERS = ("presenca", "votacao")


@implementer(ISessaoItem)
class SessaoItem(EProcessosItem):
    portal_type = "Sessao"
    service_name = "sessoes"

    def fetch_data(self) -> dict[str, Any]:
        """Fetch session data with expander support."""
        client = get_client()
        try:
            sub = self.sub_item
            if sub and sub in SESSAO_EXPANDERS:
                return client.sessoes.get(item_id=self.item_id, expanders=[sub])
            return client.sessoes.get(
                item_id=self.item_id,
                expanders=list(SESSAO_EXPANDERS),
            )
        finally:
            client.close()
