from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class PaymentFormEnum(Enum):
    pix = "pix"
    purchase_link = "purchase-link"
    other = "other"


class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    payment_form: Optional[PaymentFormEnum] = None
    payment_info: Optional[str] = None

    class Config:
        use_enum_values = True


class ItemCreate(ItemBase):
    pass


class Item(ItemBase):
    id: int
    user_id: int
    page_id: int
    created_at: datetime
    updated_at: datetime


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    payment_form: Optional[PaymentFormEnum] = None
    payment_info: Optional[str] = None

    class Config:
        use_enum_values = True
