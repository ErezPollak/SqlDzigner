import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import mermaid from 'mermaid';

const SQL_RELATION_TYPES = ["OO", "OM", "MM"];
const ENABLE_DSD = true;

function SchemaManager({ userId }) {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // --- TES ÉTATS D'ORIGINE ---
  const [schemas, setSchemas] = useState([]);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [fields, setFields] = useState([]);
  const [schemaFields, setSchemaFields] = useState([]);
  const [schemaFieldsLoaded, setSchemaFieldsLoaded] = useState(false);
  const [relations, setRelations] = useState([]);
  const [dsdSvg, setDsdSvg] = useState('');
  const [dsdLoading, setDsdLoading] = useState(false);
  const [showDsd, setShowDsd] = useState(false);
  const [dsdError, setDsdError] = useState(null);
  
  const [fieldsLoaded, setFieldsLoaded] = useState(false);
  const [newSchemaName, setNewSchemaName] = useState("");
  const [newTableName, setNewTableName] = useState("");
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

  // --- TES HELPERS D'ORIGINE ---
  const getTableById = (tableId) => {
    return tables.find((t) => t.id === tableId) || null;
  };

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- TES EFFECTS D'ORIGINE (STRICTEMENT IDENTIQUES) ---
  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_BASE}/schemas/owner/${userId}`)
      .then((res) => setSchemas(res.data))
      .catch((err) => console.error(err));
  }, [userId, API_BASE]);

  useEffect(() => {
    if (!selectedSchema) return;
    setDsdSvg('');
    setShowDsd(false);
    setSelectedTable(null);
    setFields([]);
    setRelations([]);
    axios.get(`${API_BASE}/tables/schema/${selectedSchema.id}`)
      .then((res) => {
        setTables(res.data);
        setStatus(null);
      })
      .catch((err) => {
        setTables([]);
        console.error(err);
      });
  }, [selectedSchema, API_BASE]);

  useEffect(() => {
    if (!selectedSchema) return;
    setSchemaFieldsLoaded(false);
    axios.get(`${API_BASE}/fields/schema/${selectedSchema.id}`)
      .then((res) => {
        setSchemaFields(res.data || []);
        setSchemaFieldsLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        setSchemaFields([]);
        setSchemaFieldsLoaded(true);
      });
  }, [selectedSchema, API_BASE]);

  useEffect(() => {
    if (!selectedTable) return;
    setFieldsLoaded(false);
    axios.get(`${API_BASE}/fields/table/${selectedTable.id}`)
      .then((res) => {
        setFields(res.data || []);
        setFieldsLoaded(true);
      })
      .catch((err) => {
        setFields([]);
        setFieldsLoaded(true);
      });
  }, [selectedTable, API_BASE]);

  useEffect(() => {
    if (!selectedSchema) return;
    axios.get(`${API_BASE}/relations/`)
      .then((res) => {
        setRelations(res.data);
      })
      .catch((err) => console.error(err));
  }, [selectedSchema, fields, API_BASE]);

  // --- CORRECTION MERMAID 10.9.5 (ASYNC) ---
  const fetchAndRenderDsd = async (schema) => {
    if (!schema) return;
    setDsdLoading(true);
    setDsdSvg('');
    setDsdError(null);
    try {
      const res = await axios.get(`${API_BASE}/schemas/${schema.id}/dsd`);
      const code = res.data;
      
      mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'default' });
      const nodeId = 'mermaidDsd' + uuidv4().slice(0, 8);
      
      const { svg } = await mermaid.render(nodeId, code);
      setDsdSvg(svg);
    } catch (err) {
      console.error('Failed to render DSD', err);
      setDsdError(err.message || String(err));
      setDsdSvg(`<div style="color:red; padding:10px;">Render Error: ${err.message}</div>`);
    } finally {
      setDsdLoading(false);
    }
  };

  const toggleDsd = () => {
    const next = !showDsd;
    setShowDsd(next);
    if (next && !dsdSvg) {
      fetchAndRenderDsd(selectedSchema);
    }
  };

  // --- TES FONCTIONS DE CRÉATION/SUPPRESSION (IDENTIQUES) ---
  const createSchema = () => {
    if (!newSchemaName.trim()) return;
    const ownerVal = userId ? Number(userId) : null;
    setCreatingSchema(true);
    axios.post(`${API_BASE}/schemas/`, { owner: ownerVal, name: newSchemaName.trim() })
      .then((res) => {
        setSchemas((prev) => [...prev, res.data]);
        setNewSchemaName("");
      })
      .catch((err) => setStatus({ type: 'error', text: 'Failed to create schema' }))
      .finally(() => setCreatingSchema(false));
  };

  const deleteSchema = (id) => {
    axios.delete(`${API_BASE}/schemas/${id}`)
      .then(() => {
        setSchemas(schemas.filter((s) => s.id !== id));
        if (selectedSchema?.id === id) setSelectedSchema(null);
      });
  };

  const createTable = () => {
    if (!newTableName.trim() || !selectedSchema) return;
    setCreatingTable(true);
    axios.post(`${API_BASE}/tables/`, { schema: selectedSchema.id, name: newTableName.trim() })
      .then((res) => {
        setTables((prev) => [...prev, res.data]);
        setNewTableName("");
      })
      .finally(() => setCreatingTable(false));
  };

  const deleteTable = (id) => {
    axios.delete(`${API_BASE}/tables/${id}`)
      .then(() => {
        setTables(tables.filter((t) => t.id !== id));
        if (selectedTable?.id === id) setSelectedTable(null);
      });
  };

  const createField = () => {
    if (!newFieldName.trim() || !selectedTable) return;
    setCreatingField(true);
    axios.post(`${API_BASE}/fields/`, {
      table: selectedTable.id,
      name: newFieldName.trim(),
      type: newFieldType,
    })
      .then((res) => {
        setFields((prev) => [...prev, res.data]);
        setSchemaFields((prev) => [...prev, res.data]);
        setNewFieldName("");
      })
      .finally(() => setCreatingField(false));
  };

  const deleteField = (id) => {
    axios.delete(`${API_BASE}/fields/${id}`)
      .then(() => setFields(fields.filter((f) => f.id !== id)));
  };

  const openRelationDialog = (fromField) => {
    setRelationFromField(fromField);
    setRelationDialogOpen(true);
  };

  const addRelation = () => {
    if (!relationFromField || !relationToField) return;
    setAddingRelation(true);
    axios.post(`${API_BASE}/relations/`, {
      value_from: relationFromField.id,
      value_to: relationToField.id,
      type: relationType,
    })
      .then((res) => {
        setRelations((prev) => [...prev, res.data]);
        setRelationDialogOpen(false);
        setRelationFromField(null);
        setRelationToField(null);
      })
      .finally(() => setAddingRelation(false));
  };

  // --- EXPORT (SIMULATION DOSSIER) ---
  const exportAll = async () => {
    if (!dsdSvg || !selectedSchema) return;

    // 1. Téléchargement du SVG (Image)
    const svgBlob = new Blob([dsdSvg], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const a1 = document.createElement('a');
    a1.href = svgUrl;
    a1.download = `${selectedSchema.name}_diagram.svg`;
    a1.click();
    URL.revokeObjectURL(svgUrl);

    // 2. Téléchargement du code source Mermaid (Fichier texte)
    try {
      const res = await axios.get(`${API_BASE}/schemas/${selectedSchema.id}/dsd`);
      const txtBlob = new Blob([res.data], { type: 'text/plain' });
      const txtUrl = URL.createObjectURL(txtBlob);
      const a2 = document.createElement('a');
      a2.href = txtUrl;
      a2.download = `${selectedSchema.name}_source_code.txt`;
      a2.click();
      URL.revokeObjectURL(txtUrl);
    } catch (err) {
      console.error("Erreur lors de la récupération du code source pour l'export", err);
    }
  };

  return (
    <div>
      <h2>My Schemas</h2>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input className="small-input" value={newSchemaName} placeholder="New Schema Name" onChange={(e) => setNewSchemaName(e.target.value)} />
        <button className="chip primary" onClick={createSchema} disabled={creatingSchema || !newSchemaName.trim()}>
          {creatingSchema ? 'Creating...' : 'Create Schema'}
        </button>
      </div>

      <ul className="schema-list">
        {schemas.map((schema) => (
          <li key={schema.id} className="schema-item">
            <div className="left">
              <strong>{schema.name}</strong>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={`chip ${selectedSchema?.id === schema.id ? 'ghost' : 'secondary'}`} onClick={() => setSelectedSchema(selectedSchema?.id === schema.id ? null : schema)}>
                {selectedSchema?.id === schema.id ? 'Close' : 'View'}
              </button>
              <button className="chip danger" onClick={() => deleteSchema(schema.id)}>Delete</button>
            </div>

            {selectedSchema?.id === schema.id && (
              <div style={{ marginTop: 20 }}>
                {/* BLOC BOUTONS DSD - DESIGN CHIP EXACT */}
                {ENABLE_DSD && (
                  <div style={{ marginBottom: 20, padding: "15px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.1)", display: 'flex', gap: 10 }}>
                    <button className="chip primary" onClick={toggleDsd}>{showDsd ? 'Hide Diagram' : 'Show Diagram'}</button>
                    {showDsd && (
                      <>
                        <button className="chip secondary" onClick={() => fetchAndRenderDsd(selectedSchema)} disabled={dsdLoading}>{dsdLoading ? '...' : 'Refresh'}</button>
                        <button className="chip ghost" onClick={exportAll} disabled={!dsdSvg}>Export Files</button>
                      </>
                    )}
                  </div>
                )}

                {/* RENDU DIAGRAMME - FOND BLANC POUR LISIBILITÉ */}
                {ENABLE_DSD && showDsd && (
                  <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', overflow: 'auto' }}>
                    {dsdLoading ? <div style={{ color: '#666' }}>Loading...</div> : 
                      dsdSvg ? <div dangerouslySetInnerHTML={{ __html: dsdSvg }} /> : <div style={{ color: '#999' }}>No diagram. Click Refresh.</div>}
                  </div>
                )}

                <div className="split-grid">
                  <div className="left-col">
                    <h3>Tables</h3>
                    <ul className="tables-list">
                      {tables.map((table) => (
                        <li key={table.id} className="table-item">
                          <div className="left"><strong>{table.name}</strong></div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className={`chip ${selectedTable?.id === table.id ? 'ghost' : 'secondary'}`} onClick={() => setSelectedTable(selectedTable?.id === table.id ? null : table)}>
                              {selectedTable?.id === table.id ? 'Close' : 'Edit'}
                            </button>
                            <button className="chip danger" onClick={() => deleteTable(table.id)}>Delete</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <input className="small-input" value={newTableName} placeholder="New Table Name" onChange={(e) => setNewTableName(e.target.value)} />
                      <button className="chip primary" onClick={createTable}>Add Table</button>
                    </div>
                  </div>

                  <div className="right-col">
                    {selectedTable ? (
                      <div>
                        <h3>Editing: {selectedTable.name}</h3>
                        <ul className="fields-list">
                          {fields.map((f) => (
                            <li key={f.id} className="field-item">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="field-name">{f.name}</span>
                                <span className="field-type">{f.type}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                <button className="chip secondary" onClick={() => deleteField(f.id)}>Delete</button>
                                <button className="chip ghost" onClick={() => openRelationDialog(f)}>Add Relation</button>
                              </div>
                              <div className="field-relations" style={{ fontSize: '0.85em', marginTop: 5, color: '#666' }}>
                                <strong>Relations:</strong>
                                {relations
                                  .filter((r) => r.value_from === f.id || r.value_to === f.id)
                                  .map((r) => {
                                    const isFrom = r.value_from === f.id;
                                    const targetFieldId = isFrom ? r.value_to : r.value_from;
                                    const targetField = schemaFields.find(sf => sf.id === targetFieldId);
                                    const targetTable = targetField ? getTableById(targetField.table) : null;
                                    return (
                                      <div key={r.id} className="relation-item">
                                        {isFrom ? '→ ' : '← '} {targetField ? `${targetField.name} (${targetTable?.name || '?'})` : 'Unknown'} [{r.type}]
                                      </div>
                                    );
                                  })}
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <input className="small-input" value={newFieldName} placeholder="Field Name" onChange={(e) => setNewFieldName(e.target.value)} />
                          <select className="small-input" value={newFieldType} onChange={(e) => setNewFieldType(e.target.value)}>
                            {["INT", "VARCHAR", "TEXT", "DATE", "BOOLEAN", "FLOAT"].map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <button className="chip primary" onClick={createField}>Add Field</button>
                        </div>
                      </div>
                    ) : <div className="muted">Select a table to edit its fields</div>}
                  </div>
                </div>

                {relationDialogOpen && (
                  <div className="modal-overlay" onClick={() => setRelationDialogOpen(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                      <h4>Add Relation from "{relationFromField?.name}"</h4>
                      <select className="modal-select" onChange={(e) => setRelationToField(schemaFields.find((f) => f.id === e.target.value))} value={relationToField?.id || ''}>
                        <option value="">Select field</option>
                        {schemaFields.filter((f) => f.id !== relationFromField?.id).map((f) => (
                          <option key={f.id} value={f.id}>{f.name} ({getTableById(f.table)?.name})</option>
                        ))}
                      </select>
                      <select className="modal-select" value={relationType} onChange={(e) => setRelationType(e.target.value)}>
                        {SQL_RELATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <div className="modal-actions">
                        <button className="chip primary" onClick={addRelation} disabled={!relationToField}>Add</button>
                        <button className="chip secondary" onClick={() => setRelationDialogOpen(false)}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home({ onOpenProfile, onLogout, userId }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">SQL Dezigner</div>
        <div className="header-actions">
          <button className="ghost" onClick={onOpenProfile}>Profile</button>
          <button className="secondary" onClick={onLogout}>Log out</button>
        </div>
      </header>
      <main className="home-main">
        <section className="hero">
          <SchemaManager userId={userId} />
        </section>
      </main>
    </div>
  );
}