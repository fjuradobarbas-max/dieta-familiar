// Selector tipo "pastilla" (iOS segmented control)
function Segmented({ options, value, onChange, compact }) {
  return (
    <div className={`segmented ${compact ? "compact" : ""}`} role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          className={`segmented-item ${value === o.id ? "active" : ""}`}
          onClick={() => onChange(o.id)}
        >
          {o.emoji && <span className="segmented-emoji">{o.emoji}</span>}
          {o.nombre}
        </button>
      ))}
    </div>
  );
}

export default Segmented;
