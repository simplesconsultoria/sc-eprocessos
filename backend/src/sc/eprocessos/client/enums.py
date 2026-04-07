"""Enumerations for e-Processos API parameters."""

from enum import IntEnum


class TipoNorma(IntEnum):
    """Types of legislative norms (used with /@@normas endpoint)."""

    LEI = 1
    LEI_COMPLEMENTAR = 2
    RESOLUCAO = 3
    DECRETO_LEGISLATIVO = 4
    DECRETO = 5


class TipoSessao(IntEnum):
    """Types of plenary sessions (used with /@@sessoes endpoint)."""

    ORDINARIA = 1
    EXTRAORDINARIA = 2
    SOLENE = 3
    SOLENE_INSTALACAO = 4
    SOLENE_POSSE = 5
    ENCERRAMENTO = 6
    ELEICAO_COMISSAO_EXECUTIVA = 7
    CONVOCACAO_EXTRAORDINARIA = 9


class TipoMateria(IntEnum):
    """Types of legislative matters (used with /@@materias endpoint).

    Values will be refined after API exploration.
    """

    PROJETO_LEI = 6
