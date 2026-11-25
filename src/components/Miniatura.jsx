import { useEffect, useState } from "react";
import { miniaturaPequena, refrescarReceta } from "../services/recetasService";

// Las miniaturas de TikTok/Instagram caducan a los pocos días, y alguna
// receta pudo guardarse sin ella. En ese caso se vuelve a leer el vídeo,
// como mucho una vez al día por receta.
const refrescadas = new Set();
const UN_DIA = 86400000;

const refrescar = (receta) => {
  if (refrescadas.has(receta.id) || !receta.url) return;
  if (receta.revisado && Date.now() - receta.revisado < UN_DIA) return;
  refrescadas.add(receta.id);
  refrescarReceta(receta).catch(() => {
    /* se queda el fondo de color */
  });
};

function Miniatura({ receta, grande, children }) {
  // 0 = miniatura reducida, 1 = original, 2 = sin imagen
  const [intento, setIntento] = useState(0);

  useEffect(() => setIntento(0), [receta.miniatura]);

  useEffect(() => {
    if (!receta.miniatura) refrescar(receta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receta.id, receta.miniatura]);

  const src =
    intento === 0 ? miniaturaPequena(receta.miniatura, grande ? 640 : 384) : receta.miniatura;

  return (
    <div className={`thumb ${grande ? "thumb-big" : ""} thumb-${receta.plataforma}`}>
      {receta.miniatura && intento < 2 ? (
        <img
          src={src}
          alt=""
          loading={grande ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => {
            if (intento === 0 && src !== receta.miniatura) setIntento(1);
            else {
              setIntento(2);
              refrescar({ ...receta, revisado: 0 });
            }
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
