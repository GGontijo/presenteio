from datetime import datetime
from enum import Enum
from typing import Optional

from faker import Faker
from passlib.context import CryptContext
from pydantic import (
    BaseModel,
    EmailStr,
    HttpUrl,
    SecretStr,
    field_validator,
    model_serializer,
    model_validator,
)

from app.security import decode_google_jwt_credential

fake = Faker("pt_BR")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def validate_password(password: SecretStr) -> SecretStr:
    """Implementa as regras globais de validação da senha."""
    password_str = password.get_secret_value()
    if len(password_str) < 8:
        raise ValueError("A senha deve ter pelo menos 8 caracteres.")
    if not any(char.isdigit() for char in password_str):
        raise ValueError("A senha deve conter pelo menos um número.")
    if not any(char.isupper() for char in password_str):
        raise ValueError("A senha deve conter pelo menos uma letra maiúscula.")
    return password


class AuthProviderEnum(Enum):
    local = "local"
    google = "google"
    temp = "temp"


class UserRoleEnum(Enum):
    user = "user"
    admin = "admin"


class UserBase(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    picture_url: Optional[HttpUrl] = None


class User(UserBase):
    id: int
    role: UserRoleEnum
    created_at: datetime
    updated_at: datetime


# TODO: Avaliar segurança em operações PUT quando um usuário muda seu auth_provider
class UserCreate(UserBase):
    auth_provider: Optional[AuthProviderEnum] = AuthProviderEnum.temp
    password: Optional[SecretStr] = None
    external_provider_id: Optional[str] = None
    bearer_token: Optional[str] = None

    class Config:
        use_enum_values = True
        validate_default = True

    @field_validator("password", mode="after")
    @classmethod
    def handle_password_validation(cls, v: SecretStr) -> SecretStr:
        if v:
            return validate_password(v)

    @model_validator(mode="after")
    def validate_user(self):
        if self.auth_provider != AuthProviderEnum.temp.value and not any(
            [self.password, self.bearer_token]
        ):
            raise ValueError(
                "Para criar um usuário é obrigatório informar a senha ou o token de autenticação do provedor externo!"
            )

        if all([self.password, self.bearer_token]):
            raise ValueError(
                "Para criar um usuário não pode ser informado ambos o token de autenticação do provedor externo e a senha!"
            )

        if self.bearer_token and self.auth_provider != AuthProviderEnum.google.value:
            raise ValueError(
                "O provedor de autenticação informado não é válido para a autenticação por token!"
            )

        if self.password and self.auth_provider != AuthProviderEnum.local.value:
            raise ValueError(
                "O provedor de autenticação informado não é válido para a autenticação por senha!"
            )

        match self.auth_provider:
            case AuthProviderEnum.google.value:
                jwt_decoded = decode_google_jwt_credential(self.bearer_token)
                self.name = jwt_decoded.get("name")
                self.email = jwt_decoded.get("email")
                self.picture_url = HttpUrl(jwt_decoded.get("picture"))
                self.external_provider_id = jwt_decoded.get("sub")

            case AuthProviderEnum.temp.value:
                self.name = self.name or "Temp User"
                self.email = self.email or fake.email(domain="temp.com")

        return self

    def generate_password_hash(self) -> str:
        return pwd_context.hash(self.password.get_secret_value())

    def verify_password(self, password_hash: str) -> bool:
        return pwd_context.verify(self.password.get_secret_value(), password_hash)

    @model_serializer
    def _serialize_model(self):
        """Custom serializer, implementa exclude_unset"""
        dump_data = {}
        if self.name is not None:
            dump_data["name"] = self.name
        if self.email is not None:
            dump_data["email"] = self.email
        if self.picture_url is not None:
            dump_data["picture_url"] = self.picture_url.unicode_string()
        if self.password is not None:
            dump_data["password_hash"] = self.generate_password_hash()
        if self.external_provider_id is not None:
            dump_data["external_provider_id"] = self.external_provider_id
        if self.auth_provider is not None:
            dump_data["auth_provider"] = self.auth_provider
        return dump_data


class UserUpdate(UserBase):
    name: Optional[str] = None
    email: Optional[str] = None
    picture_url: Optional[HttpUrl] = None
    auth_provider: Optional[AuthProviderEnum] = None
    password: Optional[SecretStr] = None
    external_provider_id: Optional[str] = None

    class Config:
        use_enum_values = True

    @field_validator("password", mode="after")
    @classmethod
    def handle_password_validation(cls, v: SecretStr) -> SecretStr:
        if v:
            return validate_password(v)

    @model_validator(mode="after")
    def validate_user(self):
        if any([self.password, self.external_provider_id]) and not self.auth_provider:
            raise ValueError(
                "O provedor de autenticação é obrigatório para atualizar as credenciais do usuário!"
            )

        return self

    @model_serializer
    def _serialize_model(self):
        """Custom serializer, implementa exclude_unset"""
        dump_data = {}
        if self.name is not None:
            dump_data["name"] = self.name
        if self.email is not None:
            dump_data["email"] = self.email
        if self.picture_url is not None:
            dump_data["picture_url"] = self.picture_url.unicode_string()
        if self.password is not None:
            dump_data["password_hash"] = self.generate_password_hash()
        if self.external_provider_id is not None:
            dump_data["external_provider_id"] = self.external_provider_id
        if self.auth_provider is not None:
            dump_data["auth_provider"] = self.auth_provider
        return dump_data
