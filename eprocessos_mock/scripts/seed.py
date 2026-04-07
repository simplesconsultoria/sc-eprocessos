#!/usr/bin/env python3
"""Seed the eprocessos_mock cache by hitting every list/detail endpoint.

Run with the mock service in RECORD mode (EPROCESSOS_RECORD=1 +
EPROCESSOS_UPSTREAM=...) so each request is forwarded upstream and
the response is persisted under /data.

Usage:
    uv run --with httpx python scripts/seed.py
    # or, against a different host/port:
    MOCK_URL=http://localhost:8000 uv run --with httpx python scripts/seed.py
"""

from __future__ import annotations

import os
import sys

import httpx


MOCK_URL = os.environ.get("MOCK_URL", "http://localhost:8000").rstrip("/")
SEED_YEAR = int(os.environ.get("SEED_YEAR", "2026"))

# Match enums in backend/src/sc/eprocessos/client/enums.py
TIPOS_NORMA = [1, 2, 3, 4, 5]  # LEI, LEI_COMPLEMENTAR, RESOLUCAO, DECRETO_LEGISLATIVO, DECRETO
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

    Detail endpoint is /@@sessoes/id/{item_id}.
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


def main() -> int:
    print(f"Seeding mock at {MOCK_URL} (year={SEED_YEAR})")
    with httpx.Client(base_url=MOCK_URL, timeout=60.0) as client:
        # Sanity check
        try:
            health = client.get("/")
            health.raise_for_status()
            print(f"Mock health: {health.json()}")
        except httpx.HTTPError as exc:
            print(f"Failed to reach mock at {MOCK_URL}: {exc}", file=sys.stderr)
            return 1

        # Endpoints with no list parameters
        for endpoint in ("vereadores", "legislaturas", "mesas", "comissoes"):
            seed_simple_list(client, endpoint)

        # Endpoints requiring ano + tipo
        seed_with_tipo(client, "normas", TIPOS_NORMA, SEED_YEAR)
        seed_with_tipo(client, "materias", TIPOS_MATERIA, SEED_YEAR)

        # Sessoes (path traversal)
        seed_sessoes(client, SEED_YEAR)

    print("\nDone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
