import {
    collection,
    addDoc,
    getDocs
  } from "firebase/firestore";
  
  import { db } from "./firebase";
  
  export const getProductos = async (casa) => {
    const snapshot = await getDocs(
      collection(db, "shopping", casa, "productos")
    );
  
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };
  
  export const addProducto = async (casa, producto) => {
    await addDoc(
      collection(db, "shopping", casa, "productos"),
      producto
    );
  };