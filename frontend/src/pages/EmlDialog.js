import React from "react";
import ReactFlow, { Controls, MiniMap, MarkerType, Background, getBezierPath  } from "reactflow";
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
      position: { x: index * 500, y: index % 2 == 0?100:400 },
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

    schema.tables.forEach((table) => {


      table.fields.forEach((field) => {
        field.relations_to.forEach((rel) => {
          const fromTable = fieldToTable[rel.value_from];
          const toTable = fieldToTable[rel.value_to];

          if (!fromTable || !toTable) return;
          if (fromTable === toTable) return; // optional: skip self-relations



          const key = `${fromTable}-${toTable}-${rel.type}`;
          if (seen.has(key)) return;
          seen.add(key);

          edges.push({
            id: rel.id,
            source: fromTable,
            target: toTable,
            label: rel.type,
            animated: true,
            markerEnd: { type: "arrowclosed" },
          });


        });
      });
    });

    return edges;
  }

  const nodes = buildNodes(schema);
  const edges = buildEdges(schema);

  return (
    <div style={overlayStyle} onClick={onClose}>
     
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ overflow: "hidden"}}>

        <h2>EML Diagram</h2>
        <p>This dialog is from another file</p>

                <style>{`
                  .schema-dialog {
                    width: 300vw;
                    height: 100vh;
                    // width: 100%;
                    // height:85%;
                    background: #020617;
                    border-radius: 12px;
                  }
                  .schema-dialog .react-flow {
                    background: #020617;
                  }
                  .schema-dialog .react-flow__node-default {
                      //max-width: min-content;
                      display: block;       
                      position: absolute;    
                      margin: 0;            
                      line-height: 1;        
                      width: auto;           
                      transform: none; 
                      background: #0f172a;
                      min-width: min-content;
                      padding: 0 0 50px 20px;
                  }


                  .schema-dialog .table-node {
                    display: flex;
                    flex-direction: column;  
                    align-items: center;     
                    justify-content: center; 
                    padding: 10px 12px;
                    line-height: 1;
                    width: 100%;
                  }


                  .schema-dialog .react-flow__edge-path {
                    stroke: #38bdf8;
                    stroke-width: 2;
                  }
                
                  .react-flow__handle {
                    position: absolute;
                    width: 40px;
                    height: 50px;
                  }

                  .react-flow__handle-left {
                    left: -3px;
                    top: 50%;
                    transform: translateY(-50%);
                  }

                  .react-flow__handle-right {
                    right: -3px;
                    top: 50%;
                    transform: translateY(-50%);
                  }

              }
           `}</style>

        <div className="schema-dialog">

              <ReactFlow
                style={{ width: '100%', height: '100%' }}
                nodes={nodes}
                edges={edges}
                fitView
                fitViewOptions={{
                    padding: 0.2,
                  }}
              >
                <MiniMap/>
              </ReactFlow>
        </div>
</div>
        <button onClick={onClose} style={{width: "max-content"}}>Close</button>
        
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
  height: "80%",
  display: "flex",
  flexDirection: "column"
};