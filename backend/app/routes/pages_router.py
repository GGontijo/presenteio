from app.database import get_db
from app.models.items_model import ItemTable
from app.models.pages_model import PageTable
from app.schemas.items_schema import Item, ItemCreate, ItemUpdate
from app.schemas.pages_schema import Page, PageCreate, PageUpdate
from app.security import jwt_session
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

page_router = APIRouter(
    prefix="/pages",
    tags=["pages"],
    responses={404: {"description": "Not found"}},
)


@page_router.get("", response_model=list[Page])
def read_pages(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    pages = (
        db.query(PageTable)
        .filter(PageTable.user_id == int(user_auth_data.get("sub")))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return pages


@page_router.post("", response_model=Page)
def create_page(
    create_page: PageCreate,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    db_existing_page = (
        db.query(PageTable).filter(PageTable.domain == create_page.domain).first()
    )
    if db_existing_page is not None:
        raise HTTPException(status_code=409, detail="Domain already in use!")

    if user_auth_data:
        user_id = int(user_auth_data.get("sub"))
    else:
        user_id = None

    new_page_db = PageTable(user_id=user_id, **create_page.model_dump())
    db.add(new_page_db)
    db.commit()
    db.refresh(new_page_db)
    return new_page_db


@page_router.get("/{page_id}", response_model=Page)
def read_page(page_id: int, db: Session = Depends(get_db)):
    db_page = db.query(PageTable).filter(PageTable.id == page_id).first()
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found!")
    return db_page


@page_router.put("/{page_id}", response_model=Page)
def update_page(
    page_id: int,
    page: PageCreate,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    db_existing_page = (
        db.query(PageTable).filter(PageTable.domain == page.domain).first()
    )
    if db_existing_page is not None:
        raise HTTPException(status_code=409, detail="Domain already in use!")
    db_page = (
        db.query(PageTable)
        .filter(
            PageTable.user_id == int(user_auth_data.get("sub")), PageTable.id == page_id
        )
        .first()
    )
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found!")
    db.query(PageTable).filter(
        PageTable.user_id == int(user_auth_data.get("sub")), PageTable.id == page_id
    ).update(page.model_dump())
    db.commit()
    db.refresh(db_page)
    return db_page


@page_router.patch("/{page_id}", response_model=Page)
def patch_page(
    page_id: int,
    page: PageUpdate,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    if page.domain is not None:
        db_existing_page = (
            db.query(PageTable).filter(PageTable.domain == page.domain).first()
        )
        if db_existing_page is not None:
            raise HTTPException(status_code=409, detail="Domain already in use!")
    db_page = (
        db.query(PageTable)
        .filter(
            PageTable.user_id == int(user_auth_data.get("sub")), PageTable.id == page_id
        )
        .first()
    )
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found!")
    db_page_model = PageUpdate(**db_page.__dict__)
    update_data = page.model_dump(exclude_defaults=True)
    updated_page = db_page_model.model_copy(update=update_data)
    db.query(PageTable).filter(
        PageTable.user_id == int(user_auth_data.get("sub")), PageTable.id == page_id
    ).update(updated_page.model_dump())
    db.commit()
    db.refresh(db_page)
    return db_page


@page_router.delete("/{page_id}", response_model=Page)
def delete_page(
    page_id: int,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    db_page = (
        db.query(PageTable)
        .filter(
            PageTable.user_id == int(user_auth_data.get("sub")), PageTable.id == page_id
        )
        .first()
    )
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found!")
    db.delete(db_page)
    db.commit()
    return db_page


page_item_router = APIRouter(
    prefix="/pages/{page_id}/items",
    tags=["pages"],
    responses={404: {"description": "Not found"}},
)


@page_item_router.get("", response_model=list[Item])
def read_page_items(
    page_id: int, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)
):
    db_page = db.query(PageTable).filter(PageTable.id == page_id).first()
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found")
    page_items = (
        db.query(ItemTable)
        .filter(ItemTable.page_id == page_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return page_items


@page_item_router.post("", response_model=Item)
def create_page_item(
    page_id: int,
    create_item: ItemCreate,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    db_page = (
        db.query(PageTable)
        .filter(
            PageTable.id == page_id,
            PageTable.user_id == int(user_auth_data.get("sub")),
        )
        .first()
    )

    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found!")

    new_page_item_db = ItemTable(
        user_id=int(user_auth_data.get("sub")),
        page_id=page_id,
        **create_item.model_dump(),
    )
    db.add(new_page_item_db)
    db.commit()
    db.refresh(new_page_item_db)
    return new_page_item_db


@page_item_router.get("/{item_id}", response_model=Item)
def read_page_item(
    item_id: int,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    db_page_item = (
        db.query(ItemTable)
        .filter(
            ItemTable.id == item_id,
            ItemTable.user_id == int(user_auth_data.get("sub")),
        )
        .first()
    )
    if not db_page_item:
        raise HTTPException(status_code=404, detail="Item not found!")
    return db_page_item


@page_item_router.put("/{item_id}", response_model=Item)
def update_item(
    item_id: int,
    item: ItemCreate,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    db_page_item = (
        db.query(ItemTable)
        .filter(
            ItemTable.id == item_id,
            ItemTable.user_id == int(user_auth_data.get("sub")),
        )
        .first()
    )
    if not db_page_item:
        raise HTTPException(status_code=404, detail="Item not found!")
    db.query(ItemTable).filter(ItemTable.id == item_id).update(item.model_dump())
    db.commit()
    db.refresh(db_page_item)
    return db_page_item


@page_item_router.patch("/{item_id}", response_model=Item)
def patch_item(
    item_id: int,
    item: ItemUpdate,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    db_page_item = (
        db.query(ItemTable)
        .filter(
            ItemTable.id == item_id,
            ItemTable.user_id == int(user_auth_data.get("sub")),
        )
        .first()
    )
    if not db_page_item:
        raise HTTPException(status_code=404, detail="Item not found!")
    db_page_item_model = ItemUpdate(**db_page_item.__dict__)
    update_data = item.model_dump(exclude_defaults=True)
    updated_item = db_page_item_model.model_copy(update=update_data)
    db.query(ItemTable).filter(ItemTable.id == item_id).update(
        updated_item.model_dump()
    )
    db.commit()
    db.refresh(db_page_item)
    return db_page_item


@page_item_router.delete("/{item_id}", response_model=Item)
def delete_page_item(
    page_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    user_auth_data: dict = Depends(jwt_session),
):
    db_page = (
        db.query(PageTable)
        .filter(
            PageTable.id == page_id, PageTable.user_id == int(user_auth_data.get("sub"))
        )
        .first()
    )
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found!")
    db_page_item = (
        db.query(ItemTable)
        .filter(ItemTable.page_id == page_id, ItemTable.id == item_id)
        .first()
    )
    if not db_page_item:
        raise HTTPException(status_code=404, detail="Page item not found!")
    db.delete(db_page_item)
    db.commit()
    return db_page_item
