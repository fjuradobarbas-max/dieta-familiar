import { useEffect, useMemo, useState } from "react";

import { CASAS, CATEGORIAS } from "../constants";
import {
  addProducto,
  deleteProducto,
  deleteProductos,
  setCompradoMuchos,
  subscribeProductos,
  updateComprado,
} from "../services/shoppingService";

import Segmented from "../components/Segmented";
import PurchaseItem from "../components/PurchaseItem";

const leerCasa = () => {
  try {
    return localStorage.getItem("casa") || "guadalajara";
  } catch {
    return "guadalajara";
  }
};

function Shopping() {
  const [casa, setCasa] = useState(leerCasa);
  const [productos, setProductos] = useState(null);

  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [categoria, setCategoria] = useState("otros");
  const [ocultarComprados, setOcultarComprados] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("casa", casa);
    } catch {
      /* sin almacenamiento */
    }
    setProductos(null);
    return subscribeProductos(casa, setProductos);
  }, [casa]);

  const lista = productos || [];
  const comprados = lista.filter((p) => p.comprado);
  const total = lista.length;
  const pct = total ? (comprados.length / total) * 100 : 0;

  // Agrupar por categoría. Las categorías desconocidas van a "Otros"
  // para que ningún producto quede oculto.
  const grupos = useMemo(() => {
    const ids = new Set(CATEGORIAS.map((c) => c.id));
    return CATEGORIAS.map((c) => ({
      ...c,
      items: lista
        .filter((p) => (ids.has(p.categoria) ? p.categoria : "otros") === c.id)
        .filter((p) => !(ocultarComprados && p.comprado))
        .sort(
          (a, b) =>
            Number(!!a.comprado) - Number(!!b.comprado) ||
            String(a.nombre).localeCompare(String(b.nombre), "es")
        ),
    })).filter((g) => g.items.length);
  }, [lista, ocultarComprados]);

  const agregar = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    await addProducto(casa, {
      nombre: nombre.trim(),
      cantidad: cantidad.trim(),
      categoria,
      comprado: false,
    });
    setNombre("");
    setCantidad("");
  };

  const eliminar = async (p) => {
    if (window.confirm(`¿Eliminar "${p.nombre}" de la lista?`)) {
      await deleteProducto(casa, p.id);
    }
  };

  const quitarComprados = async () => {
    if (
      comprados.length &&
      window.confirm(`¿Quitar ${comprados.length} productos comprados de la lista?`)
    ) {
      await deleteProductos(casa, comprados.map((p) => p.id));
    }
  };

  const desmarcarTodo = async () => {
    if (comprados.length) {
      await setCompradoMuchos(casa, comprados.map((p) => p.id), false);
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-eyebrow">Lista de la compra</p>
        <h1 className="hero-title">🛒 {CASAS.find((c) => c.id === casa)?.nombre}</h1>
      </header>

      <Segmented options={CASAS} value={casa} onChange={setCasa} />

      {/* Progreso */}
      <div className="card">
        <div className="row-between">
          <span className="muted">
            {total ? `${comprados.length} de ${total} comprados` : "Lista vacía"}
          </span>
          <strong>{Math.round(pct)}%</strong>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${pct}%` }} />
        </div>
        {comprados.length > 0 && (
          <div className="chips-actions">
            <button type="button" className="chip" onClick={() => setOcultarComprados((v) => !v)}>
              {ocultarComprados ? "👁️ Mostrar comprados" : "🙈 Ocultar comprados"}
            </button>
            <button type="button" className="chip" onClick={desmarcarTodo}>
              ↺ Desmarcar todo
            </button>
            <button type="button" className="chip chip-danger" onClick={quitarComprados}>
              🗑️ Quitar comprados
            </button>
          </div>
        )}
      </div>

      {/* Añadir producto */}
      <form className="card form" onSubmit={agregar}>
        <h2 className="card-title">Añadir producto</h2>
        <div className="input-row">
          <input
            className="input"
            placeholder="Producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            enterKeyHint="done"
          />
          <input
            className="input input-small"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </div>
        <div className="cat-picker">
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip ${categoria === c.id ? "chip-active" : ""}`}
              onClick={() => setCategoria(c.id)}
            >
              {c.emoji} {c.nombre}
            </button>
          ))}
        </div>
        <button type="submit" className="btn-primary" disabled={!nombre.trim()}>
          ＋ Añadir
        </button>
      </form>

      {/* Productos */}
      {productos === null && <div className="card skeleton" style={{ height: 120 }} />}

      {productos !== null && total === 0 && (
        <div className="empty">
          <div className="empty-emoji">🧺</div>
          No hay nada en la lista de {CASAS.find((c) => c.id === casa)?.nombre}.
        </div>
      )}

      {grupos.map((g) => {
        const hechos = g.items.filter((p) => p.comprado).length;
        return (
          <section key={g.id} className="card list-card">
            <div className="list-head">
              <span>
                {g.emoji} {g.nombre}
              </span>
              <span className="count">
                {hechos}/{g.items.length}
              </span>
            </div>
            {g.items.map((p) => (
              <PurchaseItem
                key={p.id}
                producto={p}
                onToggle={(x) => updateComprado(casa, x.id, !x.comprado)}
                onDelete={eliminar}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}

export default Shopping;
