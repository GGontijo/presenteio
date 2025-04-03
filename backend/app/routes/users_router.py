from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.users_model import UsersTable
from app.schemas.users_schema import User, UserCreate, UserUpdate
from app.security import create_jwt_session, jwt_session

users_router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)


@users_router.get("", response_model=list[User])
def read_users(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    if user_auth_data.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Access forbidden!")
    users = db.query(UsersTable).offset(skip).limit(limit).all()
    return users


# TODO: Definir rota como idempotente para login/registro
@users_router.post("", response_model=User)
def register_user(
    create_user: Optional[UserCreate] = None, db: Session = Depends(get_db)
):
    if not create_user:
        create_user = UserCreate()

    db_user = db.query(UsersTable).filter(UsersTable.email == create_user.email).first()
    if db_user:
        if create_user.auth_provider == "local" and not create_user.verify_password(
            db_user.password_hash
        ):
            raise HTTPException(status_code=401, detail="Username or password invalid!")
        if (
            create_user.auth_provider == "google"
            and create_user.external_provider_id != db_user.external_provider_id
        ):
            raise HTTPException(status_code=401, detail="Username or password invalid!")
        return Response(
            content=User(**db_user.__dict__).model_dump_json(),
            status_code=200,
            headers={"Authorization": f"Bearer {create_jwt_session(db_user)}"},
        )
    new_user_db = UsersTable(**create_user.model_dump())
    db.add(new_user_db)
    db.commit()
    db.refresh(new_user_db)
    return Response(
        content=User(**new_user_db.__dict__).model_dump_json(),
        status_code=201,
        headers={"Authorization": f"Bearer {create_jwt_session(new_user_db)}"},
    )


@users_router.get("/{user_id}", response_model=User)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    if (
        user_auth_data.get("role") != "admin"
        and int(user_auth_data.get("sub")) != user_id
    ):
        raise HTTPException(status_code=401, detail="Access forbidden!")
    db_user = db.query(UsersTable).filter(UsersTable.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found!")
    return db_user


@users_router.put("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user: UserCreate,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    if (
        user_auth_data.get("role") != "admin"
        and int(user_auth_data.get("sub")) != user_id
    ):
        raise HTTPException(status_code=401, detail="Access forbidden!")
    db_user = db.query(UsersTable).filter(UsersTable.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found!")
    db.query(UsersTable).filter(UsersTable.id == user_id).update(user.model_dump())
    db.commit()
    db.refresh(db_user)
    return db_user


@users_router.patch("/{user_id}", response_model=User)
def patch_user(
    user_id: int,
    user: UserUpdate,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    if (
        user_auth_data.get("role") != "admin"
        and int(user_auth_data.get("sub")) != user_id
    ):
        raise HTTPException(status_code=401, detail="Access forbidden!")
    db_user = db.query(UsersTable).filter(UsersTable.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found!")
    db_user_model = UserUpdate(**db_user.__dict__)
    update_data = user.model_dump(exclude_unset=True)
    updated_user = db_user_model.model_copy(update=update_data)
    db.query(UsersTable).filter(UsersTable.id == user_id).update(
        updated_user.model_dump()
    )
    db.commit()
    db.refresh(db_user)
    return db_user


@users_router.delete("/{user_id}", response_model=User)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    if (
        user_auth_data.get("role") != "admin"
        and int(user_auth_data.get("sub")) != user_id
    ):
        raise HTTPException(status_code=401, detail="Access forbidden!")
    db_user = db.query(UsersTable).filter(UsersTable.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found!")
    db.delete(db_user)
    db.commit()
    return db_user
