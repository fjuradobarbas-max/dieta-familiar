import { useState } from "react";
import menu from "../data/menu.json";

function Menu() {
  const dias = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];

  const hoy =
    [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ][new Date().getDay()];

  const [diaSeleccionado, setDiaSeleccionado] =
    useState(hoy);

  const menuDia =
    menu[diaSeleccionado];

  return (
    <div>
      <h1 className="page-title">
        🍽️ Menú Semanal
      </h1>

      <div className="day-selector">
        {dias.map((dia) => (
          <button
            key={dia}
            onClick={() =>
              setDiaSeleccionado(dia)
            }
            className={`day-button ${
              diaSeleccionado === dia
                ? "active"
                : ""
            }`}
          >
            {dia
              .substring(0, 3)
              .toUpperCase()}
          </button>
        ))}
      </div>

      <div className="card">
        <h2>
          📅{" "}
          {diaSeleccionado.toUpperCase()}
        </h2>
      </div>

      <div className="card">
        <h2>👨 Fernando</h2>

        <div className="meal-card">
          <strong>
            🍳 Desayuno
          </strong>
          <br />
          {menuDia.fernando.desayuno}
        </div>

        <div className="meal-card">
          <strong>
            🍎 Almuerzo
          </strong>
          <br />
          {menuDia.fernando.almuerzo}
        </div>

        <div className="meal-card">
          <strong>🍽️ Comida</strong>
          <br />
          {menuDia.fernando.comida}
        </div>

        <div className="meal-card">
          <strong>
            🥜 Merienda
          </strong>
          <br />
          {menuDia.fernando.merienda}
        </div>

        <div className="meal-card">
          <strong>🌙 Cena</strong>
          <br />
          {menuDia.fernando.cena}
        </div>
      </div>

      <div className="card">
        <h2>👩 Débora</h2>

        <div className="meal-card">
          <strong>
            🍳 Desayuno
          </strong>
          <br />
          {menuDia.debora.desayuno}
        </div>

        <div className="meal-card">
          <strong>
            🍎 Almuerzo
          </strong>
          <br />
          {menuDia.debora.almuerzo}
        </div>

        <div className="meal-card">
          <strong>🍽️ Comida</strong>
          <br />
          {menuDia.debora.comida}
        </div>

        <div className="meal-card">
          <strong>
            🥜 Merienda
          </strong>
          <br />
          {menuDia.debora.merienda}
        </div>

        <div className="meal-card">
          <strong>🌙 Cena</strong>
          <br />
          {menuDia.debora.cena}
        </div>
      </div>
    </div>
  );
}

export default Menu;