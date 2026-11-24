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

// Menú del comedor de Marcos: solo el "Menú General" de cada mes
// (Menú General Noviembre, Menú General Diciembre...)
function MenuColegio() {
  const [web, setWeb] = useState(null);
  const [error, setError] = useState(null);
  const [guardados, setGuardados] = useState([]);

  useEffect(() => subscribeMenusColegio(setGuardados), []);

  useEffect(() => {
    cargarWebColegio()
      .then(setWeb)
      .catch((e) => setError(e.message));
  }, []);

  // Guardar en el histórico los menús generales nuevos de la web
  useEffect(() => {
    if (!web?.menus) return;
    const ids = new Set(guardados.map((g) => g.id));
    web.menus
      .filter((m) => m.tipo === "General" && !ids.has(m.id))
      .forEach((m) => guardarMenuColegio(m).catch((e) => console.warn(e)));
  }, [web, guardados]);

  // Un menú general por mes, el más reciente primero
  const meses = useMemo(() => {
    const porMes = new Map();
    [...guardados, ...(web?.menus || [])]
      .filter((m) => m.tipo === "General" && m.mes && m.anio)
      .forEach((m) => {
        const clave = m.anio * 100 + m.mes;
        const previo = porMes.get(clave);
        if (!previo || Number(m.id) > Number(previo.id)) porMes.set(clave, { ...m, clave });
      });
    return [...porMes.values()].sort((a, b) => b.clave - a.clave);
  }, [guardados, web]);

  const hoy = new Date();
  const claveHoy = hoy.getFullYear() * 100 + hoy.getMonth() + 1;

  // Destacados: el del mes en curso y el del próximo si ya está publicado
  const destacados = meses.filter((m) => m.clave >= claveHoy);
  if (destacados.length === 0 && meses.length) destacados.push(meses[0]);
  const anteriores = meses.filter((m) => !destacados.includes(m));
  const cargando = !web && !error;

  return (
    <>
      {error && (
        <div className="card notice">
          No se ha podido leer la web del colegio ahora mismo.
          {meses.length > 0 && " Te muestro los menús guardados."}{" "}
          <a href={WEB_COLEGIO} target="_blank" rel="noreferrer" className="link">
            Abrir la web ›
          </a>
        </div>
      )}

      {cargando && meses.length === 0 && <div className="card skeleton" style={{ height: 170 }} />}

      {!cargando && meses.length === 0 && (
        <div className="empty">
          <div className="empty-emoji">📭</div>
          El colegio todavía no ha publicado el menú general de este mes.
        </div>
      )}

      {destacados.map((m) => (
        <section key={m.id} className={`card school-month ${m.clave === claveHoy ? "current" : ""}`}>
          <div className="row-between">
            <div>
              <div className="school-month-name">
                {NOMBRES_MES[m.mes - 1]} {m.anio}
              </div>
              {m.fecha && <div className="muted small">Publicado el {m.fecha}</div>}
            </div>
            {m.clave === claveHoy && <span className="badge">Este mes</span>}
            {m.clave > claveHoy && <span className="badge">Próximo</span>}
          </div>

          <div className="school-main">
            <span className="pdf-icon">PDF</span>
            <div className="item-text">
              <span className="item-name">{m.titulo}</span>
              <span className="item-qty">Comedor · Colegio Niña María</span>
            </div>
          </div>

          <div className="school-actions">
            <a className="btn-primary btn-link" href={urlVerArchivo(m.id)} target="_blank" rel="noreferrer">
              Ver menú
            </a>
            <a className="btn-secondary" href={m.url} target="_blank" rel="noreferrer" download>
              ⬇ Descargar
            </a>
          </div>
        </section>
      ))}

      {anteriores.length > 0 && (
        <section className="card list-card">
          <div className="list-head">
            <span>🗂️ Meses anteriores</span>
            <span className="count">{anteriores.length}</span>
          </div>
          {anteriores.map((m) => (
            <div key={m.id} className="item">
              <a className="item-main" href={urlVerArchivo(m.id)} target="_blank" rel="noreferrer">
                <span className="item-text">
                  <span className="item-name">
                    {NOMBRES_MES[m.mes - 1]} {m.anio}
                  </span>
                  <span className="item-qty">{m.titulo}</span>
                </span>
                <span className="chev">›</span>
              </a>
            </div>
          ))}
        </section>
      )}
    </>
  );
}

export default MenuColegio;
