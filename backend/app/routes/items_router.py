from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.items_model import ItemTable
from app.schemas.items_schema import Item, ItemCreate, ItemUpdate
from app.security import jwt_session

item_router = APIRouter(
    prefix="/items",
    tags=["items"],
    responses={404: {"description": "Not found"}},
)


@item_router.get("", response_model=list[Item])
def read_items(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    items = (
        db.query(ItemTable)
        .filter(ItemTable.user_id == int(user_auth_data.get("sub")))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items


@item_router.post("", response_model=Item)
def create_item(
    create_item: ItemCreate,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    new_item_db = ItemTable(
        user_id=int(user_auth_data.get("sub")), **create_item.model_dump()
    )
    db.add(new_item_db)
    db.commit()
    db.refresh(new_item_db)
    return new_item_db


@item_router.get("/{item_id}", response_model=Item)
def read_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(ItemTable).filter(ItemTable.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found!")
    return db_item


@item_router.put("/{item_id}", response_model=Item)
def update_item(
    item_id: int,
    item: ItemCreate,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    db_item = (
        db.query(ItemTable)
        .filter(
            ItemTable.id == item_id,
            ItemTable.user_id == int(user_auth_data.get("sub")),
        )
        .first()
    )
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found!")
    db.query(ItemTable).filter(ItemTable.id == item_id).update(item.model_dump())
    db.commit()
    db.refresh(db_item)
    return db_item


@item_router.patch("/{item_id}", response_model=Item)
def patch_item(
    item_id: int,
    item: ItemUpdate,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    db_item = (
        db.query(ItemTable)
        .filter(
            ItemTable.id == item_id,
            ItemTable.user_id == int(user_auth_data.get("sub")),
        )
        .first()
    )
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found!")
    db_item_model = ItemUpdate(**db_item.__dict__)
    update_data = item.model_dump(exclude_defaults=True)
    updated_item = db_item_model.model_copy(update=update_data)
    db.query(ItemTable).filter(ItemTable.id == item_id).update(
        updated_item.model_dump()
    )
    db.commit()
    db.refresh(db_item)
    return db_item


@item_router.delete("/{item_id}", response_model=Item)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    db_item = (
        db.query(ItemTable)
        .filter(
            ItemTable.id == item_id,
            ItemTable.user_id == int(user_auth_data.get("sub")),
        )
        .first()
    )
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found!")
    db.delete(db_item)
    db.commit()
    return db_item
