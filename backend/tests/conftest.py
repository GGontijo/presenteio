import pytest
from app.database import SessionLocal, load_up_tables
from app.main import app
from app.models.items_model import ItemTable
from app.models.pages_model import PageItemTable, PageTable
from app.models.users_model import UsersTable
from app.schemas.items_schema import ItemCreate
from app.schemas.pages_schema import PageCreate
from app.schemas.users_schema import UserCreate
from faker import Faker
from fastapi.testclient import TestClient

fake = Faker("pt_BR")


@pytest.fixture(scope="function")
def setup_db():
    load_up_tables()


@pytest.fixture(scope="function")
def create_admin_user(setup_db):
    db = SessionLocal()
    db.query(UsersTable).delete()
    user = UserCreate(
        name=fake.name(),
        email=fake.email(),
        picture_url=fake.image_url(),
        auth_provider="local",
        password="Password@123",
    )
    user_db = UsersTable(role="admin", **user.model_dump())
    db.add(user_db)
    db.commit()
    db.refresh(user_db)
    db.close()
    return user_db


@pytest.fixture(scope="function")
def create_user(setup_db):
    db = SessionLocal()
    db.query(UsersTable).delete()
    user = UserCreate(
        name=fake.name(),
        email=fake.email(),
        picture_url=fake.image_url(),
        auth_provider="local",
        password="Password@123",
    )
    user_db = UsersTable(**user.model_dump())
    db.add(user_db)
    db.commit()
    db.refresh(user_db)
    db.close()
    return user_db


@pytest.fixture(scope="function")
def create_page(create_user):
    user_id = create_user.id
    db = SessionLocal()
    db.query(PageTable).delete()
    page = PageCreate(
        domain=fake.domain_word(), title="Test Page", description="Testing"
    )
    page_db = PageTable(user_id=user_id, **page.model_dump())
    db.add(page_db)
    db.commit()
    db.refresh(page_db)
    db.close()
    return page_db


@pytest.fixture(scope="function")
def create_item(create_user):
    user_id = create_user.id
    db = SessionLocal()
    db.query(ItemTable).delete()
    item = ItemCreate(
        name="Test Item",
        description="Test Description",
        image_url=fake.image_url(),
        payment_form="other",
        payment_info="Test Payment Info",
    )
    item_db = ItemTable(user_id=user_id, **item.model_dump())
    db.add(item_db)
    db.commit()
    db.refresh(item_db)
    db.close()
    return item_db


@pytest.fixture(scope="function")
def create_page_item(create_page, create_item):
    page_id = create_page.id
    item_id = create_item.id
    db = SessionLocal()
    db.query(PageItemTable).delete()
    page_item_db = PageItemTable(page_id=page_id, item_id=item_id)
    db.add(page_item_db)
    db.commit()
    db.refresh(page_item_db)
    db.close()
    return page_item_db


@pytest.fixture(scope="function")
def get_session_header(create_user):
    with TestClient(app) as client:
        response = client.post(
            "/users",
            json={
                "name": create_user.name,
                "email": create_user.email,
                "auth_provider": "local",
                "password": "Password@123",
            },
        )
        token = response.headers.get("Authorization").replace("Bearer ", "")
        authorization_header = {"Authorization": f"Bearer {token}"}
        return authorization_header


@pytest.fixture(scope="function")
def get_admin_session_header(create_admin_user):
    with TestClient(app) as client:
        response = client.post(
            "/users",
            json={
                "name": create_admin_user.name,
                "email": create_admin_user.email,
                "auth_provider": "local",
                "password": "Password@123",
            },
        )
        token = response.headers.get("Authorization").replace("Bearer ", "")
        authorization_header = {"Authorization": f"Bearer {token}"}
        return authorization_header
