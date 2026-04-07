"""Service for the /@@vereadores endpoint."""

from __future__ import annotations

from sc.eprocessos.client.services.base import BaseService
from sc.eprocessos.client.types import VereadorDetail
from sc.eprocessos.client.types import VereadoresResponse


class VereadoresService(BaseService):
    """Access city councilors (vereadores)."""

    endpoint = "vereadores"

    def list(self) -> VereadoresResponse:
        """List all active councilors.

        Returns:
            Response containing list of councilors.
        """
        url = self._url()
        data = self._request("GET", url)
        return VereadoresResponse(
            description=data.get("description", ""),
            items=data.get("items", []),
        )

    def get(self, item_id: str) -> VereadorDetail:
        """Get a single councilor by ID with full detail.

        Args:
            item_id: The councilor's ID.

        Returns:
            Councilor with committees, mandates, and board memberships.
        """
        url = self._url(item_id)
        return self._request("GET", url)
