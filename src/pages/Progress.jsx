import { useState } from "react";
import weightsData from "../data/weights.json";

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
  const [pesos, setPesos] = useState(weightsData);

  const [personaSeleccionada, setPersonaSeleccionada] =
    useState("fernando");

  const [peso, setPeso] = useState("");

  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0];
  });

  const agregarPesaje = () => {
    if (!peso || !fecha) return;

    const fechaFormateada = fecha
      .split("-")
      .reverse()
      .join("/");

    setPesos((prev) => ({
      ...prev,
      [personaSeleccionada]: {
        ...prev[personaSeleccionada],
        pesajes: [
          ...prev[personaSeleccionada].pesajes,
          {
            fecha: fechaFormateada,
            peso: parseFloat(peso),
          },
        ],
      },
    }));

    setPeso("");
  };

  const eliminarPesaje = (personaId, index) => {
    setPesos((prev) => ({
      ...prev,
      [personaId]: {
        ...prev[personaId],
        pesajes: prev[personaId].pesajes.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

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
            setFecha(e.target.value)
          }
          className="form-input"
        />

        <input
          type="number"
          step="0.1"
          placeholder="Peso"
          value={peso}
          onChange={(e) =>
            setPeso(e.target.value)
          }
          className="form-input"
        />

        <button
          className="primary-button"
          onClick={agregarPesaje}
        >
          Guardar Pesaje
        </button>
      </div>

      {Object.entries(pesos).map(
        ([id, persona]) => {
          const pesoActual =
            persona.pesajes[
              persona.pesajes.length - 1
            ]?.peso ||
            persona.pesoInicial;

          const perdidos =
            persona.pesoInicial -
            pesoActual;

          const faltan =
            pesoActual -
            persona.pesoObjetivo;

          const progreso = Math.max(
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
            persona.pesajes.map(
              (registro) =>
                registro.peso
            );

          const minPeso = Math.min(
            ...pesosGrafica,
            persona.pesoObjetivo
          );

          const maxPeso = Math.max(
            ...pesosGrafica,
            persona.pesoObjetivo
          );

          const rangoMin =
            Math.floor(minPeso - 2);

          const rangoMax =
            Math.ceil(maxPeso + 2);

          return (
            <div
              key={id}
              className="card"
            >
              <h2>
                {persona.nombre ===
                "Fernando"
                  ? "👨 Fernando"
                  : "👩 Débora"}
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(140px,1fr))",
                  gap: "10px",
                  marginTop: "15px",
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
                )}{" "}
                kg
              </p>

              <p>
                🎯 Faltan:{" "}
                {faltan.toFixed(1)} kg
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
                  height: "350px",
                  marginTop:
                    "15px",
                  marginBottom:
                    "20px",
                }}
              >
                <ResponsiveContainer>
                  <LineChart
                    data={
                      persona.pesajes
                    }
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
                      strokeWidth={4}
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

              {persona.pesajes.map(
                (
                  registro,
                  index
                ) => (
                  <div
                    key={index}
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
                        eliminarPesaje(
                          id,
                          index
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