"""@@eprocessos-cache-flush service — empties the e-Processos RAM cache."""

from __future__ import annotations

from plone.restapi.services import Service
from sc.eprocessos.cache import get_ttl
from sc.eprocessos.cache import invalidate_all


class CacheFlushPost(Service):
    """Flush the e-Processos in-process cache.

    URL: POST /@@eprocessos-cache-flush (on the portal root)

    Requires the ``cmf.ManagePortal`` permission (enforced via ZCML).
    Returns a small JSON body confirming the flush and the current TTL
    so the caller can verify the configuration round-tripped.
    """

    def reply(self):
        invalidate_all()
        self.request.response.setStatus(200)
        return {
            "status": "ok",
            "flushed": True,
            "ttl": get_ttl(),
        }
