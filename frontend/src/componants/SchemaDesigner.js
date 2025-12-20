import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge, 
  Handle, 
  Position, 
  ReactFlowProvider 
} from 'reactflow';
import 'reactflow/dist/style.css';

// --- ENTITY NODE (RECTANGLE) ---
const EntityNode = ({ id, data }) => (
  <div style={{ 
    width: '120px', height: '60px', background: 'white', border: '3px solid black', 
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
    position: 'relative', boxShadow: '5px 5px 0px black' 
  }}>
    <button onClick={() => data.onDelete(id)} style={{ position: 'absolute', top: '-12px', right: '-12px', background: 'red', color: 'white', borderRadius: '50%', width: '24px', height: '24px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid black' }}>X</button>
    <Handle type="target" position={Position.Top} />
    <input 
      value={data.label} 
      onChange={(e) => data.onRename(id, e.target.value)} 
      placeholder="ENTITY"
      style={{ width: '90%', border: 'none', textAlign: 'center', fontWeight: 'bold', outline: 'none', color: 'black', fontSize: '14px', background: 'transparent' }} 
    />
    <button onClick={() => data.onAddAttribute(id)} style={{ background: 'blue', color: 'white', fontSize: '10px', border: 'none', padding: '2px 5px', cursor: 'pointer', marginTop: '3px', borderRadius: '2px' }}>+ ATTR</button>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

// --- ATTRIBUTE NODE (OVAL WITH KEY OPTION) ---
const AttributeNode = ({ id, data }) => (
  <div style={{ 
    width: '100px', height: '52px', background: 'white', border: '2px solid black', 
    borderRadius: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
    justifyContent: 'center', position: 'relative' 
  }}>
    <button onClick={() => data.onDelete(id)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '8px', cursor: 'pointer', border: '1px solid black' }}>X</button>
    <Handle type="target" position={Position.Top} />
    <input 
      value={data.label} 
      onChange={(e) => data.onRename(id, e.target.value)} 
      placeholder="attr"
      style={{ 
        width: '85%', border: 'none', textAlign: 'center', fontSize: '12px', outline: 'none', color: 'black',
        textDecoration: data.isKey ? 'underline' : 'none',
        fontWeight: data.isKey ? 'bold' : 'normal',
        background: 'transparent'
      }} 
    />
    <button 
      onClick={() => data.onToggleKey(id)} 
      style={{ background: data.isKey ? '#FFD700' : '#f0f0f0', fontSize: '9px', border: '1px solid #000', cursor: 'pointer', padding: '1px 5px', borderRadius: '3px', marginTop: '2px' }}
    >
      KEY
    </button>
  </div>
);

// --- LINK NODE (RELATIONSHIP DIAMOND) ---
const RelationshipNode = ({ id, data }) => (
  <div style={{ width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
    <div style={{ position: 'absolute', width: '70px', height: '70px', border: '3px solid black', background: 'white', transform: 'rotate(45deg)', zIndex: -1 }}></div>
    <Handle type="target" position={Position.Top} style={{ top: '10px' }} />
    <input 
      value={data.label} 
      onChange={(e) => data.onRename(id, e.target.value)} 
      placeholder="LINK" 
      style={{ width: '60%', border: 'none', textAlign: 'center', fontWeight: 'bold', background: 'transparent', outline: 'none', fontSize: '12px', color: 'black' }} 
    />
    <Handle type="source" position={Position.Bottom} style={{ bottom: '10px' }} />
  </div>
);

const nodeTypes = { entity: EntityNode, attribute: AttributeNode, relationship: RelationshipNode };

function DesignerInner() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const deleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, []);

  const renameNode = useCallback((id, label) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label }} : n));
  }, []);

  const toggleKey = useCallback((id) => {
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, isKey: !n.data.isKey }} : n));
  }, []);

  const addEntity = () => {
    const id = `e-${Date.now()}`;
    setNodes((nds) => nds.concat({ id, type: 'entity', position: { x: 100, y: 150 }, data: { label: '', onAddAttribute: addAttribute, onDelete: deleteNode, onRename: renameNode }}));
  };

  const addRelationship = () => {
    const id = `r-${Date.now()}`;
    setNodes((nds) => nds.concat({ id, type: 'relationship', position: { x: 300, y: 150 }, data: { label: '', onDelete: deleteNode, onRename: renameNode }}));
  };

  const addAttribute = (parentId) => {
    const id = `a-${Date.now()}`;
    setNodes((nds) => nds.concat({ id, type: 'attribute', position: { x: 350, y: 300 }, data: { label: '', isKey: false, onToggleKey: toggleKey, onDelete: deleteNode, onRename: renameNode }}));
    setEdges((eds) => addEdge({ id: `ev-${id}`, source: parentId, target: id, style: { stroke: 'black', strokeWidth: 2 } }, eds));
  };

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, style: { stroke: 'black', strokeWidth: 2 } }, eds)), []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      {/* GLOBAL HEADER BAR */}
      <div style={{ height: '75px', background: '#000', display: 'flex', alignItems: 'center', padding: '0 25px', gap: '20px', zIndex: 100 }}>
        <button onClick={() => alert('PROJECT SAVED!')} style={{ background: '#FF8C00', color: '#000', fontWeight: 'bold', padding: '12px 35px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>SAVE PROJECT</button>
        <button onClick={addEntity} style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>+ ENTITY</button>
        <button onClick={addRelationship} style={{ background: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>+ LINK</button>
      </div>

      <div style={{ flexGrow: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={(c) => setNodes((n) => applyNodeChanges(c, n))}
          onEdgesChange={(c) => setEdges((e) => applyEdgeChanges(c, e))}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#ccc" gap={25} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function SchemaDesigner() {
  return <div><ReactFlowProvider><DesignerInner /></ReactFlowProvider> </div>;
}