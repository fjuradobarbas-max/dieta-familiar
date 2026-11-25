// Lectura de recetas desde enlaces de TikTok e Instagram.
// (Los ficheros que empiezan por "_" no se publican como endpoints)

import { decodeEntities } from "./_colegio.js";

const UA_NAVEGADOR =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
// Instagram sirve las etiquetas og: a los rastreadores de enlaces
const UA_PREVIEW = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

export function detectarPlataforma(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(u.protocol)) return null;
  const h = u.hostname.toLowerCase();
  if (h === "tiktok.com" || h.endsWith(".tiktok.com")) return "tiktok";
  if (h === "instagram.com" || h.endsWith(".instagram.com") || h === "instagr.am") return "instagram";
  return null;
}

// Extrae el primer enlace de un texto compartido ("Mira este vídeo https://...")
export function extraerEnlace(texto) {
  const m = String(texto || "").match(/https?:\/\/[^\s"'<>]+/i);
  return m ? m[0].replace(/[),.]+$/, "") : null;
}

const meta = (html, prop) => {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`,
    "i"
  );
  const m = html.match(re);
  return m ? decodeEntities(m[1] ?? m[2] ?? "") : null;
};

const textoPlano = (html) =>
  decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/[ \t]+\n/g, "\n")
    .trim();

// ---------- TikTok ----------
const ID_TIKTOK = /\/(?:video|photo)\/(\d{8,})/;

// Sigue las redirecciones de los enlaces cortos (vm.tiktok.com, vt.tiktok.com,
// tiktok.com/t/...) leyendo la cabecera Location, sin cargar la página final
async function resolverTikTok(url) {
  let actual = url;
  for (let i = 0; i < 6 && !ID_TIKTOK.test(actual); i++) {
    let r;
    try {
      r = await fetch(actual, { redirect: "manual", headers: { "User-Agent": UA_NAVEGADOR } });
    } catch {
      break;
    }
    const loc = r.headers.get("location");
    if (loc) {
      actual = new URL(loc, actual).toString();
      continue;
    }
    if (r.ok) {
      const html = await r.text();
      const m =
        html.match(/https:\/\/www\.tiktok\.com\/@[\w.-]+\/(?:video|photo)\/\d+/) ||
        html.match(/"canonical":"([^"]+)"/);
      if (m) actual = (m[1] || m[0]).replace(/\\u002F/g, "/");
    }
    break;
  }
  return actual;
}

async function oembedTikTok(url) {
  try {
    const r = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      headers: { "User-Agent": UA_NAVEGADOR, Accept: "application/json" },
    });
    if (!r.ok) return null;
    const o = await r.json();
    return o && (o.thumbnail_url || o.title || o.author_name) ? o : null;
  } catch {
    return null;
  }
}

// Alternativa pública cuando TikTok no responde al servidor
async function tikwm(url) {
  try {
    const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
      headers: { "User-Agent": UA_NAVEGADOR, Accept: "application/json" },
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j && j.code === 0 && j.data ? j.data : null;
  } catch {
    return null;
  }
}

async function leerTikTok(url) {
  const final = await resolverTikTok(url);
  let videoId = (final.match(ID_TIKTOK) || [])[1] || null;
  let usuario = (final.match(/tiktok\.com\/@([\w.-]+)/) || [])[1] || null;

  const enlaceVideo = (id, user) =>
    user ? `https://www.tiktok.com/@${user}/video/${id}` : `https://m.tiktok.com/v/${id}.html`;
  const canonica = videoId ? enlaceVideo(videoId, usuario) : final.split("?")[0];

  let o = await oembedTikTok(canonica);
  if (!o && canonica !== url) o = await oembedTikTok(url);

  const res = {
    plataforma: "tiktok",
    url: canonica,
    videoId,
    autor: "",
    autorUrl: "",
    miniatura: "",
    descripcion: "",
  };

  if (o) {
    videoId ||= (String(o.html || "").match(/data-video-id=["'](\d+)/) || [])[1] || null;
    usuario ||= o.author_unique_id || null;
    res.autor = o.author_unique_id || o.author_name || "";
    res.autorUrl = o.author_url || "";
    res.miniatura = o.thumbnail_url || "";
    res.descripcion = o.title || "";
  }

  // Si falta la miniatura o el texto, segunda vía
  if (!res.miniatura || !res.descripcion) {
    const t = await tikwm(videoId ? canonica : url);
    if (t) {
      videoId ||= t.id ? String(t.id) : null;
      usuario ||= t.author?.unique_id || null;
      res.autor ||= t.author?.unique_id || t.author?.nickname || "";
      res.miniatura ||= t.origin_cover || t.cover || "";
      res.descripcion ||= t.title || "";
    }
  }

  if (!videoId && !res.miniatura && !res.descripcion) {
    throw new Error("TikTok no ha devuelto información de este vídeo");
  }

  res.videoId = videoId;
  if (videoId) res.url = enlaceVideo(videoId, usuario);
  if (usuario && !res.autorUrl) res.autorUrl = `https://www.tiktok.com/@${usuario}`;
  return res;
}

// ---------- Instagram ----------
export const codigoInstagram = (url) =>
  (url.match(/instagram\.com\/(?:[\w.]+\/)?(?:p|reel|reels|tv)\/([\w-]+)/i) || [])[1] || null;

async function leerInstagram(url) {
  let codigo = codigoInstagram(url);
  if (!codigo) {
    // enlaces compartidos tipo instagram.com/share/...
    try {
      const r = await fetch(url, { redirect: "follow", headers: { "User-Agent": UA_NAVEGADOR } });
      codigo = codigoInstagram(r.url || "");
    } catch {
      /* nada */
    }
  }
  if (!codigo) throw new Error("No reconozco este enlace de Instagram");

  const res = {
    plataforma: "instagram",
    url: `https://www.instagram.com/p/${codigo}/`,
    videoId: codigo,
    autor: "",
    autorUrl: "",
    miniatura: "",
    descripcion: "",
  };

  // 1) Página de inserción con el texto completo
  try {
    const r = await fetch(`https://www.instagram.com/p/${codigo}/embed/captioned/`, {
      headers: { "User-Agent": UA_NAVEGADOR, "Accept-Language": "es-ES,es;q=0.9" },
    });
    if (r.ok) {
      const html = await r.text();
      const cap = html.match(/<div class=["']Caption["'][^>]*>([\s\S]*?)<div class=["']CaptionComments/i);
      if (cap) {
        const user = cap[1].match(/class=["']CaptionUsername["'][^>]*>([\s\S]*?)<\/a>/i);
        if (user) res.autor = textoPlano(user[1]);
        res.descripcion = textoPlano(
          cap[1].replace(/<a[^>]*class=["']CaptionUsername["'][\s\S]*?<\/a>/i, "")
        );
      }
      if (!res.autor) {
        const u = html.match(/class=["']UsernameText["'][^>]*>([\s\S]*?)</i);
        if (u) res.autor = textoPlano(u[1]);
      }
      const img = html.match(/class=["']EmbeddedMediaImage["'][^>]*src=["']([^"']+)/i) ||
        html.match(/<img[^>]+src=["']([^"']+)["'][^>]*class=["']EmbeddedMediaImage/i);
      if (img) res.miniatura = decodeEntities(img[1]);
    }
  } catch {
    /* probamos la otra vía */
  }

  // 2) Etiquetas og: de la publicación (miniatura y texto si faltan)
  if (!res.miniatura || !res.descripcion || !res.autor) {
    try {
      const r = await fetch(res.url, { headers: { "User-Agent": UA_PREVIEW } });
      if (r.ok) {
        const html = await r.text();
        res.miniatura ||= meta(html, "og:image") || "";
        const desc = meta(html, "og:description") || meta(html, "description") || "";
        // Formato: '123 likes, 4 comments - usuario on 3 de noviembre: "texto"'
        const dm = desc.match(/^[\s\S]*?-\s*([\w.]+)[^:]*:\s*["“]([\s\S]*)["”]\s*\.?$/);
        if (dm) {
          res.autor ||= dm[1];
          res.descripcion ||= dm[2];
        } else {
          res.descripcion ||= desc;
        }
        if (!res.autor) {
          const t = meta(html, "og:title") || "";
          const tm = t.match(/@([\w.]+)/) || t.match(/^([^•(]+?)\s+(?:on|en)\s+Instagram/i);
          if (tm) res.autor = tm[1].trim();
        }
      }
    } catch {
      /* nada */
    }
  }

  if (!res.descripcion && !res.miniatura) {
    throw new Error("Instagram no ha dejado leer esta publicación (puede ser privada)");
  }
  if (res.autor) res.autorUrl = `https://www.instagram.com/${res.autor.replace(/^@/, "")}/`;
  return res;
}

// ---------- Separar ingredientes y pasos ----------
const CAB_ING = /^(?:[^\w]*\s*)?(ingredientes?|ingredients?|necesitas|lo que necesitas)\b[^\n]*$/i;
const CAB_PASOS = /^(?:[^\w]*\s*)?(preparaci[oó]n|elaboraci[oó]n|pasos|instrucciones|procedimiento|m[eé]todo|c[oó]mo (?:se )?hacer(?:lo)?|receta|steps|instructions|method|directions)\b[^\n]*$/i;
const UNIDADES = /\b\d+([.,/]\d+)?\s*(g|gr|grs|gramos?|kg|ml|l|litros?|cl|cdas?|cucharadas?|cditas?|cucharaditas?|tazas?|vasos?|uds?|unidades?|dientes?|latas?|sobres?|pizcas?|cups?|tbsp|tsp|oz|lb)\b|\b(una?|dos|tres|cuatro|medi[oa]|½|¼)\s+(taza|cucharada|cucharadita|pizca|lata|diente|vaso|huevo|cebolla|pechuga)/i;
const VIÑETA = /^\s*(?:[-•*·▪️▫️✅✔️☑️🔸🔹👉➡️▶️]|\p{Extended_Pictographic}️?)\s*/u;
const NUMERADO = /^\s*\d️?⃣\s*|^\s*(?:paso\s*)?\d{1,2}\s*[.)\-:º]\s*/i;

const limpiarLinea = (l) => l.replace(VIÑETA, "").replace(NUMERADO, "").trim();
const esSoloHashtags = (l) => /^(?:\s*[#@][\p{L}\p{N}_.]+)+\s*$/u.test(l);

export function separarReceta(descripcion, autor) {
  const lineas = String(descripcion || "")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l && !esSoloHashtags(l));

  let ingredientes = [];
  let pasos = [];
  let modo = null;
  let hayCabeceras = false;

  for (const l of lineas) {
    if (CAB_ING.test(l) && l.length < 60) {
      modo = "ing";
      hayCabeceras = true;
      const resto = l.replace(/^[^:]*:\s*/, "");
      if (resto && resto !== l) ingredientes.push(...resto.split(/,\s*/));
      continue;
    }
    if (CAB_PASOS.test(l) && l.length < 60) {
      modo = "pasos";
      hayCabeceras = true;
      continue;
    }
    if (modo === "ing") ingredientes.push(limpiarLinea(l));
    else if (modo === "pasos") pasos.push(limpiarLinea(l));
  }

  // Sin cabeceras: solo intentamos adivinar si el texto viene en varias líneas
  if (!hayCabeceras && lineas.length >= 3) {
    for (const l of lineas) {
      if (NUMERADO.test(l)) pasos.push(limpiarLinea(l));
      else if (UNIDADES.test(l) && l.length < 90) ingredientes.push(limpiarLinea(l));
    }
  }

  ingredientes = ingredientes.map((x) => x.replace(/[#@][\p{L}\p{N}_.]+/gu, "").trim()).filter(Boolean);
  pasos = pasos.map((x) => x.replace(/\s+#[\p{L}\p{N}_]+/gu, "").trim()).filter(Boolean);

  const primera = (lineas[0] || "").replace(/[#@][\p{L}\p{N}_.]+/gu, "").replace(VIÑETA, "").trim();
  let titulo = primera.split(/(?<=[.!?¡])\s/)[0] || "";
  if (titulo.length > 70) titulo = titulo.slice(0, 67).trimEnd() + "…";
  if (!titulo || CAB_ING.test(titulo)) titulo = autor ? `Receta de ${autor}` : "Receta";

  return { titulo, ingredientes, pasos };
}

// ---------- Opcional: estructurar con Claude si hay clave configurada ----------
async function estructurarConIA(descripcion, autor) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || !descripcion) return null;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content:
              `Este es el texto de un vídeo de recetas de ${autor || "un creador"}. ` +
              "Extrae la receta en español. Responde SOLO con JSON con esta forma: " +
              '{"titulo": string corto, "raciones": string o null, "tiempo": string o null, ' +
              '"ingredientes": [string con cantidad], "pasos": [string]}. ' +
              "No inventes cantidades que no aparezcan; si no hay pasos explícitos, deja la lista vacía.\n\n" +
              descripcion.slice(0, 6000),
          },
        ],
      }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    const txt = (d.content || []).map((c) => c.text || "").join("");
    const json = JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
    if (!Array.isArray(json.ingredientes) || !Array.isArray(json.pasos)) return null;
    return json;
  } catch {
    return null;
  }
}

export async function leerReceta(enlace) {
  const url = extraerEnlace(enlace) || enlace;
  const plataforma = detectarPlataforma(url);
  if (!plataforma) throw new Error("El enlace tiene que ser de TikTok o Instagram");

  const datos = plataforma === "tiktok" ? await leerTikTok(url) : await leerInstagram(url);
  const ia = await estructurarConIA(datos.descripcion, datos.autor);
  const auto = separarReceta(datos.descripcion, datos.autor);

  return {
    ...datos,
    titulo: ia?.titulo || auto.titulo,
    ingredientes: ia?.ingredientes?.length ? ia.ingredientes : auto.ingredientes,
    pasos: ia?.pasos?.length ? ia.pasos : auto.pasos,
    raciones: ia?.raciones || null,
    tiempo: ia?.tiempo || null,
    extraidoCon: ia ? "ia" : "auto",
  };
}
