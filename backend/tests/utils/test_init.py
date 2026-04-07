"""Tests for sc.eprocessos.utils public API (re-exports from __init__)."""


class TestPublicAPI:
    """Ensure all public symbols are importable from sc.eprocessos.utils."""

    def test_get_client(self):
        from sc.eprocessos.utils import get_client

        assert callable(get_client)

    def test_parse_eprocessos_url(self):
        from sc.eprocessos.utils import parse_eprocessos_url

        assert callable(parse_eprocessos_url)

    def test_facade_urls(self):
        from sc.eprocessos.utils import facade_urls

        assert callable(facade_urls)

    def test_process_image_field(self):
        from sc.eprocessos.utils import process_image_field

        assert callable(process_image_field)

    def test_eprocessos_item_url(self):
        from sc.eprocessos.utils import EProcessosItemURL

        url = EProcessosItemURL(prefix="p", service="s", item_id="1")
        assert url.service == "s"
