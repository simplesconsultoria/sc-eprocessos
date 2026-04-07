"""e-Processos API client.

A standalone Python client for the e-Processos REST API,
with no Plone dependencies.
"""

from sc.eprocessos.client.client import EProcessosClient
from sc.eprocessos.client.enums import TipoMateria
from sc.eprocessos.client.enums import TipoNorma
from sc.eprocessos.client.enums import TipoSessao
from sc.eprocessos.client.exceptions import EProcessosAuthError
from sc.eprocessos.client.exceptions import EProcessosConfigError
from sc.eprocessos.client.exceptions import EProcessosConnectionError
from sc.eprocessos.client.exceptions import EProcessosError
from sc.eprocessos.client.exceptions import EProcessosHTTPError
from sc.eprocessos.client.exceptions import EProcessosNotFoundError
from sc.eprocessos.client.exceptions import EProcessosResponseError
from sc.eprocessos.client.exceptions import EProcessosServerError


__all__ = [
    "EProcessosAuthError",
    "EProcessosClient",
    "EProcessosConfigError",
    "EProcessosConnectionError",
    "EProcessosError",
    "EProcessosHTTPError",
    "EProcessosNotFoundError",
    "EProcessosResponseError",
    "EProcessosServerError",
    "TipoMateria",
    "TipoNorma",
    "TipoSessao",
]
