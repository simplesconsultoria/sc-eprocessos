"""Serializer for SessaoItem."""

from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.interfaces import ISessaoItem
from sc.eprocessos.serializers.items.base import BaseItemSerializer
from zope.component import adapter


SESSAO_EXPANDERS = ("presenca", "votacao")


@adapter(ISessaoItem, IBrowserLayer)
class SerializeSessaoItemToJson(BaseItemSerializer):
    def _transform_expanders(self, data: dict, result: dict) -> None:
        """Rewrite @id inside expander data and drop @id_* link fields."""
        item_url = self.context.absolute_url()
        for exp in SESSAO_EXPANDERS:
            # Remove the raw link field (e.g. @id_presenca)
            result.pop(f"@id_{exp}", None)
            # Rewrite @id within the expanded data to point at the
            # local facade sub-item URL (e.g. .../sessoes/1669/presenca)
            exp_data = result.get(exp)
            if isinstance(exp_data, dict):
                exp_data["@id"] = f"{item_url}/{exp}"
