"""Service for the /@@materias endpoint."""

from __future__ import annotations

from sc.eprocessos.client.enums import TipoMateria
from sc.eprocessos.client.services.base import BaseService
from sc.eprocessos.client.types import MateriaItem
from sc.eprocessos.client.types import MateriasResponse
from sc.eprocessos.settings import CUR_YEAR


class MateriasService(BaseService):
    """Access legislative matters (matérias legislativas)."""

    endpoint = "materias"

    def list(
        self, ano: int = CUR_YEAR, tipo: TipoMateria | int | None = None
    ) -> MateriasResponse:
        """List legislative matters filtered by year and optionally by type.

        Args:
            ano: Year to filter by.
            tipo: Type of matter (use TipoMateria enum).

        Returns:
            Response containing list of legislative matters.
        """
        params: dict[str, str | int] = {"ano": ano}
        if tipo is not None:
            params["tipo"] = int(tipo)
        url = self._url()
        data = self._request("GET", url, params=params)
        return MateriasResponse(
            description=data.get("description", ""),
            items=data.get("items", []),
        )

    def get(self, item_id: str) -> MateriaItem:
        """Get a single legislative matter by ID.

        Args:
            item_id: The matter's ID.

        Returns:
            A single legislative matter.
        """
        url = self._url(item_id)
        return self._request("GET", url)
