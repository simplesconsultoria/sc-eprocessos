"""Functional tests for facade serialization through the REST API.

These tests exercise the real HTTP path through the WSGI server.
Only tests that don't require external API calls belong here.
"""

from collections.abc import Generator
from plone import api
from plone.app.testing import setRoles
from plone.app.testing import SITE_OWNER_NAME
from plone.app.testing import SITE_OWNER_PASSWORD
from plone.app.testing import TEST_USER_ID
from plone.dexterity.content import DexterityContent
from plone.restapi.testing import RelativeSession
from Products.CMFPlone.Portal import PloneSite
from sc.eprocessos.content.base import EProcessosFacade
from typing import Any
from typing import Protocol
from zope.component.hooks import setSite

import pytest
import transaction


class ContentFactory(Protocol):
    def __call__(
        self, container: DexterityContent, portal_type: str, **kwargs: Any
    ) -> DexterityContent: ...


@pytest.fixture()
def portal_functional(functional: dict[str, Any]) -> Generator[PloneSite]:
    portal = functional["portal"]
    setSite(portal)
    setRoles(portal, TEST_USER_ID, ["Manager"])
    transaction.commit()
    yield portal


@pytest.fixture()
def api_session(portal_functional: PloneSite) -> Generator[RelativeSession]:
    url = portal_functional.absolute_url()
    session = RelativeSession(f"{url}/++api++")
    session.auth = (SITE_OWNER_NAME, SITE_OWNER_PASSWORD)
    session.headers.update({"Accept": "application/json"})
    yield session
    session.auth = ()


@pytest.fixture()
def content_factory() -> ContentFactory:
    """Override root content_factory to commit after creation.

    Functional tests use a WSGI server in a separate thread,
    so content must be committed to be visible via HTTP.
    """

    def factory(
        container: DexterityContent, portal_type: str, **kwargs: Any
    ) -> DexterityContent:
        with api.env.adopt_roles(["Manager"]):
            content = api.content.create(
                container=container, type=portal_type, **kwargs
            )
        transaction.commit()
        return content

    return factory


@pytest.fixture()
def vereadores_facade(
    portal_functional: PloneSite, content_factory: ContentFactory
) -> EProcessosFacade:
    return content_factory(
        portal_functional, "Vereadores", id="vereadores", title="Vereadores"
    )


@pytest.fixture()
def normas_facade(
    portal_functional: PloneSite, content_factory: ContentFactory
) -> EProcessosFacade:
    return content_factory(portal_functional, "Normas", id="normas", title="Normas")


class TestFacadeSerialization:
    """Test that facade content types serialize correctly via REST API."""

    def test_vereadores_facade_includes_service_name(
        self, api_session: RelativeSession, vereadores_facade: EProcessosFacade
    ) -> None:
        response = api_session.get(f"/{vereadores_facade.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["service_name"] == "vereadores"
        assert data["display_form"] is False

    def test_normas_facade_includes_display_form(
        self, api_session: RelativeSession, normas_facade: EProcessosFacade
    ) -> None:
        response = api_session.get(f"/{normas_facade.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["service_name"] == "normas"
        assert data["display_form"] is True
