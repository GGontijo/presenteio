import logging
import os
from contextlib import asynccontextmanager

from app.database import load_up_tables
from app.routes.domains_router import domain_router
from app.routes.items_router import item_router
from app.routes.pages_router import page_item_router, page_router
from app.routes.uploads_router import uploads_router
from app.routes.users_router import users_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# TODO: Obter User ID do token
# TODO: Melhorar logging em geral, usar repr etc.
# TODO: Avaliar implementar rotas de register e login e criação de jwt token próprio para autenticação
# (verificar post em users e avaliar gerar/retornar o token próprio por lá)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # starts up development environment
    logging.info(f"Starting with {os.getenv('ENV'), 'development'} environment...")
    match os.getenv("ENV"):
        case "development":
            load_up_tables()
        case "testing":
            load_up_tables()
        case "production":
            pass
        case _:
            load_up_tables()
    yield


origins = ["http://localhost", "http://localhost:5173"]

app = FastAPI(
    lifespan=lifespan,
    title="PresenteioApp",
    version="1.0.0",
    root_path="/api" if os.getenv("ENV") == "production" else "",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Authorization"],
)


@app.get("/")
def read_root():
    return {"status": "ok"}


app.include_router(uploads_router)
app.include_router(domain_router)
app.include_router(users_router)
app.include_router(page_router)
app.include_router(item_router)
app.include_router(page_item_router)
