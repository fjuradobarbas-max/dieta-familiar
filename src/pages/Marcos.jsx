import { useEffect, useMemo, useState } from "react";

import {
  cargarWebColegio,
  guardarMenuColegio,
  subscribeMenusColegio,
  urlVerArchivo,
} from "../services/colegioService";

const NOMBRES_MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const WEB_COLEGIO =
  "https://www.adoratricesguadalajara.es/web/text.php?id_section=167";

const leerTipo = () => {
  try {
    return localStorage.getItem("menuMarcos") || "General";
  } catch {
    return "General";
  }
};

function Marcos() {
  const [web, setWeb] = useState(null); // datos actuales de la web
  const [error, setError] = useState(null);
  const [guardados, setGuardados] = useState([]);
  const [tipo, setTipo] = useState(leerTipo);

  useEffect(() => subscribeMenusColegio(setGuardados), []);

  useEffect(() => {
    cargarWebColegio()
      .then(setWeb)
      .catch((e) => setError(e.message));
  }, []);

  // Guardar en el histórico los menús nuevos que aparezcan en la web
  useEffect(() => {
    if (!web?.menus) return;
    const ids = new Set(guardados.map((g) => g.id));
    web.menus
      .filter((m) => !ids.has(m.id))
      .forEach((m) => guardarMenuColegio(m).catch((e) => console.warn(e)));
  }, [web, guardados]);

  useEffect(() => {
    try {
      localStorage.setItem("menuMarcos", tipo);
    } catch {
      /* sin almacenamiento */
    }
  }, [tipo]);

  // Unir web + histórico y agrupar por mes (más reciente primero)
  const meses = useMemo(() => {
    const porId = new Map();
    [...guardados, ...(web?.menus || [])].forEach((m) => porId.set(m.id, m));
    const grupos = new Map();
    porId.forEach((m) => {
      if (!m.mes || !m.anio) return;
      const clave = m.anio * 100 + m.mes;
      if (!grupos.has(clave)) grupos.set(clave, { clave, mes: m.mes, anio: m.anio, menus: [] });
      grupos.get(clave).menus.push(m);
    });
    return [...grupos.values()]
      .sort((a, b) => b.clave - a.clave)
      .map((g) => ({
        ...g,
        menus: g.menus.sort(
          (a, b) =>
            Number(b.tipo === "General") - Number(a.tipo === "General") ||
            a.tipo.localeCompare(b.tipo, "es")
        ),
      }));
  }, [guardados, web]);

  const tipos = useMemo(() => {
    const s = new Set(["General"]);
    meses.forEach((g) => g.menus.forEach((m) => s.add(m.tipo)));
    return [...s];
  }, [meses]);

  const hoy = new Date();
  const claveHoy = hoy.getFullYear() * 100 + hoy.getMonth() + 1;
  const cargando = !web && !error;

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-eyebrow">Comedor del colegio</p>
        <h1 className="hero-title">🎒 Marcos</h1>
      </header>

      {/* Tipo de menú preferido */}
      <div className="card">
        <h2 className="card-title">Menú de Marcos</h2>
        <div className="cat-picker">
          {tipos.map((t) => (
            <button
              key={t}
              type="button"
              className={`chip ${tipo === t ? "chip-active" : ""}`}
              onClick={() => setTipo(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="card notice">
          No se ha podido leer la web del colegio ahora mismo ({error}).
          {meses.length > 0 && " Te muestro los menús guardados."}{" "}
          <a href={WEB_COLEGIO} target="_blank" rel="noreferrer" className="link">
            Abrir la web ›
          </a>
        </div>
      )}

      {cargando && meses.length === 0 && <div className="card skeleton" style={{ height: 150 }} />}

      {!cargando && meses.length === 0 && (
        <div className="empty">
          <div className="empty-emoji">📭</div>
          El colegio todavía no ha publicado ningún menú.
        </div>
      )}

      {meses.map((g) => {
        const principal = g.menus.find((m) => m.tipo === tipo) || g.menus[0];
        const resto = g.menus.filter((m) => m.id !== principal.id);
        const actual = g.clave === claveHoy;
        return (
          <section key={g.clave} className={`card school-month ${actual ? "current" : ""}`}>
            <div className="row-between">
              <div>
                <div className="school-month-name">
                  {NOMBRES_MES[g.mes - 1]} {g.anio}
                </div>
                {principal.fecha && (
                  <div className="muted small">Publicado el {principal.fecha}</div>
                )}
              </div>
              {actual && <span className="badge">Este mes</span>}
              {g.clave > claveHoy && <span className="badge">Próximo</span>}
            </div>

            <div className="school-main">
              <span className="pdf-icon">PDF</span>
              <div className="item-text">
                <span className="item-name">Menú {principal.tipo}</span>
                <span className="item-qty">{principal.titulo}</span>
              </div>
            </div>

            <div className="school-actions">
              <a className="btn-primary btn-link" href={urlVerArchivo(principal.id)} target="_blank" rel="noreferrer">
                Ver menú
              </a>
              <a className="btn-secondary" href={principal.url} target="_blank" rel="noreferrer" download>
                ⬇ Descargar
              </a>
            </div>

            {resto.length > 0 && (
              <details className="school-more">
                <summary>Otros menús ({resto.length})</summary>
                <div className="cat-picker wrap">
                  {resto.map((m) => (
                    <a key={m.id} className="chip" href={urlVerArchivo(m.id)} target="_blank" rel="noreferrer">
                      📄 {m.tipo}
                    </a>
                  ))}
                </div>
              </details>
            )}
          </section>
        );
      })}

      {web?.otros?.length > 0 && (
        <section className="card list-card">
          <div className="list-head">
            <span>📎 Otros documentos del comedor</span>
          </div>
          {web.otros.map((d) => (
            <div key={d.id} className="item">
              <a className="item-main" href={urlVerArchivo(d.id)} target="_blank" rel="noreferrer">
                <span className="item-text">
                  <span className="item-name">{d.titulo.replace(/_/g, " ")}</span>
                  {d.fecha && <span className="item-qty">{d.fecha}</span>}
                </span>
                <span className="chev">›</span>
              </a>
            </div>
          ))}
        </section>
      )}

      <a href={WEB_COLEGIO} target="_blank" rel="noreferrer" className="link center">
        Ver la página del comedor ›
      </a>
    </div>
  );
}

export default Marcos;
