// Procedural Indian ornaments rendered as crisp SVG strings.

const f = (n) => +n.toFixed(2);
const polar = (r, a) => [f(Math.cos(a) * r), f(Math.sin(a) * r)];

/* A lotus-petal path pointing outward at angle a, from r0 to r1, half-width w (radians) */
function petal(r0, r1, a, w) {
  const [x0, y0] = polar(r0, a);
  const [x1, y1] = polar(r1, a);
  const [cl1, cl2] = polar(r0 + (r1 - r0) * 0.55, a - w);
  const [cr1, cr2] = polar(r0 + (r1 - r0) * 0.55, a + w);
  return `M${x0} ${y0} Q${cl1} ${cl2} ${x1} ${y1} Q${cr1} ${cr2} ${x0} ${y0}Z`;
}

/* ---------- RANGOLI (polar mandala) ---------- */
export function rangoli({ size = 300, palette = ['#f29a1f', '#c2185b', '#d8b56a', '#2e8b57', '#ffd34d'], stroke = '#d8b56a', cls = '' } = {}) {
  const R = 140;
  let s = `<svg class="rangoli ${cls}" viewBox="-150 -150 300 300" width="${size}" height="${size}" aria-hidden="true">`;
  // outer dotted ring
  s += `<g class="rg-ring" fill="${palette[2]}">`;
  for (let i = 0; i < 48; i++) { const [x, y] = polar(R, (i / 48) * Math.PI * 2); s += `<circle cx="${x}" cy="${y}" r="2.2"/>`; }
  s += `</g>`;
  const rings = [
    { n: 24, r0: 104, r1: 134, w: 0.09, c: palette[0] },
    { n: 16, r0: 78, r1: 108, w: 0.15, c: palette[1] },
    { n: 12, r0: 52, r1: 82, w: 0.2, c: palette[3] },
    { n: 8, r0: 24, r1: 56, w: 0.32, c: palette[4] }
  ];
  rings.forEach((rg, k) => {
    s += `<g class="rg-layer rg-l${k}">`;
    for (let i = 0; i < rg.n; i++) {
      const a = (i / rg.n) * Math.PI * 2 + (k % 2 ? Math.PI / rg.n : 0);
      s += `<path d="${petal(rg.r0, rg.r1, a, rg.w)}" fill="${rg.c}" fill-opacity=".9" stroke="${stroke}" stroke-width="1.1"/>`;
    }
    s += `</g>`;
  });
  [134, 106, 80, 54, 24].forEach(r => { s += `<circle class="rg-line" r="${r}" fill="none" stroke="${stroke}" stroke-width="1.2"/>`; });
  s += `<circle r="14" fill="${palette[1]}" stroke="${stroke}" stroke-width="1.5"/><circle r="5" fill="${palette[4]}"/>`;
  s += `</svg>`;
  return s;
}

/* ---------- line-only mandala (for drawing animations) ---------- */
export function lineMandala({ cls = '', color = 'currentColor' } = {}) {
  let s = `<svg class="line-mandala ${cls}" viewBox="-150 -150 300 300" aria-hidden="true" fill="none" stroke="${color}" stroke-width="1">`;
  const layers = [[32, 110, 140, 0.07], [16, 72, 112, 0.14], [8, 30, 74, 0.28]];
  layers.forEach(([n, r0, r1, w]) => {
    for (let i = 0; i < n; i++) s += `<path class="draw" d="${petal(r0, r1, (i / n) * Math.PI * 2, w)}"/>`;
  });
  [142, 112, 74, 30, 10].forEach(r => { s += `<circle class="draw" r="${r}"/>`; });
  s += `</svg>`;
  return s;
}

/* ---------- MARIGOLD FLOWER ---------- */
function marigold(cx, cy, r, c1 = '#f29a1f', c2 = '#ffb627') {
  let s = `<g transform="translate(${f(cx)} ${f(cy)})">`;
  for (let ring = 0; ring < 2; ring++) {
    const n = ring ? 9 : 12, rr = r * (ring ? 0.55 : 0.85);
    for (let i = 0; i < n; i++) {
      const [x, y] = polar(rr, (i / n) * Math.PI * 2 + ring * 0.3);
      s += `<circle cx="${x}" cy="${y}" r="${f(r * (ring ? 0.42 : 0.38))}" fill="${ring ? c2 : c1}"/>`;
    }
  }
  s += `<circle r="${f(r * 0.32)}" fill="#ffd34d"/></g>`;
  return s;
}
function mangoLeaf(x, y, len, rot) {
  return `<path transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" d="M0 0 C${f(len * 0.35)} ${f(len * 0.15)} ${f(len * 0.3)} ${f(len * 0.75)} 0 ${f(len)} C${f(-len * 0.3)} ${f(len * 0.75)} ${f(-len * 0.35)} ${f(len * 0.15)} 0 0Z" fill="#2f7d3a" stroke="#1e5a27" stroke-width=".8"/><path transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" d="M0 2 L0 ${f(len - 3)}" stroke="#7fbf5a" stroke-width=".7"/>`;
}

/* ---------- TORAN (door hanging of marigolds & mango leaves) ---------- */
export function toran({ width = 400, drops = 7, cls = '' } = {}) {
  const H = 150;
  let s = `<svg class="toran ${cls}" viewBox="0 0 ${width} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">`;
  s += `<path d="M0 10 Q${width / 2} 26 ${width} 10" stroke="#b98e3e" stroke-width="2" fill="none"/>`;
  // leaves along the rope
  const leaves = Math.round(width / 22);
  for (let i = 0; i <= leaves; i++) {
    const x = (i / leaves) * width, t = i / leaves, y = 10 + 16 * 4 * t * (1 - t);
    s += mangoLeaf(x, y, 30, (i % 2 ? 8 : -8));
  }
  for (let i = 0; i <= leaves; i++) {
    const x = (i / leaves) * width + width / leaves / 2, t = x / width, y = 10 + 16 * 4 * t * (1 - t);
    if (x < width) s += marigold(x, y + 2, 7, i % 2 ? '#f29a1f' : '#e8661a');
  }
  // hanging laris
  for (let d = 0; d < drops; d++) {
    const x = ((d + 0.5) / drops) * width, t = x / width, y0 = 14 + 16 * 4 * t * (1 - t);
    const len = 4 + (d % 2 ? 2 : 4) + (Math.abs(d - (drops - 1) / 2) < 1 ? 2 : 0);
    s += `<g class="lari" style="transform-origin:${f(x)}px ${f(y0)}px;animation-delay:${f(d * -0.37)}s">`;
    s += `<line x1="${f(x)}" y1="${f(y0)}" x2="${f(x)}" y2="${f(y0 + len * 11)}" stroke="#b98e3e" stroke-width="1"/>`;
    for (let k = 0; k < len; k++) s += marigold(x, y0 + 8 + k * 11, 5.4, k % 2 ? '#ffb627' : '#f29a1f', k % 2 ? '#ffd34d' : '#ffb627');
    s += `<path d="M${f(x - 4)} ${f(y0 + len * 11 + 4)} L${f(x)} ${f(y0 + len * 11 + 13)} L${f(x + 4)} ${f(y0 + len * 11 + 4)}Z" fill="#d8b56a"/>`;
    s += `</g>`;
  }
  s += `</svg>`;
  return s;
}

/* ---------- PAISLEY / MEHENDI corner ---------- */
export function paisley({ cls = '', color = '#b98e3e' } = {}) {
  return `<svg class="paisley ${cls}" viewBox="0 0 120 120" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" aria-hidden="true">
    <path class="draw" d="M30 110 C2 104 0 64 22 44 C46 22 92 26 96 58 C100 86 72 96 60 82 C50 70 62 56 72 62"/>
    <path class="draw" d="M34 100 C14 94 14 66 30 52 C48 36 82 40 86 62 C88 78 72 84 66 76"/>
    <path class="draw" d="M40 90 C28 86 26 70 36 62 C46 54 62 58 66 68"/>
    <path class="draw" d="M96 58 C104 40 112 30 116 12 M100 44 C108 44 112 40 114 34 M104 34 C98 30 98 24 102 20"/>
    <circle class="draw" cx="52" cy="72" r="4"/><circle class="draw" cx="22" cy="36" r="2"/><circle class="draw" cx="14" cy="50" r="2"/><circle class="draw" cx="40" cy="22" r="2"/><circle class="draw" cx="60" cy="18" r="2"/>
    <path class="draw" d="M8 116 C30 116 46 112 60 104 M60 104 c4 -6 10 -6 14 -2 M60 104 c-2 6 2 10 8 10"/>
  </svg>`;
}

/* ---------- small diya (CSS flame) ---------- */
export const diya = (cls = '') => `<span class="diya ${cls}" aria-hidden="true"><span class="diya__flame"><i></i></span><svg class="diya__bowl" viewBox="0 0 60 26"><path d="M2 6 Q30 34 58 6 Q50 4 44 7 Q30 12 16 7 Q10 4 2 6Z" fill="#b5532a"/><path d="M2 6 Q30 34 58 6" fill="none" stroke="#e7a159" stroke-width="1.5"/><circle cx="20" cy="15" r="1.6" fill="#f6d28b"/><circle cx="30" cy="18" r="1.6" fill="#f6d28b"/><circle cx="40" cy="15" r="1.6" fill="#f6d28b"/></svg></span>`;
