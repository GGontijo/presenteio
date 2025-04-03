from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class PageBase(BaseModel):
    domain: str
    title: Optional[str] = None
    description: Optional[str] = None
    picture_url: Optional[str] = None

    @field_validator("domain", mode="before")
    def validate_domain(cls, v):
        return v.strip().lower()


class PageCreate(PageBase):
    pass


class Page(PageBase):
    id: int
    user_id: Optional[int] = None
    status: str
    published_at: Optional[datetime] = None
    published_until: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class PageUpdate(PageBase):
    domain: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    picture_url: Optional[str] = None


class PageItem(BaseModel):
    id: int
    page_id: int
    item_id: int
    created_at: datetime
    updated_at: datetime
