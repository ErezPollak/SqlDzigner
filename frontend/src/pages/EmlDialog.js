export default function EmlDialog({ open, onClose, schema }) {
  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <h2>EML Diagram</h2>
        <p>This dialog is from another file</p>
        <div>{JSON.stringify(schema)}</div>  
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
};