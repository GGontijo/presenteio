from fastapi.testclient import TestClient
from conftest import fake
from app.main import app
from decimal import Decimal

def test_create_item(get_session_header):
    with TestClient(app) as client:
        response = client.post(
            "/items",
            headers=get_session_header,
            json={
                "name": "Test Item",
                "description": "Test Description", 
                "image_url": "http://test.com/image.jpg",
                "value": 100,
                "payment_form": "other", 
                "payment_info": "Test Payment Info"
            }
        )
        assert response.status_code == 200
        assert response.json()["name"] == "Test Item"

def test_read_item(create_item):
    with TestClient(app) as client:
        response = client.get(f"/items/{create_item.id}")
        assert response.status_code == 200
        assert response.json()["name"] == create_item.name
        assert response.json()["description"] == create_item.description
        assert response.json()["id"] == create_item.id
        assert response.json()["user_id"] == create_item.user_id
        assert Decimal(response.json()["value"]) == create_item.value
        assert response.json()["image_url"] == create_item.image_url
        assert response.json()["payment_form"] == create_item.payment_form
        assert response.json()["payment_info"] == create_item.payment_info

def test_read_all_user_items(create_item, get_session_header):
    with TestClient(app) as client:
        response = client.get("/items", headers=get_session_header)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) == 1
        assert response.json()[0]["name"] == create_item.name
        assert response.json()[0]["description"] == create_item.description
        assert response.json()[0]["id"] == create_item.id
        assert response.json()[0]["user_id"] == create_item.user_id
        assert Decimal(response.json()[0]["value"]) == create_item.value
        assert response.json()[0]["image_url"] == create_item.image_url
        assert response.json()[0]["payment_form"] == create_item.payment_form
        assert response.json()[0]["payment_info"] == create_item.payment_info

def test_update_item(create_item, get_session_header):
    item_id = create_item.id
    with TestClient(app) as client:
        response = client.put(
            f"/items/{item_id}",
            headers=get_session_header, 
            json={
                "name": "Updated Item", 
                "description": "Updated Description",
                "value": 15,
                "image_url": fake.image_url(),
                "payment_form": "other"
            }
        )
        assert response.status_code == 200
        assert response.json()["name"] == "Updated Item"

def test_patch_item(create_item, get_session_header):
    item_id = create_item.id
    with TestClient(app) as client:
        response = client.patch(
            f"/items/{item_id}", 
            headers=get_session_header, 
            json={"value": 150}
        )
        assert response.status_code == 200
        assert Decimal(response.json()["value"]) == Decimal(150)

def test_delete_item(create_item, get_session_header):
    item_id = create_item.id
    with TestClient(app) as client:
        response = client.delete(f"/items/{item_id}", headers=get_session_header)
        assert response.status_code == 200
        response = client.get(f"/items/{item_id}", headers=get_session_header)
        assert response.status_code == 404
