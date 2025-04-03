from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.pages_model import PageTable

domain_router = APIRouter(
    prefix="/domains",
    tags=["domains"],
    responses={404: {"description": "Not found"}},
)

@domain_router.get("/{domain}")
def get_domain(domain: str, db: Session = Depends(get_db)):
    domain = db.query(PageTable).filter(PageTable.domain == domain, PageTable.status == "published").first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found!")
    return domain.id