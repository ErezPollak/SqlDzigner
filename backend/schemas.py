from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: str = None
    email: EmailStr = None
    phone: str = None

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: str
    password: str