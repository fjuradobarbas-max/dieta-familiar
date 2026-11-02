  
  import { db } from "./firebase";

  import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot
  } from "firebase/firestore";

  export const subscribeProductos = (
    casa,
    callback
  ) => {
    return onSnapshot(
      collection(
        db,
        "shopping",
        casa,
        "productos"
      ),
      (snapshot) => {
        const productos = snapshot.docs.map(
          (documento) => ({
            id: documento.id,
            ...documento.data(),
          })
        );
  
        callback(productos);
      }
    );
  };

  export const updateComprado = async (
    casa,
    id,
    comprado
  ) => {
    await updateDoc(
      doc(
        db,
        "shopping",
        casa,
        "productos",
        id
      ),
      {
        comprado,
      }
    );
  };
  
  export const getProductos = async (casa) => {
    const snapshot = await getDocs(
      collection(db, "shopping", casa, "productos")
    );
  
    return snapshot.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));
  };
  
  export const addProducto = async (
    casa,
    producto
  ) => {
    await addDoc(
      collection(db, "shopping", casa, "productos"),
      producto
    );
  };
  
  export const deleteProducto = async (
    casa,
    id
  ) => {
    await deleteDoc(
      doc(
        db,
        "shopping",
        casa,
        "productos",
        id
      )
    );
  };