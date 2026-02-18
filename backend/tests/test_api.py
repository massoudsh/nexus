"""
API endpoint tests using FastAPI TestClient.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Test client that uses the app without starting a server."""
    return TestClient(app)


def test_root(client: TestClient):
    """Root returns Nexus API info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data.get("message") == "Nexus API"
    assert "version" in data
    assert data.get("docs") == "/docs"


def test_health(client: TestClient):
    """Health check returns healthy."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_api_v1_requires_auth(client: TestClient):
    """Protected API returns 401 without token."""
    response = client.get("/api/v1/accounts")
    assert response.status_code == 401
