import { useState } from "react";

import { PERSONAS, getPersonaInfo } from "../constants";
import { useWeights } from "../hooks/useWeights";
import { addPesaje, deletePesaje, getEstadisticas } from "../services/progressService";
import { hoyISO, isoToFecha, fechaCorta } from "../utils/dates";

import Segmented from "../components/Segmented";
import ProgressRing from "../components/ProgressRing";
import WeightChart from "../components/WeightChart";

const fmt = (n, dec = 1) => (n == null || isNaN(n) ? "—" : Number(n).toFixed(dec));

function Progress() {
  const [sel, setSel] = useState("fernando");
  const [peso, setPeso] = useState("");
  const [fecha, setFecha] = useState(hoyISO);
  const [guardando, setGuardando] = useState(false);

  const { datos } = useWeights();
  const info = getPersonaInfo(sel);
  const { persona, pesajes } = datos[sel];
  const listo = persona && persona.pesoInicial != null;
  const s = listo ? getEstadisticas(persona, pesajes) : null;

  const guardar = async (e) => {
    e.preventDefault();
    if (!peso || !fecha) return;
    setGuardando(true);
    try {
      await addPesaje(sel, isoToFecha(fecha), String(peso).replace(",", "."));
      setPeso("");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (registro) => {
    if (window.confirm(`¿Eliminar el pesaje del ${registro.fecha} (${registro.peso} kg)?`)) {
      await deletePesaje(sel, registro.id);
    }
  };

  // Histórico: más reciente primero, con la diferencia respecto al anterior
  const historico = pesajes
    .map((r, i) => ({ ...r, diff: i > 0 ? r.peso - pesajes[i - 1].peso : null }))
    .reverse();

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-eyebrow">Seguimiento</p>
        <h1 className="hero-title">📈 Peso</h1>
      </header>

      <Segmented options={PERSONAS} value={sel} onChange={setSel} />

      {!listo && <div className="card skeleton" style={{ height: 220 }} />}

      {listo && (
        <>
          {/* Resumen */}
          <div className="card summary">
            <ProgressRing value={s.progreso} color={info.color} size={120} stroke={12}>
              <span className="ring-value big">{Math.round(s.progreso)}%</span>
              <span className="ring-label">del objetivo</span>
            </ProgressRing>
            <div className="summary-side">
              <div className="muted">Peso actual</div>
              <div className="big-number">
                {s.actual}
                <small> kg</small>
              </div>
              <div className={s.perdidos >= 0 ? "good" : "bad"}>
                {s.perdidos >= 0 ? "▼" : "▲"} {fmt(Math.abs(s.perdidos))} kg desde el inicio
              </div>
              {s.ritmo != null && (
                <div className="muted small">
                  Ritmo: {s.ritmo > 0 ? "+" : ""}
                  {fmt(s.ritmo, 2)} kg/semana
                </div>
              )}
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <span className="stat-label">⚖️ Inicial</span>
              <span className="stat-value">{s.inicial}</span>
            </div>
            <div className="stat">
              <span className="stat-label">📍 Actual</span>
              <span className="stat-value">{s.actual}</span>
            </div>
            <div className="stat">
              <span className="stat-label">🎯 Objetivo</span>
              <span className="stat-value">{s.objetivo}</span>
            </div>
            <div className="stat">
              <span className="stat-label">✅ Perdidos</span>
              <span className="stat-value">{fmt(s.perdidos)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">🏁 Faltan</span>
              <span className="stat-value">{fmt(Math.max(0, s.faltan))}</span>
            </div>
            <div className="stat">
              <span className="stat-label">📊 Progreso</span>
              <span className="stat-value">{Math.round(s.progreso)}%</span>
            </div>
          </div>

          {/* Gráfica */}
          <div className="card">
            <h2 className="card-title">Evolución</h2>
            <WeightChart pesajes={pesajes} objetivo={s.objetivo} color={info.color} />
          </div>
        </>
      )}

      {/* Nuevo pesaje */}
      <form className="card form" onSubmit={guardar}>
        <h2 className="card-title">
          Nuevo pesaje · {info.emoji} {info.nombre}
        </h2>
        <div className="input-row">
          <input
            type="date"
            className="input"
            value={fecha}
            max={hoyISO()}
            onChange={(e) => setFecha(e.target.value)}
          />
          <div className="input-suffix">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              className="input"
              placeholder="Peso"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />
            <span>kg</span>
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={!peso || guardando}>
          {guardando ? "Guardando…" : "Guardar pesaje"}
        </button>
      </form>

      {/* Histórico */}
      {historico.length > 0 && (
        <section className="card list-card">
          <div className="list-head">
            <span>📅 Histórico</span>
            <span className="count">{historico.length}</span>
          </div>
          {historico.map((r) => (
            <div key={r.id} className="item">
              <div className="item-main static">
                <span className="hist-date">{fechaCorta(r.fecha)}</span>
                <span className="item-text">
                  <span className="item-name">{r.peso} kg</span>
                  <span className="item-qty">{r.fecha}</span>
                </span>
                {r.diff != null && (
                  <span className={`pill ${r.diff <= 0 ? "pill-good" : "pill-bad"}`}>
                    {r.diff > 0 ? "+" : ""}
                    {fmt(r.diff)}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="icon-btn danger"
                aria-label="Eliminar pesaje"
                onClick={() => eliminar(r)}
              >
                ✕
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default Progress;
