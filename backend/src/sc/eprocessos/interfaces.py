"""Module where all interfaces, events and exceptions live."""

from Products.CMFCore.interfaces import IContentish
from sc.eprocessos import _
from zope import schema
from zope.interface import Interface
from zope.publisher.interfaces.browser import IDefaultBrowserLayer


class IBrowserLayer(IDefaultBrowserLayer):
    """Marker interface that defines a browser layer."""


# --- Settings ---


class IEProcessosSettings(Interface):
    """e-Processos site settings"""

    base_url = schema.URI(
        title=_("e-Processos base address"),
        description=_("The base URL for the e-Processos API."),
        required=False,
        default="http://localhost/",
    )
    default_timeout = schema.Int(
        title=_("Default timeout"),
        description=_("The default timeout for the e-Processos API client."),
        required=False,
        default=30,
    )
    max_retries = schema.Int(
        title=_("Maximum retries"),
        description=_("The maximum number of retries for the e-Processos API client."),
        required=False,
        default=3,
    )
    retry_delay = schema.Float(
        title=_("Retry delay"),
        description=_("The delay between retries for the e-Processos API client."),
        required=False,
        default=1.0,
    )


# --- Facade interfaces (Dexterity content, persistent) ---


class IEProcessosFacade(Interface):
    """Base marker for all e-Processos facade content types."""


class INormas(IEProcessosFacade):
    """Marker for the Normas facade."""


class IVereadores(IEProcessosFacade):
    """Marker for the Vereadores facade."""


class ILegislaturas(IEProcessosFacade):
    """Marker for the Legislaturas facade."""


class IMesas(IEProcessosFacade):
    """Marker for the Mesas facade."""


class IComissoes(IEProcessosFacade):
    """Marker for the Comissoes facade."""


class IMaterias(IEProcessosFacade):
    """Marker for the Materias facade."""


class ISessoes(IEProcessosFacade):
    """Marker for the Sessoes facade."""


# --- Item interfaces (non-persistent, traversed from API) ---


class IEProcessosItem(IContentish):
    """Base marker for all e-Processos traversed items.

    Extends IContentish so plone.rest's RESTWrapper accepts it.
    """


class INormaItem(IEProcessosItem):
    """A single norm/legislation, resolved from the API."""


class IVereadorItem(IEProcessosItem):
    """A single councilor, resolved from the API."""


class ILegislaturaItem(IEProcessosItem):
    """A single legislative term."""


class IMesaItem(IEProcessosItem):
    """A single executive board period."""


class IComissaoItem(IEProcessosItem):
    """A single committee."""


class IMateriaItem(IEProcessosItem):
    """A single legislative matter."""


class ISessaoItem(IEProcessosItem):
    """A single plenary session."""
