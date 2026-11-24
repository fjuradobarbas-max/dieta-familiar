// Utilidades compartidas para leer la web del comedor del colegio.
// (Los ficheros que empiezan por "_" no se publican como endpoints en Vercel)

export const COLEGIO_URL =
  "https://www.adoratricesguadalajara.es/web/text.php?id_section=167";
export const ARCHIVO_URL =
  "https://www.adoratricesguadalajara.es/br/Files.php?method=downloadFile&id=";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const ENTIDADES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
  ntilde: "ñ", Ntilde: "Ñ", uuml: "ü", Uuml: "Ü", ordm: "º", ordf: "ª",
};

export const decodeEntities = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTIDADES[n] ?? m);

const limpiar = (s) =>
  decodeEntities(s.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

const sinAcentos = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const capitalizar = (s) =>
  s
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

// Descarga el HTML respetando la codificación de la página (puede ser latin-1)
export async function descargarHtml() {
  const r = await fetch(COLEGIO_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (DietaContigo)" },
  });
  if (!r.ok) throw new Error(`La web del colegio respondió ${r.status}`);
  const buf = await r.arrayBuffer();
  const ct = r.headers.get("content-type") || "";
  let charset = (ct.match(/charset=([\w-]+)/i) || [])[1];
  if (!charset) {
    const cabecera = new TextDecoder("latin1").decode(buf.slice(0, 4000));
    charset = (cabecera.match(/charset=["']?([\w-]+)/i) || [])[1] || "utf-8";
  }
  try {
    return new TextDecoder(charset.toLowerCase()).decode(buf);
  } catch {
    return new TextDecoder("utf-8").decode(buf);
  }
}

// Extrae todos los enlaces de descarga con su fecha y, si es un menú, su mes
export function parsearDescargas(html) {
  const resultado = [];
  const vistos = new Set();
  const re = /<a\b[^>]*href=["']([^"']*downloadFile[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = decodeEntities(m[1]);
    const id = (href.match(/[?&]id=(\d+)/) || [])[1];
    if (!id || vistos.has(id)) continue;
    const titulo = limpiar(m[2]);
    if (!titulo) continue;
    vistos.add(id);

    // Fecha dd/mm/aaaa más cercana antes del enlace
    const antes = html.slice(Math.max(0, m.index - 600), m.index);
    const fechas = [...antes.matchAll(/(\d{1,2})\/(\d{1,2})\/(\d{4})/g)];
    const f = fechas[fechas.length - 1];
    const fecha = f ? `${f[1].padStart(2, "0")}/${f[2].padStart(2, "0")}/${f[3]}` : null;

    const item = { id, titulo, fecha, url: ARCHIVO_URL + id };

    const t = sinAcentos(titulo);
    if (t.startsWith("menu")) {
      const mesIdx = MESES.findIndex((mes) => t.includes(mes));
      if (mesIdx >= 0) {
        // Año: el de publicación; si el menú es de un mes anterior al de
        // publicación (p. ej. publicado en diciembre para enero) es del año siguiente
        let anio = f ? Number(f[3]) : new Date().getFullYear();
        const mesPub = f ? Number(f[2]) - 1 : mesIdx;
        if (mesIdx < mesPub - 6) anio += 1;
        const tipoRaw = t.replace(/^menu\s*/, "").replace(MESES[mesIdx], "").replace(/\d{4}/g, "").trim();
        item.mes = mesIdx + 1;
        item.anio = anio;
        item.tipo = tipoRaw ? capitalizar(tipoRaw) : "General";
      }
    }
    resultado.push(item);
  }
  return {
    menus: resultado.filter((x) => x.mes),
    otros: resultado.filter((x) => !x.mes),
  };
}
