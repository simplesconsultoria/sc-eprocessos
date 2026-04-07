"""@@formdata service for form-based facade queries."""

from __future__ import annotations

from plone.restapi.services import Service
from sc.eprocessos.client.exceptions import EProcessosError
from sc.eprocessos.utils import get_client
from zExceptions import HTTPBadGateway

import logging


logger = logging.getLogger(__name__)


class FormDataGet(Service):
    """Return query results for form-based facades.

    URL: /legislativo/normas/@@formdata?ano=2025&tipo=1
    """

    def reply(self):
        params = dict(self.request.form)
        service_name = self.context.service_name

        try:
            client = get_client()
            try:
                service = getattr(client, service_name)
                # Convert string params to appropriate types for the service
                if "ano" in params:
                    params["ano"] = int(params["ano"])
                if "tipo" in params:
                    params["tipo"] = int(params["tipo"])
                data = service.list(**params)
            finally:
                client.close()
        except EProcessosError as exc:
            logger.exception("Failed to query %s", service_name)
            raise HTTPBadGateway(
                f"Could not fetch data from e-Processos for {service_name}"
            ) from exc

        return {
            "@id": f"{self.context.absolute_url()}/@formdata",
            "items": data.get("items", []),
            "items_total": len(data.get("items", [])),
            "description": data.get("description", ""),
        }
