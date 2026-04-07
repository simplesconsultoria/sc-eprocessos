"""Serializer for MesaItem."""

from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.interfaces import IMesaItem
from sc.eprocessos.serializers.items.base import BaseItemSerializer
from zope.component import adapter


@adapter(IMesaItem, IBrowserLayer)
class SerializeMesaItemToJson(BaseItemSerializer):
    pass
