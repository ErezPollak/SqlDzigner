from dotenv import load_dotenv

load_dotenv()
from sqlalchemy.exc import IntegrityError
import psycopg2
from fastapi import FastAPI, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import update
from passlib.context import CryptContext
from fastapi import Header
import hashlib
from fastapi.middleware.cors import CORSMiddleware

import models
import schemas
import database

from fastapi import FastAPI, HTTPException, Depends, Path
from sqlalchemy.orm import Session
from models import User

def get_md5(s: str) -> str:
    return hashlib.md5(s.encode("utf-8")).hexdigest()

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Registration
@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        (models.User.username == user.username) | 
        (models.User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    hashed_password = get_md5(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        phone=user.phone
    )
    
    try:
        db.add(new_user)
    except IntegrityError as e:
        db.rollback()  # important to rollback session
        # Check if it's a unique violation
        if isinstance(e.orig, psycopg2.errors.UniqueViolation):
            # You can inspect e.orig.diag for the constraint name
            constraint = e.orig.diag.constraint_name
            if constraint == "users_email_key":  # your DB constraint name
                raise HTTPException(status_code=400, detail="Email already exists.")
            elif constraint == "users_username_key":
                raise HTTPException(status_code=400, detail="Username already exists.")
            else:
                raise HTTPException(status_code=400, detail="Duplicate value found.")
        else:
            # re-raise other integrity errors
            raise HTTPException(status_code=400, detail="Database integrity error.")
    
    db.commit()
    db.refresh(new_user)
    return new_user

# Login
@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not get_md5(user.password) == db_user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "user": db_user}


@app.put("/update-user/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int = Path(..., description="ID of the user to update"),
    user_update: schemas.UserUpdate = Body(...),
    db: Session = Depends(get_db)
):
    # Fetch the user
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = {}
    if user_update.full_name and user_update.full_name.strip():
        update_data["full_name"] = user_update.full_name.strip()
    if user_update.email and user_update.email.strip():
        update_data["email"] = user_update.email.strip()
    if user_update.phone and user_update.phone.strip():
        update_data["phone"] = user_update.phone.strip()

    stmt = (
        update(User)
        .where(User.id == user_id)
        .values(**update_data)
        .execution_options(synchronize_session="fetch")
    )


    try:
        db.execute(stmt)
    except IntegrityError as e:
        db.rollback()  # important to rollback session
        # Check if it's a unique violation
        if isinstance(e.orig, psycopg2.errors.UniqueViolation):
            # You can inspect e.orig.diag for the constraint name
            constraint = e.orig.diag.constraint_name
            if constraint == "users_email_key":  # your DB constraint name
                raise HTTPException(status_code=400, detail="Email already exists.")
            elif constraint == "users_username_key":
                raise HTTPException(status_code=400, detail="Username already exists.")
            else:
                raise HTTPException(status_code=400, detail="Duplicate value found.")
        else:
            # re-raise other integrity errors
            raise HTTPException(status_code=400, detail="Database integrity error.")

    db.commit()
    db.refresh(db_user)

    return db_user


@app.delete("/delete-user/{user_id}", status_code=204)
def delete_user(user_id: int = Path(..., description="ID of the user to delete"), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    # delete user
    db.delete(db_user)
    db.commit()
    return
