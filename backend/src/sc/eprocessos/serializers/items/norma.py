"""Serializer for NormaItem."""

from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.interfaces import INormaItem
from sc.eprocessos.serializers.items.base import BaseItemSerializer
from zope.component import adapter


@adapter(INormaItem, IBrowserLayer)
class SerializeNormaItemToJson(BaseItemSerializer):
    pass
