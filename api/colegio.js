import { descargarHtml, parsearDescargas, COLEGIO_URL } from "./_colegio.js";

// GET /api/colegio -> menús del comedor publicados en la web del colegio
export default async function handler(req, res) {
  try {
    const html = await descargarHtml();
    const datos = parsearDescargas(html);
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({ fuente: COLEGIO_URL, actualizado: new Date().toISOString(), ...datos });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e), fuente: COLEGIO_URL });
  }
}
