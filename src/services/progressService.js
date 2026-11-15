import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
  } from "firebase/firestore";
  
  import { db } from "./firebase";
  
  export const subscribePersona = (
    persona,
    callback
  ) => {
    return onSnapshot(
      doc(db, "weights", persona),
      (snapshot) => {
        callback({
          id: snapshot.id,
          ...snapshot.data(),
        });
      }
    );
  };
  
  export const subscribePesajes = (
    persona,
    callback
  ) => {
    return onSnapshot(
      collection(
        db,
        "weights",
        persona,
        "pesajes"
      ),
      (snapshot) => {
        const pesajes = snapshot.docs.map(
          (documento) => ({
            id: documento.id,
            ...documento.data(),
          })
        );
  
        callback(pesajes);
      }
    );
  };
  
  
  export const addPesaje = async (
    persona,
    fecha,
    peso
  ) => {
  
    console.log(
      "Añadiendo pesaje:",
      persona,
      fecha,
      peso
    );
  
    const docRef = await addDoc(
      collection(
        db,
        "weights",
        persona,
        "pesajes"
      ),
      {
        fecha,
        peso: Number(peso),
      }
    );
  
    console.log(
      "Documento creado:",
      docRef.id
    );
  };
  
  export const deletePesaje =
    async (
      persona,
      id
    ) => {
      await deleteDoc(
        doc(
          db,
          "weights",
          persona,
          "pesajes",
          id
        )
      );
    };

    export const getPesajes = async (
        persona
      ) => {
        const snapshot = await getDocs(
          collection(
            db,
            "weights",
            persona,
            "pesajes"
          )
        );
      
        return snapshot.docs.map(
          (documento) => ({
            id: documento.id,
            ...documento.data(),
          })
        );
      };

      export const ordenarPesajes = (
        pesajes
      ) => {
        return [...pesajes].sort(
          (a, b) => {
            const [da, ma, aa] =
              a.fecha.split("/");
            const [db, mb, ab] =
              b.fecha.split("/");
      
            const fechaA =
              new Date(
                `${aa}-${ma}-${da}`
              );
      
            const fechaB =
              new Date(
                `${ab}-${mb}-${db}`
              );
      
            return fechaA - fechaB;
          }
        );
      };
      export const getUltimoPeso = (
        persona,
        pesajes
      ) => {
      
        if (
          !pesajes ||
          pesajes.length === 0
        ) {
          return persona.pesoInicial;
        }
      
        return pesajes[
          pesajes.length - 1
        ].peso;
      };