"""Serializer for ComissaoItem."""

from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.interfaces import IComissaoItem
from sc.eprocessos.serializers.items.base import BaseItemSerializer
from zope.component import adapter


@adapter(IComissaoItem, IBrowserLayer)
class SerializeComissaoItemToJson(BaseItemSerializer):
    pass
