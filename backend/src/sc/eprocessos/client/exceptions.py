"""Exceptions for the e-Processos API client."""

from __future__ import annotations


class EProcessosError(Exception):
    """Base exception for all e-Processos client errors."""


class EProcessosConfigError(EProcessosError):
    """Invalid client configuration (bad base_url, missing params, etc.)."""


class EProcessosConnectionError(EProcessosError):
    """Network-level failure (DNS, connection refused, timeout)."""

    def __init__(self, message: str, url: str = "", method: str = "") -> None:
        self.url = url
        self.method = method
        super().__init__(message)


class EProcessosHTTPError(EProcessosError):
    """HTTP response with non-2xx status code."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int,
        url: str = "",
        method: str = "",
        response_body: str | None = None,
    ) -> None:
        self.status_code = status_code
        self.url = url
        self.method = method
        self.response_body = response_body
        super().__init__(message)


class EProcessosNotFoundError(EProcessosHTTPError):
    """404 - resource not found."""


class EProcessosAuthError(EProcessosHTTPError):
    """401/403 - authentication or authorization failure."""


class EProcessosServerError(EProcessosHTTPError):
    """5xx - server-side error."""


class EProcessosResponseError(EProcessosError):
    """Response body is not valid JSON or doesn't match expected structure."""

    def __init__(self, message: str, url: str = "", method: str = "") -> None:
        self.url = url
        self.method = method
        super().__init__(message)
