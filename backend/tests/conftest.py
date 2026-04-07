from collections.abc import Generator
from OFS.interfaces import IApplication
from plone import api
from plone.app.testing import SITE_OWNER_NAME
from plone.app.testing import SITE_OWNER_PASSWORD
from plone.dexterity.content import DexterityContent
from plone.restapi.testing import RelativeSession
from Products.CMFPlone.Portal import PloneSite
from pytest_plone import fixtures_factory
from sc.eprocessos.testing import ACCEPTANCE_TESTING
from sc.eprocessos.testing import FUNCTIONAL_TESTING
from sc.eprocessos.testing import INTEGRATION_TESTING
from typing import Any
from typing import Protocol
from zope.component.hooks import site

import pytest


pytest_plugins = ["pytest_plone"]


globals().update(
    fixtures_factory((
        (ACCEPTANCE_TESTING, "acceptance"),
        (FUNCTIONAL_TESTING, "functional"),
        (INTEGRATION_TESTING, "integration"),
    ))
)


class ContentFactory(Protocol):
    def __call__(
        self, container: DexterityContent, portal_type: str, **kwargs: Any
    ) -> DexterityContent: ...


class APISessionFactory(Protocol):
    def __call__(self) -> RelativeSession: ...


@pytest.fixture()
def app_functional(functional: dict[str, Any]) -> IApplication:
    return functional["app"]


@pytest.fixture()
def portal_functional(functional: dict[str, Any]) -> Generator[PloneSite]:
    portal = functional["portal"]
    with site(portal):
        yield portal


@pytest.fixture()
def http_request(functional: dict[str, Any]) -> Any:
    return functional["request"]


@pytest.fixture()
def request_api_factory(portal_functional: PloneSite) -> APISessionFactory:
    def factory() -> RelativeSession:
        url = portal_functional.absolute_url()
        api_session = RelativeSession(f"{url}/++api++")
        return api_session

    return factory


@pytest.fixture()
def api_anon_request(request_api_factory: APISessionFactory) -> RelativeSession:
    return request_api_factory()


@pytest.fixture()
def api_manager_request(
    request_api_factory: APISessionFactory,
) -> Generator[RelativeSession]:
    request = request_api_factory()
    request.auth = (SITE_OWNER_NAME, SITE_OWNER_PASSWORD)
    yield request
    request.auth = ()


@pytest.fixture(scope="class")
def portal_class(integration_class: dict[str, Any]) -> Generator[PloneSite]:
    if hasattr(integration_class, "testSetUp"):
        integration_class.testSetUp()
    portal = integration_class["portal"]
    with site(portal):
        yield portal
    if hasattr(integration_class, "testTearDown"):
        integration_class.testTearDown()


@pytest.fixture()
def content_factory() -> ContentFactory:
    """Factory to create Dexterity content with Manager role."""

    def factory(
        container: DexterityContent, portal_type: str, **kwargs: Any
    ) -> DexterityContent:
        with api.env.adopt_roles(["Manager"]):
            return api.content.create(container=container, type=portal_type, **kwargs)

    return factory
