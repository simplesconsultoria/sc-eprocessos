"""Serializer for SessaoItem."""

from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.interfaces import ISessaoItem
from sc.eprocessos.serializers.items.base import BaseItemSerializer
from zope.component import adapter


@adapter(ISessaoItem, IBrowserLayer)
class SerializeSessaoItemToJson(BaseItemSerializer):
    pass
