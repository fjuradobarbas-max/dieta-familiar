import { useState, useEffect } from "react";

import menu from "../data/menu.json";

import {
  subscribePersona,
  subscribePesajes,
  getUltimoPeso,
  ordenarPesajes,
} from "../services/progressService";

function Home() {
  const dias = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];

  const dia = dias[new Date().getDay()];

  const menuDia = menu[dia];

  const [fernando, setFernando] =
    useState(null);

  const [debora, setDebora] =
    useState(null);

  const [pesajesFernando, setPesajesFernando] =
    useState([]);

  const [pesajesDebora, setPesajesDebora] =
    useState([]);

  useEffect(() => {
    const unsubFernando =
      subscribePersona(
        "fernando",
        setFernando
      );

    const unsubDebora =
      subscribePersona(
        "debora",
        setDebora
      );

    const unsubPesajesFernando =
      subscribePesajes(
        "fernando",
        (datos) =>
          setPesajesFernando(
            ordenarPesajes(datos)
          )
      );

    const unsubPesajesDebora =
      subscribePesajes(
        "debora",
        (datos) =>
          setPesajesDebora(
            ordenarPesajes(datos)
          )
      );

    return () => {
      unsubFernando();
      unsubDebora();
      unsubPesajesFernando();
      unsubPesajesDebora();
    };
  }, []);

  const contarPendientes = (
    pesajes
  ) => pesajes.length;

  if (
    !fernando ||
    !debora
  ) {
    return (
      <div className="card">
        Cargando...
      </div>
    );
  }

  const fernandoActual =
    getUltimoPeso(
      fernando,
      pesajesFernando
    );

  const deboraActual =
    getUltimoPeso(
      debora,
      pesajesDebora
    );

  const progresoFernando =
    ((fernando.pesoInicial -
      fernandoActual) /
      (fernando.pesoInicial -
        fernando.pesoObjetivo)) *
    100;

  const progresoDebora =
    ((debora.pesoInicial -
      deboraActual) /
      (debora.pesoInicial -
        debora.pesoObjetivo)) *
    100;

  return (
    <div>
      <h1 className="page-title">
        📅 {dia.toUpperCase()}
      </h1>

      <div className="card">
        <h2>👨 Fernando</h2>

        <div className="metric">
          {fernandoActual} kg
        </div>

        <div className="metric-small">
          Objetivo:{" "}
          {fernando.pesoObjetivo} kg
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.max(
                0,
                Math.min(
                  100,
                  progresoFernando
                )
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="card">
        <h2>👩 Débora</h2>

        <div className="metric">
          {deboraActual} kg
        </div>

        <div className="metric-small">
          Objetivo:{" "}
          {debora.pesoObjetivo} kg
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.max(
                0,
                Math.min(
                  100,
                  progresoDebora
                )
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="card">
        <h2>🍳 Desayuno</h2>

        <p>
          <strong>
            Fernando
          </strong>
          <br />
          {
            menuDia.fernando
              .desayuno
          }
        </p>

        <br />

        <p>
          <strong>
            Débora
          </strong>
          <br />
          {
            menuDia.debora
              .desayuno
          }
        </p>
      </div>

      <div className="card">
        <h2>🍎 Almuerzo</h2>

        <p>
          <strong>
            Fernando
          </strong>
          <br />
          {
            menuDia.fernando
              .almuerzo
          }
        </p>

        <br />

        <p>
          <strong>
            Débora
          </strong>
          <br />
          {
            menuDia.debora
              .almuerzo
          }
        </p>
      </div>

      <div className="card">
        <h2>🍽️ Comida</h2>

        <p>
          <strong>
            Fernando
          </strong>
          <br />
          {
            menuDia.fernando
              .comida
          }
        </p>

        <br />

        <p>
          <strong>
            Débora
          </strong>
          <br />
          {
            menuDia.debora
              .comida
          }
        </p>
      </div>

      <div className="card">
        <h2>🥜 Merienda</h2>

        <p>
          <strong>
            Fernando
          </strong>
          <br />
          {
            menuDia.fernando
              .merienda
          }
        </p>

        <br />

        <p>
          <strong>
            Débora
          </strong>
          <br />
          {
            menuDia.debora
              .merienda
          }
        </p>
      </div>

      <div className="card">
        <h2>🌙 Cena</h2>

        <p>
          <strong>
            Fernando
          </strong>
          <br />
          {
            menuDia.fernando
              .cena
          }
        </p>

        <br />

        <p>
          <strong>
            Débora
          </strong>
          <br />
          {
            menuDia.debora
              .cena
          }
        </p>
      </div>

      <div className="card">
        <h2>
          📈 Resumen pesos
        </h2>

        <p>
          👨 Fernando:{" "}
          {
            pesajesFernando.length
          }{" "}
          registros
        </p>

        <p>
          👩 Débora:{" "}
          {
            pesajesDebora.length
          }{" "}
          registros
        </p>
      </div>
    </div>
  );
}

export default Home;