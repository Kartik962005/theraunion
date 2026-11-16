import * as THREE from 'three';

const isMobile = matchMedia('(max-width: 760px)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.6 : 1.8);

function makeRenderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: DPR < 2, powerPreference: 'high-performance' });
  r.setPixelRatio(DPR);
  r.setClearColor(0x000000, 0);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  return r;
}

/* ================================================================
   PETALS: marigold & rose petals drifting over the whole site
   ================================================================ */
export function createPetals(canvas) {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 10;

  scene.add(new THREE.AmbientLight(0xfff0d8, 1.4));
  const sun = new THREE.DirectionalLight(0xffe0b0, 2.2); sun.position.set(2, 5, 6); scene.add(sun);
  const back = new THREE.DirectionalLight(0xff9a6a, 0.8); back.position.set(-3, -2, -4); scene.add(back);

  // cupped petal from a bezier shape
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.5);
  shape.bezierCurveTo(0.38, -0.3, 0.42, 0.25, 0, 0.55);
  shape.bezierCurveTo(-0.42, 0.25, -0.38, -0.3, 0, -0.5);
  const geo = new THREE.ShapeGeometry(shape, 14);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i);
    p.setZ(i, x * x * 1.1 - (y + 0.5) * 0.12);
  }
  geo.computeVertexNormals();
  geo.scale(0.28, 0.28, 0.28);

  const COUNT = isMobile ? 34 : 70;
  const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.55, metalness: 0.05, transparent: true, opacity: 0.92 });
  const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
  const palette = [0xf29a1f, 0xffb11f, 0xf57c12, 0xb3122e, 0xd61f3c, 0xffc94d, 0xe86a10];
  const col = new THREE.Color();
  const P = [];
  for (let i = 0; i < COUNT; i++) {
    col.setHex(palette[i % palette.length]);
    mesh.setColorAt(i, col);
    P.push({
      x: 0, y: 0, z: (Math.random() - 0.5) * 6,
      vy: 0.25 + Math.random() * 0.45,
      rx: Math.random() * 6, ry: Math.random() * 6, rz: Math.random() * 6,
      sx: (Math.random() - 0.5) * 1.6, sy: (Math.random() - 0.5) * 1.6, sz: (Math.random() - 0.5) * 1.2,
      phase: Math.random() * 10, amp: 0.3 + Math.random() * 0.6,
      scale: 0.7 + Math.random() * 0.8,
      born: false
    });
  }
  scene.add(mesh);

  let halfH = 4, halfW = 2;
  const resize = () => {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = Math.tan(THREE.MathUtils.degToRad(22.5)) * 10;
    halfW = halfH * camera.aspect;
  };
  resize();
  window.addEventListener('resize', resize);

  const state = { velocity: 0, active: false, burst: 0, density: 1 };
  const dummy = new THREE.Object3D();
  const clock = new THREE.Clock();

  P.forEach(o => { o.x = (Math.random() - 0.5) * 2 * halfW; o.y = halfH + Math.random() * halfH * 2.5; });

  // big shower when the doors open
  state.shower = () => {
    P.forEach((o, i) => {
      o.x = (Math.random() - 0.5) * 2 * halfW * 1.1;
      o.y = halfH + 0.5 + Math.random() * halfH * 1.6;
      o.vy = 0.9 + Math.random() * 1.1;
    });
    state.burst = 1;
  };

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    if (state.active) {
      state.burst = Math.max(0, state.burst - dt * 0.25);
      const v = THREE.MathUtils.clamp(state.velocity, -60, 60) * 0.012;
      P.forEach((o, i) => {
        const targetVy = 0.25 + (i % 5) * 0.08;
        o.vy += (targetVy - o.vy) * dt * (0.3 + (1 - state.burst));
        o.y -= o.vy * dt;
        o.y += v * (0.5 + o.scale * 0.5);               // parallax with scroll
        o.x += Math.sin(t * 0.7 + o.phase) * o.amp * dt; // sway
        o.rx += o.sx * dt; o.ry += o.sy * dt; o.rz += o.sz * dt;
        if (o.y < -halfH - 1) { o.y = halfH + 1 + Math.random() * 2; o.x = (Math.random() - 0.5) * 2 * halfW; }
        if (o.y > halfH + 4) { o.y = -halfH - 0.8; }
        dummy.position.set(o.x, o.y, o.z);
        dummy.rotation.set(o.rx, o.ry, o.rz);
        dummy.scale.setScalar(o.scale * state.density);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }
  tick();
  return state;
}

