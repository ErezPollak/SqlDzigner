from sqlalchemy.exc import IntegrityError
import psycopg2
from fastapi import FastAPI, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import update
from passlib.context import CryptContext
from fastapi import Header
import hashlib
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

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
        db.rollback()
        if isinstance(e.orig, psycopg2.errors.UniqueViolation):
            constraint = e.orig.diag.constraint_name
            if constraint == "users_email_key":
                raise HTTPException(status_code=400, detail="Email already exists.")
            elif constraint == "users_username_key":
                raise HTTPException(status_code=400, detail="Username already exists.")
            else:
                raise HTTPException(status_code=400, detail="Duplicate value found.")
        else:
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
        db.rollback()
        if isinstance(e.orig, psycopg2.errors.UniqueViolation):
            constraint = e.orig.diag.constraint_name
            if constraint == "users_email_key":
                raise HTTPException(status_code=400, detail="Email already exists.")
            elif constraint == "users_username_key":
                raise HTTPException(status_code=400, detail="Username already exists.")
            else:
                raise HTTPException(status_code=400, detail="Duplicate value found.")
        else:
            raise HTTPException(status_code=400, detail="Database integrity error.")

    db.commit()
    db.refresh(db_user)
    return db_user


@app.delete("/delete-user/{user_id}", status_code=204)
def delete_user(user_id: int = Path(..., description="ID of the user to delete"), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
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


@app.get("/schemas/{schema_id}/dsd", response_class=PlainTextResponse)
def get_dsd_diagram(schema_id: schemas.UUID4, db: Session = Depends(get_db)):
    """
    Génère un diagramme DSD (Data Structure Diagram) en format Mermaid
    montrant les flux de données et relations entre tables
    """
    schema = db.query(Schema).filter(Schema.id == schema_id).first()
    if not schema:
        raise HTTPException(status_code=404, detail="Schema not found")
    
    # Charger les tables du schéma
    tables = db.query(Table).filter(Table.schema == schema_id).all()
    if not tables:
        return "sequenceDiagram\n    Note over Schema: No tables in this schema"
    
    table_map = {t.id: t for t in tables}
    
    # Charger les champs
    field_rows = db.query(Field).filter(Field.table.in_([t.id for t in tables])).all()
    fields_by_table = {}
    field_map = {f.id: f for f in field_rows}
    for f in field_rows:
        fields_by_table.setdefault(f.table, []).append(f)
    
    # Charger les relations
    relations = db.query(Relation).all()
    relations = [r for r in relations 
                if r.value_from in field_map and r.value_to in field_map]
    
    def clean_name(n: str) -> str:
        """Nettoie les noms pour Mermaid"""
        if not n:
            return 'Unknown'
        s = str(n).replace(' ', '_').replace('-', '_').replace('"', '').replace("'", '')
        if s and s[0].isdigit():
            s = 'T_' + s
        return s
    
    # Générer le diagramme de séquence DSD
    lines = ["sequenceDiagram"]
    
    # Ajouter un titre
    lines.append(f"    title Data Structure: {clean_name(schema.name)}")
    lines.append("")
    
    # Déclarer les participants (tables)
    for t in tables:
        tn = clean_name(t.name)
        field_count = len(fields_by_table.get(t.id, []))
        lines.append(f"    participant {tn} as {t.name}<br/>({field_count} fields)")
    
    lines.append("")
    
    # Si pas de relations, afficher une note
    if not relations:
        lines.append("    Note over " + ",".join([clean_name(t.name) for t in tables[:2]]) + ": No relations defined")
    else:
        # Grouper les relations par type
        for rel in relations:
            from_field = field_map.get(rel.value_from)
            to_field = field_map.get(rel.value_to)
            
            if not from_field or not to_field:
                continue
            
            from_table = table_map.get(from_field.table)
            to_table = table_map.get(to_field.table)
            
            if not from_table or not to_table:
                continue
            
            from_name = clean_name(from_table.name)
            to_name = clean_name(to_table.name)
            
            # Déterminer le type de flèche selon le type de relation
            arrow = "->>"  # par défaut
            if rel.type == "OO":
                arrow = "->>"
                label = f"{from_field.name} (1:1) {to_field.name}"
            elif rel.type == "OM":
                arrow = "->>"
                label = f"{from_field.name} (1:N) {to_field.name}"
            elif rel.type == "MM":
                arrow = "->>"
                label = f"{from_field.name} (N:N) {to_field.name}"
            else:
                label = f"{from_field.name} → {to_field.name}"
            
            lines.append(f"    {from_name}{arrow}{to_name}: {label}")
    
    # Ajouter des notes sur les champs de chaque table
    lines.append("")
    for t in tables:
        tn = clean_name(t.name)
        fields = fields_by_table.get(t.id, [])
        if fields:
            field_list = "<br/>".join([f"• {f.name} ({f.type})" for f in fields[:5]])
            if len(fields) > 5:
                field_list += f"<br/>• ... and {len(fields) - 5} more"
            lines.append(f"    Note right of {tn}: Fields:<br/>{field_list}")
    
    return "\n".join(lines)


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


@app.get("/fields/schema/{schema_id}", response_model=list[FieldRead])
def read_fields_by_schema(schema_id: UUID4, db: Session = Depends(get_db)):
    table_ids = db.query(Table.id).filter(Table.schema == schema_id).all()
    if not table_ids:
        raise HTTPException(status_code=404, detail="Schema has no tables or does not exist")
    
    table_ids = [tid[0] for tid in table_ids]
    fields = db.query(Field).filter(Field.table.in_(table_ids)).all()
    if not fields:
        raise HTTPException(status_code=404, detail="No fields found for this schema")
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