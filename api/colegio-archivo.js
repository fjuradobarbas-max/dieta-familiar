import { ARCHIVO_URL } from "./_colegio.js";

// GET /api/colegio-archivo?id=9197 -> abre el PDF dentro de la app
// (solo ids numéricos, siempre de la web del colegio)
export default async function handler(req, res) {
  const id = String(req.query.id || "");
  if (!/^\d{1,8}$/.test(id)) {
    res.status(400).send("id no válido");
    return;
  }
  try {
    const r = await fetch(ARCHIVO_URL + id, {
      headers: { "User-Agent": "Mozilla/5.0 (DietaContigo)" },
    });
    if (!r.ok) {
      res.status(502).send(`El colegio respondió ${r.status}`);
      return;
    }
    const buf = Buffer.from(await r.arrayBuffer());
    const tipo = r.headers.get("content-type") || "application/pdf";
    const nombre =
      (r.headers.get("content-disposition") || "").match(/filename="?([^";]+)"?/i)?.[1] ||
      `menu-${id}.pdf`;
    res.setHeader("Content-Type", tipo.includes("octet-stream") ? "application/pdf" : tipo);
    res.setHeader("Content-Disposition", `inline; filename="${nombre.replace(/[^\w.\- ]/g, "_")}"`);
    res.setHeader("Cache-Control", "public, s-maxage=86400, max-age=86400");
    res.status(200).send(buf);
  } catch (e) {
    res.status(502).send(String(e.message || e));
  }
}
