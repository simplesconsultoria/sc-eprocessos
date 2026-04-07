"""Tests for the exceptions module."""

from __future__ import annotations

from sc.eprocessos.client.exceptions import EProcessosAuthError
from sc.eprocessos.client.exceptions import EProcessosConfigError
from sc.eprocessos.client.exceptions import EProcessosConnectionError
from sc.eprocessos.client.exceptions import EProcessosError
from sc.eprocessos.client.exceptions import EProcessosHTTPError
from sc.eprocessos.client.exceptions import EProcessosNotFoundError
from sc.eprocessos.client.exceptions import EProcessosResponseError
from sc.eprocessos.client.exceptions import EProcessosServerError

import pytest


class TestExceptionHierarchy:
    """Test that exception hierarchy is correct."""

    def test_base_exception(self):
        exc = EProcessosError("base error")
        assert str(exc) == "base error"
        assert isinstance(exc, Exception)

    def test_config_error_is_base(self):
        exc = EProcessosConfigError("bad config")
        assert isinstance(exc, EProcessosError)

    def test_connection_error(self):
        exc = EProcessosConnectionError(
            "timeout", url="https://example.com", method="GET"
        )
        assert isinstance(exc, EProcessosError)
        assert exc.url == "https://example.com"
        assert exc.method == "GET"
        assert str(exc) == "timeout"

    def test_connection_error_defaults(self):
        exc = EProcessosConnectionError("timeout")
        assert exc.url == ""
        assert exc.method == ""

    def test_http_error(self):
        exc = EProcessosHTTPError(
            "server error",
            status_code=500,
            url="https://example.com/api",
            method="POST",
            response_body='{"error": "internal"}',
        )
        assert isinstance(exc, EProcessosError)
        assert exc.status_code == 500
        assert exc.url == "https://example.com/api"
        assert exc.method == "POST"
        assert exc.response_body == '{"error": "internal"}'

    def test_http_error_defaults(self):
        exc = EProcessosHTTPError("error", status_code=400)
        assert exc.url == ""
        assert exc.method == ""
        assert exc.response_body is None

    def test_not_found_error(self):
        exc = EProcessosNotFoundError("not found", status_code=404)
        assert isinstance(exc, EProcessosHTTPError)
        assert isinstance(exc, EProcessosError)
        assert exc.status_code == 404

    def test_auth_error(self):
        exc = EProcessosAuthError("forbidden", status_code=403)
        assert isinstance(exc, EProcessosHTTPError)
        assert exc.status_code == 403

    def test_server_error(self):
        exc = EProcessosServerError("internal", status_code=502)
        assert isinstance(exc, EProcessosHTTPError)
        assert exc.status_code == 502

    def test_response_error(self):
        exc = EProcessosResponseError(
            "invalid json", url="https://example.com", method="GET"
        )
        assert isinstance(exc, EProcessosError)
        assert exc.url == "https://example.com"
        assert exc.method == "GET"

    def test_response_error_defaults(self):
        exc = EProcessosResponseError("invalid json")
        assert exc.url == ""
        assert exc.method == ""

    @pytest.mark.parametrize(
        "exc_class",
        [
            EProcessosConfigError,
            EProcessosConnectionError,
            EProcessosNotFoundError,
            EProcessosAuthError,
            EProcessosServerError,
            EProcessosResponseError,
        ],
    )
    def test_all_are_eprocessos_error(self, exc_class):
        assert issubclass(exc_class, EProcessosError)
