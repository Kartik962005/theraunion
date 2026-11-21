// Lightweight twinkling gold sparkles on a 2D canvas (no WebGL, no 3D library).
// Pre-rendered star sprites + drawImage keeps this cheap even on older phones.

function makeSprite(size, core = '255,248,225', ray = '240,200,120') {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const m = size / 2;
  // soft halo
  const halo = g.createRadialGradient(m, m, 0, m, m, m);
  halo.addColorStop(0, `rgba(${core},0.9)`);
  halo.addColorStop(0.12, `rgba(${ray},0.45)`);
  halo.addColorStop(0.4, `rgba(${ray},0.08)`);
  halo.addColorStop(1, `rgba(${ray},0)`);
  g.fillStyle = halo;
  g.fillRect(0, 0, size, size);
  // four thin rays
  g.globalCompositeOperation = 'lighter';
  const rayGrad = (x0, y0, x1, y1) => {
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, `rgba(${ray},0)`);
    gr.addColorStop(0.5, `rgba(${core},0.95)`);
    gr.addColorStop(1, `rgba(${ray},0)`);
    return gr;
  };
  const w = Math.max(1, size * 0.035);
  g.fillStyle = rayGrad(0, m, size, m); g.fillRect(0, m - w / 2, size, w);
  g.fillStyle = rayGrad(m, 0, m, size); g.fillRect(m - w / 2, 0, w, size);
  // short diagonal rays
  g.translate(m, m); g.rotate(Math.PI / 4);
  const d = size * 0.32;
  g.fillStyle = rayGrad(-d, 0, d, 0); g.fillRect(-d, -w / 3, d * 2, w * 0.66);
  g.fillStyle = rayGrad(0, -d, 0, d); g.fillRect(-w / 3, -d, w * 0.66, d * 2);
  return c;
}

export function createSparkles(canvas, { count } = {}) {
  const ctx = canvas.getContext('2d');
  const mobile = matchMedia('(max-width: 760px)').matches;
  const N = count || (mobile ? 38 : 64);
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const sprites = [makeSprite(64), makeSprite(64, '255,255,255', '255,226,170')];
  let W = 0, H = 0;
  const P = [];

  const resize = () => {
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize);

  for (let i = 0; i < N; i++) {
    const z = Math.random();                        // 0 far … 1 near (depth)
    P.push({
      x: Math.random() * W, y: Math.random() * H, z,
      s: (z < 0.85 ? 8 + z * 18 : 30 + Math.random() * 16),
      sp: 0.6 + Math.random() * 1.8, ph: Math.random() * 10,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
      img: sprites[i % 2], dx: (Math.random() - 0.5) * 6
    });
  }

  const state = { active: false, alpha: 0, velocity: 0, burst: 0 };
  let last = performance.now(), t = 0;

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (state.active && !document.hidden && state.alpha > 0.01) {
      t += dt;
      ctx.clearRect(0, 0, W, H);
      const v = Math.max(-60, Math.min(60, state.velocity));
      for (const p of P) {
        p.y -= (6 + p.z * 14) * dt + v * (0.15 + p.z * 0.55);
        p.x += Math.sin(t * 0.3 + p.ph) * p.dx * dt;
        p.rot += p.vr * dt;
        if (p.y < -40) { p.y = H + 40; p.x = Math.random() * W; }
        if (p.y > H + 40) { p.y = -40; p.x = Math.random() * W; }
        const tw = Math.pow(0.5 + 0.5 * Math.sin(t * p.sp + p.ph), 3);   // sharp glints
        const a = (0.15 + 0.85 * tw) * state.alpha * (0.45 + 0.55 * p.z);
        if (a < 0.02) continue;
        const size = p.s * (0.55 + 0.45 * tw) * (1 + state.burst * 0.8);
        ctx.globalAlpha = a;
        ctx.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr);
        ctx.rotate(p.rot);
        ctx.drawImage(p.img, -size / 2, -size / 2, size, size);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
    } else if (!state.active || state.alpha <= 0.01) {
      ctx.clearRect(0, 0, W, H);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return state;
}
