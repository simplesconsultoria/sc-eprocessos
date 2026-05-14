"""Tests for BaseItemSerializer's transformer pipeline.

Focused unit tests for ``_transform_collections`` — the path that hands
collection-item image fields off to ``sc.eprocessos.utils.process_image``.
``rewrite_id`` is exercised transitively via the portal registry.
"""

from sc.eprocessos.serializers.items.base import BaseItemSerializer
from typing import Any

import pytest


class _StubFacade:
    """Just enough of an ``EProcessosFacade`` to satisfy attribute access."""

    def absolute_url(self) -> str:
        return "http://nohost/plone/vereadores"

    def Title(self) -> str:
        return "Vereadores"


class _StubContext:
    """Minimal context — only the attributes ``_transform_*`` and
    ``_process_data`` read."""

    portal_type = "Vereador"
    facade = _StubFacade()


def _make_serializer(request: Any, collections: tuple[str, ...]) -> BaseItemSerializer:
    serializer = BaseItemSerializer(_StubContext(), request)
    serializer.collections = collections
    return serializer


SAMPLE_IMAGE_DOWNLOAD_VIEW = {
    "content-type": "image/png",
    "download": "/@@sapl_documentos_download?path=parlamentar/fotos/546914_foto",
    "filename": "546914_foto",
    "height": "350",
    "size": "221654",
    "width": "350",
}


class TestTransformCollectionsEmpty:
    """``_transform_collections`` handles empty / missing collections."""

    def test_empty_collections_tuple(self, http_request):
        serializer = _make_serializer(http_request, collections=())
        result: dict = {}
        serializer._transform_collections({"foo": [{"@id": "/x"}]}, result)
        # No declared collections → ``result`` is untouched.
        assert result == {}

    def test_missing_attr_in_data(self, http_request):
        serializer = _make_serializer(http_request, collections=("mandatos",))
        result: dict = {}
        serializer._transform_collections({}, result)
        assert result == {"mandatos": []}

    def test_empty_collection_in_data(self, http_request):
        serializer = _make_serializer(http_request, collections=("mandatos",))
        result: dict = {}
        serializer._transform_collections({"mandatos": []}, result)
        assert result == {"mandatos": []}


class TestTransformCollectionsWithoutImages:
    """Items with no ``image`` field pass through with only ``@id`` rewriting."""

    def test_item_without_image_field(self, http_request):
        serializer = _make_serializer(http_request, collections=("mandatos",))
        result: dict = {}
        data = {"mandatos": [{"@id": "http://other/foo", "title": "X"}]}
        serializer._transform_collections(data, result)
        assert "image" not in result["mandatos"][0]
        assert result["mandatos"][0]["title"] == "X"

    def test_item_with_empty_image_list(self, http_request):
        serializer = _make_serializer(http_request, collections=("mandatos",))
        result: dict = {}
        data = {"mandatos": [{"@id": "http://other/foo", "image": []}]}
        serializer._transform_collections(data, result)
        # Empty image list: ``process_image`` is not called; field unchanged.
        assert result["mandatos"][0]["image"] == []


class TestTransformCollectionsWithImages:
    """Items carrying an ``image`` field go through ``process_image``."""

    EXPECTED_DOWNLOAD = (
        "@@images/sapl_documentos_download/parlamentar/fotos/546914_foto"
    )

    def test_image_download_is_rewritten(self, http_request):
        serializer = _make_serializer(http_request, collections=("mandatos",))
        result: dict = {}
        data = {
            "mandatos": [
                {
                    "@id": "http://nohost/plone/vereadores/546914",
                    "image": [SAMPLE_IMAGE_DOWNLOAD_VIEW.copy()],
                }
            ]
        }
        serializer._transform_collections(data, result)
        assert result["mandatos"][0]["image"][0]["download"] == self.EXPECTED_DOWNLOAD

    def test_preserves_non_download_fields(self, http_request):
        serializer = _make_serializer(http_request, collections=("mandatos",))
        result: dict = {}
        data = {
            "mandatos": [
                {
                    "@id": "http://nohost/plone/x",
                    "image": [SAMPLE_IMAGE_DOWNLOAD_VIEW.copy()],
                }
            ]
        }
        serializer._transform_collections(data, result)
        img = result["mandatos"][0]["image"][0]
        assert img["content-type"] == "image/png"
        assert img["filename"] == "546914_foto"
        assert img["width"] == "350"

    def test_multiple_items_each_processed(self, http_request):
        serializer = _make_serializer(http_request, collections=("mandatos",))
        result: dict = {}
        data = {
            "mandatos": [
                {
                    "@id": "http://nohost/plone/v/1",
                    "image": [SAMPLE_IMAGE_DOWNLOAD_VIEW.copy()],
                },
                {
                    "@id": "http://nohost/plone/v/2",
                    "image": [SAMPLE_IMAGE_DOWNLOAD_VIEW.copy()],
                },
            ]
        }
        serializer._transform_collections(data, result)
        rows = result["mandatos"]
        assert len(rows) == 2
        assert all(
            row["image"][0]["download"] == self.EXPECTED_DOWNLOAD for row in rows
        )

    def test_multiple_collections(self, http_request):
        serializer = _make_serializer(
            http_request, collections=("mandatos", "comissoes")
        )
        result: dict = {}
        data = {
            "mandatos": [
                {
                    "@id": "http://nohost/plone/m/1",
                    "image": [SAMPLE_IMAGE_DOWNLOAD_VIEW.copy()],
                }
            ],
            "comissoes": [
                {
                    "@id": "http://nohost/plone/c/1",
                    "image": [SAMPLE_IMAGE_DOWNLOAD_VIEW.copy()],
                }
            ],
        }
        serializer._transform_collections(data, result)
        assert result["mandatos"][0]["image"][0]["download"] == self.EXPECTED_DOWNLOAD
        assert result["comissoes"][0]["image"][0]["download"] == self.EXPECTED_DOWNLOAD


class TestTransformCollectionsWithUrlFoto:
    """Items with ``url_foto`` (no ``image``) build a one-image list via
    ``image_from_url_foto``."""

    def test_url_foto_produces_image_list(self, http_request):
        serializer = _make_serializer(http_request, collections=("mandatos",))
        result: dict = {}
        data = {
            "mandatos": [
                {
                    "@id": "http://nohost/plone/v/1",
                    "url_foto": (
                        "/@@sapl_documentos_download?path=parlamentar/fotos/546914_foto"
                    ),
                }
            ]
        }
        serializer._transform_collections(data, result)
        image = result["mandatos"][0]["image"]
        assert len(image) == 1
        assert image[0]["filename"] == "546914_foto"
        assert image[0]["download"] == (
            "@@images/sapl_documentos_download/parlamentar/fotos/546914_foto"
        )

    def test_image_takes_precedence_over_url_foto(self, http_request):
        """When both fields are present, ``image`` wins — ``elif`` skips
        ``url_foto``."""
        serializer = _make_serializer(http_request, collections=("mandatos",))
        result: dict = {}
        data = {
            "mandatos": [
                {
                    "@id": "http://nohost/plone/v/1",
                    "image": [SAMPLE_IMAGE_DOWNLOAD_VIEW.copy()],
                    "url_foto": "/sapl_documentos/other/file",
                }
            ]
        }
        serializer._transform_collections(data, result)
        image = result["mandatos"][0]["image"]
        # ``image`` came from ``process_image``, not from ``image_from_url_foto``,
        # so we keep the multi-field DataItemCol (with ``content-type`` etc.).
        assert image[0]["content-type"] == "image/png"


@pytest.fixture()
def http_request(integration: dict[str, Any]) -> Any:
    """Reuse the integration request — ``rewrite_id`` queries the
    registry via ``facade_urls()`` so a real portal context is required."""
    return integration["request"]
