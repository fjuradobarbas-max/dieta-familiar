import { useEffect, useState } from "react";

import { CASAS } from "../constants";
import { addProducto } from "../services/shoppingService";
import {
  actualizarReceta,
  borrarReceta,
  leerEnlace,
  urlReproductor,
} from "../services/recetasService";

import Miniatura from "./Miniatura";

const fechaGuardada = (ms) =>
  ms
    ? new Date(ms).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : "";

const aLineas = (texto) =>
  texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

function RecetaDetalle({ receta, onCerrar }) {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [marcados, setMarcados] = useState({});
  const [editando, setEditando] = useState(false);
  const [aviso, setAviso] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [receta.id]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2500);
    return () => clearTimeout(t);
  }, [aviso]);

  const reproductor = urlReproductor(receta);
  const plataforma = receta.plataforma === "tiktok" ? "TikTok" : "Instagram";
  const ingredientes = receta.ingredientes || [];
  const pasos = receta.pasos || [];

  const empezarEdicion = () => {
    setForm({
      titulo: receta.titulo || "",
      ingredientes: ingredientes.join("\n"),
      pasos: pasos.join("\n"),
      notas: receta.notas || "",
      raciones: receta.raciones || "",
      tiempo: receta.tiempo || "",
    });
    setEditando(true);
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    await actualizarReceta(receta.id, {
      titulo: form.titulo.trim() || receta.titulo,
      ingredientes: aLineas(form.ingredientes),
      pasos: aLineas(form.pasos),
      notas: form.notas.trim(),
      raciones: form.raciones.trim() || null,
      tiempo: form.tiempo.trim() || null,
    });
    setEditando(false);
    setAviso("Receta guardada ✓");
  };

  const releer = async () => {
    setAviso("Leyendo de nuevo…");
    try {
      const d = await leerEnlace(receta.url);
      await actualizarReceta(receta.id, {
        miniatura: d.miniatura || receta.miniatura || "",
        descripcion: d.descripcion || receta.descripcion || "",
        autor: d.autor || receta.autor || "",
        ingredientes: d.ingredientes?.length ? d.ingredientes : ingredientes,
        pasos: d.pasos?.length ? d.pasos : pasos,
      });
      setAviso("Actualizada ✓");
    } catch (err) {
      setAviso(err.message);
    }
  };

  const eliminar = async () => {
    if (window.confirm(`¿Eliminar la receta "${receta.titulo}"?`)) {
      await borrarReceta(receta.id);
      onCerrar();
    }
  };

  const aLaCompra = async (casa) => {
    const lista = ingredientes.filter((_, i) => !marcados[i]);
    if (!lista.length) return;
    const nombreCasa = CASAS.find((c) => c.id === casa)?.nombre;
    if (!window.confirm(`¿Añadir ${lista.length} ingredientes a la compra de ${nombreCasa}?`)) return;
    await Promise.all(
      lista.map((nombre) =>
        addProducto(casa, { nombre, cantidad: "", categoria: "otros", comprado: false })
      )
    );
    setAviso(`Añadidos a la compra de ${nombreCasa} ✓`);
  };

  if (editando && form) {
    const campo = (k) => ({
      value: form[k],
      onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })),
    });
    return (
      <div className="page">
        <button type="button" className="back" onClick={() => setEditando(false)}>
          ‹ Cancelar
        </button>
        <form className="card form" onSubmit={guardarEdicion}>
          <h2 className="card-title">Editar receta</h2>
          <label className="label">Título</label>
          <input className="input" {...campo("titulo")} />
          <div className="input-row">
            <div>
              <label className="label">Raciones</label>
              <input className="input" placeholder="Ej. 4" {...campo("raciones")} />
            </div>
            <div>
              <label className="label">Tiempo</label>
              <input className="input" placeholder="Ej. 30 min" {...campo("tiempo")} />
            </div>
          </div>
          <label className="label">Ingredientes (uno por línea)</label>
          <textarea className="input textarea" rows={8} {...campo("ingredientes")} />
          <label className="label">Pasos (uno por línea)</label>
          <textarea className="input textarea" rows={8} {...campo("pasos")} />
          <label className="label">Notas</label>
          <textarea className="input textarea" rows={3} placeholder="Cambios, trucos…" {...campo("notas")} />
          <button type="submit" className="btn-primary">
            Guardar cambios
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="row-between">
        <button type="button" className="back" onClick={onCerrar}>
          ‹ Recetas
        </button>
        <div className="detail-actions">
          <button type="button" className="chip" onClick={empezarEdicion}>
            ✏️ Editar
          </button>
          <button type="button" className="icon-btn danger" aria-label="Eliminar receta" onClick={eliminar}>
            🗑️
          </button>
        </div>
      </div>

      {/* Vídeo */}
      <div className="video-wrap">
        {reproduciendo && reproductor ? (
          <iframe
            className={`player player-${receta.plataforma}`}
            src={reproductor}
            title={receta.titulo}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="video-preview"
            onClick={() => (reproductor ? setReproduciendo(true) : window.open(receta.url, "_blank"))}
            aria-label="Ver vídeo"
          >
            <Miniatura receta={receta} grande />
          </button>
        )}
      </div>
      <a className="btn-secondary open-original" href={receta.url} target="_blank" rel="noreferrer">
        Abrir en {plataforma} ↗
      </a>

      {/* Cabecera */}
      <div>
        <h1 className="recipe-title">{receta.titulo}</h1>
        <div className="muted small">
          {receta.autor && (
            <a href={receta.autorUrl || receta.url} target="_blank" rel="noreferrer" className="link">
              @{receta.autor.replace(/^@/, "")}
            </a>
          )}
          {receta.autor && " · "}Guardada el {fechaGuardada(receta.creado)}
        </div>
        {(receta.raciones || receta.tiempo || ingredientes.length > 0) && (
          <div className="facts">
            {receta.raciones && <span className="fact">🍽️ {receta.raciones} raciones</span>}
            {receta.tiempo && <span className="fact">⏱️ {receta.tiempo}</span>}
            {ingredientes.length > 0 && <span className="fact">🧺 {ingredientes.length} ingredientes</span>}
            {pasos.length > 0 && <span className="fact">👣 {pasos.length} pasos</span>}
          </div>
        )}
      </div>

      {/* Ingredientes */}
      <section className="card list-card">
        <div className="list-head">
          <span>🧺 Ingredientes</span>
          {ingredientes.length > 0 && (
            <span className="count">
              {Object.values(marcados).filter(Boolean).length}/{ingredientes.length}
            </span>
          )}
        </div>
        {ingredientes.length === 0 && (
          <div className="list-empty">
            No se han detectado ingredientes en la descripción.{" "}
            <button type="button" className="link" onClick={empezarEdicion}>
              Añadirlos
            </button>
          </div>
        )}
        {ingredientes.map((ing, i) => (
          <div key={i} className={`item ${marcados[i] ? "done" : ""}`}>
            <button
              type="button"
              className="item-main"
              onClick={() => setMarcados((m) => ({ ...m, [i]: !m[i] }))}
            >
              <span className="check">{marcados[i] ? "✓" : ""}</span>
              <span className="item-text">
                <span className="item-name">{ing}</span>
              </span>
            </button>
          </div>
        ))}
        {ingredientes.length > 0 && (
          <div className="to-shop">
            <span className="muted small">Añadir a la compra{Object.values(marcados).some(Boolean) ? " (los no marcados)" : ""}:</span>
            <div className="chips-actions wrap">
              {CASAS.map((c) => (
                <button key={c.id} type="button" className="chip" onClick={() => aLaCompra(c.id)}>
                  🛒 {c.nombre}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Pasos */}
      <section className="card">
        <h2 className="card-title">👩‍🍳 Preparación</h2>
        {pasos.length === 0 ? (
          <div className="list-empty">
            No hay pasos separados; mira la descripción completa o{" "}
            <button type="button" className="link" onClick={empezarEdicion}>
              escríbelos
            </button>
            .
          </div>
        ) : (
          <ol className="steps">
            {pasos.map((p, i) => (
              <li key={i}>
                <span className="step-n">{i + 1}</span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {receta.notas && (
        <section className="card">
          <h2 className="card-title">📝 Notas</h2>
          <p className="pre">{receta.notas}</p>
        </section>
      )}

      {/* Descripción completa */}
      <section className="card">
        <h2 className="card-title">📄 Descripción completa</h2>
        {receta.descripcion ? (
          <p className="pre">{receta.descripcion}</p>
        ) : (
          <p className="muted">El vídeo no tiene descripción.</p>
        )}
        <button type="button" className="link small reread" onClick={releer}>
          ↻ Volver a leer del vídeo
        </button>
      </section>

      {aviso && <div className="toast">{aviso}</div>}
    </div>
  );
}

export default RecetaDetalle;
