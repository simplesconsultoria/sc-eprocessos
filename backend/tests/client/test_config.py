"""Tests for the config module."""

from __future__ import annotations

from sc.eprocessos.client.config import ClientConfig
from sc.eprocessos.client.config import DEFAULT_MAX_RETRIES
from sc.eprocessos.client.config import DEFAULT_RETRY_DELAY
from sc.eprocessos.client.config import DEFAULT_TIMEOUT
from sc.eprocessos.client.exceptions import EProcessosConfigError

import pytest


class TestClientConfig:
    def test_valid_https_url(self):
        config = ClientConfig(base_url="https://example.com")
        assert config.base_url == "https://example.com"

    def test_valid_http_url(self):
        config = ClientConfig(base_url="http://localhost:8080")
        assert config.base_url == "http://localhost:8080"

    def test_strips_trailing_slash(self):
        config = ClientConfig(base_url="https://example.com/")
        assert config.base_url == "https://example.com"

    def test_strips_multiple_trailing_slashes(self):
        config = ClientConfig(base_url="https://example.com///")
        assert config.base_url == "https://example.com"

    def test_invalid_url_empty(self):
        with pytest.raises(EProcessosConfigError, match="valid HTTP"):
            ClientConfig(base_url="")

    def test_invalid_url_no_scheme(self):
        with pytest.raises(EProcessosConfigError, match="valid HTTP"):
            ClientConfig(base_url="example.com")

    def test_invalid_url_ftp(self):
        with pytest.raises(EProcessosConfigError, match="valid HTTP"):
            ClientConfig(base_url="ftp://example.com")

    def test_defaults(self):
        config = ClientConfig(base_url="https://example.com")
        assert config.timeout == DEFAULT_TIMEOUT
        assert config.max_retries == DEFAULT_MAX_RETRIES
        assert config.retry_delay == DEFAULT_RETRY_DELAY
        assert config.headers == {}

    def test_custom_values(self):
        config = ClientConfig(
            base_url="https://example.com",
            timeout=10.0,
            max_retries=5,
            retry_delay=0.5,
            headers={"X-Custom": "value"},
        )
        assert config.timeout == 10.0
        assert config.max_retries == 5
        assert config.retry_delay == 0.5
        assert config.headers == {"X-Custom": "value"}

    def test_frozen(self):
        config = ClientConfig(base_url="https://example.com")
        with pytest.raises(AttributeError):
            config.base_url = "https://other.com"
