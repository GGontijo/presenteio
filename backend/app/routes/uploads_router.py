import logging
import uuid
from pathlib import Path

from app.database import get_db
from app.models.users_model import UsersTable
from app.security import jwt_session
from app.services.s3_bucket import AWS_BUCKET_NAME, AWS_REGION, s3_client
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

uploads_router = APIRouter(
    prefix="/uploads",
    tags=["uploads"],
    responses={404: {"description": "Not found"}},
)


@uploads_router.post("")
async def upload_file(
    file: UploadFile = File(...),
    user_auth_data: dict = Depends(jwt_session),
    db=Depends(get_db),
):
    try:
        # Verifica se o usuário está autenticado
        user_db = (
            db.query(UsersTable)
            .filter(UsersTable.id == user_auth_data["user_id"])
            .first()
        )
        if not user_db:
            raise HTTPException(status_code=401, detail="Usuário não autenticado")

        file_content = await file.read()

        # Limitando o tamanho em no máximo em 10 MB
        max_size = 10 * 1024 * 1024

        if len(file_content) > max_size:
            raise HTTPException(
                status_code=400,
                detail="O arquivo excede o tamanho máximo permitido de 10 MB.",
            )

        file_extension = Path(file.filename).suffix

        if file_extension not in [".jpg", ".jpeg", ".png", ".webp", ".jfif"]:
            raise HTTPException(
                status_code=400,
                detail="Extensão de arquivo inválida. Apenas imagens PNG e JPG sao permitidas.",
            )

        random_name = uuid.uuid4().hex

        new_file_name = f"{random_name}{file_extension}"

        # Upload para o bucket S3
        s3_client.put_object(
            Bucket=AWS_BUCKET_NAME,
            Key=new_file_name,
            Body=file_content,
            ContentType=file.content_type,
        )

        # URL pública do arquivo
        file_url = (
            f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{new_file_name}"
        )

        return {"file_url": file_url}

    except Exception as e:
        logging.error(f"Erro ao fazer upload do arquivo: {e}")
        raise HTTPException(
            status_code=500,
            detail="Houve um erro inesperado ao fazer o upload do arquivo",
        )
