"""Image scaling facade for e-Processos photos."""

from plone import api
from Products.Five import BrowserView
from zExceptions import HTTPBadGateway
from zExceptions import HTTPNotFound
from zope.interface import implementer
from zope.publisher.interfaces.browser import IBrowserPublisher
from zope.traversing.interfaces import ITraversable

import httpx


class ImageScale(BrowserView):
    """Proxy view that streams an image from e-Processos."""

    __roles__ = ("Anonymous",)

    def __init__(self, context, request, url: str):
        self.context = context
        self.request = request
        self.url = url

    def _fetch(self) -> httpx.Response:
        """Fetch the image from e-Processos."""
        timeout = float(api.portal.get_registry_record("eprocessos.default_timeout"))
        response = httpx.get(self.url, timeout=timeout)
        response.raise_for_status()
        return response

    def set_headers(self, response: httpx.Response) -> None:
        zope_response = self.request.response
        zope_response.setHeader(
            "Content-Type",
            response.headers.get("Content-Type", "application/octet-stream"),
        )
        content_length = response.headers.get("Content-Length")
        if content_length:
            zope_response.setHeader("Content-Length", content_length)
        zope_response.setHeader("Accept-Ranges", "bytes")

    def index_html(self):
        """Download the image."""
        try:
            response = self._fetch()
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 404:
                raise HTTPNotFound(self.url) from exc
            raise HTTPBadGateway(
                f"e-Processos returned {exc.response.status_code}"
            ) from exc
        except httpx.HTTPError as exc:
            raise HTTPBadGateway(
                f"Failed to fetch image from e-Processos: {exc}"
            ) from exc
        self.set_headers(response)
        return response.content

    def __call__(self):
        # Avoid the need to prefix with nocall: in TAL
        return self

    def HEAD(self, REQUEST, RESPONSE=None):
        """Return image metadata without the body."""
        try:
            response = self._fetch()
        except httpx.HTTPError:
            return ""
        self.set_headers(response)
        return ""

    HEAD.__roles__ = ("Anonymous",)


@implementer(ITraversable, IBrowserPublisher)
class ImageScaling(BrowserView):
    """Traversable view that resolves image paths to e-Processos URLs."""

    _scale_view_class = ImageScale

    def eprocessos_root(self) -> str:
        """Return the base URL for e-Processos (without trailing slash)."""
        base_url: str = api.portal.get_registry_record("eprocessos.base_url")
        return base_url.rstrip("/")

    def publishTraverse(self, request, name):
        """Build an ImageScale from the remaining traversal path.

        Two URL shapes are emitted, matching upstream's evolution:

        * ``sapl_documentos_download/<path>`` (current upstream) →
          ``{root}/@@sapl_documentos_download?path=<path>``
        * any other ``<segment>/<path>`` (legacy) → ``{root}/<segment>/<path>``
        """
        stack = request.get("TraversalRequestNameStack", [])
        stack_path = "/".join(reversed(stack)) if stack else ""
        # Consume the stack so Zope stops traversing
        del stack[:]
        root = self.eprocessos_root()
        if name == "sapl_documentos_download":
            url = f"{root}/@@sapl_documentos_download?path={stack_path}"
        else:
            url = f"{root}/{name}/{stack_path}"
        return self._scale_view_class(self.context, self.request, url=url)
