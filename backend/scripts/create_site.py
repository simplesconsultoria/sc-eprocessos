from AccessControl.SecurityManagement import newSecurityManager
from plone.exportimport.interfaces import IExportImportRequestMarker
from Products.CMFPlone.factory import _DEFAULT_PROFILE
from Products.CMFPlone.factory import addPloneSite
from Products.GenericSetup.tool import SetupTool
from sc.eprocessos.interfaces import IBrowserLayer
from Testing.makerequest import makerequest
from zope.globalrequest import setRequest
from zope.interface import directlyProvidedBy
from zope.interface import directlyProvides

import os
import transaction


truthy = frozenset(("t", "true", "y", "yes", "on", "1"))


def asbool(s):
    """Return the boolean value ``True`` if the case-lowered value of string
    input ``s`` is a :term:`truthy string`. If ``s`` is already one of the
    boolean values ``True`` or ``False``, return it."""
    if s is None:
        return False
    if isinstance(s, bool):
        return s
    s = str(s).strip()
    return s.lower() in truthy


DELETE_EXISTING = asbool(os.getenv("DELETE_EXISTING"))
EXAMPLE_CONTENT = asbool(os.getenv("EXAMPLE_CONTENT", "1"))

app = makerequest(globals()["app"])

request = app.REQUEST

# Apply ``IExportImportRequestMarker`` so searchable facades short-circuit
# their ``form_config`` vocabulary fetch — the marker only gets attached
# inside ``plone.exportimport``'s own ``request_provides`` context, which
# does not wrap GenericSetup profile imports nor ``addPloneSite``.
ifaces = [IBrowserLayer, IExportImportRequestMarker]
for iface in directlyProvidedBy(request):
    ifaces.append(iface)

directlyProvides(request, *ifaces)

# Publish the request to ``zope.globalrequest`` so ``getRequest()`` returns
# our marked request from anywhere in the import flow.
setRequest(request)

admin = app.acl_users.getUserById("admin")
admin = admin.__of__(app.acl_users)
newSecurityManager(None, admin)

site_id = "Plone"
payload = {
    "title": "Plone e-Processos",
    "profile_id": _DEFAULT_PROFILE,
    "distribution_name": "volto",
    "setup_content": False,
    "default_language": "en",
    "portal_timezone": "UTC",
}

if site_id in app.objectIds() and DELETE_EXISTING:
    app.manage_delObjects([site_id])
    transaction.commit()
    app._p_jar.sync()

if site_id not in app.objectIds():
    site = addPloneSite(app, site_id, **payload)
    transaction.commit()

    portal_setup: SetupTool = site.portal_setup
    portal_setup.runAllImportStepsFromProfile("profile-sc.eprocessos:default")
    transaction.commit()

    if EXAMPLE_CONTENT:
        portal_setup.runAllImportStepsFromProfile("profile-sc.eprocessos:initial")
        transaction.commit()
    app._p_jar.sync()
