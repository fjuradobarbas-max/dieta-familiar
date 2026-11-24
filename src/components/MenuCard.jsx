import { PERSONAS } from "../constants";

// Tarjeta de una comida. Muestra a las personas indicadas en "personas".
function MenuCard({ comida, menuDia, personas = PERSONAS, destacada, etiqueta }) {
  return (
    <div className={`meal ${destacada ? "meal-now" : ""}`}>
      <div className="meal-head">
        <span className="meal-icon">{comida.emoji}</span>
        <span className="meal-title">{comida.nombre}</span>
        {etiqueta && <span className="badge">{etiqueta}</span>}
      </div>

      <div className="meal-body">
        {personas.map((p) => (
          <div key={p.id} className="meal-row">
            {personas.length > 1 && (
              <span className="dot" style={{ background: p.color }} />
            )}
            <div>
              {personas.length > 1 && (
                <div className="meal-who">{p.nombre}</div>
              )}
              <div className="meal-text">
                {menuDia?.[p.id]?.[comida.id] || "—"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuCard;
