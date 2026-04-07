"""Tests for the EProcessosClient."""

from __future__ import annotations

from sc.eprocessos.client.client import EProcessosClient
from sc.eprocessos.client.exceptions import EProcessosConfigError
from sc.eprocessos.client.services.comissoes import ComissoesService
from sc.eprocessos.client.services.legislaturas import LegislaturasService
from sc.eprocessos.client.services.materias import MateriasService
from sc.eprocessos.client.services.mesas import MesasService
from sc.eprocessos.client.services.normas import NormasService
from sc.eprocessos.client.services.sessoes import SessoesService
from sc.eprocessos.client.services.vereadores import VereadoresService

import pytest


class TestEProcessosClientInit:
    def test_creates_services(self, base_url: str):
        client = EProcessosClient(base_url=base_url)
        assert isinstance(client.normas, NormasService)
        assert isinstance(client.vereadores, VereadoresService)
        assert isinstance(client.legislaturas, LegislaturasService)
        assert isinstance(client.mesas, MesasService)
        assert isinstance(client.comissoes, ComissoesService)
        assert isinstance(client.materias, MateriasService)
        assert isinstance(client.sessoes, SessoesService)
        client.close()

    def test_invalid_base_url(self):
        with pytest.raises(EProcessosConfigError):
            EProcessosClient(base_url="not-a-url")

    def test_custom_timeout(self, base_url: str):
        client = EProcessosClient(base_url=base_url, timeout=10.0)
        assert client._config.timeout == 10.0
        client.close()

    def test_custom_headers(self, base_url: str):
        headers = {"Authorization": "Bearer token"}
        client = EProcessosClient(base_url=base_url, headers=headers)
        assert client._config.headers == headers
        client.close()


class TestEProcessosClientContextManager:
    def test_context_manager(self, base_url: str):
        with EProcessosClient(base_url=base_url) as client:
            assert isinstance(client, EProcessosClient)

    def test_close_is_idempotent(self, base_url: str):
        client = EProcessosClient(base_url=base_url)
        client.close()
        client.close()  # Should not raise
