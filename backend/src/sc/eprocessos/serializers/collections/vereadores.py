"""Serializer for the Vereadores facade."""

from __future__ import annotations

from plone.restapi.interfaces import ISerializeToJson
from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.interfaces import IVereadores
from sc.eprocessos.serializers.facade import SerializeFacadeToJson
from zope.component import adapter
from zope.interface import implementer


@implementer(ISerializeToJson)
@adapter(IVereadores, IBrowserLayer)
class SerializeVereadoresCollectionToJson(SerializeFacadeToJson):
    """Serialize Vereadores facade to JSON.

    Fetches councilors from the external API and serializes
    each item through the standard ISerializeToJson machinery.
    """
