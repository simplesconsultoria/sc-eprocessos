"""TypedDict definitions for e-Processos API responses."""

from __future__ import annotations

from typing import TypedDict


# --- Shared types ---


class FileItem(TypedDict, total=False):
    """A file attachment (PDF, etc.)."""

    content_type: str
    download: str
    filename: str
    size: str


class ImageItem(TypedDict, total=False):
    """An image attachment."""

    content_type: str
    download: str
    filename: str
    height: str
    size: str
    width: str


class PartidoItem(TypedDict):
    """A political party."""

    title: str
    token: str


class AuthorshipItem(TypedDict, total=False):
    """Authorship of a legislative matter."""

    description: str
    firstAuthor: bool
    title: str


# --- Normas ---


class NormaItem(TypedDict, total=False):
    """A single norm/legislation item."""

    id: str
    title: str
    description: str
    data_apresentacao: str
    data_norma: str
    data_publicacao: str
    status: str


class NormasResponse(TypedDict):
    """Response from /@@normas endpoint."""

    description: str
    items: list[NormaItem]


# --- Vereadores ---


class ParticipanteComissaoItem(TypedDict, total=False):
    """A councilor's participation in a committee."""

    id: str
    comissao: str
    title: str
    description: str
    mandato: str
    start: str
    end: str


class MandatoItem(TypedDict, total=False):
    """A councilor's mandate."""

    id: str
    title: str
    description: str
    start: str
    end: str
    legislatura: str


class MembroMesaItem(TypedDict, total=False):
    """A councilor's role in an executive board."""

    id: str
    title: str
    description: str
    cargo: str
    start: str
    end: str


class VereadorItem(TypedDict, total=False):
    """A single councilor item (list view)."""

    id: str
    title: str
    description: str
    dic_vereador: str
    partido: list[PartidoItem]
    image: list[ImageItem]
    url_foto: str


class VereadorDetail(TypedDict, total=False):
    """A councilor with full detail (single item view)."""

    id: str
    title: str
    description: str
    dic_vereador: str
    cod_autor: str
    biografia: str
    birthday: str
    partido: list[PartidoItem]
    image: list[ImageItem]
    url_foto: str
    comissoes: list[ParticipanteComissaoItem]
    mandatos: list[MandatoItem]
    mesas: list[MembroMesaItem]


class VereadoresResponse(TypedDict):
    """Response from /@@vereadores endpoint."""

    description: str
    items: list[VereadorItem]


# --- Legislaturas ---


class LegislaturaItem(TypedDict, total=False):
    """A single legislative term."""

    id: str
    title: str
    description: str
    atual: bool


class LegislaturasResponse(TypedDict):
    """Response from /@@legislaturas endpoint."""

    description: str
    items: list[LegislaturaItem]


# --- Mesas (Executive Boards) ---


class MesaItem(TypedDict, total=False):
    """A single executive board period."""

    id: str
    title: str
    description: str
    legislatura: str
    legislatura_id: str
    start: str
    end: str
    atual: bool


class MesaDetail(TypedDict, total=False):
    """An executive board with members."""

    id: str
    title: str
    description: str
    legislatura: str
    legislatura_id: str
    start: str
    end: str
    atual: bool
    items: list[dict]


class MesasResponse(TypedDict):
    """Response from /@@mesas endpoint."""

    description: str
    items: list[MesaItem]


# --- Comissões (Committees) ---


class ComissaoItem(TypedDict, total=False):
    """A single committee (list view)."""

    id: str
    title: str
    description: str
    tipo: str


class ComissaoDetail(TypedDict, total=False):
    """A committee with full detail."""

    id: str
    title: str
    description: str
    tipo: str
    items: list[dict]
    reunioes: list[dict]
    periodos: list[dict]


class ComissoesResponse(TypedDict):
    """Response from /@@comissoes endpoint."""

    description: str
    items: list[ComissaoItem]


# --- Matérias (Legislative Matters) ---


class MateriaItem(TypedDict, total=False):
    """A single legislative matter."""

    id: str
    title: str
    description: str
    date: str
    remoteUrl: str
    authorship: list[AuthorshipItem]
    file: list[FileItem]


class MateriasResponse(TypedDict):
    """Response from /@@materias endpoint."""

    description: str
    items: list[MateriaItem]


# --- Sessões (Plenary Sessions) ---


class SessaoItem(TypedDict, total=False):
    """A single plenary session."""

    id: str
    title: str
    description: str
    date: str
    startTime: str
    endTime: str
    type: str
    type_id: int
    ata: list[FileItem]
    pauta: list[FileItem]


class SessaoDetail(TypedDict, total=False):
    """A plenary session with expanded data."""

    id: str
    title: str
    description: str
    date: str
    startTime: str
    endTime: str
    type: str
    type_id: int
    ata: list[FileItem]
    pauta: list[FileItem]
    presenca: dict
    votacao: dict


class SessoesResponse(TypedDict):
    """Response from /@@sessoes endpoint."""

    description: str
    items: list[SessaoItem]
