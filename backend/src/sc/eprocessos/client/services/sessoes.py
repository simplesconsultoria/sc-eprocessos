"""Service for the /@@sessoes endpoint."""

from __future__ import annotations

from sc.eprocessos import logger
from sc.eprocessos.client.enums import TipoSessao
from sc.eprocessos.client.services.base import BaseService
from sc.eprocessos.client.types import SessaoDetail
from sc.eprocessos.client.types import SessoesResponse
from sc.eprocessos.settings import CUR_YEAR


class SessoesService(BaseService):
    """Access plenary sessions (sessões/reuniões plenárias).

    This endpoint uses path-based traversal for listing
    and supports expanders for attendance and voting data.
    """

    endpoint = "sessoes"

    def list(
        self, ano: int = CUR_YEAR, tipo: TipoSessao | int = TipoSessao.ORDINARIA
    ) -> SessoesResponse:
        """List plenary sessions filtered by year and type.

        Uses path-traversal: /@@sessoes/tipo/{tipo}/ano/{ano}

        Args:
            ano: Year to filter by.
            tipo: Type of session (use TipoSessao enum).

        Returns:
            Response containing list of plenary sessions.
        """
        url = self._traversal_url(tipo=int(tipo), ano=ano)
        data = self._request("GET", url)
        return SessoesResponse(
            description=data.get("description", ""),
            items=data.get("items", []),
        )

    def get(
        self,
        item_id: str,
        expanders: list[str] | None = None,
    ) -> SessaoDetail:
        """Get a single plenary session by ID, optionally expanding related data.

        Args:
            item_id: The session's ID.
            expanders: List of expanders to fetch. Supported values:
                ``"presenca"`` (attendance) and ``"votacao"`` (voting).

        Returns:
            Session detail, optionally including attendance and voting data.
        """
        url = self._url("id", item_id)
        data = self._request("GET", url)
        if expanders:
            for exp in expanders:
                exp_url = data.get(f"@id_{exp}")
                if exp_url:
                    # The API may return a full URL or a relative path
                    # (e.g. /@@sessoes/id/1669/presenca).  Normalise to
                    # a fully-qualified URL so httpx can handle it.
                    if not exp_url.startswith("http"):
                        path = exp_url.lstrip("/")
                        exp_url = f"{self._base_url}/{path}"
                    data[exp] = self._request("GET", exp_url)
                else:
                    logger.warning(
                        "Expander '%s' URL not found in session %s",
                        exp,
                        item_id,
                    )
        return data
