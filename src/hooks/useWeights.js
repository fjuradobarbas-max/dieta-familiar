import { useEffect, useState } from "react";
import { PERSONAS } from "../constants";
import {
  subscribePersona,
  subscribePesajes,
  ordenarPesajes,
} from "../services/progressService";

const estadoInicial = () =>
  Object.fromEntries(
    PERSONAS.map((p) => [p.id, { persona: null, pesajes: [] }])
  );

// Suscripción en tiempo real a los pesos de todas las personas
export function useWeights() {
  const [datos, setDatos] = useState(estadoInicial);

  useEffect(() => {
    const unsubs = [];

    PERSONAS.forEach(({ id }) => {
      unsubs.push(
        subscribePersona(id, (persona) =>
          setDatos((d) => ({ ...d, [id]: { ...d[id], persona } }))
        )
      );
      unsubs.push(
        subscribePesajes(id, (pesajes) =>
          setDatos((d) => ({
            ...d,
            [id]: { ...d[id], pesajes: ordenarPesajes(pesajes) },
          }))
        )
      );
    });

    return () => unsubs.forEach((u) => u());
  }, []);

  const cargado = PERSONAS.every(
    ({ id }) => datos[id].persona && datos[id].persona.pesoInicial != null
  );

  return { datos, cargado };
}
