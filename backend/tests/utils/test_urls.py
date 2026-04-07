"""Tests for sc.eprocessos.utils.urls."""

from sc.eprocessos.utils.urls import EProcessosItemURL
from sc.eprocessos.utils.urls import parse_eprocessos_url

import pytest


class TestEProcessosItemURL:
    """Test the EProcessosItemURL dataclass."""

    def test_attributes(self):
        url = EProcessosItemURL(
            prefix="http://host/@@vereadores", service="vereadores", item_id="123"
        )
        assert url.prefix == "http://host/@@vereadores"
        assert url.service == "vereadores"
        assert url.item_id == "123"

    def test_equality(self):
        a = EProcessosItemURL(prefix="x", service="y", item_id="1")
        b = EProcessosItemURL(prefix="x", service="y", item_id="1")
        assert a == b

    def test_inequality(self):
        a = EProcessosItemURL(prefix="x", service="y", item_id="1")
        b = EProcessosItemURL(prefix="x", service="y", item_id="2")
        assert a != b


class TestParseEprocessosUrl:
    """Test parse_eprocessos_url."""

    def test_valid_vereadores_url(self):
        result = parse_eprocessos_url(
            "https://e-processos.example.com/@@vereadores/546914"
        )
        assert result is not None
        assert result.prefix == "https://e-processos.example.com/@@vereadores"
        assert result.service == "vereadores"
        assert result.item_id == "546914"

    def test_valid_normas_url(self):
        result = parse_eprocessos_url("https://host/@@normas/18503")
        assert result is not None
        assert result.service == "normas"
        assert result.item_id == "18503"

    def test_valid_sessoes_url(self):
        result = parse_eprocessos_url("http://localhost/@@sessoes/1636")
        assert result is not None
        assert result.service == "sessoes"
        assert result.item_id == "1636"

    def test_returns_none_for_list_url(self):
        """List URLs (no item ID) should not match."""
        result = parse_eprocessos_url("https://host/@@vereadores")
        assert result is None

    def test_returns_none_for_non_eprocessos_url(self):
        result = parse_eprocessos_url("https://example.com/page")
        assert result is None

    def test_returns_none_for_empty_string(self):
        result = parse_eprocessos_url("")
        assert result is None

    def test_returns_none_for_non_numeric_id(self):
        """Item IDs must be numeric."""
        result = parse_eprocessos_url("https://host/@@vereadores/abc")
        assert result is None

    def test_prefix_reconstruction(self):
        """Prefix should include the full path up to and including @@service."""
        result = parse_eprocessos_url("https://a.b.c/path/@@comissoes/999")
        assert result is not None
        assert result.prefix == "https://a.b.c/path/@@comissoes"

    @pytest.mark.parametrize(
        "url,expected_prefix,expected_service",
        [
            ("/@@vereadores/1", "/@@vereadores", "vereadores"),
            ("https://h/@@vereadores/1", "https://h/@@vereadores", "vereadores"),
            ("https://h/@@normas/2", "https://h/@@normas", "normas"),
            ("https://h/@@legislaturas/3", "https://h/@@legislaturas", "legislaturas"),
            ("https://h/@@mesas/4", "https://h/@@mesas", "mesas"),
            ("https://h/@@comissoes/5", "https://h/@@comissoes", "comissoes"),
            ("https://h/@@materias/6", "https://h/@@materias", "materias"),
            ("https://h/@@sessoes/7", "https://h/@@sessoes", "sessoes"),
        ],
    )
    def test_all_services(self, url, expected_prefix, expected_service):
        result = parse_eprocessos_url(url)
        assert result is not None
        assert result.prefix == expected_prefix
        assert result.service == expected_service
