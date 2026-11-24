// Datos fijos de la app. La base de datos (Firestore) sigue siendo la misma:
//   weights/{persona}                 -> { nombre, pesoInicial, pesoObjetivo }
//   weights/{persona}/pesajes/{id}    -> { fecha: "dd/mm/aaaa", peso }
//   shopping/{casa}/productos/{id}    -> { nombre, cantidad, categoria, comprado }

export const PERSONAS = [
  { id: "fernando", nombre: "Fernando", emoji: "👨", color: "var(--fernando)" },
  { id: "debora", nombre: "Débora", emoji: "👩", color: "var(--debora)" },
];

export const getPersonaInfo = (id) =>
  PERSONAS.find((p) => p.id === id) || PERSONAS[0];

export const CASAS = [
  { id: "guadalajara", nombre: "Guadalajara" },
  { id: "murillo", nombre: "Murillo" },
];

export const COMIDAS = [
  { id: "desayuno", nombre: "Desayuno", emoji: "🍳", hasta: 10.5 },
  { id: "almuerzo", nombre: "Almuerzo", emoji: "🍎", hasta: 12.75 },
  { id: "comida", nombre: "Comida", emoji: "🍽️", hasta: 16 },
  { id: "merienda", nombre: "Merienda", emoji: "🥜", hasta: 19 },
  { id: "cena", nombre: "Cena", emoji: "🌙", hasta: 24 },
];

export const CATEGORIAS = [
  { id: "carne", nombre: "Carne", emoji: "🥩" },
  { id: "pescado", nombre: "Pescado", emoji: "🐟" },
  { id: "pasta", nombre: "Pasta y legumbres", emoji: "🍝" },
  { id: "verduras", nombre: "Verduras", emoji: "🥬" },
  { id: "fruta", nombre: "Fruta", emoji: "🍎" },
  { id: "lacteos", nombre: "Lácteos y desayunos", emoji: "🥛" },
  { id: "limpieza", nombre: "Limpieza e higiene", emoji: "🧻" },
  { id: "hogar", nombre: "Hogar", emoji: "🏠" },
  { id: "otros", nombre: "Otros", emoji: "📦" },
];

// Orden de la semana para el selector (lunes primero)
export const SEMANA = [
  { id: "lunes", corto: "L", nombre: "Lunes" },
  { id: "martes", corto: "M", nombre: "Martes" },
  { id: "miercoles", corto: "X", nombre: "Miércoles" },
  { id: "jueves", corto: "J", nombre: "Jueves" },
  { id: "viernes", corto: "V", nombre: "Viernes" },
  { id: "sabado", corto: "S", nombre: "Sábado" },
  { id: "domingo", corto: "D", nombre: "Domingo" },
];
