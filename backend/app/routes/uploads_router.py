from pathlib import Path
import uuid
from botocore.exceptions import NoCredentialsError
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from app.security import jwt_session
from app.services.s3_bucket import s3_client
from app.services.s3_bucket import AWS_BUCKET_NAME, AWS_REGION

uploads_router = APIRouter(
    prefix="/uploads",
    tags=["uploads"],
    responses={404: {"description": "Not found"}},
)


@uploads_router.post("")
async def upload_file(
    file: UploadFile = File(...), user_auth_data: dict = Depends(jwt_session)
):
    try:
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

    except NoCredentialsError:
        raise HTTPException(status_code=401, detail="Credenciais AWS inválidas")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload: {str(e)}")
