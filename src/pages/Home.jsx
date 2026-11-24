import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import menu from "../data/menu.json";
import { PERSONAS, COMIDAS, CASAS } from "../constants";
import { useWeights } from "../hooks/useWeights";
import { getEstadisticas } from "../services/progressService";
import { subscribeProductos } from "../services/shoppingService";
import { getDiaHoy, fechaLarga, horaDecimal } from "../utils/dates";

import ProgressRing from "../components/ProgressRing";
import MenuCard from "../components/MenuCard";

const saludo = () => {
  const h = new Date().getHours();
  if (h < 14) return "Buenos días";
  if (h < 21) return "Buenas tardes";
  return "Buenas noches";
};

function Home() {
  const dia = getDiaHoy();
  const menuDia = menu[dia];
  const { datos, cargado } = useWeights();

  // Comida que toca ahora según la hora
  const hora = horaDecimal();
  const comidaActual = COMIDAS.find((c) => hora < c.hasta) || COMIDAS[COMIDAS.length - 1];

  // Productos pendientes de cada casa
  const [pendientes, setPendientes] = useState({});
  useEffect(() => {
    const unsubs = CASAS.map((c) =>
      subscribeProductos(c.id, (prods) =>
        setPendientes((p) => ({ ...p, [c.id]: prods.filter((x) => !x.comprado).length }))
      )
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-eyebrow">{fechaLarga()}</p>
        <h1 className="hero-title">{saludo()} 👋</h1>
      </header>

      {/* Progreso de cada persona */}
      <section className="grid-2">
        {PERSONAS.map((p) => {
          const { persona, pesajes } = datos[p.id];
          if (!cargado) return <div key={p.id} className="card skeleton" style={{ height: 196 }} />;
          const s = getEstadisticas(persona, pesajes);
          return (
            <Link key={p.id} to="/progress" className="card person-card">
              <div className="person-name">
                {p.emoji} {p.nombre}
              </div>
              <ProgressRing value={s.progreso} color={p.color} size={92}>
                <span className="ring-value">{Math.round(s.progreso)}%</span>
              </ProgressRing>
              <div className="person-weight">
                {s.actual}
                <small> kg</small>
              </div>
              <div className="person-sub">
                🎯 {s.objetivo} kg · {s.faltan > 0 ? `faltan ${s.faltan.toFixed(1)}` : "¡conseguido!"}
              </div>
              <div className="person-foot">
                {s.registros} {s.registros === 1 ? "registro" : "registros"}
                {s.ultimoCambio != null && (
                  <span className={s.ultimoCambio <= 0 ? "good" : "bad"}>
                    {" "}· {s.ultimoCambio > 0 ? "+" : ""}
                    {s.ultimoCambio.toFixed(1)}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </section>

      {/* Ahora toca */}
      {menuDia && (
        <section>
          <h2 className="section-title">Ahora toca</h2>
          <MenuCard comida={comidaActual} menuDia={menuDia} destacada etiqueta="Ahora" />
        </section>
      )}

      {/* Lista de la compra */}
      <section>
        <Link to="/shopping" className="card shop-summary">
          <span className="shop-icon">🛒</span>
          <div className="shop-text">
            <strong>Lista de la compra</strong>
            <span>
              {CASAS.map((c) => `${c.nombre}: ${pendientes[c.id] ?? "…"}`).join(" · ")} pendientes
            </span>
          </div>
          <span className="chev">›</span>
        </Link>
      </section>

      {/* Menú completo del día */}
      {menuDia && (
        <section>
          <div className="section-head">
            <h2 className="section-title">Menú de hoy</h2>
            <Link to="/menu" className="link">Semana ›</Link>
          </div>
          <div className="stack">
            {COMIDAS.map((c) => (
              <MenuCard
                key={c.id}
                comida={c}
                menuDia={menuDia}
                destacada={c.id === comidaActual.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
