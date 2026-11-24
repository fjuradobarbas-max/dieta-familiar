function PurchaseItem({ producto, onToggle, onDelete }) {
  return (
    <div className={`item ${producto.comprado ? "done" : ""}`}>
      <button
        type="button"
        className="item-main"
        onClick={() => onToggle(producto)}
        aria-pressed={!!producto.comprado}
      >
        <span className="check">{producto.comprado ? "✓" : ""}</span>
        <span className="item-text">
          <span className="item-name">{producto.nombre}</span>
          {producto.cantidad && (
            <span className="item-qty">{producto.cantidad}</span>
          )}
        </span>
      </button>

      <button
        type="button"
        className="icon-btn danger"
        aria-label={`Eliminar ${producto.nombre}`}
        onClick={() => onDelete(producto)}
      >
        ✕
      </button>
    </div>
  );
}

export default PurchaseItem;
