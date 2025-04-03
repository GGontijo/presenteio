from fastapi.testclient import TestClient

from app.main import app


def test_create_user(setup_db):
    with TestClient(app) as client:
        response = client.post(
            "/users",
            json={
                "name": "Manoel",
                "email": "manoel.gomes@testing.com",
                "auth_provider": "local",
                "password": "Password@123",
            },
        )
        assert response.status_code == 201
        assert response.headers["Authorization"]
        assert response.json()["id"]
        assert response.json()["name"] == "Manoel"
        assert response.json()["email"] == "manoel.gomes@testing.com"


def test_read_user(create_user, get_session_header):
    with TestClient(app) as client:
        response = client.get(f"/users/{create_user.id}", headers=get_session_header)
        assert response.status_code == 200
        assert response.json()["name"] == create_user.name
        assert response.json()["email"] == create_user.email
        assert response.json()["id"] == create_user.id
        assert response.json()["role"] == create_user.role


def test_read_all_users(get_admin_session_header):
    with TestClient(app) as client:
        response = client.get("/users", headers=get_admin_session_header)
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) == 1


def test_update_user(create_user, get_session_header):
    user_id = create_user.id
    with TestClient(app) as client:
        response = client.put(
            f"/users/{user_id}",
            headers=get_session_header,
            json={
                "name": "Manoel Updated",
                "email": "manoel.gomes@testing.com",
                "auth_provider": "local",
                "password": "Password@123",
            },
        )
        assert response.status_code == 200
        assert response.json()["name"] == "Manoel Updated"


def test_patch_user(create_user, get_session_header):
    user_id = create_user.id
    with TestClient(app) as client:
        response = client.patch(
            f"/users/{user_id}",
            headers=get_session_header,
            json={"email": "manoel.updated@testing.com"},
        )
        assert response.status_code == 200
        assert response.json()["email"] == "manoel.updated@testing.com"


def test_delete_user(create_user, get_session_header):
    user_id = create_user.id
    with TestClient(app) as client:
        response = client.delete(f"/users/{user_id}", headers=get_session_header)
        assert response.status_code == 200
        response = client.get(f"/users/{user_id}", headers=get_session_header)
        assert response.status_code == 404
