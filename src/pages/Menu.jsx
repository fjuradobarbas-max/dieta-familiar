import { useState } from "react";

import menu from "../data/menu.json";
import { PERSONAS, COMIDAS, SEMANA } from "../constants";
import { getDiaHoy } from "../utils/dates";

import Segmented from "../components/Segmented";
import MenuCard from "../components/MenuCard";

const FILTROS = [{ id: "ambos", nombre: "Ambos" }, ...PERSONAS];

function Menu() {
  const hoy = getDiaHoy();
  const [dia, setDia] = useState(hoy);
  const [filtro, setFiltro] = useState("ambos");

  const menuDia = menu[dia];
  const personas = filtro === "ambos" ? PERSONAS : PERSONAS.filter((p) => p.id === filtro);
  const nombreDia = SEMANA.find((d) => d.id === dia)?.nombre;

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-eyebrow">Menú semanal</p>
        <h1 className="hero-title">
          {nombreDia} {dia === hoy && <span className="badge">Hoy</span>}
        </h1>
      </header>

      <div className="days">
        {SEMANA.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`day ${dia === d.id ? "active" : ""} ${hoy === d.id ? "today" : ""}`}
            onClick={() => setDia(d.id)}
            aria-label={d.nombre}
          >
            <span className="day-letter">{d.corto}</span>
            <span className="day-name">{d.nombre.slice(0, 3)}</span>
          </button>
        ))}
      </div>

      <Segmented options={FILTROS} value={filtro} onChange={setFiltro} />

      <div className="stack timeline">
        {COMIDAS.map((c) => (
          <MenuCard key={c.id} comida={c} menuDia={menuDia} personas={personas} />
        ))}
      </div>
    </div>
  );
}

export default Menu;
