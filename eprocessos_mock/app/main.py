"""e-Processos mock/recorder FastAPI application."""

from __future__ import annotations

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi import Query
from fastapi.responses import JSONResponse
from fastapi.responses import Response

from app import recorder
from app import storage
from app.settings import DATA_DIR
from app.settings import RECORD_MODE
from app.settings import UPSTREAM_URL

import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# -- Helpers ------------------------------------------------------------------


async def _serve_list(
    endpoint: str,
    path: str,
    **params: str,
) -> JSONResponse:
    """Serve a list endpoint (record or replay)."""
    if RECORD_MODE:
        data = await recorder.proxy_json(path, endpoint, **params)
        return JSONResponse(data)
    data = storage.load(endpoint, **params)
    if data is None:
        return JSONResponse(
            {"error": f"No recorded data for {endpoint}", "params": params},
            status_code=404,
        )
    return JSONResponse(data)


async def _serve_detail(
    endpoint: str,
    path: str,
    item_id: str,
) -> JSONResponse:
    """Serve a detail endpoint (record or replay)."""
    if RECORD_MODE:
        data = await recorder.proxy_json(path, endpoint, item_id=item_id)
        return JSONResponse(data)
    data = storage.load(endpoint, item_id=item_id)
    if data is None:
        return JSONResponse(
            {"error": f"No recorded data for {endpoint}/{item_id}"},
            status_code=404,
        )
    return JSONResponse(data)


# -- App lifecycle ------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    mode = "RECORD" if RECORD_MODE else "REPLAY"
    logger.info("Starting e-Processos mock in %s mode", mode)
    if RECORD_MODE:
        if not UPSTREAM_URL:
            raise RuntimeError(
                "EPROCESSOS_RECORD=1 requires EPROCESSOS_UPSTREAM to be set"
            )
        logger.info("Upstream: %s", UPSTREAM_URL)
    logger.info("Data directory: %s", DATA_DIR)
    yield
    if RECORD_MODE:
        await recorder.close_client()


app = FastAPI(
    title="e-Processos Mock",
    description="Record/replay proxy for the e-Processos REST API",
    lifespan=lifespan,
)


# -- Health -------------------------------------------------------------------


@app.get("/")
async def health():
    return {
        "status": "ok",
        "mode": "record" if RECORD_MODE else "replay",
    }


# -- Vereadores ---------------------------------------------------------------


@app.get("/@@vereadores")
async def vereadores_list():
    return await _serve_list("vereadores", "/@@vereadores")


@app.get("/@@vereadores/{item_id}")
async def vereadores_detail(item_id: str):
    return await _serve_detail("vereadores", f"/@@vereadores/{item_id}", item_id)


# -- Normas -------------------------------------------------------------------


@app.get("/@@normas")
async def normas_list(
    ano: int = Query(...),
    tipo: int | None = Query(None),
):
    params: dict[str, str] = {"ano": str(ano)}
    if tipo is not None:
        params["tipo"] = str(tipo)
    return await _serve_list("normas", "/@@normas", **params)


@app.get("/@@normas/{item_id}")
async def normas_detail(item_id: str):
    return await _serve_detail("normas", f"/@@normas/{item_id}", item_id)


# -- Legislaturas -------------------------------------------------------------


@app.get("/@@legislaturas")
async def legislaturas_list():
    return await _serve_list("legislaturas", "/@@legislaturas")


@app.get("/@@legislaturas/{item_id}")
async def legislaturas_detail(item_id: str):
    return await _serve_detail("legislaturas", f"/@@legislaturas/{item_id}", item_id)


# -- Mesas --------------------------------------------------------------------


@app.get("/@@mesas")
async def mesas_list():
    return await _serve_list("mesas", "/@@mesas")


@app.get("/@@mesas/{item_id}")
async def mesas_detail(item_id: str):
    return await _serve_detail("mesas", f"/@@mesas/{item_id}", item_id)


# -- Comissões ----------------------------------------------------------------


@app.get("/@@comissoes")
async def comissoes_list():
    return await _serve_list("comissoes", "/@@comissoes")


@app.get("/@@comissoes/{item_id}")
async def comissoes_detail(item_id: str):
    return await _serve_detail("comissoes", f"/@@comissoes/{item_id}", item_id)


# -- Matérias -----------------------------------------------------------------


@app.get("/@@materias")
async def materias_list(
    ano: int = Query(...),
    tipo: int | None = Query(None),
):
    params: dict[str, str] = {"ano": str(ano)}
    if tipo is not None:
        params["tipo"] = str(tipo)
    return await _serve_list("materias", "/@@materias", **params)


@app.get("/@@materias/{item_id}")
async def materias_detail(item_id: str):
    return await _serve_detail("materias", f"/@@materias/{item_id}", item_id)


# -- Sessões ------------------------------------------------------------------


@app.get("/@@sessoes/tipo/{tipo}/ano/{ano}")
async def sessoes_list(tipo: int, ano: int):
    params = {"tipo": str(tipo), "ano": str(ano)}
    return await _serve_list("sessoes", f"/@@sessoes/tipo/{tipo}/ano/{ano}", **params)


@app.get("/@@sessoes/id/{item_id}")
async def sessoes_detail(item_id: str):
    return await _serve_detail("sessoes", f"/@@sessoes/id/{item_id}", item_id)


# -- Sessão expanders ---------------------------------------------------------
# The real API exposes expander data at two equivalent URL shapes:
#   /@@sessoes/id/{id}/presenca  AND  /@@presenca_sessao/sessao_plenaria/{id}
# Both are wired to the same storage key so recorded data is shared.


@app.get("/@@sessoes/id/{item_id}/presenca")
async def sessoes_presenca(item_id: str):
    return await _serve_detail(
        "presenca_sessao",
        f"/@@sessoes/id/{item_id}/presenca",
        item_id,
    )


@app.get("/@@sessoes/id/{item_id}/votacao")
async def sessoes_votacao(item_id: str):
    return await _serve_detail(
        "votacao_sessao",
        f"/@@sessoes/id/{item_id}/votacao",
        item_id,
    )


@app.get("/@@presenca_sessao/sessao_plenaria/{item_id}")
async def presenca_sessao(item_id: str):
    return await _serve_detail(
        "presenca_sessao",
        f"/@@presenca_sessao/sessao_plenaria/{item_id}",
        item_id,
    )


@app.get("/@@votacao_sessao/sessao_plenaria/{item_id}")
async def votacao_sessao(item_id: str):
    return await _serve_detail(
        "votacao_sessao",
        f"/@@votacao_sessao/sessao_plenaria/{item_id}",
        item_id,
    )


# -- Document/image proxy (sapl_documentos) -----------------------------------
# Upstream switched from path-style /sapl_documentos/<path> to a query-string
# endpoint /@@sapl_documentos_download?path=<path>. Both are wired here to
# share the same storage key so old recordings remain reachable.


async def _serve_sapl_documentos(path: str) -> Response:
    endpoint = "sapl_documentos"
    safe_id = path.replace("/", "__")

    if RECORD_MODE:
        data, content_type = await recorder.proxy_binary(
            "/@@sapl_documentos_download",
            endpoint,
            item_id=safe_id,
            path=path,
        )
        return Response(content=data, media_type=content_type)

    result = storage.load(endpoint, item_id=safe_id, binary=True)
    if result is None:
        return JSONResponse(
            {"error": f"No recorded data for /@@sapl_documentos_download?path={path}"},
            status_code=404,
        )
    return Response(content=result["data"], media_type=result["content_type"])


@app.get("/@@sapl_documentos_download")
async def sapl_documentos_download(path: str = Query(...)):
    """New upstream shape: ?path=parlamentar/fotos/<id>_foto_parlamentar."""
    return await _serve_sapl_documentos(path)


@app.get("/sapl_documentos/{path:path}")
async def sapl_documentos_legacy(path: str):
    """Legacy upstream shape, kept so older recordings remain replayable."""
    return await _serve_sapl_documentos(path)
