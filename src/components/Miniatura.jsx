import { useEffect, useState } from "react";
import { refrescarReceta } from "../services/recetasService";

// Las miniaturas de TikTok/Instagram caducan a los pocos días, y alguna
// receta pudo guardarse sin ella. En ambos casos se vuelve a leer el vídeo
// (una vez por sesión) y se guarda lo que falte.
const refrescadas = new Set();

const refrescar = (receta) => {
  if (refrescadas.has(receta.id) || !receta.url) return;
  refrescadas.add(receta.id);
  refrescarReceta(receta).catch(() => {
    /* se queda el fondo de color */
  });
};

function Miniatura({ receta, grande, children }) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => setFallo(false), [receta.miniatura]);

  useEffect(() => {
    if (!receta.miniatura || !receta.descripcion) refrescar(receta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receta.id, receta.miniatura, receta.descripcion]);

  return (
    <div className={`thumb ${grande ? "thumb-big" : ""} thumb-${receta.plataforma}`}>
      {receta.miniatura && !fallo ? (
        <img
          src={receta.miniatura}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            setFallo(true);
            refrescar(receta);
          }}
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
