// Gera src/data/mapa-regiao.ts a partir das malhas municipais do IBGE (API de malhas v3, GeoJSON).
// Roda uma vez, offline em relação ao site: o resultado é versionado e o site nunca chama o IBGE.
//
// Uso: npm run mapa:gerar
//
// Passos: baixa o contorno de cada município -> projeta para o plano (equirretangular corrigida
// pela latitude média) -> recorta no quadro MAP_FRAME -> simplifica (Douglas-Peucker) -> grava paths SVG.

import { writeFileSync } from "node:fs";
import { CITIES, CONTEXT_CITIES, MAP_FRAME } from "../src/data/regiao.ts";

const WIDTH = 1000;
const TOLERANCE = 0.9; // em unidades do viewBox; quanto maior, mais simples o traço
const { west, east, north, south } = MAP_FRAME;
const k = Math.cos((((north + south) / 2) * Math.PI) / 180);
const scale = WIDTH / ((east - west) * k);
const HEIGHT = Math.round((north - south) * scale);

const project = ([lon, lat]) => [(lon - west) * k * scale, (north - lat) * scale];

/** Sutherland-Hodgman: recorta um anel contra o retângulo do quadro. */
function clipRing(ring) {
  const edges = [
    (p) => p[0] >= 0,
    (p) => p[0] <= WIDTH,
    (p) => p[1] >= 0,
    (p) => p[1] <= HEIGHT,
  ];
  const cut = [
    (a, b) => [0, a[1] + ((b[1] - a[1]) * (0 - a[0])) / (b[0] - a[0])],
    (a, b) => [WIDTH, a[1] + ((b[1] - a[1]) * (WIDTH - a[0])) / (b[0] - a[0])],
    (a, b) => [a[0] + ((b[0] - a[0]) * (0 - a[1])) / (b[1] - a[1]), 0],
    (a, b) => [a[0] + ((b[0] - a[0]) * (HEIGHT - a[1])) / (b[1] - a[1]), HEIGHT],
  ];
  let out = ring;
  for (let e = 0; e < 4 && out.length; e++) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      const curIn = edges[e](cur);
      const prevIn = edges[e](prev);
      if (curIn) {
        if (!prevIn) out.push(cut[e](prev, cur));
        out.push(cur);
      } else if (prevIn) {
        out.push(cut[e](prev, cur));
      }
    }
  }
  return out;
}

function distToSegment(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len)) : 0;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function simplify(points) {
  if (points.length < 4) return points;
  let max = 0;
  let idx = 0;
  const last = points.length - 1;
  for (let i = 1; i < last; i++) {
    const d = distToSegment(points[i], points[0], points[last]);
    if (d > max) {
      max = d;
      idx = i;
    }
  }
  if (max <= TOLERANCE) return [points[0], points[last]];
  return [...simplify(points.slice(0, idx + 1)).slice(0, -1), ...simplify(points.slice(idx))];
}

function simplifyRing(ring) {
  // Divide o anel em duas metades para o Douglas-Peucker não colapsar o polígono fechado.
  const mid = Math.floor(ring.length / 2);
  const a = simplify(ring.slice(0, mid + 1));
  const b = simplify([...ring.slice(mid), ring[0]]);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}

function area(ring) {
  let s = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
}

function inside(p, rings) {
  let c = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
    }
  }
  return c;
}

/** Ponto interno mais distante das bordas (onde cabe o rótulo/contagem). */
function anchor(rings) {
  const xs = rings.flat().map((p) => p[0]);
  const ys = rings.flat().map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let best = [(x0 + x1) / 2, (y0 + y1) / 2];
  let bestD = -1;
  const N = 60;
  for (let i = 1; i < N; i++) {
    for (let j = 1; j < N; j++) {
      const p = [x0 + ((x1 - x0) * i) / N, y0 + ((y1 - y0) * j) / N];
      if (!inside(p, rings)) continue;
      let d = Infinity;
      for (const ring of rings) {
        for (let m = 0; m < ring.length; m++) d = Math.min(d, distToSegment(p, ring[m], ring[(m + 1) % ring.length]));
      }
      if (d > bestD) {
        bestD = d;
        best = p;
      }
    }
  }
  return { point: best.map((v) => Math.round(v)), radius: Math.round(bestD), bbox: [x0, y0, x1, y1].map(Math.round) };
}

const r1 = (n) => Math.round(n * 10) / 10;

/** Ponto em cima de uma borda do quadro (lado do recorte). */
function onFrame(p) {
  const e = 0.5;
  return p[0] <= e ? "w" : p[0] >= WIDTH - e ? "e" : p[1] <= e ? "n" : p[1] >= HEIGHT - e ? "s" : null;
}

/**
 * Divisa "de verdade": o contorno sem os trechos que só existem por causa do recorte.
 * É ela que recebe borda e brilho, para não aparecer linha reta na beira do mapa.
 */
function outlineOf(rings) {
  let d = "";
  for (const ring of rings) {
    const n = ring.length;
    // começa num vértice cujo segmento anterior seja real, para não partir a linha no meio
    let start = 0;
    for (let i = 0; i < n; i++) {
      const a = ring[(i + n - 1) % n];
      const b = ring[i];
      const fa = onFrame(a);
      if (!(fa && fa === onFrame(b))) {
        start = i;
        break;
      }
    }
    let pen = false;
    for (let k = 0; k <= n; k++) {
      const a = ring[(start + k - 1 + n) % n];
      const b = ring[(start + k) % n];
      const fa = onFrame(a);
      const artificial = fa && fa === onFrame(b);
      if (k === 0 || artificial) {
        pen = false;
        continue;
      }
      if (!pen) d += `M${r1(a[0])} ${r1(a[1])}`;
      d += `L${r1(b[0])} ${r1(b[1])}`;
      pen = true;
    }
  }
  return d;
}

async function shape(code) {
  const url = `https://servicodados.ibge.gov.br/api/v3/malhas/municipios/${code}?formato=application/vnd.geo+json&qualidade=maxima`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IBGE respondeu ${res.status} para ${code}`);
  const geo = await res.json();
  const g = geo.features[0].geometry;
  const polys = g.type === "MultiPolygon" ? g.coordinates : [g.coordinates];
  const rings = [];
  let clipped = false;
  for (const poly of polys) {
    for (const ring of poly) {
      const projected = ring.slice(0, -1).map(project);
      const c = clipRing(projected);
      if (c.length !== projected.length || c.some((p, i) => p !== projected[i])) clipped = true;
      if (c.length < 3) continue;
      const s = simplifyRing(c);
      if (s.length >= 3 && Math.abs(area(s)) > 4) rings.push(s);
    }
  }
  const d = rings.map((ring) => "M" + ring.map((p) => `${r1(p[0])} ${r1(p[1])}`).join("L") + "Z").join("");
  return { d, outline: outlineOf(rings), clipped, ...anchor(rings) };
}

const out = { cities: {}, context: {} };
for (const c of CITIES) out.cities[c.id] = await shape(c.ibge);
for (const c of CONTEXT_CITIES) out.context[c.id] = await shape(c.ibge);

const file = `// ARQUIVO GERADO por scripts/gerar-mapa-regiao.mjs a partir das malhas municipais do IBGE
// (API de malhas v3, qualidade máxima). Não edite à mão: ajuste src/data/regiao.ts e rode \`npm run mapa:gerar\`.
// Gerado em ${new Date().toISOString().slice(0, 10)}. Recorte: ${JSON.stringify(MAP_FRAME)}.

export type MapShape = {
  /** Path SVG no viewBox do mapa. */
  d: string;
  /** Só a divisa real (sem os trechos criados pelo recorte): recebe borda e brilho. */
  outline: string;
  /** true se o município foi cortado pelo quadro (aparece com borda esmaecida). */
  clipped: boolean;
  /** Ponto interno mais distante das bordas: onde ficam rótulo e contagem. */
  point: [number, number];
  /** Raio livre em volta do ponto. */
  radius: number;
  bbox: [number, number, number, number];
};

export const MAP_VIEWBOX = { width: ${WIDTH}, height: ${HEIGHT} } as const;

export const CITY_SHAPES: Record<string, MapShape> = ${JSON.stringify(out.cities, null, 2)};

export const CONTEXT_SHAPES: Record<string, MapShape> = ${JSON.stringify(out.context, null, 2)};
`;
writeFileSync(new URL("../src/data/mapa-regiao.ts", import.meta.url), file);
console.log(`OK: viewBox ${WIDTH}x${HEIGHT}`);
for (const [id, s] of Object.entries({ ...out.cities, ...out.context })) {
  console.log(id.padEnd(22), "bbox", s.bbox.join(","), "raio", s.radius, s.clipped ? "(recortado)" : "", "chars", s.d.length);
}
