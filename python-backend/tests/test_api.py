import pytest
from fastapi import status

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "healthy"

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    assert "Welcome to" in response.json()["message"]

@pytest.mark.asyncio
async def test_ocr_endpoint_missing_file(client):
    response = client.post("/ocr/process", json={"document_type": "bill"})
    # Should fail without file upload
    assert response.status_code in [400, 422]
