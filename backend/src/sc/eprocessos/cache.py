"""In-process caching for e-Processos API calls.

Uses a dedicated ``zope.ramcache.ram.RAMCache`` instance scoped to this
add-on so the TTL can be tuned independently of Plone's global memoize
defaults. TTL and max entries are driven by the registry records under
``IEProcessosSettings``.

Typical usage::

    from sc.eprocessos.cache import cache

    def _key(method, self):
        return (self.service_name, self.item_id, self.sub_item)

    @cache(_key)
    def fetch_data(self) -> dict:
        ...

Operators can flush the cache at runtime via
:func:`invalidate_all` (wired to a control panel action).
"""

from __future__ import annotations

from collections.abc import Callable
from plone import api
from plone.memoize import ram
from plone.memoize import volatile
from sc.eprocessos import logger
from zope.ramcache.ram import RAMCache


DEFAULT_TTL: int = 300
DEFAULT_MAX_ENTRIES: int = 1000
DEFAULT_CLEANUP_INTERVAL: int = 60

_REGISTRY_KEY: str = "eprocessos.cache_ttl"


_cache: RAMCache = RAMCache()
_cache.update(
    maxAge=DEFAULT_TTL,
    maxEntries=DEFAULT_MAX_ENTRIES,
    cleanupInterval=DEFAULT_CLEANUP_INTERVAL,
)


def _sync_ttl_from_registry() -> None:
    """Update the cache's TTL from the registry if it differs.

    Called from ``_get_cache`` so that control panel edits take effect
    on the next cache lookup without requiring a Zope restart. Fails
    open (no-op) if the registry record is missing — e.g. during early
    testing layers before the profile is installed.
    """
    try:
        raw = api.portal.get_registry_record(_REGISTRY_KEY)
    except (KeyError, api.exc.InvalidParameterError, api.exc.CannotGetPortalError):
        return
    if raw is None:
        return
    ttl = int(raw)
    if ttl != _cache.maxAge:
        _cache.update(maxAge=ttl)
        logger.debug("e-Processos cache TTL updated to %ds", ttl)


def get_ttl() -> int:
    """Return the TTL currently in effect on the underlying RAMCache."""
    return _cache.maxAge


def invalidate_all() -> None:
    """Flush every cached e-Processos response."""
    _cache.invalidateAll()
    logger.info("e-Processos cache flushed")


def _get_cache(fun: Callable, *args, **kwargs) -> ram.RAMCacheAdapter:
    """Return a dict-like adapter bound to our private RAMCache.

    ``plone.memoize.volatile.cache`` passes the decorated function plus
    the call's positional and keyword arguments; we only use the
    function to derive the namespacing ``globalkey``.

    Syncs the TTL from the registry on every call so operators can tune
    it via the control panel at runtime.
    """
    _sync_ttl_from_registry()
    key = f"{fun.__module__}.{fun.__name__}"
    return ram.RAMCacheAdapter(_cache, globalkey=key)


def cache(get_key: Callable) -> Callable:
    """Memoize a callable using the dedicated e-Processos RAMCache.

    ``get_key`` must be a function that receives the same positional
    arguments as the decorated callable (prefixed by the function itself,
    per ``plone.memoize.volatile`` convention) and returns a hashable
    cache key.
    """
    return volatile.cache(get_key, get_cache=_get_cache)
