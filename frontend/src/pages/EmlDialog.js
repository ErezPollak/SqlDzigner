import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";




const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Increased node size for layout calculations to assume wider/taller tables
const NODE_WIDTH = 250;
const NODE_HEIGHT = 300;

const getLayoutedElements = (nodes, edges, direction = "LR") => {
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 100, // Increased horizontal separation
    ranksep: 200  // Increased vertical separation (or rank separation)
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = direction === "LR" ? "left" : "top";
    node.sourcePosition = direction === "LR" ? "right" : "bottom";

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - NODE_HEIGHT / 2,
    };

    return node;
  });

  return { nodes: layoutedNodes, edges };
};

const TableNode = ({ data }) => {
  return (
    <div className="table-node-container">
      <div className="table-header">
        <strong>{data.name}</strong>
      </div>

      <div className="table-body">
        <ul className="field-list">
          {(data.fields || []).map((f) => (
            <li key={f.id} className="field-item" style={{ position: 'relative' }}>
              {/* Target Handle (Left) */}
              <Handle
                type="target"
                position={Position.Left}
                id={`target-${f.id}`}
                className="handle-target-field"
                style={{ top: '50%', transform: 'translateY(-50%)', left: -8 }}
              />

              <span className="field-name">{f.name}</span>
              <span className="field-type">{f.type}</span>

              {/* Source Handle (Right) */}
              <Handle
                type="source"
                position={Position.Right}
                id={`source-${f.id}`}
                className="handle-source-field"
                style={{ top: '50%', transform: 'translateY(-50%)', right: -8 }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const nodeTypes = {
  tableNode: TableNode,
};

export default function EmlDialog({ open, onClose, schema }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges]
  );

  useEffect(() => {
    if (open && schema && schema.tables) {
      // 1. Build Nodes
      const initialNodes = schema.tables.map((table) => ({
        id: table.id.toString(),
        type: "tableNode",
        data: {
          name: table.name,
          fields: table.fields
        },
        position: { x: 0, y: 0 },
      }));

      // 2. Build Edges
      const initialEdges = [];
      const fieldToTable = {};
      schema.tables.forEach((t) => {
        t.fields.forEach((f) => {
          fieldToTable[f.id] = t.id.toString();
        });
      });

      const seen = new Set();
      schema.tables.forEach((table) => {
        table.fields.forEach((field) => {
          if (field.relations_to) {
            field.relations_to.forEach((rel) => {
              const fromTable = fieldToTable[rel.value_from];
              const toTable = fieldToTable[rel.value_to];

              if (!fromTable || !toTable) return;
              if (fromTable === toTable) return;

              const key = `${rel.value_from}-${rel.value_to}-${rel.type}`;
              if (seen.has(key)) return;
              seen.add(key);

              initialEdges.push({
                id: `e${rel.id}`,
                source: fromTable,
                target: toTable,
                sourceHandle: `source-${rel.value_from}`, // Connect from specific field
                targetHandle: `target-${rel.value_to}`,   // Connect to specific field
                label: rel.type,
                type: 'smoothstep', // Orthogonal lines often look better for field-to-field
                animated: true,
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { stroke: '#64748b', strokeWidth: 2 },
                labelStyle: { fill: '#94a3b8', fontWeight: 700 }
              });
            });
          }
        });
      });

      // 3. Apply Layout
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges,
        "LR"
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [open, schema, setNodes, setEdges]); // Only re-run if open state or schema changes

  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div className="schema-dialog-header">
          <h2>{schema.name || "EML Diagram"}</h2>
          <button onClick={onClose} className="close-btn">Close</button>
        </div>

        <div className="schema-dialog-content">
          <style>{`
            .table-node-container {
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 8px;
                min-width: 200px;
                font-family: 'Inter', sans-serif;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                overflow: hidden;
            }
            .table-header {
                background: #0f172a;
                padding: 10px 15px;
                border-bottom: 1px solid #334155;
                color: #e2e8f0;
                font-size: 14px;
                text-align: center;
                font-weight: 600;
            }
            .table-body {
                padding: 10px;
            }
            .field-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .field-item {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
                border-bottom: 1px solid #334155;
                color: #cbd5e1;
                font-size: 12px;
            }
            .field-item:last-child {
                border-bottom: none;
            }
            .field-name {
                font-weight: 500;
            }
            .field-type {
                color: #94a3b8;
                font-size: 11px;
                text-transform: uppercase;
            }
            .handle-target, .handle-source {
                width: 8px;
                height: 8px;
                background: #64748b;
                border: 2px solid #1e293b;
            }
            
            .schema-dialog-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-bottom: 15px;
                border-bottom: 1px solid #334155;
                margin-bottom: 15px;
            }
            .schema-dialog-header h2 {
                margin: 0;
                color: #fff;
                font-size: 1.25rem;
            }
            .close-btn {
                background: transparent;
                border: 1px solid #475569;
                color: #cbd5e1;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .close-btn:hover {
                background: #334155;
                color: white;
            }
            .schema-dialog-content {
                flex: 1;
                background: #020617;
                border-radius: 8px;
                overflow: hidden;
                position: relative;
            }
            `}</style>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: "#020617" }}
          >
            <Background color="#1e293b" gap={16} />
            <Controls style={{ fill: '#cbd5e1' }} />
            <MiniMap style={{ background: '#0f172a' }} nodeColor="#334155" />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.75)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const dialogStyle = {
  background: "#0f172a",
  padding: "20px",
  borderRadius: "12px",
  width: "90%",
  height: "90%",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  border: "1px solid #1e293b",
};