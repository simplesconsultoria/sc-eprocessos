"""Service for the /@@normas endpoint."""

from __future__ import annotations

from sc.eprocessos.client.enums import TipoNorma
from sc.eprocessos.client.services.base import BaseService
from sc.eprocessos.client.types import NormaItem
from sc.eprocessos.client.types import NormasResponse
from sc.eprocessos.settings import CUR_YEAR


class NormasService(BaseService):
    """Access legislative norms (leis, resoluções, decretos, etc.)."""

    endpoint = "normas"

    def list(
        self, ano: int = CUR_YEAR, tipo: TipoNorma | int | None = None
    ) -> NormasResponse:
        """List norms filtered by year and optionally by type.

        Args:
            ano: Year to filter by.
            tipo: Type of norm (use TipoNorma enum).

        Returns:
            Response containing list of norms.
        """
        params: dict[str, str | int] = {"ano": ano}
        if tipo is not None:
            params["tipo"] = int(tipo)
        url = self._url()
        data = self._request("GET", url, params=params)
        return NormasResponse(
            description=data.get("description", ""),
            items=data.get("items", []),
        )

    def get(self, item_id: str) -> NormaItem:
        """Get a single norm by ID.

        Args:
            item_id: The norm's ID.

        Returns:
            A single norm item.
        """
        url = self._url(item_id)
        return self._request("GET", url)
