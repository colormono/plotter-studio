// engine.jsx — Plotter Studio generative engine
// Pure-ish geometry: seeded RNG, recursive grid, collection renderers.
// Everything outputs vector primitives (no fills) so it reads as real plotter art.

// ---------- seeded RNG (mulberry32) ----------
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const rnd = (rng, a, b) => a + rng() * (b - a);

// ---------- Liang–Barsky line clip to rect ----------
function clipLine(x0, y0, x1, y1, xmin, ymin, xmax, ymax) {
  let t0 = 0, t1 = 1;
  const dx = x1 - x0, dy = y1 - y0;
  const p = [-dx, dx, -dy, dy];
  const q = [x0 - xmin, xmax - x0, y0 - ymin, ymax - y0];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return null; }
    else {
      const r = q[i] / p[i];
      if (p[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
      else { if (r < t0) return null; if (r < t1) t1 = r; }
    }
  }
  return [x0 + t0 * dx, y0 + t0 * dy, x0 + t1 * dx, y0 + t1 * dy];
}

// hatch a rect with parallel lines at angleDeg, spacing mm
function hatch(b, angleDeg, spacing) {
  const out = [];
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a), dy = Math.sin(a);     // line direction
  const nx = -dy, ny = dx;                        // normal
  const corners = [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]];
  let cmin = Infinity, cmax = -Infinity;
  for (const [cx, cy] of corners) { const c = cx * nx + cy * ny; if (c < cmin) cmin = c; if (c > cmax) cmax = c; }
  const start = Math.ceil(cmin / spacing) * spacing;
  const BIG = (b.w + b.h) * 2;
  for (let c = start; c <= cmax; c += spacing) {
    const px = nx * c, py = ny * c;
    const seg = clipLine(px - dx * BIG, py - dy * BIG, px + dx * BIG, py + dy * BIG,
      b.x, b.y, b.x + b.w, b.y + b.h);
    if (seg) out.push({ k: 'line', x1: seg[0], y1: seg[1], x2: seg[2], y2: seg[3] });
  }
  return out;
}

// ---------- collections: render(value, bounds) -> primitives ----------
const COLLECTIONS = {
  'silence': { label: 'silence', render: () => [] },

  'regular-textures': {
    label: 'regular-textures',
    render: (rng, b) => {
      const pad = Math.min(b.w, b.h) * 0.12;
      const c = { x: b.x + pad, y: b.y + pad, w: b.w - pad * 2, h: b.h - pad * 2 };
      const style = pick(rng, ['h', 'v', 'd1', 'd2', 'cross', 'rings']);
      const sp = rnd(rng, 1.6, 3.2);
      if (style === 'rings') {
        const out = []; const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
        const rmax = Math.min(c.w, c.h) / 2; const step = rnd(rng, 1.6, 2.6);
        for (let r = rmax; r > 0.4; r -= step) out.push({ k: 'circle', cx, cy, r });
        return out;
      }
      const ang = { h: 0, v: 90, d1: 45, d2: 135 }[style];
      if (style === 'cross') return [...hatch(c, 0, sp), ...hatch(c, 90, sp)];
      return hatch(c, ang, sp);
    },
  },

  'irregular-textures': {
    label: 'irregular-textures',
    render: (rng, b) => {
      const pad = Math.min(b.w, b.h) * 0.12;
      const c = { x: b.x + pad, y: b.y + pad, w: b.w - pad * 2, h: b.h - pad * 2 };
      const out = [];
      const rows = Math.max(3, Math.floor(c.h / rnd(rng, 2.2, 3.4)));
      const amp = rnd(rng, 0.5, 1.4), freq = rnd(rng, 1.2, 2.8), phase0 = rng() * 6.28;
      const seg = Math.max(6, Math.floor(c.w / 1.6));
      for (let r = 0; r <= rows; r++) {
        const y0 = c.y + (c.h * r) / rows;
        const ph = phase0 + r * 0.6;
        let d = '';
        for (let s = 0; s <= seg; s++) {
          const x = c.x + (c.w * s) / seg;
          const y = y0 + Math.sin((x / c.w) * freq * 6.28 + ph) * amp;
          d += (s === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
        }
        out.push({ k: 'path', d });
      }
      return out;
    },
  },

  'geometric-shapes': {
    label: 'geometric-shapes',
    render: (rng, b) => {
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      const R = Math.min(b.w, b.h) * 0.34;
      const kind = pick(rng, ['circle', 'tri', 'sq', 'nested', 'circleline']);
      if (kind === 'circle') return [{ k: 'circle', cx, cy, r: R }];
      if (kind === 'circleline') return [{ k: 'circle', cx, cy, r: R }, { k: 'line', x1: cx - R, y1: cy, x2: cx + R, y2: cy }];
      if (kind === 'tri') {
        const pts = [0, 1, 2].map(i => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; });
        return [{ k: 'poly', pts, closed: true }];
      }
      if (kind === 'nested') {
        const out = [];
        for (let i = 0; i < 3; i++) { const r = R * (1 - i * 0.3); out.push({ k: 'rect', x: cx - r, y: cy - r, w: r * 2, h: r * 2, rot: i * 15, cx, cy }); }
        return out;
      }
      return [{ k: 'rect', x: cx - R, y: cy - R, w: R * 2, h: R * 2 }];
    },
  },

  'dice': {
    label: 'dice',
    render: (rng, b) => {
      const s = Math.min(b.w, b.h) * 0.62;
      const x = b.x + (b.w - s) / 2, y = b.y + (b.h - s) / 2;
      const out = [{ k: 'rect', x, y, w: s, h: s, rx: s * 0.14 }];
      const val = 1 + Math.floor(rng() * 6);
      const pr = s * 0.07;
      const g = (gx, gy) => out.push({ k: 'circle', cx: x + s * gx, cy: y + s * gy, r: pr, dot: true });
      const L = 0.27, M = 0.5, H = 0.73;
      if (val % 2 === 1) g(M, M);
      if (val >= 2) { g(L, L); g(H, H); }
      if (val >= 4) { g(H, L); g(L, H); }
      if (val === 6) { g(L, M); g(H, M); }
      return out;
    },
  },
};

// ---------- recursive grid ----------
function weights(rng, n, irregular) {
  if (!irregular) return Array(n).fill(1);
  return Array.from({ length: n }, () => rnd(rng, 0.6, 1.7));
}
function splitWeighted(start, total, ws) {
  const sum = ws.reduce((a, c) => a + c, 0);
  const edges = [start]; let acc = start;
  for (const w of ws) { acc += (w / sum) * total; edges.push(acc); }
  return edges;
}

// returns array of leaf cells {x,y,w,h,depth}
function buildGrid(b, spec, rng, depth, stats) {
  const cols = depth === 0 ? spec.cols : (1 + Math.floor(rng() * 2) + 1); // 2-3 for subgrids
  const rows = depth === 0 ? spec.rows : (1 + Math.floor(rng() * 2) + 1);
  const cw = weights(rng, cols, depth === 0 && spec.irregular);
  const rw = weights(rng, rows, depth === 0 && spec.irregular);
  const xs = splitWeighted(b.x, b.w, cw);
  const ys = splitWeighted(b.y, b.h, rw);
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = { x: xs[c], y: ys[r], w: xs[c + 1] - xs[c], h: ys[r + 1] - ys[r], depth };
      const minDim = Math.min(cell.w, cell.h);
      if (minDim < stats.minCell) stats.minCell = minDim;
      const canSplit = depth < spec.depth && minDim > spec.threshold * 3 && rng() < spec.splitProb;
      if (canSplit) cells.push(...buildGrid(cell, spec, rng, depth + 1, stats));
      else cells.push(cell);
    }
  }
  return cells;
}

// ---------- document -> layered primitives ----------
// layers: frame (structure), fill (regular), organic (irregular), accent (shapes/dice)
function generateArt(doc) {
  const m = doc.margin;
  const bounds = { x: m, y: m, w: doc.paper.w - m * 2, h: doc.paper.h - m * 2 };
  const rng = makeRng(doc.seed);
  const stats = { minCell: Infinity };
  const cells = buildGrid(bounds, doc.grid, rng, 0, stats);

  const layers = { cut: [], frame: [], fill: [], organic: [], accent: [] };

  // cut: outer trim rectangle (knife pass)
  const ti = Math.min(m * 0.45, 6);
  layers.cut.push({ k: 'rect', x: ti, y: ti, w: doc.paper.w - ti * 2, h: doc.paper.h - ti * 2 });

  // frame: paper drawable border + registration crosses + cell structure
  layers.frame.push({ k: 'rect', x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h });
  const cross = (cx, cy) => { layers.frame.push({ k: 'line', x1: cx - 2.4, y1: cy, x2: cx + 2.4, y2: cy }); layers.frame.push({ k: 'line', x1: cx, y1: cy - 2.4, x2: cx, y2: cy + 2.4 }); };
  cross(m / 2, m / 2); cross(doc.paper.w - m / 2, m / 2); cross(m / 2, doc.paper.h - m / 2); cross(doc.paper.w - m / 2, doc.paper.h - m / 2);

  const active = doc.collections.filter(c => c.on);
  const wsum = active.reduce((a, c) => a + c.weight, 0) || 1;
  const choose = () => { let r = rng() * wsum; for (const c of active) { if ((r -= c.weight) <= 0) return c.id; } return active.length ? active[0].id : 'silence'; };

  for (const cell of cells) {
    if (doc.structure) layers.frame.push({ k: 'rect', x: cell.x, y: cell.y, w: cell.w, h: cell.h, faint: true });
    const id = choose();
    const prims = COLLECTIONS[id].render(rng, cell);
    if (id === 'regular-textures') layers.fill.push(...prims);
    else if (id === 'irregular-textures') layers.organic.push(...prims);
    else if (id === 'geometric-shapes' || id === 'dice') layers.accent.push(...prims);
  }

  return { layers, stats, cellCount: cells.length };
}

Object.assign(window, { generateArt, COLLECTIONS, makeRng });
