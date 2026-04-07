import pytest


_DATA = None


@pytest.fixture
def serialization_data(api_manager_request):
    """Fixture to provide the control panel data for serialization tests."""
    global _DATA
    if _DATA is None:
        response = api_manager_request.get("/@controlpanels/eprocessos-settings")
        _DATA = response.json()
    return _DATA


class TestControlPanel:
    @pytest.fixture(autouse=True)
    def _initialize(self, api_manager_request, serialization_data):
        self.api_session = api_manager_request
        self.data = serialization_data

    def test_registration(self):
        """Test if the control panel is registered correctly."""
        response = self.api_session.get("/@controlpanels")
        assert response.status_code == 200
        data = response.json()
        control_panels = {
            cp["@id"] for cp in data if cp["@id"].endswith("eprocessos-settings")
        }
        assert len(control_panels) == 1, (
            "Control panel 'eprocessos-settings' should be registered."
        )

    @pytest.mark.parametrize(
        "key,type_",
        (
            ("@id", str),
            ("data", dict),
            ("group", str),
            ("schema", dict),
            ("title", str),
        ),
    )
    def test_serialization(self, key, type_):
        data = self.data
        assert key in data
        assert isinstance(data[key], type_)
