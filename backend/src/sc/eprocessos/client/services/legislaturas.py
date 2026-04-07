"""Service for the /@@legislaturas endpoint."""

from __future__ import annotations

from sc.eprocessos.client.services.base import BaseService
from sc.eprocessos.client.types import LegislaturaItem
from sc.eprocessos.client.types import LegislaturasResponse


class LegislaturasService(BaseService):
    """Access legislative terms (legislaturas)."""

    endpoint = "legislaturas"

    def list(self) -> LegislaturasResponse:
        """List all legislative terms.

        Returns:
            Response containing list of legislative terms.
        """
        url = self._url()
        data = self._request("GET", url)
        return LegislaturasResponse(
            description=data.get("description", ""),
            items=data.get("items", []),
        )

    def get(self, item_id: str) -> LegislaturaItem:
        """Get a single legislative term by ID.

        Args:
            item_id: The legislature's ID.

        Returns:
            A single legislative term.
        """
        url = self._url(item_id)
        return self._request("GET", url)
