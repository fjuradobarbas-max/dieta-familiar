import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import menu from "../data/menu.json";
import { PERSONAS, COMIDAS, SEMANA } from "../constants";
import { getDiaHoy } from "../utils/dates";

import Segmented from "../components/Segmented";
import MenuCard from "../components/MenuCard";
import MenuColegio from "../components/MenuColegio";

const FILTROS = [
  { id: "ambos", nombre: "Ambos" },
  ...PERSONAS,
  { id: "marcos", nombre: "Marcos", emoji: "🎒" },
];

function Menu() {
  const hoy = getDiaHoy();
  const [params, setParams] = useSearchParams();
  const [dia, setDia] = useState(hoy);

  const ver = params.get("ver");
  const filtro = FILTROS.some((f) => f.id === ver) ? ver : "ambos";
  const setFiltro = (id) =>
    setParams(id === "ambos" ? {} : { ver: id }, { replace: true });

  const esMarcos = filtro === "marcos";
  const menuDia = menu[dia];
  const personas = filtro === "ambos" ? PERSONAS : PERSONAS.filter((p) => p.id === filtro);
  const nombreDia = SEMANA.find((d) => d.id === dia)?.nombre;

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-eyebrow">{esMarcos ? "Comedor del colegio" : "Menú semanal"}</p>
        <h1 className="hero-title">
          {esMarcos ? (
            "🎒 Marcos"
          ) : (
            <>
              {nombreDia} {dia === hoy && <span className="badge">Hoy</span>}
            </>
          )}
        </h1>
      </header>

      <Segmented options={FILTROS} value={filtro} onChange={setFiltro} compact />

      {esMarcos ? (
        <MenuColegio />
      ) : (
        <>
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

          <div className="stack timeline">
            {COMIDAS.map((c) => (
              <MenuCard key={c.id} comida={c} menuDia={menuDia} personas={personas} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Menu;
