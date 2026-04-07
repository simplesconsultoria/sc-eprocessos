"""Application settings from environment variables."""

from __future__ import annotations

import os


# When set, the mock acts as a recording proxy: forwards requests to
# EPROCESSOS_UPSTREAM and stores responses under DATA_DIR.
RECORD_MODE: bool = os.environ.get("EPROCESSOS_RECORD", "").lower() in ("1", "true")
UPSTREAM_URL: str = os.environ.get("EPROCESSOS_UPSTREAM", "").rstrip("/")
DATA_DIR: str = os.environ.get("EPROCESSOS_DATA_DIR", "/data")
