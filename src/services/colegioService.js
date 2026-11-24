import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Colección NUEVA (no toca las que ya existen):
//   colegio/{idArchivo} -> { titulo, fecha, url, mes, anio, tipo }
// Sirve para conservar los menús de meses anteriores, porque la web
// del colegio solo muestra los del mes en curso.

export const subscribeMenusColegio = (callback) =>
  onSnapshot(
    collection(db, "colegio"),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (error) => {
      console.warn("No se pudo leer el histórico del colegio", error);
      callback([]);
    }
  );

export const guardarMenuColegio = async (menu) => {
  const { id, ...datos } = menu;
  await setDoc(doc(db, "colegio", id), datos, { merge: true });
};

export const cargarWebColegio = async () => {
  const r = await fetch("/api/colegio");
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(datos.error || `Error ${r.status}`);
  return datos;
};

export const urlVerArchivo = (id) => `/api/colegio-archivo?id=${id}`;
