import { leerReceta } from "./_receta.js";

// GET /api/receta?url=<enlace de TikTok o Instagram>
// Devuelve miniatura, autor, descripción completa, ingredientes y pasos.
export default async function handler(req, res) {
  const url = String(req.query.url || "").trim();
  if (!url) {
    res.status(400).json({ error: "Falta el enlace" });
    return;
  }
  try {
    const receta = await leerReceta(url);
    res.setHeader("Cache-Control", "s-maxage=600");
    res.status(200).json(receta);
  } catch (e) {
    res.status(422).json({ error: String(e.message || e) });
  }
}
