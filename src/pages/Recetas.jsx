import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  esEnlaceValido,
  extraerEnlace,
  guardarReceta,
  leerEnlace,
  subscribeRecetas,
} from "../services/recetasService";

import Segmented from "../components/Segmented";
import RecetaDetalle from "../components/RecetaDetalle";
import Miniatura from "../components/Miniatura";

const ORDEN = [
  { id: "recientes", nombre: "Más recientes" },
  { id: "antiguas", nombre: "Más antiguas" },
];

const sinAcentos = (s) =>
  String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Recetas() {
  const [params, setParams] = useSearchParams();
  const [recetas, setRecetas] = useState(null);
  const [errorLectura, setErrorLectura] = useState(null);

  const [enlace, setEnlace] = useState("");
  const [estado, setEstado] = useState(null); // null | "leyendo" | {error}
  const [buscar, setBuscar] = useState("");
  const [orden, setOrden] = useState("recientes");
  const compartidoProcesado = useRef(false);

  const idAbierta = params.get("id");

  useEffect(
    () =>
      subscribeRecetas(setRecetas, () => {
        setErrorLectura(true);
        setRecetas([]);
      }),
    []
  );

  const abrir = (id) => setParams({ id });
  const cerrar = () => setParams({}, { replace: true });

  const guardar = async (texto) => {
    const url = extraerEnlace(texto) || texto.trim();
    if (!esEnlaceValido(url)) {
      setEstado({ error: "Pega un enlace de TikTok o Instagram" });
      return;
    }
    // ¿Ya está guardada?
    const limpia = url.split("?")[0].replace(/\/$/, "");
    const existente = (recetas || []).find(
      (r) => r.url?.split("?")[0].replace(/\/$/, "") === limpia
    );
    if (existente) {
      setEnlace("");
      setEstado(null);
      abrir(existente.id);
      return;
    }

    setEstado("leyendo");
    try {
      const datos = await leerEnlace(url);
      const dup = (recetas || []).find(
        (r) => r.videoId && r.videoId === datos.videoId && r.plataforma === datos.plataforma
      );
      const id = dup ? dup.id : await guardarReceta(datos);
      setEnlace("");
      setEstado(null);
      abrir(id);
    } catch (e) {
      setEstado({ error: e.message });
    }
  };

  // Enlace compartido desde TikTok/Instagram (Android: "Compartir > Dieta")
  useEffect(() => {
    if (compartidoProcesado.current || recetas === null) return;
    const compartido = params.get("url") || params.get("text") || params.get("title");
    if (!compartido) return;
    compartidoProcesado.current = true;
    setParams({}, { replace: true });
    setEnlace(extraerEnlace(compartido) || compartido);
    guardar(compartido);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recetas]);

  const pegar = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) {
        setEnlace(t.trim());
        if (esEnlaceValido(extraerEnlace(t) || t)) guardar(t);
      }
    } catch {
      setEstado({ error: "No se ha podido leer el portapapeles. Mantén pulsado el campo y pega." });
    }
  };

  const lista = useMemo(() => {
    const q = sinAcentos(buscar.trim());
    return (recetas || [])
      .filter(
        (r) =>
          !q ||
          sinAcentos(
            [r.titulo, r.autor, r.descripcion, ...(r.ingredientes || [])].join(" ")
          ).includes(q)
      )
      .sort((a, b) =>
        orden === "recientes" ? (b.creado || 0) - (a.creado || 0) : (a.creado || 0) - (b.creado || 0)
      );
  }, [recetas, buscar, orden]);

  const abierta = idAbierta && recetas?.find((r) => r.id === idAbierta);
  if (abierta) return <RecetaDetalle receta={abierta} onCerrar={cerrar} />;

  return (
    <div className="page">
      <header className="hero">
        <p className="hero-eyebrow">Tu recetario</p>
        <h1 className="hero-title">📖 Recetas</h1>
      </header>

      {/* Guardar nueva */}
      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault();
          guardar(enlace);
        }}
      >
        <h2 className="card-title">Guardar receta</h2>
        <div className="input-row">
          <input
            className="input"
            type="url"
            inputMode="url"
            placeholder="Pega el enlace de TikTok o Instagram"
            value={enlace}
            onChange={(e) => {
              setEnlace(e.target.value);
              if (estado?.error) setEstado(null);
            }}
            disabled={estado === "leyendo"}
          />
          {navigator.clipboard?.readText && (
            <button type="button" className="btn-secondary btn-paste" onClick={pegar} disabled={estado === "leyendo"}>
              📋 Pegar
            </button>
          )}
        </div>
        {estado?.error && <div className="form-error">{estado.error}</div>}
        <button type="submit" className="btn-primary" disabled={!enlace.trim() || estado === "leyendo"}>
          {estado === "leyendo" ? "Leyendo la receta…" : "＋ Guardar"}
        </button>
        <div className="sources">
          <span className="src src-tiktok">TikTok</span>
          <span className="src src-instagram">Instagram</span>
        </div>
      </form>

      {errorLectura && (
        <div className="card notice">
          No se pueden leer las recetas guardadas. Puede que las reglas de Firebase no permitan
          todavía la colección <b>recetas</b>.
        </div>
      )}

      {recetas === null && (
        <div className="recipe-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="recipe-card skeleton" style={{ aspectRatio: "3 / 4" }} />
          ))}
        </div>
      )}

      {recetas !== null && recetas.length === 0 && !errorLectura && (
        <div className="empty">
          <div className="empty-emoji">🍳</div>
          Todavía no hay recetas. Pega el enlace de un vídeo para empezar.
        </div>
      )}

      {recetas?.length > 0 && (
        <>
          <div className="input-search">
            <span>🔎</span>
            <input
              className="input"
              placeholder="Buscar por nombre o ingrediente"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
          <Segmented options={ORDEN} value={orden} onChange={setOrden} compact />

          <div className="recipe-grid">
            {lista.map((r) => (
              <button key={r.id} type="button" className="recipe-card" onClick={() => abrir(r.id)}>
                <Miniatura receta={r} />
                <div className="recipe-card-body">
                  <div className="recipe-card-title">{r.titulo}</div>
                  <div className="recipe-card-meta">
                    {r.autor ? `@${r.autor.replace(/^@/, "")}` : ""}
                    {r.ingredientes?.length ? ` · ${r.ingredientes.length} ingr.` : ""}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {lista.length === 0 && <div className="empty">Ninguna receta coincide con “{buscar}”.</div>}
        </>
      )}
    </div>
  );
}

export default Recetas;
