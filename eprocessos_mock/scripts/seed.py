#!/usr/bin/env python3
"""Seed the eprocessos_mock cache by hitting every list/detail endpoint.

Run with the mock service in RECORD mode (EPROCESSOS_RECORD=1 +
EPROCESSOS_UPSTREAM=...) so each request is forwarded upstream and
the response is persisted under /data.

Usage:
    uv run --with httpx python scripts/seed.py
    # or, against a different host/port:
    MOCK_URL=http://localhost:8000 uv run --with httpx python scripts/seed.py
    # multiple years (refreshes year-scoped fixtures across the full range):
    SEED_YEARS=2024,2025,2026 uv run --with httpx python scripts/seed.py
"""

from __future__ import annotations

import os
import sys

import httpx


MOCK_URL = os.environ.get("MOCK_URL", "http://localhost:8000").rstrip("/")
SEED_YEARS = [
    int(y)
    for y in os.environ.get("SEED_YEARS", os.environ.get("SEED_YEAR", "2026")).split(
        ","
    )
]

# Match enums in backend/src/sc/eprocessos/client/enums.py
TIPOS_NORMA = [
    1,
    2,
    3,
    4,
    5,
]  # LEI, LEI_COMPLEMENTAR, RESOLUCAO, DECRETO_LEGISLATIVO, DECRETO
TIPOS_SESSAO = [1, 2, 3, 4, 5, 6, 7, 9]  # ORDINARIA … CONVOCACAO_EXTRAORDINARIA
TIPOS_MATERIA = [6]  # PROJETO_LEI


def fetch(client: httpx.Client, path: str, **params: int | str) -> dict | list | None:
    """GET path on the mock and return parsed JSON, or None on failure."""
    try:
        response = client.get(path, params=params or None)
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        print(
            f"  ✗ {path} {params or ''} → {exc.response.status_code}",
            file=sys.stderr,
        )
        return None
    except httpx.HTTPError as exc:
        print(f"  ✗ {path} {params or ''} → {exc}", file=sys.stderr)
        return None
    print(f"  ✓ {path} {params or ''}")
    return response.json()


def fetch_raw(client: httpx.Client, path: str) -> bool:
    """GET path on the mock without parsing the body. Used for binary assets."""
    try:
        response = client.get(path)
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        print(f"  ✗ {path} → {exc.response.status_code}", file=sys.stderr)
        return False
    except httpx.HTTPError as exc:
        print(f"  ✗ {path} → {exc}", file=sys.stderr)
        return False
    print(f"  ✓ {path}")
    return True


def seed_items(client: httpx.Client, endpoint: str, items: list[dict]) -> None:
    """For each item in a list response, fetch its detail endpoint."""
    for item in items:
        item_id = item.get("id")
        if not item_id:
            continue
        fetch(client, f"/@@{endpoint}/{item_id}")


def seed_simple_list(client: httpx.Client, endpoint: str) -> None:
    """Seed an endpoint that has no list parameters."""
    print(f"\n[{endpoint}]")
    data = fetch(client, f"/@@{endpoint}")
    if data and isinstance(data, dict):
        seed_items(client, endpoint, data.get("items", []))


def seed_with_tipo(
    client: httpx.Client,
    endpoint: str,
    tipos: list[int],
    ano: int,
) -> None:
    """Seed an endpoint that requires `ano` and iterates over `tipo` values."""
    print(f"\n[{endpoint}] ano={ano}")
    for tipo in tipos:
        data = fetch(client, f"/@@{endpoint}", ano=ano, tipo=tipo)
        if data and isinstance(data, dict):
            seed_items(client, endpoint, data.get("items", []))


def seed_sessoes(client: httpx.Client, ano: int) -> None:
    """Sessoes uses path-traversal for listing: /@@sessoes/tipo/{tipo}/ano/{ano}.

    For each session also seeds the two expanders:
      * /@@sessoes/id/{id}/presenca  → presenca_sessao/{id}.json
      * /@@sessoes/id/{id}/votacao   → votacao_sessao/{id}.json
    """
    print(f"\n[sessoes] ano={ano}")
    for tipo in TIPOS_SESSAO:
        data = fetch(client, f"/@@sessoes/tipo/{tipo}/ano/{ano}")
        if not data or not isinstance(data, dict):
            continue
        for item in data.get("items", []):
            item_id = item.get("id")
            if not item_id:
                continue
            fetch(client, f"/@@sessoes/id/{item_id}")
            fetch(client, f"/@@sessoes/id/{item_id}/presenca")
            fetch(client, f"/@@sessoes/id/{item_id}/votacao")


def seed_vereadores(client: httpx.Client) -> None:
    """Seed vereadores list + each detail, then download every photo.

    Photo URLs come from the detail response (`image[0].download` or
    `url_foto`); they're served by the mock's /sapl_documentos proxy.
    """
    endpoint = "vereadores"
    print(f"\n[{endpoint}]")
    data = fetch(client, f"/@@{endpoint}")
    if not (data and isinstance(data, dict)):
        return
    for item in data.get("items", []):
        item_id = item.get("id")
        if not item_id:
            continue
        detail = fetch(client, f"/@@{endpoint}/{item_id}")
        if not isinstance(detail, dict):
            continue
        photo_url = ""
        images = detail.get("image") or []
        if isinstance(images, list) and images:
            photo_url = images[0].get("download") or ""
        if not photo_url:
            photo_url = detail.get("url_foto") or ""
        if photo_url:
            fetch_raw(client, photo_url)


def main() -> int:
    print(f"Seeding mock at {MOCK_URL} (years={SEED_YEARS})")
    with httpx.Client(base_url=MOCK_URL, timeout=60.0) as client:
        # Sanity check
        try:
            health = client.get("/")
            health.raise_for_status()
            print(f"Mock health: {health.json()}")
        except httpx.HTTPError as exc:
            print(f"Failed to reach mock at {MOCK_URL}: {exc}", file=sys.stderr)
            return 1

        # Vereadores list + details + photo binaries
        seed_vereadores(client)

        # Endpoints with no list parameters
        for endpoint in ("legislaturas", "mesas", "comissoes"):
            seed_simple_list(client, endpoint)

        # Endpoints requiring ano + tipo, swept across every requested year
        for ano in SEED_YEARS:
            seed_with_tipo(client, "normas", TIPOS_NORMA, ano)
            seed_with_tipo(client, "materias", TIPOS_MATERIA, ano)
            seed_sessoes(client, ano)

    print("\nDone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
