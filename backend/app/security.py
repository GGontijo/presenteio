import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import ExpiredSignatureError, InvalidTokenError, PyJWKClient

GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
SECRET_KEY = os.environ.get("SECRET_KEY", "welcome-to-the-jungle")

if not SECRET_KEY:
    raise Exception("Missing SECRET_KEY environment variable")

security = HTTPBearer()


def create_jwt_session(jwt_payload):
    """
    Gera um token JWT com os dados principais do usuário.
    """
    jwt_payload = {
        "sub": str(jwt_payload.id),
        "email": jwt_payload.email,
        "name": jwt_payload.name,
        "auth_provider": jwt_payload.auth_provider,
        "picture_url": jwt_payload.picture_url,
        "role": jwt_payload.role,
        "iat": datetime.now(tz=timezone.utc),
        "exp": datetime.now(tz=timezone.utc) + timedelta(days=1),
    }
    token = jwt.encode(jwt_payload, SECRET_KEY, algorithm="HS256")
    return token


def validate_jwt(
    token: str, secret: str = SECRET_KEY, audience: str = None, alg: str = "HS256"
) -> dict:
    """
    Decodifica e verifica se o JWT fornecido é válido.
    """
    try:
        # Decodificar o token usando a chave pública do Google
        payload = jwt.decode(
            token,
            secret,
            algorithms=alg,
            audience=audience,
            options={"verify_exp": True},
        )

        return payload

    except (ExpiredSignatureError, InvalidTokenError) as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")


def decode_google_jwt_credential(token: str):
    """
    Dependência de validação do JWT fornecido no header de autorização.
    """

    jwks_client = PyJWKClient(uri=GOOGLE_CERTS_URL)
    signing_key = jwks_client.get_signing_key_from_jwt(token)

    return validate_jwt(
        token=token, secret=signing_key.key, audience=GOOGLE_CLIENT_ID, alg="RS256"
    )


def jwt_session(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Dependência de validação do JWT fornecido no header de autorização.
    """
    token = credentials.credentials

    return validate_jwt(token=token, secret=SECRET_KEY)
