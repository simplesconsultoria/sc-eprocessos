"""Main e-Processos API client."""

from __future__ import annotations

from sc.eprocessos.client.config import ClientConfig
from sc.eprocessos.client.config import DEFAULT_MAX_RETRIES
from sc.eprocessos.client.config import DEFAULT_RETRY_DELAY
from sc.eprocessos.client.config import DEFAULT_TIMEOUT
from sc.eprocessos.client.services.comissoes import ComissoesService
from sc.eprocessos.client.services.legislaturas import LegislaturasService
from sc.eprocessos.client.services.materias import MateriasService
from sc.eprocessos.client.services.mesas import MesasService
from sc.eprocessos.client.services.normas import NormasService
from sc.eprocessos.client.services.sessoes import SessoesService
from sc.eprocessos.client.services.vereadores import VereadoresService
from types import TracebackType

import httpx


class EProcessosClient:
    """Client for the e-Processos REST API.

    Usage::

        client = EProcessosClient(base_url="https://e-processos.example.com")
        normas = client.normas.list(ano=2025, tipo=TipoNorma.LEI)
        client.close()

        # Or as a context manager:
        with EProcessosClient(base_url="https://e-processos.example.com") as client:
            vereadores = client.vereadores.list()
    """

    def __init__(
        self,
        base_url: str,
        *,
        timeout: float = DEFAULT_TIMEOUT,
        max_retries: int = DEFAULT_MAX_RETRIES,
        retry_delay: float = DEFAULT_RETRY_DELAY,
        headers: dict[str, str] | None = None,
    ) -> None:
        self._config = ClientConfig(
            base_url=base_url,
            timeout=timeout,
            max_retries=max_retries,
            retry_delay=retry_delay,
            headers=headers or {},
        )
        self._http = httpx.Client(
            timeout=self._config.timeout,
            headers=self._config.headers,
        )
        service_kwargs = {
            "http_client": self._http,
            "base_url": self._config.base_url,
            "max_retries": self._config.max_retries,
            "retry_delay": self._config.retry_delay,
        }
        self.normas = NormasService(**service_kwargs)
        self.vereadores = VereadoresService(**service_kwargs)
        self.legislaturas = LegislaturasService(**service_kwargs)
        self.mesas = MesasService(**service_kwargs)
        self.comissoes = ComissoesService(**service_kwargs)
        self.materias = MateriasService(**service_kwargs)
        self.sessoes = SessoesService(**service_kwargs)

    def close(self) -> None:
        """Close the underlying HTTP client."""
        self._http.close()

    def __enter__(self) -> EProcessosClient:
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        self.close()
