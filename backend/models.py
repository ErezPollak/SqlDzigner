from sqlalchemy import Column, Integer, String, DateTime, func, ForeignKey, Enum, UniqueConstraint
from database import Base

import uuid
from sqlalchemy.dialects.postgresql import UUID


SQL_TYPES = (
    "INT",
    "INTEGER",
    "SMALLINT",
    "BIGINT",
    "DECIMAL",
    "NUMERIC",
    "FLOAT",
    "REAL",
    "DOUBLE",
    "CHAR",
    "VARCHAR",
    "TEXT",
    "DATE",
    "TIME",
    "TIMESTAMP",
    "DATETIME",
    "INTERVAL",
    "BOOLEAN",
    "BINARY",
    "VARBINARY",
    "BLOB",
    "UUID",
    "JSON",
    "JSONB",
    "ENUM",
    "ARRAY"
)

SQL_RELATION_TYPES = (
    "OO",
    "OM",
    "MM"
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Schema(Base):
    __tablename__ = "schemas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner = Column(Integer,ForeignKey("users.id", ondelete="CASCADE"),nullable=False)
    name = Column(String,nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Table(Base):
    __tablename__ = "tables"         

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String,nullable=False)
    schema = Column(UUID(as_uuid=True),ForeignKey("schemas.id", ondelete="CASCADE"),nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('schema', 'name', name='uniq table name per schema'),
    )

class Field(Base):
    __tablename__= "fields"         

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    table = Column(UUID(as_uuid=True),ForeignKey("tables.id", ondelete="CASCADE"),nullable=False)
    name = Column(String, nullable=False)
    type =  Column(Enum(*SQL_TYPES, name='SQL_TYPES'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__= (
        UniqueConstraint('table', 'name', name='uniq field name per table'),
    )

class Relation(Base):
    __tablename__= "relations"         

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    value_from = Column(UUID(as_uuid=True),ForeignKey("fields.id", ondelete="CASCADE"),nullable=False)
    value_to = Column(UUID(as_uuid=True),ForeignKey("fields.id", ondelete="CASCADE"),nullable=False)
    type =  Column(Enum(*SQL_RELATION_TYPES, name='SQL_RELATION_TYPES'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('value_from', 'value_to', name='only one relation between two fields'),
    )




