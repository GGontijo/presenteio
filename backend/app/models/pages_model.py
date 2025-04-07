from datetime import datetime, timezone

from app.database import Base
from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)


class PageTable(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    domain = Column(String(50), nullable=False, unique=True)
    status = Column(String(50), nullable=False, default="building")
    title = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    picture_url = Column(Text, nullable=True)
    publish_id = Column(String(255), nullable=True)
    published_at = Column(DateTime, nullable=True)
    published_until = Column(DateTime, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(tz=timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(tz=timezone.utc),
        onupdate=lambda: datetime.now(tz=timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('building', 'published', 'overdue')", name="check_status"
        ),
    )
