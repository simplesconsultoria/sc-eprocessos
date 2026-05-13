"""Permission metadata for EProcessosFacade content types."""

# Maps each singleton facade ``portal_type`` to the human-readable title of its
# add permission — the form accepted by ``manage_permission`` /
# ``rolesOfPermission``. Used by the singleton subscribers (to strip and
# restore the permission) and by the ``_verifyObjectPaste`` patch (to detect
# which types participate in the singleton policy).
PERMISSION_MAP: dict[str, str] = {
    "Normas": "sc.eprocessos: Add Normas",
    "Vereadores": "sc.eprocessos: Add Vereadores",
    "Legislaturas": "sc.eprocessos: Add Legislaturas",
    "Mesas": "sc.eprocessos: Add Mesas",
    "Comissoes": "sc.eprocessos: Add Comissoes",
    "Materias": "sc.eprocessos: Add Materias",
    "Sessoes": "sc.eprocessos: Add Sessoes",
}
