"""Singleton subscribers for EProcessosFacade content types."""

from plone import api
from sc.eprocessos import logger
from sc.eprocessos.permissions import PERMISSION_MAP
from zExceptions import BadRequest


def prevent_duplicate_creation(obj, _event):
    """Block adding a second singleton instance.

    Defense-in-depth for the copy+paste path: ``_verifyObjectPaste`` is
    bypassed for the existing singleton (so move/rename work), and the
    fresh copy that ``_pasteObjects`` then creates has a different UID, so
    the bypass would otherwise let a duplicate slip through. This
    subscriber fires on the new object's ``IObjectWillBeAddedEvent`` and
    aborts the add.
    """
    portal_type = obj.portal_type
    if portal_type not in PERMISSION_MAP:
        return
    portal = api.portal.get()
    if not api.content.find(context=portal, portal_type=portal_type):
        return
    logger.info(
        "Singleton blocked: refused to add a second %s instance.",
        portal_type,
    )
    raise BadRequest(
        f"An instance of '{portal_type}' already exists; only one is allowed."
    )


def enforce_singleton(obj, _event):
    """Strip the facade's add permission from the portal once an instance exists.

    Fires on ``IObjectAddedEvent``. Removing the permission makes the type
    disappear from the "Add new" menu (since ``allowedContentTypes`` is
    permission-filtered). The ``_verifyObjectPaste`` patch in
    :mod:`sc.eprocessos.patches.copy_support` keeps move/rename working
    despite the missing permission.
    """
    permission = PERMISSION_MAP.get(obj.portal_type)
    if not permission:
        return
    portal = api.portal.get()
    portal.manage_permission(permission, roles=[], acquire=False)
    logger.info(
        "Singleton enforced: removed '%s' permission after adding %s at %s",
        permission,
        obj.portal_type,
        obj.absolute_url(),
    )


def restore_add_permission(obj, _event):
    """Restore the facade's add permission after the singleton is deleted.

    Fires on ``IObjectRemovedEvent``. Re-grants the permission to
    ``Manager`` and ``Site Administrator`` so a new instance can be created
    and the type reappears in the "Add new" menu.
    """
    permission = PERMISSION_MAP.get(obj.portal_type)
    if not permission:
        return
    portal = api.portal.get()
    portal.manage_permission(
        permission,
        roles=["Manager", "Site Administrator"],
        acquire=False,
    )
    logger.info(
        "Singleton released: restored '%s' permission after removing %s",
        permission,
        obj.portal_type,
    )
