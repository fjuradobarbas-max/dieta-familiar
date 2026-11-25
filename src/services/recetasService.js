import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Colección NUEVA (no toca las que ya existen):
//   recetas/{id} -> { url, plataforma, videoId, titulo, autor, autorUrl,
//                     miniatura, descripcion, ingredientes[], pasos[],
//                     raciones, tiempo, notas, creado (ms) }

export const subscribeRecetas = (callback, onError) =>
  onSnapshot(
    collection(db, "recetas"),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (error) => {
      console.error("Error leyendo recetas", error);
      onError?.(error);
    }
  );

export const leerEnlace = async (url) => {
  const r = await fetch(`/api/receta?url=${encodeURIComponent(url)}`);
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(datos.error || "No se ha podido leer el enlace");
  return datos;
};

export const guardarReceta = async (receta) => {
  const ref = await addDoc(collection(db, "recetas"), {
    notas: "",
    ...receta,
    creado: Date.now(),
  });
  return ref.id;
};

export const actualizarReceta = (id, cambios) =>
  updateDoc(doc(db, "recetas", id), cambios);

export const borrarReceta = (id) => deleteDoc(doc(db, "recetas", id));

// Dirección del reproductor para ver el vídeo dentro de la app
export const urlReproductor = (r) => {
  if (r.plataforma === "tiktok" && r.videoId) {
    return `https://www.tiktok.com/player/v1/${r.videoId}?autoplay=1&description=1&rel=0`;
  }
  if (r.plataforma === "instagram" && r.videoId) {
    return `https://www.instagram.com/p/${r.videoId}/embed/`;
  }
  return null;
};

export const extraerEnlace = (texto) => {
  const m = String(texto || "").match(/https?:\/\/[^\s"'<>]+/i);
  return m ? m[0].replace(/[),.]+$/, "") : null;
};

export const esEnlaceValido = (url) =>
  /^https?:\/\/([\w-]+\.)*(tiktok\.com|instagram\.com|instagr\.am)\//i.test(url || "");
