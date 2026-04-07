"""Serializer for MateriaItem."""

from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.interfaces import IMateriaItem
from sc.eprocessos.serializers.items.base import BaseItemSerializer
from zope.component import adapter


@adapter(IMateriaItem, IBrowserLayer)
class SerializeMateriaItemToJson(BaseItemSerializer):
    pass
