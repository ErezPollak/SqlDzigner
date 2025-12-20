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
from schemas import *
import database

from fastapi import FastAPI, HTTPException, Depends, Path
from sqlalchemy.orm import Session
from models import User, Schema, Table, Field, Relation

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



################ SCHEMAS #######################


@app.post("/schemas/", response_model=schemas.SchemaRead)
def create_schema(schema: schemas.SchemaCreate, db: Session = Depends(get_db)):
    db_schema = Schema(**schema.dict())
    db.add(db_schema)
    db.commit()
    db.refresh(db_schema)
    return db_schema


@app.get("/schemas/", response_model=list[schemas.SchemaRead])
def read_schemas(db: Session = Depends(get_db)):
    return db.query(Schema).all()


@app.get("/schemas/owner/{owner_id}", response_model=list[schemas.SchemaRead])
def read_schemas_by_owner(owner_id: int, db: Session = Depends(get_db)):
    schemas = db.query(Schema).filter(Schema.owner == owner_id).all()
    if not schemas:
        raise HTTPException(status_code=404, detail="No schemas found for this owner")
    return schemas


@app.get("/schemas/{schema_id}", response_model=schemas.SchemaRead)
def read_schema(schema_id: schemas.UUID4, db: Session = Depends(get_db)):
    schema = db.query(Schema).filter(Schema.id == schema_id).first()
    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found")
    return schema


@app.put("/schemas/{schema_id}", response_model=schemas.SchemaRead)
def update_schema(schema_id: schemas.UUID4, schema_update: schemas.SchemaCreate, db: Session = Depends(get_db)):
    schema = db.query(Schema).filter(Schema.id == schema_id).first()
    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found")
    for key, value in schema_update.dict().items():
        setattr(schema, key, value)
    db.commit()
    db.refresh(schema)
    return schema


@app.delete("/schemas/{schema_id}")
def delete_schema(schema_id: schemas.UUID4, db: Session = Depends(get_db)):
    schema = db.query(Schema).filter(Schema.id == schema_id).first()
    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found")
    db.delete(schema)
    db.commit()
    return {"detail": "Schema deleted"}


################ TABLES #######################


@app.post("/tables/", response_model=TablesRead)
def create_table(table: TablesCreate, db: Session = Depends(get_db)):
    db_table = Table(**table.dict())
    db.add(db_table)
    db.commit()
    db.refresh(db_table)
    return db_table


@app.get("/tables/", response_model=list[TablesRead])
def read_tables(db: Session = Depends(get_db)):
    return db.query(Table).all()


@app.get("/tables/{table_id}", response_model=TablesRead)
def read_table(table_id: UUID4, db: Session = Depends(get_db)):
    table = db.query(Table).filter(Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return table


@app.get("/tables/schema/{schema_id}", response_model=list[TablesRead])
def read_tables_by_schema(schema_id: UUID4, db: Session = Depends(get_db)):
    tables = db.query(Table).filter(Table.schema == schema_id).all()
    if not tables:
        raise HTTPException(status_code=404, detail="No tables found for this schema")
    return tables


@app.put("/tables/{table_id}", response_model=TablesRead)
def update_table(table_id: UUID4, table_update: TablesCreate, db: Session = Depends(get_db)):
    table = db.query(Table).filter(Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    for key, value in table_update.dict().items():
        setattr(table, key, value)
    db.commit()
    db.refresh(table)
    return table


@app.delete("/tables/{table_id}")
def delete_table(table_id: UUID4, db: Session = Depends(get_db)):
    table = db.query(Table).filter(Table.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    db.delete(table)
    db.commit()
    return {"detail": "Table deleted"}



################ FIELDS #######################

@app.post("/fields/", response_model=FieldRead)
def create_field(field: FieldCreate, db: Session = Depends(get_db)):
    db_field = Field(**field.dict())
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    return db_field


@app.get("/fields/", response_model=list[FieldRead])
def read_fields(db: Session = Depends(get_db)):
    return db.query(Field).all()


@app.get("/fields/{field_id}", response_model=FieldRead)
def read_field(field_id: UUID4, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field


@app.get("/fields/table/{table_id}", response_model=list[FieldRead])
def read_fields_by_table(table_id: UUID4, db: Session = Depends(get_db)):
    fields = db.query(Field).filter(Field.table == table_id).all()
    if not fields:
        raise HTTPException(status_code=404, detail="No fields found for this table")
    return fields
    


@app.put("/fields/{field_id}", response_model=FieldRead)
def update_field(field_id: UUID4, field_update: FieldCreate, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    for key, value in field_update.dict().items():
        setattr(field, key, value)
    db.commit()
    db.refresh(field)
    return field


@app.delete("/fields/{field_id}")
def delete_field(field_id: UUID4, db: Session = Depends(get_db)):
    field = db.query(Field).filter(Field.id == field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    db.delete(field)
    db.commit()
    return {"detail": "Field deleted"}

################ RELATIONS #######################


@app.post("/relations/", response_model=RelationRead)
def create_relation(relation: RelationCreate, db: Session = Depends(get_db)):
    db_relation = Relation(**relation.dict())
    db.add(db_relation)
    db.commit()
    db.refresh(db_relation)
    return db_relation

@app.get("/relations/", response_model=list[RelationRead])
def read_relations(db: Session = Depends(get_db)):
    return db.query(Relation).all()


@app.get("/relations/{relation_id}", response_model=RelationRead)
def read_relation(relation_id: UUID4, db: Session = Depends(get_db)):
    relation = db.query(Relation).filter(Relation.id == relation_id).first()
    if not relation:
        raise HTTPException(status_code=404, detail="Relation not found")
    return relation


@app.get("/relations/from/{field_id}", response_model=list[RelationRead])
def read_relations_by_source(field_id: UUID4, db: Session = Depends(get_db)):
    relations = db.query(Relation).filter(Relation.value_from == field_id).all()
    if not relations:
        raise HTTPException(status_code=404, detail="No relations found from this field")
    return relations

@app.get("/relations/to/{field_id}", response_model=list[RelationRead])
def read_relations_by_target(field_id: UUID4, db: Session = Depends(get_db)):
    relations = db.query(Relation).filter(Relation.value_to == field_id).all()
    if not relations:
        raise HTTPException(status_code=404, detail="No relations found to this field")
    return relations


@app.put("/relations/{relation_id}", response_model=RelationRead)
def update_relation(relation_id: UUID4, relation_update: RelationCreate, db: Session = Depends(get_db)):
    relation = db.query(Relation).filter(Relation.id == relation_id).first()
    if not relation:
        raise HTTPException(status_code=404, detail="Relation not found")
    for key, value in relation_update.dict().items():
        setattr(relation, key, value)
    db.commit()
    db.refresh(relation)
    return relation
    

@app.delete("/relations/{relation_id}")
def delete_relation(relation_id: UUID4, db: Session = Depends(get_db)):
    relation = db.query(Relation).filter(Relation.id == relation_id).first()
    if not relation:
        raise HTTPException(status_code=404, detail="Relation not found")
    db.delete(relation)
    db.commit()
    return {"detail": "Relation deleted"}