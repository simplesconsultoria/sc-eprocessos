"""Base service class for e-Processos API endpoints."""

from __future__ import annotations

from sc.eprocessos import logger
from sc.eprocessos.client.exceptions import EProcessosAuthError
from sc.eprocessos.client.exceptions import EProcessosConnectionError
from sc.eprocessos.client.exceptions import EProcessosHTTPError
from sc.eprocessos.client.exceptions import EProcessosNotFoundError
from sc.eprocessos.client.exceptions import EProcessosResponseError
from sc.eprocessos.client.exceptions import EProcessosServerError
from typing import Any

import httpx
import time


class BaseService:
    """Base class for e-Processos API service endpoints."""

    endpoint: str = ""

    def __init__(
        self,
        http_client: httpx.Client,
        base_url: str,
        max_retries: int = 3,
        retry_delay: float = 1.0,
    ) -> None:
        self._http = http_client
        self._base_url = base_url
        self._max_retries = max_retries
        self._retry_delay = retry_delay

    def _url(self, *parts: str) -> str:
        """Build URL: {base_url}/@@{endpoint}[/parts...]."""
        segments = [self._base_url, f"@@{self.endpoint}"]
        segments.extend(parts)
        return "/".join(segments)

    def _traversal_url(self, **kwargs: str | int) -> str:
        """Build path-traversal URL: /@@endpoint/key1/val1/key2/val2."""
        parts: list[str] = []
        for key, value in kwargs.items():
            parts.extend([key, str(value)])
        return self._url(*parts)

    def vocabularies(self) -> dict[str, Any]:
        """Fetch the filter vocabularies advertised by the endpoint.

        The upstream returns a payload with a ``filtros`` key shaped as
        ``{field: [{"id": ..., "title": ...}, ...]}`` when the root URL
        is called with no path arguments. Endpoints that do not expose
        filters return an empty dict.
        """
        data = self._request("GET", self._url())
        return data.get("filtros", {})

    def _request(
        self,
        method: str,
        url: str,
        params: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Execute an HTTP request with retry logic and error mapping.

        Maps httpx exceptions to EProcessos exceptions.
        Retries on connection errors, timeouts, and 5xx responses.
        """
        last_exception: Exception | None = None
        for attempt in range(self._max_retries):
            try:
                response = self._do_request(method, url, params)
                return self._handle_response(response)
            except (EProcessosConnectionError, EProcessosServerError) as exc:
                last_exception = exc
                if attempt < self._max_retries - 1:
                    delay = self._retry_delay * (2**attempt)
                    logger.warning(
                        "Retry %d/%d for %s %s: %s",
                        attempt + 1,
                        self._max_retries,
                        method,
                        url,
                        exc,
                    )
                    time.sleep(delay)
            except (
                EProcessosHTTPError,
                EProcessosResponseError,
            ):
                raise
        raise last_exception  # type: ignore[misc]

    def _do_request(
        self,
        method: str,
        url: str,
        params: dict[str, Any] | None = None,
    ) -> httpx.Response:
        """Execute the HTTP call, mapping transport errors to our exceptions."""
        try:
            return self._http.request(method, url, params=params)
        except httpx.TimeoutException as exc:
            raise EProcessosConnectionError(
                f"Timeout on {method} {url}",
                url=url,
                method=method,
            ) from exc
        except httpx.ConnectError as exc:
            raise EProcessosConnectionError(
                f"Connection error on {method} {url}",
                url=url,
                method=method,
            ) from exc

    def _handle_response(self, response: httpx.Response) -> dict[str, Any]:
        """Process an httpx response, raising appropriate exceptions."""
        url = str(response.request.url)
        method = response.request.method
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            body = exc.response.text
            msg = f"{method} {url} returned {status}"
            kwargs = {
                "status_code": status,
                "url": url,
                "method": method,
                "response_body": body,
            }
            if status == 404:
                raise EProcessosNotFoundError(msg, **kwargs) from exc
            if status in (401, 403):
                raise EProcessosAuthError(msg, **kwargs) from exc
            if status >= 500:
                raise EProcessosServerError(msg, **kwargs) from exc
            raise EProcessosHTTPError(msg, **kwargs) from exc

        try:
            return response.json()
        except ValueError as exc:
            raise EProcessosResponseError(
                f"Invalid JSON response from {method} {url}",
                url=url,
                method=method,
            ) from exc
