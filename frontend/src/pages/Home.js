import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';

const SQL_RELATION_TYPES = ["OO", "OM", "MM"];

function SchemaManager({ userId }) {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const [schemas, setSchemas] = useState([]);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [fields, setFields] = useState([]);
  const [schemaFields, setSchemaFields] = useState([]);
  const [schemaFieldsLoaded, setSchemaFieldsLoaded] = useState(false);
  const [relations, setRelations] = useState([]);
  const [fieldsLoaded, setFieldsLoaded] = useState(false);
  const [newSchemaName, setNewSchemaName] = useState("");
  const [editingSchemaId, setEditingSchemaId] = useState(null);
  const [editingSchemaName, setEditingSchemaName] = useState("");
  const [newTableName, setNewTableName] = useState("");
  const [editingTableId, setEditingTableId] = useState(null);
  const [editingTableName, setEditingTableName] = useState("");
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("VARCHAR");
  const [status, setStatus] = useState(null);
  const [creatingSchema, setCreatingSchema] = useState(false);
  const [creatingTable, setCreatingTable] = useState(false);
  const [creatingField, setCreatingField] = useState(false);
  const [addingRelation, setAddingRelation] = useState(false);

  const [relationDialogOpen, setRelationDialogOpen] = useState(false);
  const [relationFromField, setRelationFromField] = useState(null);
  const [relationToField, setRelationToField] = useState(null);
  const [relationType, setRelationType] = useState(SQL_RELATION_TYPES[0]);

  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_BASE}/schemas/owner/${userId}`)
      .then((res) => setSchemas(res.data))
      .catch((err) => console.error(err));
  }, [userId, API_BASE]);

  useEffect(() => {
    if (!selectedSchema) return;
    setSelectedTable(null);
    setFields([]);
    setRelations([]);
    axios.get(`${API_BASE}/tables/schema/${selectedSchema.id}`)
      .then((res) => setTables(res.data))
      .catch(() => setTables([]));
  }, [selectedSchema, API_BASE]);

  useEffect(() => {
    if (!selectedTable) return;
    setFieldsLoaded(false);
    axios.get(`${API_BASE}/fields/table/${selectedTable.id}`)
      .then((res) => {
        setFields(res.data || []);
        setFieldsLoaded(true);
      })
      .catch(() => {
        setFields([]);
        setFieldsLoaded(true);
      });
  }, [selectedTable, API_BASE]);

  const createSchema = () => {
    if (!newSchemaName.trim()) return;
    setCreatingSchema(true);
    axios.post(`${API_BASE}/schemas/`, { owner: Number(userId), name: newSchemaName.trim() })
      .then((res) => setSchemas([...schemas, res.data]))
      .finally(() => {
        setCreatingSchema(false);
        setNewSchemaName("");
      });
  };

  const createTable = () => {
    if (!selectedSchema || !newTableName.trim()) return;
    setCreatingTable(true);
    axios.post(`${API_BASE}/tables/`, { schema: selectedSchema.id, name: newTableName.trim() })
      .then((res) => setTables([...tables, res.data]))
      .finally(() => {
        setCreatingTable(false);
        setNewTableName("");
      });
  };

  const createField = () => {
    if (!selectedTable || !newFieldName.trim()) return;
    setCreatingField(true);
    axios.post(`${API_BASE}/fields/`, {
      table: selectedTable.id,
      name: newFieldName.trim(),
      type: newFieldType,
    })
    .then((res) => setFields([...fields, res.data]))
    .finally(() => {
      setCreatingField(false);
      setNewFieldName("");
    });
  };

  const deleteSchema = (id) => axios.delete(`${API_BASE}/schemas/${id}`).then(() => setSchemas(schemas.filter(s => s.id !== id)));

  return (
    <div className="schema-manager">
      <h2>My Schemas</h2>
      <input value={newSchemaName} onChange={(e) => setNewSchemaName(e.target.value)} placeholder="New Schema" />
      <button onClick={createSchema}>Create</button>
      <ul>
        {schemas.map(s => (
          <li key={s.id}>
            {s.name} 
            <button onClick={() => setSelectedSchema(s)}>View</button>
            <button onClick={() => deleteSchema(s.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {selectedSchema && (
        <div className="tables-section">
          <h3>Tables in {selectedSchema.name}</h3>
          <input value={newTableName} onChange={(e) => setNewTableName(e.target.value)} placeholder="New Table" />
          <button onClick={createTable}>Add Table</button>
          <ul>
            {tables.map(t => (
              <li key={t.id}>
                {t.name} <button onClick={() => setSelectedTable(t)}>Edit Fields</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedTable && (
        <div className="fields-section">
          <h3>Fields in {selectedTable.name}</h3>
          <input value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} placeholder="Field Name" />
          <button onClick={createField}>Add Field</button>
          <ul>
            {fields.map(f => <li key={f.id}>{f.name} ({f.type})</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Home({ onOpenProfile, onLogout, userId }) {
  return (
    <div className="app-shell">
      <header className="app-header" style={{display:'flex', justifyContent:'space-between', padding:'10px', background:'#222', color:'white'}}>
        <div className="brand">SQL Dezigner</div>
        <div className="header-actions">
          <button onClick={onOpenProfile}>Profile</button>
          <button onClick={onLogout}>Log out</button>
        </div>
      </header>
      <main className="home-main" style={{padding:'20px'}}>
        <SchemaManager userId={userId} />
      </main>
    </div>
  );
}