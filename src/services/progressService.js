import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";
import { parseFecha } from "../utils/dates";

// Misma estructura de siempre: weights/{persona} y weights/{persona}/pesajes

export const subscribePersona = (persona, callback) =>
  onSnapshot(
    doc(db, "weights", persona),
    (snapshot) => callback({ id: snapshot.id, ...snapshot.data() }),
    (error) => console.error("Error leyendo persona", persona, error)
  );

export const subscribePesajes = (persona, callback) =>
  onSnapshot(
    collection(db, "weights", persona, "pesajes"),
    (snapshot) =>
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (error) => console.error("Error leyendo pesajes", persona, error)
  );

export const addPesaje = async (persona, fecha, peso) => {
  await addDoc(collection(db, "weights", persona, "pesajes"), {
    fecha,
    peso: Number(peso),
  });
};

export const deletePesaje = async (persona, id) => {
  await deleteDoc(doc(db, "weights", persona, "pesajes", id));
};

export const getPesajes = async (persona) => {
  const snapshot = await getDocs(collection(db, "weights", persona, "pesajes"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const ordenarPesajes = (pesajes) =>
  [...pesajes].sort((a, b) => parseFecha(a.fecha) - parseFecha(b.fecha));

export const getUltimoPeso = (persona, pesajes) => {
  if (!pesajes || pesajes.length === 0) return persona.pesoInicial;
  return pesajes[pesajes.length - 1].peso;
};

// Todas las cifras que se muestran en la app, calculadas en un sitio
export const getEstadisticas = (persona, pesajes) => {
  const inicial = Number(persona.pesoInicial);
  const objetivo = Number(persona.pesoObjetivo);
  const actual = Number(getUltimoPeso(persona, pesajes));
  const perdidos = inicial - actual;
  const faltan = actual - objetivo;
  const total = inicial - objetivo;
  const progreso =
    total > 0 ? Math.max(0, Math.min(100, (perdidos / total) * 100)) : 0;

  const ultimoCambio =
    pesajes.length >= 2
      ? pesajes[pesajes.length - 1].peso - pesajes[pesajes.length - 2].peso
      : null;

  // Ritmo medio (kg/semana) entre el primer y el último pesaje
  let ritmo = null;
  if (pesajes.length >= 2) {
    const dias =
      (parseFecha(pesajes[pesajes.length - 1].fecha) -
        parseFecha(pesajes[0].fecha)) /
      86400000;
    if (dias >= 3) {
      ritmo = ((pesajes[pesajes.length - 1].peso - pesajes[0].peso) / dias) * 7;
    }
  }

  return {
    inicial,
    objetivo,
    actual,
    perdidos,
    faltan,
    progreso,
    ultimoCambio,
    ritmo,
    registros: pesajes.length,
  };
};
