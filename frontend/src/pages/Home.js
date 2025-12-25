import React, { useState, useCallback, useEffect } from 'react';
// import ReactFlow, { 
//   Background, 
//   Controls, 
//   applyNodeChanges, 
//   applyEdgeChanges, 
//   addEdge, 
//   Handle, 
//   Position, 
//   ReactFlowProvider 
// } from 'reactflow';
// import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';















// // --- ENTITY NODE (RECTANGLE) ---
// const EntityNode = ({ id, data }) => (
//   <div style={{ 
//     width: '120px', height: '60px', background: 'white', border: '3px solid black', 
//     display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
//     position: 'relative', boxShadow: '5px 5px 0px black' 
//   }}>
//     <button onClick={() => data.onDelete(id)} style={{ position: 'absolute', top: '-12px', right: '-12px', background: 'red', color: 'white', borderRadius: '50%', width: '24px', height: '24px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid black' }}>X</button>
//     <Handle type="target" position={Position.Top} />
//     <input 
//       value={data.label} 
//       onChange={(e) => data.onRename(id, e.target.value)} 
//       placeholder="ENTITY"
//       style={{ width: '90%', border: 'none', textAlign: 'center', fontWeight: 'bold', outline: 'none', color: 'black', fontSize: '14px', background: 'transparent' }} 
//     />
//     <button onClick={() => data.onAddAttribute(id)} style={{ background: 'blue', color: 'white', fontSize: '10px', border: 'none', padding: '2px 5px', cursor: 'pointer', marginTop: '3px', borderRadius: '2px' }}>+ ATTR</button>
//     <Handle type="source" position={Position.Bottom} />
//   </div>
// );

// // --- ATTRIBUTE NODE (OVAL WITH KEY OPTION) ---
// const AttributeNode = ({ id, data }) => (
//   <div style={{ 
//     width: '100px', height: '52px', background: 'white', border: '2px solid black', 
//     borderRadius: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
//     justifyContent: 'center', position: 'relative' 
//   }}>
//     <button onClick={() => data.onDelete(id)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '8px', cursor: 'pointer', border: '1px solid black' }}>X</button>
//     <Handle type="target" position={Position.Top} />
//     <input 
//       value={data.label} 
//       onChange={(e) => data.onRename(id, e.target.value)} 
//       placeholder="attr"
//       style={{ 
//         width: '85%', border: 'none', textAlign: 'center', fontSize: '12px', outline: 'none', color: 'black',
//         textDecoration: data.isKey ? 'underline' : 'none',
//         fontWeight: data.isKey ? 'bold' : 'normal',
//         background: 'transparent'
//       }} 
//     />
//     <button 
//       onClick={() => data.onToggleKey(id)} 
//       style={{ background: data.isKey ? '#FFD700' : '#f0f0f0', fontSize: '9px', border: '1px solid #000', cursor: 'pointer', padding: '1px 5px', borderRadius: '3px', marginTop: '2px' }}
//     >
//       KEY
//     </button>
//   </div>
// );

// // --- LINK NODE (RELATIONSHIP DIAMOND) ---
// const RelationshipNode = ({ id, data }) => (
//   <div style={{ width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
//     <div style={{ position: 'absolute', width: '70px', height: '70px', border: '3px solid black', background: 'white', transform: 'rotate(45deg)', zIndex: -1 }}></div>
//     <Handle type="target" position={Position.Top} style={{ top: '10px' }} />
//     <input 
//       value={data.label} 
//       onChange={(e) => data.onRename(id, e.target.value)} 
//       placeholder="LINK" 
//       style={{ width: '60%', border: 'none', textAlign: 'center', fontWeight: 'bold', background: 'transparent', outline: 'none', fontSize: '12px', color: 'black' }} 
//     />
//     <Handle type="source" position={Position.Bottom} style={{ bottom: '10px' }} />
//   </div>
// );

// const nodeTypes = { entity: EntityNode, attribute: AttributeNode, relationship: RelationshipNode };

// function DesignerInner() {
//   const [nodes, setNodes] = useState([]);
//   const [edges, setEdges] = useState([]);

//   const deleteNode = useCallback((id) => {
//     setNodes((nds) => nds.filter((n) => n.id !== id));
//     setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
//   }, []);

//   const renameNode = useCallback((id, label) => {
//     setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label }} : n));
//   }, []);

//   const toggleKey = useCallback((id) => {
//     setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, isKey: !n.data.isKey }} : n));
//   }, []);

//   const addEntity = () => {
//     const id = `e-${Date.now()}`;
//     setNodes((nds) => nds.concat({ id, type: 'entity', position: { x: 100, y: 150 }, data: { label: '', onAddAttribute: addAttribute, onDelete: deleteNode, onRename: renameNode }}));
//   };

//   const addRelationship = () => {
//     const id = `r-${Date.now()}`;
//     setNodes((nds) => nds.concat({ id, type: 'relationship', position: { x: 300, y: 150 }, data: { label: '', onDelete: deleteNode, onRename: renameNode }}));
//   };

//   const addAttribute = (parentId) => {
//     const id = `a-${Date.now()}`;
//     setNodes((nds) => nds.concat({ id, type: 'attribute', position: { x: 350, y: 300 }, data: { label: '', isKey: false, onToggleKey: toggleKey, onDelete: deleteNode, onRename: renameNode }}));
//     setEdges((eds) => addEdge({ id: `ev-${id}`, source: parentId, target: id, style: { stroke: 'black', strokeWidth: 2 } }, eds));
//   };

//   const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, style: { stroke: 'black', strokeWidth: 2 } }, eds)), []);

//   return (
//     <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
//       {/* GLOBAL HEADER BAR */}
//       <div style={{ height: '75px', background: '#000', display: 'flex', alignItems: 'center', padding: '0 25px', gap: '20px', zIndex: 100 }}>
//         <button onClick={() => alert('PROJECT SAVED!')} style={{ background: '#FF8C00', color: '#000', fontWeight: 'bold', padding: '12px 35px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>SAVE PROJECT</button>
//         <button onClick={addEntity} style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>+ ENTITY</button>
//         <button onClick={addRelationship} style={{ background: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>+ LINK</button>
//       </div>

//       <div style={{ flexGrow: 1 }}>
//         <ReactFlow
//           nodes={nodes}
//           edges={edges}
//           onNodesChange={(c) => setNodes((n) => applyNodeChanges(c, n))}
//           onEdgesChange={(c) => setEdges((e) => applyEdgeChanges(c, e))}
//           onConnect={onConnect}
//           nodeTypes={nodeTypes}
//           fitView
//         >
//           <Background color="#ccc" gap={25} />
//           <Controls />
//         </ReactFlow>
//       </div>
//     </div>
//   );
// }





const SQL_RELATION_TYPES = ["OO", "OM", "MM"];

function SchemaManager({ userId }) {

  // fallback to localhost:8000 (matches docker-compose/.env) when env var is not provided
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
  const [newTableName, setNewTableName] = useState("");
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("VARCHAR");
  const [status, setStatus] = useState(null); // { type: 'success'|'error'|'info', text }
  const [creatingSchema, setCreatingSchema] = useState(false);
  const [creatingTable, setCreatingTable] = useState(false);
  const [creatingField, setCreatingField] = useState(false);
  const [addingRelation, setAddingRelation] = useState(false);

  // --- Relation dialog ---
  const [relationDialogOpen, setRelationDialogOpen] = useState(false);
  const [relationFromField, setRelationFromField] = useState(null);
  const [relationToField, setRelationToField] = useState(null);
  const [relationType, setRelationType] = useState(SQL_RELATION_TYPES[0]);

  // --- Fetch schemas for user ---
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${API_BASE}/schemas/owner/${userId}`)
      .then((res) => setSchemas(res.data))
      .catch((err) => console.error(err));
  }, [userId]);

  // --- Fetch tables for selected schema ---
  useEffect(() => {
    if (!selectedSchema) return;
    // reset dependent selections/data when schema changes
    setSelectedTable(null);
    setFields([]);
    setRelations([]);

    axios
      .get(`${API_BASE}/tables/schema/${selectedSchema.id}`)
      .then((res) => {
        setTables(res.data);
        setStatus(null);
      })
      .catch((err) => {
        setTables([]);
        console.error(err);
        setStatus({ type: 'error', text: 'Failed to load tables for schema.' });
      });
  }, [selectedSchema]);


   // --- Fetch fields for selected schema ---
  useEffect(() => {
    if (!selectedSchema) return;
    setSchemaFieldsLoaded(false);
    axios
      .get(`${API_BASE}/fields/schema/${selectedSchema.id}`)
      .then((res) => {
        setSchemaFields(res.data || []);
        setSchemaFieldsLoaded(true);
        setStatus(null);
      })
      .catch((err) => {
        console.error(err);
        // If backend returns 404 or 204, treat as 'no fields yet' not an error
        const code = err?.response?.status;
        if (code === 404 || code === 204) {
          setSchemaFields([]);
          setSchemaFieldsLoaded(true);
          setStatus({ type: 'info', text: 'No fields yet. Add one below.' });
          return;
        }
        setSchemaFieldsLoaded(true);
        setStatus({ type: 'error', text: 'Failed to load fields for schema.' });
      });
  }, [selectedSchema]);

  // --- Fetch fields for selected table ---
  useEffect(() => {
    if (!selectedTable) return;
    setFieldsLoaded(false);
    axios
      .get(`${API_BASE}/fields/table/${selectedTable.id}`)
      .then((res) => {
        setFields(res.data || []);
        setFieldsLoaded(true);
        setStatus(null);
      })
      .catch((err) => {
        console.error(err);
        const code = err?.response?.status;
        if (code === 404 || code === 204) {
          setFields([]);
          setFieldsLoaded(true);
          setStatus({ type: 'info', text: 'No fields yet. Add one below.' });
          return;
        }
        setFieldsLoaded(true);
        setStatus({ type: 'error', text: 'Failed to load fields for table.' });
      });
  }, [selectedTable]);

  // --- Fetch relations for selected table ---
  useEffect(() => {
    if (!selectedTable) return;
    axios
      .get(`${API_BASE}/relations/`) // get all relations
      .then((res) => {
        // filter relations where either value_from or value_to belongs to current table fields
        const tableFieldIds = fields.map((f) => f.id);
        const tableRelations = res.data.filter(
          (r) =>
            tableFieldIds.includes(r.value_from) ||
            tableFieldIds.includes(r.value_to)
        );
        setRelations(tableRelations);
      })
      .catch((err) => console.error(err));
  }, [selectedTable, fields]);

  // --- CRUD Handlers ---
  const createSchema = () => {
    if (!newSchemaName || !newSchemaName.trim()) {
      setStatus({ type: 'info', text: 'Please enter a schema name.' });
      return;
    }
    const ownerVal = userId ? Number(userId) : null;
    if (!ownerVal || Number.isNaN(ownerVal) || ownerVal <= 0) {
      setStatus({ type: 'error', text: 'Missing or invalid userId; please re-login.' });
      return;
    }

    const payload = { owner: ownerVal, name: newSchemaName.trim() };
    setCreatingSchema(true);
    setStatus(null);

    axios
      .post(`${API_BASE}/schemas/`, payload)
      .then((res) => {
        setSchemas((prev) => [...prev, res.data]);
        setStatus({ type: 'success', text: 'Schema created.' });
      })
      .catch((err) => {
        console.error('Create schema failed:', err?.response || err);
        const msg = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
        setStatus({ type: 'error', text: 'Failed to create schema: ' + msg });
      })
      .finally(() => {
        setCreatingSchema(false);
        setNewSchemaName("");
      });
  };

  const deleteSchema = (schemaId) => {
    axios
      .delete(`${API_BASE}/schemas/${schemaId}`)
      .then(() => setSchemas(schemas.filter((s) => s.id !== schemaId)))
      .finally(() => setSelectedSchema(null));
  };
  
  const exportSchema = async (schema) => {
    try {
      const res = await axios.get(`${API_BASE}/schemas/${schema.id}/export`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/sql' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${schema.name || 'schema'}.sql`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setStatus({ type: 'success', text: 'Export started' });
    } catch (err) {
      console.error('Export failed', err);
      setStatus({ type: 'error', text: 'Export failed: ' + (err?.response?.data || err.message) });
    }
  };
/////////////////////////////
  const createTable = () => {
    if (!selectedSchema) {
      setStatus({ type: 'error', text: 'Select a schema to add a table.' });
      return;
    }
    if (!newTableName || !newTableName.trim()) {
      setStatus({ type: 'info', text: 'Please enter a table name.' });
      return;
    }
    setCreatingTable(true);
    setStatus(null);

    axios
      .post(`${API_BASE}/tables/`, { schema: selectedSchema.id, name: newTableName.trim() })
      .then((res) => setTables((prev) => [...prev, res.data]))
      .catch((err) => {
        console.error('Create table failed:', err?.response || err);
        setStatus({ type: 'error', text: 'Failed to create table: ' + (err?.message || '') });
      })
      .finally(() => {
        setCreatingTable(false);
        setNewTableName("");
      });
  };

  const deleteTable = (tableId) => {
    axios
      .delete(`${API_BASE}/tables/${tableId}`)
      .then(() => setTables(tables.filter((t) => t.id !== tableId)))
      .finally(() => setSelectedTable(null));
  };

 const getTableById = (tableId) => {
  return tables.find((t) => t.id === tableId) || null;
};


  const createField = () => {
    if (!selectedTable) {
      setStatus({ type: 'error', text: 'Select a table to add a field.' });
      return;
    }
    if (!newFieldName || !newFieldName.trim()) {
      setStatus({ type: 'info', text: 'Please enter a field name.' });
      return;
    }
    setCreatingField(true);
    setStatus(null);

    axios
      .post(`${API_BASE}/fields/`, {
        table: selectedTable.id,
        name: newFieldName.trim(),
        type: newFieldType,
      })
      .then((res) => {
        setFields((prev) => [...prev, res.data]);
        setSchemaFields((prev) => [...prev, res.data]);
        setStatus({ type: 'success', text: 'Field created.' });
      })
      .catch((err) => {
        console.error('Create field failed:', err?.response || err);
        setStatus({ type: 'error', text: 'Failed to create field: ' + (err?.message || '') });
      })
      .finally(() => {
        setCreatingField(false);
        setNewFieldName("");
        setNewFieldType("VARCHAR");
      });
  };

  const deleteField = (fieldId) => {
    axios
      .delete(`${API_BASE}/fields/${fieldId}`)
      .then(() => setFields(fields.filter((f) => f.id !== fieldId)));
  };

  const openRelationDialog = (fromField) => {
    setRelationFromField(fromField);
    setRelationDialogOpen(true);
  };

  const addRelation = () => {
    if (!relationFromField || !relationToField) {
      setStatus({ type: 'info', text: 'Select a source and target field for the relation.' });
      return;
    }
    setAddingRelation(true);
    setStatus(null);

    axios
      .post(`${API_BASE}/relations/`, {
        value_from: relationFromField.id,
        value_to: relationToField.id,
        type: relationType,
      })
      .then((res) => {
        setRelations((prev) => [...prev, res.data]);
        setStatus({ type: 'success', text: 'Relation added.' });
        setRelationDialogOpen(false);
        setRelationFromField(null);
        setRelationToField(null);
      })
      .catch((err) => {
        console.error('Add relation failed:', err?.response || err);
        setStatus({ type: 'error', text: 'Failed to add relation: ' + (err?.message || '') });
      })
      .finally(() => setAddingRelation(false));
  };

  return (
    <div>
      <h2>My Schemas</h2>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          className="small-input"
          value={newSchemaName}
          placeholder="New Schema Name"
          onChange={(e) => setNewSchemaName(e.target.value)}
          disabled={creatingSchema}
        />
        <button className="chip primary" onClick={createSchema} disabled={creatingSchema || !newSchemaName.trim()}> 
          {creatingSchema ? 'Creating...' : 'Create Schema'}
        </button>
      </div>
      {status && (
        <div style={{ marginTop: 8, color: status.type === 'error' ? 'darkred' : status.type === 'success' ? 'green' : 'black' }}>
          {status.text}
        </div>
      )}

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
              <button className="chip" onClick={() => exportSchema(schema)}>Export</button>
            </div>

            {selectedSchema?.id === schema.id && (
              <div style={{ marginTop: 12 }}>
                <div className="split-grid">
                  <div className="left-col">
                    <h3>Tables</h3>
                    <ul className="tables-list">
                      {tables.map((table) => (
                        <li key={table.id} className="table-item">
                          <div className="left"><strong>{table.name || 'Unnamed Table'}</strong></div>
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
                        <h4>Fields</h4>
                        <ul className="fields-list">
                          {fields.map((f) => (
                            <li key={f.id} className="field-item">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="field-name">{f.name}</span>
                                <span className="field-type">{f.type}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <button className="chip secondary" onClick={() => deleteField(f.id)}>Delete</button>
                                <button className="chip ghost" onClick={() => openRelationDialog(f)}>Add Relation</button>
                              </div>
                              <div className="field-relations">
                                <strong>Relations:</strong>
                                {relations
                                  .filter((r) => r.value_from === f.id || r.value_to === f.id)
                                  .map((r) => (
                                    <div key={r.id} className="relation-item">
                                      {r.value_from === f.id ? '→ ' : '← '}
                                      {r.value_from === f.id
                                        ? (schemaFields.find((fld) => fld.id === r.value_to)?.name || 'unknown') + ' (' + (getTableById(schemaFields.find((fld) => fld.id === r.value_to)?.table)?.name || 'unknown') + ')'
                                        : (schemaFields.find((fld) => fld.id === r.value_from)?.name || 'unknown') + ' (' + (getTableById(schemaFields.find((fld) => fld.id === r.value_from)?.table)?.name || 'unknown') + ')'}
                                      {' '}
                                      ({r.type})
                                    </div>
                                  ))}
                              </div>
                            </li>
                          ))}
                        </ul>
                        {!fieldsLoaded && <div className="muted">Loading fields...</div>}
                        {fieldsLoaded && fields.length === 0 && <div className="muted">No fields yet. Add one below.</div>}
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                          <input className="small-input" value={newFieldName} placeholder="Field Name" onChange={(e) => setNewFieldName(e.target.value)} />
                          <select className="small-input" value={newFieldType} onChange={(e) => setNewFieldType(e.target.value)}>
                            {["INT", "VARCHAR", "TEXT", "DATE", "BOOLEAN", "FLOAT"].map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <button className="chip primary" onClick={createField}>Add Field</button>
                        </div>
                      </div>
                    ) : (
                      <div className="muted">Select a table to edit its fields</div>
                    )}
                  </div>
                </div>

                {relationDialogOpen && (
                  <div className="modal-overlay" onClick={() => setRelationDialogOpen(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <h4 className="modal-title">Add Relation from "{relationFromField?.name}"</h4>
                        <button className="chip ghost" onClick={() => setRelationDialogOpen(false)}>Close</button>
                      </div>

                      <div className="modal-row">
                        <label>To Field</label>
                        <select className="modal-select" onChange={(e) => setRelationToField(schemaFields.find((f) => f.id === e.target.value))} value={relationToField?.id || ''}>
                          <option value="">Select field</option>
                          {schemaFields.filter((f) => f.id !== relationFromField?.id).map((f) => (
                            <option key={f.id} value={f.id}>{f.name} ({getTableById(f.table).name})</option>
                          ))}
                        </select>
                      </div>

                      <div className="modal-row">
                        <label>Type</label>
                        <select className="modal-select" value={relationType} onChange={(e) => setRelationType(e.target.value)}>
                          {SQL_RELATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>

                      <div className="modal-actions">
                        <button className="chip primary" onClick={addRelation} disabled={!relationToField}>Add Relation</button>
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
          <h2>Welcome to SQL Dezigner</h2>
          <p>This is your workspace. Start by creating a new design or open an existing one.</p>
          {/* <div className="placeholder-canvas"> */}
            {/* <ReactFlowProvider>
              <DesignerInner />
              </ReactFlowProvider> */}
          {/* </div> */}
           <SchemaManager userId={userId} />

        </section>
      </main>

      <footer className="app-footer">© {new Date().getFullYear()} SQL Dezigner</footer>
    </div>
  );
}
