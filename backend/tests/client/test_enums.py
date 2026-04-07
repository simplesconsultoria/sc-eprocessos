"""Tests for the enums module."""

from __future__ import annotations

from enum import IntEnum
from sc.eprocessos.client.enums import TipoMateria
from sc.eprocessos.client.enums import TipoNorma
from sc.eprocessos.client.enums import TipoSessao

import pytest


class TestTipoNorma:
    def test_is_int_enum(self):
        assert issubclass(TipoNorma, IntEnum)

    def test_values(self):
        assert TipoNorma.LEI == 1
        assert TipoNorma.LEI_COMPLEMENTAR == 2
        assert TipoNorma.RESOLUCAO == 3
        assert TipoNorma.DECRETO_LEGISLATIVO == 4
        assert TipoNorma.DECRETO == 5

    def test_can_use_as_int(self):
        assert int(TipoNorma.LEI) == 1

    @pytest.mark.parametrize("member", TipoNorma)
    def test_all_members_are_positive(self, member):
        assert member > 0


class TestTipoSessao:
    def test_is_int_enum(self):
        assert issubclass(TipoSessao, IntEnum)

    def test_values(self):
        assert TipoSessao.ORDINARIA == 1
        assert TipoSessao.EXTRAORDINARIA == 2
        assert TipoSessao.SOLENE == 3

    @pytest.mark.parametrize("member", TipoSessao)
    def test_all_members_are_positive(self, member):
        assert member > 0


class TestTipoMateria:
    def test_is_int_enum(self):
        assert issubclass(TipoMateria, IntEnum)

    def test_projeto_lei(self):
        assert TipoMateria.PROJETO_LEI == 6
