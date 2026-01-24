"""tests for health check endpoints."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    """test health endpoint returns 200."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_readiness_check():
    """test readiness endpoint returns 200."""
    response = client.get("/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
