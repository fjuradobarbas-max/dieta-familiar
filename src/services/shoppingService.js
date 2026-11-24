import { db } from "./firebase";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";

// Misma estructura de siempre: shopping/{casa}/productos

export const subscribeProductos = (casa, callback) =>
  onSnapshot(
    collection(db, "shopping", casa, "productos"),
    (snapshot) =>
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (error) => console.error("Error leyendo productos", casa, error)
  );

export const updateComprado = async (casa, id, comprado) => {
  await updateDoc(doc(db, "shopping", casa, "productos", id), { comprado });
};

// Antes faltaba importar getDocs y esta función fallaba
export const getProductos = async (casa) => {
  const snapshot = await getDocs(collection(db, "shopping", casa, "productos"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addProducto = async (casa, producto) => {
  await addDoc(collection(db, "shopping", casa, "productos"), producto);
};

export const deleteProducto = async (casa, id) => {
  await deleteDoc(doc(db, "shopping", casa, "productos", id));
};

// Acciones en bloque (una sola escritura)
export const deleteProductos = async (casa, ids) => {
  const batch = writeBatch(db);
  ids.forEach((id) => batch.delete(doc(db, "shopping", casa, "productos", id)));
  await batch.commit();
};

export const setCompradoMuchos = async (casa, ids, comprado) => {
  const batch = writeBatch(db);
  ids.forEach((id) =>
    batch.update(doc(db, "shopping", casa, "productos", id), { comprado })
  );
  await batch.commit();
};
