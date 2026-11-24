import { useEffect, useRef, useState } from "react";
import { fechaCorta } from "../utils/dates";

// Gráfica de evolución del peso en SVG (ligera y adaptada al móvil).
// Toca un punto para ver la fecha y el peso.
function WeightChart({ pesajes, objetivo, color = "var(--primary)", height = 220 }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(320);
  const [sel, setSel] = useState(null);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => setSel(null), [pesajes]);

  if (!pesajes.length) {
    return (
      <div ref={ref} className="chart-empty">
        Aún no hay pesajes. Añade el primero abajo 👇
      </div>
    );
  }

  const pad = { top: 24, right: 14, bottom: 28, left: 36 };
  const w = Math.max(200, width);
  const innerW = w - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const pesos = pesajes.map((p) => Number(p.peso));
  const min = Math.floor(Math.min(...pesos, objetivo) - 1);
  const max = Math.ceil(Math.max(...pesos, objetivo) + 1);
  const range = max - min || 1;

  const x = (i) =>
    pad.left + (pesajes.length === 1 ? innerW / 2 : (i / (pesajes.length - 1)) * innerW);
  const y = (v) => pad.top + (1 - (v - min) / range) * innerH;

  const pts = pesajes.map((p, i) => [x(i), y(Number(p.peso))]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${pad.top + innerH} L${pts[0][0]},${pad.top + innerH} Z`;

  // Marcas del eje Y en números redondos
  const stepY = Math.max(1, Math.ceil(range / 4));
  const yTicks = [];
  for (let t = min; t <= max; t += stepY) yTicks.push(t);

  // Etiquetas del eje X: primera, última y alguna intermedia
  const step = Math.max(1, Math.ceil(pesajes.length / 4));
  const xLabels = pesajes
    .map((p, i) => ({ i, f: p.fecha }))
    .filter(({ i }) => i === 0 || i === pesajes.length - 1 || i % step === 0)
    .filter(({ i }) => i === pesajes.length - 1 || pesajes.length - 1 - i >= step / 2);

  const gid = `grad-${String(color).replace(/[^a-z0-9]/gi, "")}`;
  const s = sel != null ? pesajes[sel] : null;

  return (
    <div ref={ref} className="chart">
      <svg width={w} height={height} role="img" aria-label="Evolución del peso">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={w - pad.right} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" className="axis">
              {Math.round(t * 10) / 10}
            </text>
          </g>
        ))}

        {/* Línea de objetivo */}
        <line
          x1={pad.left}
          x2={w - pad.right}
          y1={y(objetivo)}
          y2={y(objetivo)}
          className="goal-line"
        />
        <text x={w - pad.right} y={y(objetivo) - 6} textAnchor="end" className="goal-label">
          🎯 {objetivo} kg
        </text>

        {pesajes.length > 1 && <path d={area} fill={`url(#${gid})`} />}
        <path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

        {pts.map(([px, py], i) => (
          <g key={pesajes[i].id || i} onClick={() => setSel(sel === i ? null : i)} style={{ cursor: "pointer" }}>
            <circle cx={px} cy={py} r="14" fill="transparent" />
            <circle
              cx={px}
              cy={py}
              r={sel === i ? 6 : 4}
              fill="var(--card)"
              stroke={color}
              strokeWidth="2.5"
            />
          </g>
        ))}

        {xLabels.map(({ i, f }) => (
          <text key={i} x={x(i)} y={height - 8} textAnchor="middle" className="axis">
            {fechaCorta(f)}
          </text>
        ))}

        {s && (
          <g transform={`translate(${Math.min(Math.max(pts[sel][0], pad.left + 44), w - pad.right - 44)}, ${Math.max(pts[sel][1] - 40, 4)})`}>
            <rect x="-44" y="0" width="88" height="30" rx="10" className="tip-bg" />
            <text x="0" y="13" textAnchor="middle" className="tip-strong">{s.peso} kg</text>
            <text x="0" y="25" textAnchor="middle" className="tip-small">{s.fecha}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default WeightChart;
