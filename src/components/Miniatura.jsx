import { useEffect, useState } from "react";
import { actualizarReceta, leerEnlace } from "../services/recetasService";

// Las miniaturas de TikTok/Instagram caducan a los pocos días.
// Si la imagen falla, se pide una nueva y se guarda.
const refrescando = new Set();

function Miniatura({ receta, grande, children }) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => setFallo(false), [receta.miniatura]);

  const alFallar = async () => {
    setFallo(true);
    if (refrescando.has(receta.id) || !receta.url) return;
    refrescando.add(receta.id);
    try {
      const nuevo = await leerEnlace(receta.url);
      if (nuevo.miniatura && nuevo.miniatura !== receta.miniatura) {
        await actualizarReceta(receta.id, { miniatura: nuevo.miniatura });
      }
    } catch {
      /* se queda el fondo de color */
    }
  };

  return (
    <div className={`thumb ${grande ? "thumb-big" : ""} thumb-${receta.plataforma}`}>
      {receta.miniatura && !fallo ? (
        <img
          src={receta.miniatura}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={alFallar}
        />
      ) : (
        <div className="thumb-placeholder">🍽️</div>
      )}
      <span className={`thumb-badge src-${receta.plataforma}`}>
        {receta.plataforma === "tiktok" ? "TikTok" : "Instagram"}
      </span>
      <span className="thumb-play">▶</span>
      {children}
    </div>
  );
}

export default Miniatura;
