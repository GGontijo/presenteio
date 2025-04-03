from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, Column, DateTime, Integer, String

from app.database import Base


class UsersTable(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    picture_url = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="user")
    auth_provider = Column(String(50), nullable=False)
    external_provider_id = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=True)
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
            "auth_provider IN ('local', 'google', 'temp')", name="check_auth_provider"
        ),
        CheckConstraint("role IN ('user', 'admin')", name="check_role"),
    )
