"""Singleton subscribers for EProcessosFacade content types."""

from plone import api

import logging


logger = logging.getLogger(__name__)

# Maps portal_type to its add permission title (used by manage_permission)
PERMISSION_MAP: dict[str, str] = {
    "Normas": "sc.eprocessos: Add Normas",
    "Vereadores": "sc.eprocessos: Add Vereadores",
    "Legislaturas": "sc.eprocessos: Add Legislaturas",
    "Mesas": "sc.eprocessos: Add Mesas",
    "Comissoes": "sc.eprocessos: Add Comissoes",
    "Materias": "sc.eprocessos: Add Materias",
    "Sessoes": "sc.eprocessos: Add Sessoes",
}


def enforce_singleton(obj, event):
    """After adding a facade, remove its add permission from the portal.

    This prevents editors from creating a second instance of the same type.
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


def restore_add_permission(obj, event):
    """On deletion, restore the add permission so a new instance can be created."""
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
