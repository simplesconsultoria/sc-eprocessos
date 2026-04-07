"""Service for the /@@comissoes endpoint."""

from __future__ import annotations

from sc.eprocessos.client.services.base import BaseService
from sc.eprocessos.client.types import ComissaoDetail
from sc.eprocessos.client.types import ComissoesResponse


class ComissoesService(BaseService):
    """Access committees (comissões)."""

    endpoint = "comissoes"

    def list(self) -> ComissoesResponse:
        """List all committees.

        Returns:
            Response containing list of committees.
        """
        url = self._url()
        data = self._request("GET", url)
        return ComissoesResponse(
            description=data.get("description", ""),
            items=data.get("items", []),
        )

    def get(self, item_id: str) -> ComissaoDetail:
        """Get a single committee by ID with members, meetings, and periods.

        Args:
            item_id: The committee's ID.

        Returns:
            Committee with full detail.
        """
        url = self._url(item_id)
        return self._request("GET", url)
