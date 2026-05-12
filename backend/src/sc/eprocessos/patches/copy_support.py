"""Targeted patches for ``_verifyObjectPaste``.

``_verifyObjectPaste`` runs *before* ``IObjectWillBeMovedEvent``, so a
subscriber cannot restore the permission in time for rename / cut+paste /
move. Instead we intercept the verify itself: when the pasted object is the
existing singleton instance (same UID as the one already in the catalog), it
cannot be a duplicate — it must be a move/rename — so the permission/FTI
checks are safe to skip. Copy/paste still goes through (different UID) and is
correctly rejected by the original implementation.

Two layers are patched because ``plone.dexterity.content.PasteBehaviourMixin``
overrides the method to also call ``fti.isConstructionAllowed(self)``, which
fails for the same reason once ``enforce_singleton`` strips the permission.
"""

from plone import api
from plone.dexterity.content import DexterityContent
from sc.eprocessos.permissions import PERMISSION_MAP


def _is_existing_singleton(obj: DexterityContent) -> bool:
    portal_type = getattr(obj, "portal_type", None)
    if portal_type not in PERMISSION_MAP:
        return False
    try:
        obj_uid = obj.UID()
    except (AttributeError, TypeError):
        return False
    if obj_uid is None:
        return False
    portal = api.portal.get()
    existing = api.content.find(context=portal, portal_type=portal_type)
    return any(obj_uid == brain.UID for brain in existing)


def patch__verifyObjectPaste():
    from OFS.CopySupport import CopyContainer
    from plone.dexterity.content import PasteBehaviourMixin

    _ORIGINAL_OFS_VERIFY = CopyContainer._verifyObjectPaste
    _ORIGINAL_DX_VERIFY = PasteBehaviourMixin._verifyObjectPaste

    def _ofs_verify_object_paste_singleton_aware(self, object, validate_src=1):
        if _is_existing_singleton(object):
            return
        return _ORIGINAL_OFS_VERIFY(self, object, validate_src)

    def _dx_verify_object_paste_singleton_aware(self, obj, validate_src=True):
        if _is_existing_singleton(obj):
            return
        return _ORIGINAL_DX_VERIFY(self, obj, validate_src)

    if CopyContainer._verifyObjectPaste is not _ofs_verify_object_paste_singleton_aware:
        CopyContainer._verifyObjectPaste = _ofs_verify_object_paste_singleton_aware
    if (
        PasteBehaviourMixin._verifyObjectPaste
        is not _dx_verify_object_paste_singleton_aware
    ):
        PasteBehaviourMixin._verifyObjectPaste = _dx_verify_object_paste_singleton_aware
