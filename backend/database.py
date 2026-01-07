from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# On cherche la variable d'environnement, sinon on utilise SQLite par défaut
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# Le paramètre check_same_thread est spécifique et obligatoire pour SQLite + FastAPI
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Fonction pour obtenir la session de base de données (le DAL l'utilise)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()