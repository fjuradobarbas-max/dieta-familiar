import { useState, useEffect } from "react";

import {
  subscribePersona,
  subscribePesajes,
  addPesaje,
  deletePesaje,
  ordenarPesajes,
  getUltimoPeso,
} from "../services/progressService";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

function Progress() {
  const [personaSeleccionada, setPersonaSeleccionada] =
    useState("fernando");

  const [peso, setPeso] = useState("");

  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0];
  });

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

  const agregarPesajeFirebase =
    async () => {
      if (!peso || !fecha) return;

      const fechaFormateada =
        fecha
          .split("-")
          .reverse()
          .join("/");

      await addPesaje(
        personaSeleccionada,
        fechaFormateada,
        peso
      );

      setPeso("");
    };

  const eliminarPesajeFirebase =
    async (
      persona,
      id
    ) => {
      await deletePesaje(
        persona,
        id
      );
    };

  const personas = [
    {
      id: "fernando",
      persona: fernando,
      pesajes: pesajesFernando,
    },
    {
      id: "debora",
      persona: debora,
      pesajes: pesajesDebora,
    },
  ];

  return (
    <div>
      <h1 className="page-title">
        📈 Seguimiento
      </h1>

      <div className="card">
        <h2>➕ Nuevo Pesaje</h2>

        <select
          value={personaSeleccionada}
          onChange={(e) =>
            setPersonaSeleccionada(
              e.target.value
            )
          }
          className="form-input"
        >
          <option value="fernando">
            👨 Fernando
          </option>

          <option value="debora">
            👩 Débora
          </option>
        </select>

        <input
          type="date"
          value={fecha}
          onChange={(e) =>
            setFecha(
              e.target.value
            )
          }
          className="form-input"
        />

        <input
          type="number"
          step="0.1"
          placeholder="Peso"
          value={peso}
          onChange={(e) =>
            setPeso(
              e.target.value
            )
          }
          className="form-input"
        />

        <button
          className="primary-button"
          onClick={
            agregarPesajeFirebase
          }
        >
          Guardar Pesaje
        </button>
      </div>

      {personas.map(
        ({
          id,
          persona,
          pesajes,
        }) => {
          if (!persona)
            return null;

          const pesoActual =
            getUltimoPeso(
              persona,
              pesajes
            );

          const perdidos =
            persona.pesoInicial -
            pesoActual;

          const faltan =
            pesoActual -
            persona.pesoObjetivo;

          const progreso =
            Math.max(
              0,
              Math.min(
                100,
                (perdidos /
                  (persona.pesoInicial -
                    persona.pesoObjetivo)) *
                  100
              )
            );

          const pesosGrafica =
            pesajes.map(
              (registro) =>
                registro.peso
            );

          const minPeso =
            Math.min(
              ...pesosGrafica,
              persona.pesoObjetivo,
              pesoActual
            );

          const maxPeso =
            Math.max(
              ...pesosGrafica,
              persona.pesoObjetivo,
              pesoActual
            );

          const rangoMin =
            Math.floor(
              minPeso - 2
            );

          const rangoMax =
            Math.ceil(
              maxPeso + 2
            );

          return (
            <div
              key={id}
              className="card"
            >
              <h2>
                {id ===
                "fernando"
                  ? "👨 Fernando"
                  : "👩 Débora"}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(140px,1fr))",
                  gap: "10px",
                  marginTop:
                    "15px",
                  marginBottom:
                    "20px",
                }}
              >
                <div className="meal-card">
                  <strong>
                    ⚖️ Inicial
                  </strong>

                  <div
                    className="metric"
                    style={{
                      fontSize:
                        "24px",
                    }}
                  >
                    {
                      persona.pesoInicial
                    }
                  </div>
                </div>

                <div className="meal-card">
                  <strong>
                    📍 Actual
                  </strong>

                  <div
                    className="metric"
                    style={{
                      fontSize:
                        "24px",
                    }}
                  >
                    {pesoActual}
                  </div>
                </div>

                <div className="meal-card">
                  <strong>
                    🎯 Objetivo
                  </strong>

                  <div
                    className="metric"
                    style={{
                      fontSize:
                        "24px",
                    }}
                  >
                    {
                      persona.pesoObjetivo
                    }
                  </div>
                </div>
              </div>

              <p>
                ✅ Perdidos:{" "}
                {perdidos.toFixed(
                  1
                )} kg
              </p>

              <p>
                🎯 Faltan:{" "}
                {faltan.toFixed(
                  1
                )} kg
              </p>

              <p>
                📊 Progreso:{" "}
                {progreso.toFixed(
                  0
                )}
                %
              </p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progreso}%`,
                  }}
                />
              </div>

              <h3
                style={{
                  marginTop:
                    "25px",
                }}
              >
                📈 Evolución
              </h3>

              <div
                style={{
                  width: "100%",
                  height:
                    "350px",
                }}
              >
                <ResponsiveContainer>
                  <LineChart
                    data={pesajes}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="fecha" />

                    <YAxis
                      domain={[
                        rangoMin,
                        rangoMax,
                      ]}
                    />

                    <Tooltip
                      formatter={(
                        value
                      ) => [
                        `${value} kg`,
                        "Peso",
                      ]}
                    />

                    <ReferenceLine
                      y={
                        persona.pesoObjetivo
                      }
                      stroke="#ef4444"
                      strokeWidth={
                        2
                      }
                      strokeDasharray="6 6"
                      label="Objetivo"
                    />

                    <Line
                      type="monotone"
                      dataKey="peso"
                      stroke="#6c63ff"
                      strokeWidth={
                        4
                      }
                      dot={{
                        r: 6,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <h3>
                📅 Histórico
              </h3>

              {pesajes.map(
                (
                  registro
                ) => (
                  <div
                    key={
                      registro.id
                    }
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      padding:
                        "10px 0",
                      borderBottom:
                        "1px solid #eee",
                    }}
                  >
                    <span>
                      {
                        registro.fecha
                      }{" "}
                      ·{" "}
                      {
                        registro.peso
                      }
                      kg
                    </span>

                    <button
                      onClick={() =>
                        eliminarPesajeFirebase(
                          id,
                          registro.id
                        )
                      }
                      style={{
                        background:
                          "#ef4444",
                        color:
                          "white",
                        border:
                          "none",
                        borderRadius:
                          "10px",
                        padding:
                          "8px 12px",
                        cursor:
                          "pointer",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                )
              )}
            </div>
          );
        }
      )}
    </div>
  );
}

export default Progress;