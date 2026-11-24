// Índice de getDay(): 0 = domingo
const DIAS_JS = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

export const getDiaHoy = (date = new Date()) => DIAS_JS[date.getDay()];

// "dd/mm/aaaa" -> Date (hora local)
export const parseFecha = (fecha) => {
  if (!fecha || typeof fecha !== "string") return new Date(NaN);
  const [d, m, a] = fecha.split("/").map(Number);
  return new Date(a, (m || 1) - 1, d || 1);
};

// "aaaa-mm-dd" (input date) -> "dd/mm/aaaa" (formato guardado en Firestore)
export const isoToFecha = (iso) => iso.split("-").reverse().join("/");

// Fecha de hoy en formato "aaaa-mm-dd" usando la hora LOCAL
// (toISOString usa UTC y de madrugada daba el día anterior)
export const hoyISO = () => {
  const h = new Date();
  const mm = String(h.getMonth() + 1).padStart(2, "0");
  const dd = String(h.getDate()).padStart(2, "0");
  return `${h.getFullYear()}-${mm}-${dd}`;
};

export const fechaCorta = (fecha) => {
  const d = parseFecha(fecha);
  if (isNaN(d)) return fecha;
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

export const fechaLarga = (date = new Date()) =>
  date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export const horaDecimal = (date = new Date()) =>
  date.getHours() + date.getMinutes() / 60;
