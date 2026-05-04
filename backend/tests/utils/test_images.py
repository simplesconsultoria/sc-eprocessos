"""Tests for sc.eprocessos.utils.images."""

from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from Products.CMFPlone.Portal import PloneSite
from sc.eprocessos.utils.images import process_image_field
from typing import Any

import pytest


REGISTRY_SETTINGS: dict[str, str | int | float] = {
    "eprocessos.base_url": "https://e-processos.example.com",
}

SAMPLE_IMAGE = {
    "content-type": "image/png",
    "download": "https://e-processos.example.com/sapl_documentos/parlamentar/fotos/546914_foto",
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
    "download": ("/@@sapl_documentos_download?path=parlamentar/fotos/546914_foto"),
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


class TestProcessImageFieldEmpty:
    """Test process_image_field with empty input."""

    def test_empty_list(self):
        name, scales = process_image_field("image", [])
        assert name == ""
        assert scales == {}

    def test_none_like_empty(self):
        """An empty list should return empty results."""
        name, scales = process_image_field("image", [])
        assert name == ""
        assert scales == {}


class TestProcessImageFieldWithData:
    """Test process_image_field with actual image data."""

    def test_returns_field_name(self):
        name, _ = process_image_field("image", [SAMPLE_IMAGE.copy()])
        assert name == "image"

    def test_returns_scales_mapping(self):
        _, scales = process_image_field("image", [SAMPLE_IMAGE.copy()])
        assert "image" in scales
        assert isinstance(scales["image"], list)
        assert len(scales["image"]) == 1

    def test_rewrites_absolute_download_url(self):
        _, scales = process_image_field("image", [SAMPLE_IMAGE.copy()])
        main_image = scales["image"][0]
        assert not main_image["download"].startswith("https://")
        assert main_image["download"].startswith("@@images/")

    def test_rewrites_relative_download_url(self):
        _, scales = process_image_field("image", [SAMPLE_IMAGE_RELATIVE.copy()])
        main_image = scales["image"][0]
        assert main_image["download"].startswith("@@images/")
        assert "//" not in main_image["download"]

    def test_rewrites_sapl_documentos_download_view(self):
        """Query-string upstream URLs are converted to a path-style local URL."""
        _, scales = process_image_field("image", [SAMPLE_IMAGE_DOWNLOAD_VIEW.copy()])
        main_image = scales["image"][0]
        assert main_image["download"] == (
            "@@images/sapl_documentos_download/parlamentar/fotos/546914_foto"
        )
        assert "?" not in main_image["download"]
        assert "@@" not in main_image["download"][len("@@images/") :]

    def test_includes_plone_scales(self):
        _, scales = process_image_field("image", [SAMPLE_IMAGE.copy()])
        main_image = scales["image"][0]
        assert "scales" in main_image
        # Plone default has several scales (mini, preview, large, etc.)
        assert len(main_image["scales"]) > 0

    def test_scale_has_download_width_height(self):
        _, scales = process_image_field("image", [SAMPLE_IMAGE.copy()])
        main_image = scales["image"][0]
        for scale_name, scale_data in main_image["scales"].items():
            assert "download" in scale_data, f"{scale_name} missing download"
            assert "width" in scale_data, f"{scale_name} missing width"
            assert "height" in scale_data, f"{scale_name} missing height"
            assert isinstance(scale_data["width"], int)
            assert isinstance(scale_data["height"], int)

    def test_does_not_mutate_input(self):
        original = [SAMPLE_IMAGE.copy()]
        original_download = original[0]["download"]
        process_image_field("image", original)
        assert original[0]["download"] == original_download

    def test_custom_field_name(self):
        name, scales = process_image_field("foto", [SAMPLE_IMAGE.copy()])
        assert name == "foto"
        assert "foto" in scales

    def test_unknown_download_url_unchanged(self):
        """A download URL that doesn't match any pattern is left as-is."""
        image = SAMPLE_IMAGE.copy()
        image["download"] = "https://other-host.com/some/image.png"
        _, scales = process_image_field("image", [image])
        main_image = scales["image"][0]
        assert main_image["download"] == "https://other-host.com/some/image.png"
