from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional
from models import SQL_TYPES, SQL_RELATION_TYPES
from typing import Literal

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



class SchemaCreate(BaseModel):
    owner: int
    name: str

class SchemaRead(SchemaCreate):
    id: UUID4

class TablesCreate(BaseModel):
    schema: UUID4
    name: str

class TablesRead(TablesCreate):
    id: UUID4

class FieldCreate(BaseModel):
    table: UUID4
    name: str
    type: Literal[*SQL_TYPES]

class FieldRead(FieldCreate):
    id: UUID4

class RelationCreate(BaseModel):
    value_from: UUID4
    value_to: UUID4
    type: Literal[*SQL_RELATION_TYPES]

class RelationRead(RelationCreate):
    id: UUID4