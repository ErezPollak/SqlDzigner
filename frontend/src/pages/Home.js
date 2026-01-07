import React, { useState, useCallback, useEffect } from 'react';
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
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';

const Home = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Gestion des changements de nœuds (déplacement)
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // Gestion des changements de liens
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Création d'une nouvelle relation (lien)
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Home;