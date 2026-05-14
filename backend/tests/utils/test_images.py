"""Tests for sc.eprocessos.utils.images."""

from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from Products.CMFPlone.Portal import PloneSite
from sc.eprocessos.utils.images import _local_proxy_url
from sc.eprocessos.utils.images import image_from_url_foto
from sc.eprocessos.utils.images import process_image
from sc.eprocessos.utils.images import process_image_field
from typing import Any

import pytest


REGISTRY_SETTINGS: dict[str, str | int | float] = {
    "eprocessos.base_url": "https://e-processos.example.com",
}

EPROCESSOS_ROOT_SLASH = "https://e-processos.example.com/"
EPROCESSOS_ROOT_NO_SLASH = "https://e-processos.example.com"

SAMPLE_IMAGE = {
    "content-type": "image/png",
    "download": (
        "https://e-processos.example.com/sapl_documentos/parlamentar/fotos/546914_foto"
    ),
    "filename": "546914_foto",
    "height": "350",
    "size": "221654",
    "width": "350",
}

SAMPLE_IMAGE_RELATIVE = {
    "content-type": "image/png",
    "download": "/sapl_documentos/parlamentar/fotos/546914_foto",
    "filename": "546914_foto",
    "height": "350",
    "size": "221654",
    "width": "350",
}

SAMPLE_IMAGE_DOWNLOAD_VIEW = {
    "content-type": "image/png",
    "download": "/@@sapl_documentos_download?path=parlamentar/fotos/546914_foto",
    "filename": "546914_foto",
    "height": "350",
    "size": "221654",
    "width": "350",
}


@pytest.fixture()
def portal(integration: dict[str, Any]) -> PloneSite:
    portal = integration["portal"]
    setRoles(portal, TEST_USER_ID, ["Manager"])
    return portal


@pytest.fixture(autouse=True)
def _setup_registry(portal: PloneSite) -> None:
    for key, value in REGISTRY_SETTINGS.items():
        api.portal.set_registry_record(key, value)


# ---------------------------------------------------------------------------
# ``_local_proxy_url`` — pure helper, no Plone dependency.
# ---------------------------------------------------------------------------


class TestLocalProxyUrl:
    """``_local_proxy_url`` covers every supported URL shape.

    Cases are grouped by ``id`` prefix:
    * ``sapl_view_*`` — query-string ``@@sapl_documentos_download?path=...``
    * ``absolute_*`` — absolute URLs sharing the configured root prefix
    * ``relative_*`` — paths starting with ``/`` that aren't sapl views
    * ``passthrough_*`` — anything that doesn't match a rewrite rule
    """

    @pytest.mark.parametrize(
        "url,root,expected",
        [
            pytest.param(
                "/@@sapl_documentos_download?path=parlamentar/fotos/546914",
                EPROCESSOS_ROOT_SLASH,
                "@@images/sapl_documentos_download/parlamentar/fotos/546914",
                id="sapl_view_relative",
            ),
            pytest.param(
                "https://e-processos.example.com/@@sapl_documentos_download"
                "?path=parlamentar/fotos/546914",
                EPROCESSOS_ROOT_SLASH,
                "@@images/sapl_documentos_download/parlamentar/fotos/546914",
                id="sapl_view_absolute",
            ),
            pytest.param(
                "/@@sapl_documentos_download?path=/parlamentar/fotos/546914",
                EPROCESSOS_ROOT_SLASH,
                "@@images/sapl_documentos_download/parlamentar/fotos/546914",
                id="sapl_view_leading_slash_in_path_param_is_stripped",
            ),
            pytest.param(
                "/sapl_documentos_download?path=parlamentar/fotos/546914",
                EPROCESSOS_ROOT_SLASH,
                "@@images/sapl_documentos_download/parlamentar/fotos/546914",
                id="sapl_view_without_at_prefix",
            ),
            pytest.param(
                "/@@sapl_documentos_download?path=",
                EPROCESSOS_ROOT_SLASH,
                "@@images/sapl_documentos_download/",
                id="sapl_view_empty_path_param",
            ),
            pytest.param(
                "/@@sapl_documentos_download",
                EPROCESSOS_ROOT_SLASH,
                "@@images/sapl_documentos_download/",
                id="sapl_view_missing_path_param",
            ),
            pytest.param(
                "https://e-processos.example.com/sapl_documentos/parlamentar/fotos/546914",
                EPROCESSOS_ROOT_SLASH,
                "@@images/sapl_documentos/parlamentar/fotos/546914",
                id="absolute_root_with_trailing_slash",
            ),
            # Documented quirk: the literal ``.replace()`` doesn't normalize
            # the join, so a root without a trailing slash leaves a ``//`` in
            # the rewritten URL. Production has a trailing slash.
            pytest.param(
                "https://e-processos.example.com/sapl_documentos/parlamentar/fotos/546914",
                EPROCESSOS_ROOT_NO_SLASH,
                "@@images//sapl_documentos/parlamentar/fotos/546914",
                id="absolute_root_without_trailing_slash_double_slash",
            ),
            pytest.param(
                "/sapl_documentos/parlamentar/fotos/546914",
                EPROCESSOS_ROOT_SLASH,
                "@@images/sapl_documentos/parlamentar/fotos/546914",
                id="relative_legacy_sapl_documentos_path",
            ),
            pytest.param(
                "/some/other/path",
                EPROCESSOS_ROOT_SLASH,
                "@@images/some/other/path",
                id="relative_arbitrary_path",
            ),
            pytest.param(
                "https://other-host.com/some/image.png",
                EPROCESSOS_ROOT_SLASH,
                "https://other-host.com/some/image.png",
                id="passthrough_external_host",
            ),
            pytest.param(
                "",
                EPROCESSOS_ROOT_SLASH,
                "",
                id="passthrough_empty_string",
            ),
        ],
    )
    def test_rewrite(self, url: str, root: str, expected: str):
        assert _local_proxy_url(url, root) == expected


# ---------------------------------------------------------------------------
# ``process_image_field`` — reads ``eprocessos.base_url`` + ``plone.allowed_sizes``.
# ``REGISTRY_SETTINGS["eprocessos.base_url"]`` has no trailing slash, so absolute
# URLs come back with the documented ``//`` quirk.
# ---------------------------------------------------------------------------


class TestProcessImageField:
    """``process_image_field`` returns ``(name, {name: [image_with_scales]})``."""

    def test_empty_returns_empty(self):
        assert process_image_field("image", []) == ("", {})

    @pytest.mark.parametrize(
        "image,expected_download",
        [
            pytest.param(
                SAMPLE_IMAGE,
                "@@images//sapl_documentos/parlamentar/fotos/546914_foto",
                id="absolute_url",
            ),
            pytest.param(
                SAMPLE_IMAGE_RELATIVE,
                "@@images/sapl_documentos/parlamentar/fotos/546914_foto",
                id="relative_url",
            ),
            pytest.param(
                SAMPLE_IMAGE_DOWNLOAD_VIEW,
                "@@images/sapl_documentos_download/parlamentar/fotos/546914_foto",
                id="sapl_documentos_download_view",
            ),
        ],
    )
    def test_rewrites_download(self, image: dict[str, Any], expected_download: str):
        _, scales = process_image_field("image", [image.copy()])
        assert scales["image"][0]["download"] == expected_download

    @pytest.mark.parametrize(
        "field_name",
        ["image", "foto", "imagem_principal"],
        ids=["default", "alternate", "underscored"],
    )
    def test_returns_field_name(self, field_name: str):
        name, scales = process_image_field(field_name, [SAMPLE_IMAGE.copy()])
        assert name == field_name
        assert field_name in scales
        assert len(scales[field_name]) == 1

    def test_includes_plone_scales(self):
        _, scales = process_image_field("image", [SAMPLE_IMAGE.copy()])
        main_image = scales["image"][0]
        assert "scales" in main_image
        assert len(main_image["scales"]) > 0
        for scale_name, scale_data in main_image["scales"].items():
            assert "download" in scale_data, f"{scale_name} missing download"
            assert isinstance(scale_data["width"], int)
            assert isinstance(scale_data["height"], int)

    def test_unknown_download_url_unchanged(self):
        """URLs that don't match any rewrite rule pass through unchanged."""
        image = SAMPLE_IMAGE.copy()
        image["download"] = "https://other-host.com/some/image.png"
        _, scales = process_image_field("image", [image])
        assert scales["image"][0]["download"] == (
            "https://other-host.com/some/image.png"
        )

    def test_does_not_mutate_input(self):
        original = [SAMPLE_IMAGE.copy()]
        original_download = original[0]["download"]
        process_image_field("image", original)
        assert original[0]["download"] == original_download


# ---------------------------------------------------------------------------
# ``process_image`` — list-in, list-out, rewrites ``download`` per item.
# No path prefix (signature was simplified — see git history).
# ---------------------------------------------------------------------------


class TestProcessImage:
    """``process_image`` rewrites each item's download URL in place."""

    def test_empty_returns_empty(self):
        assert process_image([]) == []

    @pytest.mark.parametrize(
        "image,expected_download",
        [
            pytest.param(
                SAMPLE_IMAGE,
                "@@images//sapl_documentos/parlamentar/fotos/546914_foto",
                id="absolute_url",
            ),
            pytest.param(
                SAMPLE_IMAGE_RELATIVE,
                "@@images/sapl_documentos/parlamentar/fotos/546914_foto",
                id="relative_url",
            ),
            pytest.param(
                SAMPLE_IMAGE_DOWNLOAD_VIEW,
                "@@images/sapl_documentos_download/parlamentar/fotos/546914_foto",
                id="sapl_documentos_download_view",
            ),
        ],
    )
    def test_rewrites_download(self, image: dict[str, Any], expected_download: str):
        result = process_image([image.copy()])
        assert result[0]["download"] == expected_download

    def test_processes_multiple_items(self):
        result = process_image([SAMPLE_IMAGE.copy(), SAMPLE_IMAGE_DOWNLOAD_VIEW.copy()])
        assert len(result) == 2
        assert all(item["download"].startswith("@@images/") for item in result)

    def test_preserves_other_fields(self):
        result = process_image([SAMPLE_IMAGE.copy()])
        item = result[0]
        assert item["content-type"] == "image/png"
        assert item["filename"] == "546914_foto"
        assert item["height"] == "350"
        assert item["width"] == "350"
        assert item["size"] == "221654"

    def test_missing_download_field(self):
        """A missing ``download`` key resolves to an empty string."""
        image = {k: v for k, v in SAMPLE_IMAGE.items() if k != "download"}
        result = process_image([image])
        assert result[0]["download"] == ""

    def test_does_not_mutate_input(self):
        original = [SAMPLE_IMAGE.copy()]
        original_download = original[0]["download"]
        process_image(original)
        assert original[0]["download"] == original_download


# ---------------------------------------------------------------------------
# ``image_from_url_foto`` — convenience wrapper that builds a single-image
# list out of a raw ``url_foto`` string (e.g. a councilor portrait).
# ---------------------------------------------------------------------------


class TestImageFromUrlFoto:
    """``image_from_url_foto`` wraps a single URL into the image-list shape."""

    @pytest.mark.parametrize(
        "url_foto,expected_filename,expected_download",
        [
            pytest.param(
                "/@@sapl_documentos_download?path=parlamentar/fotos/546914_foto",
                "546914_foto",
                "@@images/sapl_documentos_download/parlamentar/fotos/546914_foto",
                id="sapl_view_relative",
            ),
            pytest.param(
                "/sapl_documentos/parlamentar/fotos/546914_foto",
                "546914_foto",
                "@@images/sapl_documentos/parlamentar/fotos/546914_foto",
                id="legacy_relative_path",
            ),
            pytest.param(
                "https://other-host.com/some/portrait.jpg",
                "portrait.jpg",
                "https://other-host.com/some/portrait.jpg",
                id="external_passthrough",
            ),
        ],
    )
    def test_rewrites_url_foto(
        self, url_foto: str, expected_filename: str, expected_download: str
    ):
        result = image_from_url_foto(url_foto)
        assert len(result) == 1
        assert result[0]["filename"] == expected_filename
        assert result[0]["download"] == expected_download

    def test_default_image_metadata(self):
        """Numeric defaults are zero; content-type is ``image/jpeg``."""
        result = image_from_url_foto("/sapl_documentos/parlamentar/fotos/546914_foto")
        item = result[0]
        assert item["content-type"] == "image/jpeg"
        assert item["height"] == 0
        assert item["width"] == 0
        assert item["size"] == 0
