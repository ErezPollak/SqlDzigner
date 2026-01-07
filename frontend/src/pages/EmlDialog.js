import React from "react";
import ReactFlow, { Controls, MiniMap, MarkerType } from "reactflow";
import { Handle, Position } from "reactflow";

const TableNode = ({ data }) => {
  return (
    <div
      style={{
        padding: 10,
        border: "1px solid #555",
        borderRadius: 6,
        background: "white",
        minWidth: 180,
      }}
    >
      {/* incoming relations */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
      />

      <strong>{data.name}</strong>

      <ul style={{ paddingLeft: 12 }}>
        {(data.fields || []).map((f) => (
          <li key={f.id}>
            {f.name} : {f.type}
          </li>
        ))}
      </ul>

      {/* outgoing relations */}
      <Handle
        type="source"
        position={Position.Right}
        id="out"
      />
    </div>
  );
};


export default function EmlDialog({ open, onClose, schema }) {
  if (!open) return null;

  const nodeTypes = {
    tableNode: TableNode,
  };

  function buildFieldToTableMap(schema) {
    const map = {};

    schema.tables.forEach((table) => {
      table.fields.forEach((field) => {
        map[field.id] = table.id;
      });
    });

    return map;
  }

  function buildNodes(schema) {
    return schema.tables.map((table, index) => ({
      id: table.id,
      position: { x: index * 300, y: 100 },
      data: {
        label: (
          <div>
            <strong>{table.name}</strong>
            <ul style={{ paddingLeft: 16 }}>
              {table.fields.map((f) => (
                <li key={f.id}>
                  {f.name} : {f.type}
                </li>
              ))}
            </ul>
          </div>
        ),
      },
    }));
  }

  function buildEdges(schema) {
    const fieldToTable = buildFieldToTableMap(schema);
    const edges = [];
    const seen = new Set();
    console.log("fieldToTable")
    console.log(fieldToTable)

    schema.tables.forEach((table) => {
      
      console.log("table")
      console.log("table")
      console.log("table")
      console.log("table")
      console.log("table")
      console.log(table)

      table.fields.forEach((field) => {
        field.relations_to.forEach((rel) => {
          const fromTable = fieldToTable[rel.value_from];
          const toTable = fieldToTable[rel.value_to];
        
          if (!fromTable || !toTable) return;
          if (fromTable === toTable) return; // optional: skip self-relations
          

          console.log(rel)
          console.log("fromTable")
          console.log(fromTable)
          console.log("toTable")
          console.log(toTable)

         

          const key = `${fromTable}-${toTable}-${rel.type}`;
          if (seen.has(key)) return;
          seen.add(key);

          edges.push({
            id: rel.id,
            // source: fromTable,
            // target: toTable,
            source: toTable,
            target: fromTable,
            label: rel.type,
            sourceHandle: "out",
            targetHandle: "in",
            animated: true,
            markerEnd: { type: "arrowclosed" },
          });

          // edges.push(
          //   {
          //     id: "ksjhdfljslkdjflksjdlkjflsjd",
          //   source: "b1234a3d-c1b5-4a77-a761-1c8d898c259a",
          //   target: "f78e5927-b80b-4471-81c1-bb7c5b943ff8",
          //   label: rel.type,
          //   animated: true,
          //   markerEnd: { type: "arrowclosed" },
          // });

          //  edges.push(
          //   {
          //     id: "ksjhdfljslkdjflksjdlkjflsjd",
          //   source: "b1234a3d-c1b5-4a77-a761-1c8d898c259a",
          //   target: "885d40b0-348a-4bcd-8b90-3461e13a08fd",
          //   label: rel.type,
          //   animated: true,
          //   markerEnd: { type: "arrowclosed" },
          // });
            
          
        });
      });
    });

    return edges;
  }

  const nodes = buildNodes(schema);

  console.log("nodes")
  console.log(nodes)

  const edges = buildEdges(schema);

  console.log("edges")
  console.log(edges)

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <h2>EML Diagram</h2>
        <p>This dialog is from another file</p>
        {/* <div>{JSON.stringify(schema)}</div>   */}

        <style>{`






                  .schema-dialog {
                    width: 100%;
                    height: 100%;
                    background: #020617;
                    border-radius: 12px;
                  }

                  .schema-dialog .react-flow {
                    background: #020617;
                  }

                  .schema-dialog .react-flow__node-default {
                      display: inline-block;
                      width: fit-content;
                      min-width: max-content;
                      max-width: none;

                      background: #0f172a;
                      color: #e5e7eb;
                      border: 1px solid #334155;
                      border-radius: 8px;

                      padding: 10px 12px;
                      font-size: 12px;
                      white-space: nowrap;
                  }

                  .schema-dialog .react-flow__edge-path {
                    stroke: #38bdf8;
                    stroke-width: 2;

                  }

                  .schema-dialog .react-flow__controls button {
                    background: #020617;
                    color: #e5e7eb;
                  }


                  .schema-dialog .table-node {
                    position: relative;
                    width: fit-content;
                    white-space: nowrap;
                  }

                  .schema-dialog .react-flow__handle {
                    width: 8px;
                    height: 8px;
                    background: transparent;
                    border: none;
                  }

      `}</style>

        <div className="schema-dialog">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            nodeOrigin={[0, 0]}
            edgeIntersectionPadding={0}
            defaultEdgeOptions={{
              type: "smoothstep",
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 14,
                height: 14,
              },
            }}
          >
            <MiniMap />
            <Controls />
          </ReactFlow>
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const dialogStyle = {
  background: "#0b2240",
  padding: "20px",
  borderRadius: "8px",
  width: "50%",
  height: "50%",
};
