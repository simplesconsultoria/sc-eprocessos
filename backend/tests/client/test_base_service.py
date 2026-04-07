"""Tests for the BaseService."""

from __future__ import annotations

from sc.eprocessos.client.exceptions import EProcessosAuthError
from sc.eprocessos.client.exceptions import EProcessosConnectionError
from sc.eprocessos.client.exceptions import EProcessosHTTPError
from sc.eprocessos.client.exceptions import EProcessosNotFoundError
from sc.eprocessos.client.exceptions import EProcessosResponseError
from sc.eprocessos.client.exceptions import EProcessosServerError
from sc.eprocessos.client.services.base import BaseService
from unittest.mock import patch

import httpx
import pytest


BASE_URL = "https://e-processos.example.com"


class ConcreteService(BaseService):
    """Concrete service for testing."""

    endpoint = "test"


@pytest.fixture()
def service(http_client: httpx.Client) -> ConcreteService:
    return ConcreteService(
        http_client=http_client,
        base_url=BASE_URL,
        max_retries=1,
        retry_delay=0.0,
    )


class TestURLBuilding:
    def test_url_no_parts(self, service: ConcreteService):
        assert service._url() == f"{BASE_URL}/@@test"

    def test_url_with_parts(self, service: ConcreteService):
        assert service._url("123") == f"{BASE_URL}/@@test/123"

    def test_url_with_multiple_parts(self, service: ConcreteService):
        assert service._url("id", "456") == f"{BASE_URL}/@@test/id/456"

    def test_traversal_url(self, service: ConcreteService):
        url = service._traversal_url(tipo=1, ano=2025)
        assert url == f"{BASE_URL}/@@test/tipo/1/ano/2025"


class TestErrorMapping:
    def test_404_raises_not_found(self, service: ConcreteService):
        with patch.object(
            service._http,
            "request",
            return_value=httpx.Response(404, request=httpx.Request("GET", BASE_URL)),
        ):
            with pytest.raises(EProcessosNotFoundError) as exc_info:
                service._request("GET", f"{BASE_URL}/@@test/missing")
            assert exc_info.value.status_code == 404

    def test_401_raises_auth_error(self, service: ConcreteService):
        with patch.object(
            service._http,
            "request",
            return_value=httpx.Response(401, request=httpx.Request("GET", BASE_URL)),
        ):
            with pytest.raises(EProcessosAuthError) as exc_info:
                service._request("GET", f"{BASE_URL}/@@test")
            assert exc_info.value.status_code == 401

    def test_403_raises_auth_error(self, service: ConcreteService):
        with (
            patch.object(
                service._http,
                "request",
                return_value=httpx.Response(
                    403, request=httpx.Request("GET", BASE_URL)
                ),
            ),
            pytest.raises(EProcessosAuthError),
        ):
            service._request("GET", f"{BASE_URL}/@@test")

    def test_500_raises_server_error(self, service: ConcreteService):
        with patch.object(
            service._http,
            "request",
            return_value=httpx.Response(500, request=httpx.Request("GET", BASE_URL)),
        ):
            with pytest.raises(EProcessosServerError) as exc_info:
                service._request("GET", f"{BASE_URL}/@@test")
            assert exc_info.value.status_code == 500

    def test_400_raises_http_error(self, service: ConcreteService):
        with patch.object(
            service._http,
            "request",
            return_value=httpx.Response(400, request=httpx.Request("GET", BASE_URL)),
        ):
            with pytest.raises(EProcessosHTTPError) as exc_info:
                service._request("GET", f"{BASE_URL}/@@test")
            assert exc_info.value.status_code == 400

    def test_timeout_raises_connection_error(self, service: ConcreteService):
        with (
            patch.object(
                service._http,
                "request",
                side_effect=httpx.TimeoutException("timed out"),
            ),
            pytest.raises(EProcessosConnectionError, match="Timeout"),
        ):
            service._request("GET", f"{BASE_URL}/@@test")

    def test_connect_error_raises_connection_error(self, service: ConcreteService):
        with (
            patch.object(
                service._http,
                "request",
                side_effect=httpx.ConnectError("refused"),
            ),
            pytest.raises(EProcessosConnectionError, match="Connection error"),
        ):
            service._request("GET", f"{BASE_URL}/@@test")

    def test_invalid_json_raises_response_error(self, service: ConcreteService):
        response = httpx.Response(
            200,
            content=b"not json",
            headers={"content-type": "text/html"},
            request=httpx.Request("GET", BASE_URL),
        )
        with (
            patch.object(service._http, "request", return_value=response),
            pytest.raises(EProcessosResponseError, match="Invalid JSON"),
        ):
            service._request("GET", f"{BASE_URL}/@@test")


class TestRetryLogic:
    def test_retries_on_server_error(self, http_client: httpx.Client):
        service = ConcreteService(
            http_client=http_client,
            base_url=BASE_URL,
            max_retries=3,
            retry_delay=0.0,
        )
        request = httpx.Request("GET", BASE_URL)
        responses = [
            httpx.Response(500, request=request),
            httpx.Response(500, request=request),
            httpx.Response(200, json={"ok": True}, request=request),
        ]
        call_count = 0

        def mock_request(*args, **kwargs):
            nonlocal call_count
            resp = responses[call_count]
            call_count += 1
            return resp

        with patch.object(service._http, "request", side_effect=mock_request):
            result = service._request("GET", f"{BASE_URL}/@@test")
        assert result == {"ok": True}
        assert call_count == 3

    def test_retries_on_connection_error(self, http_client: httpx.Client):
        service = ConcreteService(
            http_client=http_client,
            base_url=BASE_URL,
            max_retries=2,
            retry_delay=0.0,
        )
        request = httpx.Request("GET", BASE_URL)
        responses = [
            httpx.ConnectError("refused"),
            httpx.Response(200, json={"ok": True}, request=request),
        ]
        call_count = 0

        def mock_request(*args, **kwargs):
            nonlocal call_count
            resp = responses[call_count]
            call_count += 1
            if isinstance(resp, Exception):
                raise resp
            return resp

        with patch.object(service._http, "request", side_effect=mock_request):
            result = service._request("GET", f"{BASE_URL}/@@test")
        assert result == {"ok": True}

    def test_no_retry_on_client_error(self, http_client: httpx.Client):
        service = ConcreteService(
            http_client=http_client,
            base_url=BASE_URL,
            max_retries=3,
            retry_delay=0.0,
        )
        request = httpx.Request("GET", BASE_URL)
        call_count = 0

        def mock_request(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            return httpx.Response(404, request=request)

        with (
            patch.object(service._http, "request", side_effect=mock_request),
            pytest.raises(EProcessosNotFoundError),
        ):
            service._request("GET", f"{BASE_URL}/@@test/missing")
        assert call_count == 1

    def test_exhausted_retries_raises_last_exception(self, http_client: httpx.Client):
        service = ConcreteService(
            http_client=http_client,
            base_url=BASE_URL,
            max_retries=2,
            retry_delay=0.0,
        )
        request = httpx.Request("GET", BASE_URL)

        with (
            patch.object(
                service._http,
                "request",
                return_value=httpx.Response(503, request=request),
            ),
            pytest.raises(EProcessosServerError),
        ):
            service._request("GET", f"{BASE_URL}/@@test")

    def test_success_on_first_try(self, service: ConcreteService):
        request = httpx.Request("GET", BASE_URL)
        response = httpx.Response(200, json={"items": []}, request=request)
        with patch.object(service._http, "request", return_value=response):
            result = service._request("GET", f"{BASE_URL}/@@test")
        assert result == {"items": []}
