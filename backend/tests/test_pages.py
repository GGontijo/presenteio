from fastapi.testclient import TestClient
from conftest import fake
from app.main import app

def test_create_page(get_session_header):
    with TestClient(app) as client:
        response = client.post(
            "/pages", 
            headers=get_session_header,
            json={
                "domain": "test",
                "title": "Test Page", 
                "description": "Testing"
            }
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Test Page"
        assert response.json()["description"] == "Testing"

def test_read_page(create_page):
    with TestClient(app) as client:
        response = client.get(f"/pages/{create_page.id}")
        assert response.status_code == 200
        assert response.json()["title"] == create_page.title
        assert response.json()["description"] == create_page.description
        assert response.json()["id"] == create_page.id
        assert response.json()["user_id"] == create_page.user_id
        assert response.json()["domain"] == create_page.domain

def test_read_all_user_pages(create_page, get_session_header):
    with TestClient(app) as client:
        response = client.get("/pages", headers=get_session_header)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) == 1
        assert response.json()[0]["title"] == create_page.title
        assert response.json()[0]["description"] == create_page.description
        assert response.json()[0]["id"] == create_page.id
        assert response.json()[0]["user_id"] == create_page.user_id
        assert response.json()[0]["domain"] == create_page.domain

def test_update_page(create_page, get_session_header):
    page_id = create_page.id
    with TestClient(app) as client:
        response = client.put(
            f"/pages/{page_id}",
            headers=get_session_header,
            json={"domain": fake.domain_name(), "title": "Updated Page", "description": "Updated Testing"},
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Updated Page"
        assert response.json()["description"] == "Updated Testing"

def test_patch_page(create_page, get_session_header):
    page_id = create_page.id
    with TestClient(app) as client:
        response = client.patch(
            f"/pages/{page_id}",
            headers=get_session_header,
            json={"description": "Partially Updated Subject"},
        )
        assert response.status_code == 200
        assert response.json()["description"] == "Partially Updated Subject"

def test_delete_page(create_page, get_session_header):
    page_id = create_page.id
    with TestClient(app) as client:
        response = client.delete(f"/pages/{page_id}", headers=get_session_header)
        assert response.status_code == 200

def test_create_page_item(create_page, create_item, get_session_header):
    page_id = create_page.id
    item_id = create_item.id
    with TestClient(app) as client:
        response = client.post(
            f"/pages/{page_id}/items/{item_id}",
            headers=get_session_header
        )
        assert response.status_code == 200

def test_read_page_items(create_page_item):
    page_id = create_page_item.page_id
    with TestClient(app) as client:
        response = client.get(f"/pages/{page_id}/items")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) == 1

def test_delete_page_item(create_page_item, get_session_header):
    page_id = create_page_item.page_id
    item_id = create_page_item.item_id
    with TestClient(app) as client:
        response = client.delete(f"/pages/{page_id}/items/{item_id}", headers=get_session_header)
        assert response.status_code == 200
        response = client.get(f"/pages/{page_id}/items")
        assert isinstance(response.json(), list)
        assert len(response.json()) == 0