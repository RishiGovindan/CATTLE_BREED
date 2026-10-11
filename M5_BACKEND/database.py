import os

from dotenv import load_dotenv
from sqlmodel import create_engine
from sqlmodel import SQLModel
from models import User, Profile, Listing, SavedListing, RecognitionHistory


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in .env")

engine = create_engine(DATABASE_URL, echo=True)
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)