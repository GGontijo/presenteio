import logging
import os

import logfire
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

ENV = os.environ.get("ENV", "development")
DB_USERNAME = os.environ.get("POSTGRES_USER")
DB_PASSWORD = os.environ.get("POSTGRES_PASSWORD")
DB_NAME = os.environ.get("POSTGRES_DB")
DB_HOST = os.environ.get("POSTGRES_HOST")

db_ready = False

Base = declarative_base()

database_url = f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
engine = create_engine(database_url)

# TODO: Set logging_config.yml to display debug level on terminal
match ENV:
    case "development":
        logging.basicConfig(level=logging.DEBUG)
        logging.debug("Starting local development database in memory...")
        database_url = "sqlite:///development.db"
        engine = create_engine(
            database_url, connect_args={"check_same_thread": False}, echo=True
        )
    case "testing":
        logging.basicConfig(level=logging.DEBUG)
        logging.debug("Starting local testing database in memory...")
        database_url = "sqlite:///testing.db"
        engine = create_engine(
            database_url, connect_args={"check_same_thread": False}, echo=True
        )
    case "production":
        logging.debug("Using production database!")
        logging.info("Configuring logfire...")
        logfire.configure()
        logging.info("Adding sqlalchemy instrumentation into logfire...")
        logfire.instrument_sqlalchemy(engine=engine)
    case _:
        raise Exception(
            f"Unknown environment {ENV}. Please set ENV to development, testing or production."
        )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# TODO: Async support (asyncpg)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def load_up_tables():
    """Starts up a fresh database with all declared tables for development purpose"""
    global db_ready
    if db_ready:
        logging.info("All tables are ready!")
        return
    if ENV == "testing":
        logging.warning("Deleting all tables for testing...")
        Base.metadata.drop_all(bind=engine)
    logging.debug(f"Creating all tables in {database_url}...")
    Base.metadata.create_all(bind=engine)
    db_ready = True
