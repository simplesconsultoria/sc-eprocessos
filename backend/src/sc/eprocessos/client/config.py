"""Client configuration."""

from __future__ import annotations

from dataclasses import dataclass
from dataclasses import field


DEFAULT_TIMEOUT = 30.0
DEFAULT_MAX_RETRIES = 3
DEFAULT_RETRY_DELAY = 1.0


@dataclass(frozen=True)
class ClientConfig:
    """Configuration for the e-Processos API client."""

    base_url: str
    timeout: float = DEFAULT_TIMEOUT
    max_retries: int = DEFAULT_MAX_RETRIES
    retry_delay: float = DEFAULT_RETRY_DELAY
    headers: dict[str, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        url = self.base_url
        if not url or not url.startswith(("http://", "https://")):
            from sc.eprocessos.client.exceptions import EProcessosConfigError

            raise EProcessosConfigError(
                f"base_url must be a valid HTTP(S) URL, got: {url!r}"
            )
        # Strip trailing slash for consistent URL building
        if url.endswith("/"):
            object.__setattr__(self, "base_url", url.rstrip("/"))
