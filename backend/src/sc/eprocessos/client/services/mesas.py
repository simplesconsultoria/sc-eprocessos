"""Service for the /@@mesas endpoint."""

from __future__ import annotations

from sc.eprocessos.client.services.base import BaseService
from sc.eprocessos.client.types import MesaDetail
from sc.eprocessos.client.types import MesasResponse


class MesasService(BaseService):
    """Access executive board periods (mesas diretoras)."""

    endpoint = "mesas"

    def list(self) -> MesasResponse:
        """List all executive board periods.

        Returns:
            Response containing list of executive board periods.
        """
        url = self._url()
        data = self._request("GET", url)
        return MesasResponse(
            description=data.get("description", ""),
            items=data.get("items", []),
        )

    def get(self, item_id: str) -> MesaDetail:
        """Get a single executive board period by ID with members.

        Args:
            item_id: The board period's ID.

        Returns:
            Executive board with member details.
        """
        url = self._url(item_id)
        return self._request("GET", url)
