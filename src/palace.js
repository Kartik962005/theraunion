import * as THREE from 'three';

const isMobile = matchMedia('(max-width: 760px)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.75);

const SPACING = 6.5;
const N = 9;

/* ---------- canvas textures ---------- */
function sandstoneTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#d9a184'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2200; i++) { // grain
    g.fillStyle = `rgba(${120 + Math.random() * 80},${60 + Math.random() * 40},${40 + Math.random() * 30},${Math.random() * 0.12})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  // inlay lattice + little flowers (pietra dura feel)
  g.strokeStyle = 'rgba(255,236,190,.55)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(128, 0); g.lineTo(256, 128); g.lineTo(128, 256); g.lineTo(0, 128); g.closePath(); g.stroke();
  const flower = (x, y, r, col) => {
    g.fillStyle = col;
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; g.beginPath(); g.ellipse(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.7, r * 0.35, a, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#f6d28b'; g.beginPath(); g.arc(x, y, r * 0.5, 0, Math.PI * 2); g.fill();
  };
  flower(128, 128, 9, 'rgba(140,24,44,.75)');
  [[0, 0], [256, 0], [0, 256], [256, 256]].forEach(([x, y]) => flower(x, y, 7, 'rgba(46,110,70,.6)'));
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function marbleTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#efe6d6'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = '#5a0f1f';
  g.beginPath(); g.moveTo(128, 30); g.lineTo(226, 128); g.lineTo(128, 226); g.lineTo(30, 128); g.closePath(); g.fill();
  g.strokeStyle = '#c9a35a'; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#c9a35a';
  g.beginPath(); g.moveTo(128, 92); g.lineTo(164, 128); g.lineTo(128, 164); g.lineTo(92, 128); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(160,140,120,.25)'; g.lineWidth = 1;
  for (let i = 0; i < 14; i++) { g.beginPath(); g.moveTo(Math.random() * 256, 0); g.bezierCurveTo(Math.random() * 256, 90, Math.random() * 256, 170, Math.random() * 256, 256); g.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function glowTexture(inner = 'rgba(255,240,200,1)', mid = 'rgba(255,150,40,.85)') {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner); grd.addColorStop(0.25, mid); grd.addColorStop(1, 'rgba(255,90,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function flameTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 92, 2, 32, 80, 60);
  grd.addColorStop(0, 'rgba(255,255,235,1)'); grd.addColorStop(0.3, 'rgba(255,200,80,.95)'); grd.addColorStop(0.7, 'rgba(255,100,20,.5)'); grd.addColorStop(1, 'rgba(255,60,0,0)');
  g.fillStyle = grd;
  g.beginPath(); g.moveTo(32, 4); g.bezierCurveTo(56, 50, 58, 118, 32, 122); g.bezierCurveTo(6, 118, 8, 50, 32, 4); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ---------- cusped Mughal arch outline ---------- */
function archPoints(W, H1, H2, cusps = 5, depth = 0.16) {
  const pts = [];
  const bez = (t, p0, p1, p2, p3) => {
    const u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
  };
  const L = [[-W / 2, H1], [-W / 2, H1 + (H2 - H1) * 0.7], [-W * 0.16, H2 - (H2 - H1) * 0.12], [0, H2]];
  const left = [];
  for (let i = 0; i <= cusps; i++) left.push(bez(i / cusps, ...L));
  return { left, W, H1, H2, depth };
}
function archShapePath(path, a, scale = 1, lift = 0) {
  const { left, W, H1, depth } = a;
  const S = (p) => [p[0] * scale, p[1] * scale + lift];
  const lobe = (p0, p1, sign) => { // scallop between points, bulging into the opening
    const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len * sign, ny = dx / len * sign;
    return [mx + nx * depth * scale, my + ny * depth * scale];
  };
  const bl = S([-W / 2, 0]);
  path.moveTo(bl[0], bl[1]);
  let p = S([-W / 2, H1]); path.lineTo(p[0], p[1]);
  for (let i = 0; i < left.length - 1; i++) {
    const p0 = S(left[i]), p1 = S(left[i + 1]); const c = lobe(p0, p1, -1);
    path.quadraticCurveTo(c[0], c[1], p1[0], p1[1]);
  }
  for (let i = left.length - 1; i > 0; i--) {
    const p0 = S([-left[i][0], left[i][1]]), p1 = S([-left[i - 1][0], left[i - 1][1]]); const c = lobe(p0, p1, -1);
    path.quadraticCurveTo(c[0], c[1], p1[0], p1[1]);
  }
  p = S([W / 2, 0]); path.lineTo(p[0], p[1]);
  path.closePath();
  return path;
}

export function createPalace(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: DPR < 2, powerPreference: 'high-performance' });
  renderer.setPixelRatio(DPR);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const NIGHT = new THREE.Color('#1e0610');
  const DUSK = new THREE.Color('#7a2a3a');
  scene.background = NIGHT.clone();
  scene.fog = new THREE.Fog(NIGHT.clone(), 9, 46);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
  const START_Z = 7, END_Z = -(N - 1) * SPACING - 9;
  camera.position.set(0, 2.3, START_Z);

  /* lights */
  scene.add(new THREE.HemisphereLight(0xffd9b0, 0x2a0610, 0.75));
  const camLights = [];
  [[-2.2, 1, -3], [2.2, 1, -3], [0, 4, -8]].forEach(([x, y, z], i) => {
    const l = new THREE.PointLight(i === 2 ? 0xffc27a : 0xff9a3c, i === 2 ? 26 : 18, 16, 1.6);
    l.userData.offset = new THREE.Vector3(x, y, z);
    scene.add(l); camLights.push(l);
  });

  /* materials */
  const stoneTex = sandstoneTexture(); stoneTex.repeat.set(0.35, 0.35);
  const stone = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.7, metalness: 0.05 });
  const stoneIvory = new THREE.MeshStandardMaterial({ map: stoneTex, color: 0xfff1e0, roughness: 0.6, metalness: 0.05 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xe0b45a, roughness: 0.25, metalness: 1, emissive: 0x3a2200, emissiveIntensity: 0.4 });
  const maroon = new THREE.MeshStandardMaterial({ color: 0x6b1022, roughness: 0.45, metalness: 0.2 });

  /* arch geometry */
  const A = archPoints(3.8, 3.9, 6.9, 6, 0.17);
  const wall = new THREE.Shape();
  wall.moveTo(-4.6, -0.01); wall.lineTo(4.6, -0.01); wall.lineTo(4.6, 9.2); wall.lineTo(-4.6, 9.2); wall.closePath();
  wall.holes.push(archShapePath(new THREE.Path(), A));
  const wallGeo = new THREE.ExtrudeGeometry(wall, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2, curveSegments: 8 });
  // gold trim ring around the opening
  const trim = new THREE.Shape(); archShapePath(trim, A, 1.06, 0);
  trim.holes.push(archShapePath(new THREE.Path(), A));
  const trimGeo = new THREE.ExtrudeGeometry(trim, { depth: 0.12, bevelEnabled: false, curveSegments: 8 });
  // second, thin outer trim
  const trim2 = new THREE.Shape(); archShapePath(trim2, A, 1.17, 0);
  trim2.holes.push(archShapePath(new THREE.Path(), A, 1.13, 0));
  const trim2Geo = new THREE.ExtrudeGeometry(trim2, { depth: 0.08, bevelEnabled: false, curveSegments: 8 });

  const pillarGeo = new THREE.CylinderGeometry(0.22, 0.26, 3.9, 16);
  const capGeo = new THREE.SphereGeometry(0.34, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const baseGeo = new THREE.CylinderGeometry(0.36, 0.4, 0.3, 16);
  const domeGeo = new THREE.SphereGeometry(0.75, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const finialGeo = new THREE.ConeGeometry(0.08, 0.6, 8);
  const chhatriPost = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
  const medallionGeo = new THREE.TorusGeometry(0.42, 0.06, 10, 40);
  const jewelGeo = new THREE.OctahedronGeometry(0.16);

  const corridor = new THREE.Group();
  scene.add(corridor);

  // marigold garlands (instanced)
  const beadGeo = new THREE.IcosahedronGeometry(0.11, 1);
  const beadMat = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0 });
  const beadsPerArch = 2 * 16 + 30;
  const beads = new THREE.InstancedMesh(beadGeo, beadMat, beadsPerArch * N);
  const dummy = new THREE.Object3D();
  const cA = new THREE.Color(0xf29a1f), cB = new THREE.Color(0xffc21a), cC = new THREE.Color(0xd8352a);
  let bi = 0;
  const beadBase = [];

  for (let i = 0; i < N; i++) {
    const z = -i * SPACING;
    const g = new THREE.Group(); g.position.z = z;
    const wallMesh = new THREE.Mesh(wallGeo, i % 2 ? stoneIvory : stone);
    wallMesh.position.z = -0.35;
    g.add(wallMesh);
    const t1 = new THREE.Mesh(trimGeo, gold); t1.position.z = 0.38; g.add(t1);
    const t2 = new THREE.Mesh(trim2Geo, gold); t2.position.z = 0.38; g.add(t2);
    // pillars
    [-1, 1].forEach(sd => {
      const x = sd * 2.32;
      const p = new THREE.Mesh(pillarGeo, maroon); p.position.set(x, 1.95, 0.55); g.add(p);
      const b = new THREE.Mesh(baseGeo, gold); b.position.set(x, 0.15, 0.55); g.add(b);
      const c = new THREE.Mesh(capGeo, gold); c.position.set(x, 3.9, 0.55); g.add(c);
      // chhatri on top
      const dome = new THREE.Mesh(domeGeo, stoneIvory); dome.position.set(sd * 3.6, 9.95, 0); dome.scale.set(1, 1.2, 1); g.add(dome);
      const fin = new THREE.Mesh(finialGeo, gold); fin.position.set(sd * 3.6, 11.15, 0); g.add(fin);
      [-0.55, 0.55].forEach(px => { const post = new THREE.Mesh(chhatriPost, gold); post.position.set(sd * 3.6 + px, 9.6, 0.4); g.add(post); });
    });
    const bigDome = new THREE.Mesh(domeGeo, stoneIvory); bigDome.position.set(0, 9.2, -0.2); bigDome.scale.set(1.6, 1.9, 1.3); g.add(bigDome);
    const bigFin = new THREE.Mesh(finialGeo, gold); bigFin.position.set(0, 11.0, -0.2); bigFin.scale.setScalar(1.6); g.add(bigFin);
    // medallions in the spandrels
    [-1, 1].forEach(sd => {
      const m = new THREE.Mesh(medallionGeo, gold); m.position.set(sd * 3.2, 7.6, 0.4); g.add(m);
      const j = new THREE.Mesh(jewelGeo, maroon); j.position.set(sd * 3.2, 7.6, 0.45); g.add(j);
    });
    corridor.add(g);

    // laris hanging at both pillars + swag across the arch top
    [-1, 1].forEach(sd => {
      for (let k = 0; k < 16; k++) {
        const pos = new THREE.Vector3(sd * 1.95, 7.0 - k * 0.24, z + 0.75);
        beadBase.push({ pos, sway: k / 16, side: sd });
        beads.setColorAt(bi, k % 3 === 2 ? cC : (k % 2 ? cB : cA)); bi++;
      }
    });
    for (let k = 0; k < 30; k++) {
      const t = k / 29; const x = -1.95 + t * 3.9; const y = 7.0 - Math.sin(t * Math.PI) * 0.75;
      beadBase.push({ pos: new THREE.Vector3(x, y, z + 0.78), sway: 0.3 * Math.sin(t * Math.PI), side: 0 });
      beads.setColorAt(bi, k % 2 ? cB : cA); bi++;
    }
  }
  scene.add(beads);

  /* floor */
  const floorTex = marbleTexture(); floorTex.repeat.set(5, 26);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 76), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.28, metalness: 0.15 }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -28);
  scene.add(floor);
  // side walls (low maroon jaali walls)
  const sideMat = new THREE.MeshStandardMaterial({ color: 0x3e0a16, roughness: 0.6 });
  [-1, 1].forEach(sd => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 66), sideMat); w.position.set(sd * 4.9, 0.6, -26); scene.add(w);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 66), gold); rail.position.set(sd * 4.9, 1.25, -26); scene.add(rail);
  });

  /* diyas: clay lamps on the floor + floating ones */
  const diyaProfile = [];
  for (let i = 0; i <= 10; i++) { const t = i / 10; diyaProfile.push(new THREE.Vector2(0.05 + Math.sin(t * Math.PI * 0.5) * 0.26, -0.12 + t * 0.16)); }
  const diyaGeo = new THREE.LatheGeometry(diyaProfile, 18);
  const clay = new THREE.MeshStandardMaterial({ color: 0xb5532a, roughness: 0.7, side: THREE.DoubleSide });
  const flameTex = flameTexture(), glowTex = glowTexture();
  const flames = [];
  const addDiya = (x, y, z, floating) => {
    const d = new THREE.Mesh(diyaGeo, clay); d.position.set(x, y, z); scene.add(d);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    fl.scale.set(0.16, 0.34, 1); fl.position.set(x, y + 0.17, z); scene.add(fl);
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 }));
    gl.scale.set(1.3, 1.3, 1); gl.position.copy(fl.position); scene.add(gl);
    flames.push({ d, fl, gl, base: new THREE.Vector3(x, y, z), floating, ph: Math.random() * 10 });
  };
  for (let i = 0; i < N; i++) {
    const z = -i * SPACING;
    [-1, 1].forEach(sd => { addDiya(sd * 2.9, 0.13, z + 1.4, false); addDiya(sd * 3.7, 0.13, z + 2.9, false); });
  }
  const FLOAT = isMobile ? 26 : 44;
  for (let i = 0; i < FLOAT; i++) addDiya((Math.random() - 0.5) * 7, 2.6 + Math.random() * 4.2, 4 - Math.random() * (N * SPACING + 4), true);

  /* gold dust */
  const DUST = isMobile ? 500 : 900;
  const dPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) { dPos[i * 3] = (Math.random() - 0.5) * 10; dPos[i * 3 + 1] = Math.random() * 9; dPos[i * 3 + 2] = 6 - Math.random() * 70; }
  const dGeo = new THREE.BufferGeometry(); dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ size: 0.06, map: glowTexture('rgba(255,250,220,1)', 'rgba(255,215,140,.7)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: 0xffe2a0 }));
  scene.add(dust);

  /* the horizon: Goa sunset + sea beyond the last arch */
  const skyMat = new THREE.ShaderMaterial({
    fog: false, depthWrite: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform float uTime;
      void main(){
        float y=vUv.y;
        vec3 top=vec3(.18,.06,.22), mid=vec3(.86,.33,.30), low=vec3(1.,.66,.32);
        vec3 c=mix(low,mid,smoothstep(.0,.45,y)); c=mix(c,top,smoothstep(.45,1.,y));
        vec2 sp=vec2(.5,.18); float d=distance(vec2(vUv.x*2.2,vUv.y),vec2(sp.x*2.2,sp.y));
        c+=vec3(1.,.75,.4)*smoothstep(.16,.0,d)*1.2 + vec3(1.,.5,.2)*smoothstep(.5,.0,d)*.35;
        gl_FragColor=vec4(c,1.);
      }`
  });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(260, 90), skyMat);
  sky.position.set(0, 30, END_Z - 70); scene.add(sky);
  const seaMat = new THREE.ShaderMaterial({
    fog: false,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform float uTime;
      void main(){
        float y=vUv.y; vec3 deep=vec3(.12,.05,.16), near=vec3(.36,.12,.2);
        vec3 c=mix(near,deep,y);
        float band=smoothstep(.12,.0,abs(vUv.x-.5))*smoothstep(.0,1.,y);
        float w=sin(vUv.y*260.-uTime*2.)*.5+.5; w*=sin(vUv.x*90.+uTime)*.5+.5;
        c+=vec3(1.,.62,.3)*band*w*1.1;
        c+=vec3(1.,.5,.3)*smoothstep(.8,1.,y)*.35;
        gl_FragColor=vec4(c,1.);
      }`
  });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(260, 80), seaMat);
  sea.rotation.x = -Math.PI / 2; sea.position.set(0, -0.6, END_Z - 32); scene.add(sea);

  /* state + loop */
  const state = { progress: 0, intro: 0, visible: true, tx: 0, ty: 0, px: 0, py: 0 };
  addEventListener('pointermove', (e) => { state.tx = (e.clientX / innerWidth - 0.5) * 2; state.ty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
  addEventListener('deviceorientation', (e) => { if (e.gamma != null) { state.tx = THREE.MathUtils.clamp(e.gamma / 30, -1, 1); state.ty = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1); } }, { passive: true });

  const resize = () => {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.75 ? 72 : 58;
    camera.updateProjectionMatrix();
  };
  resize(); addEventListener('resize', resize);

  const clock = new THREE.Clock();
  const tmpC = new THREE.Color();
  const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    if (state.visible) {
      state.px += (state.tx - state.px) * 0.05; state.py += (state.ty - state.py) * 0.05;
      const p = ease(Math.min(1, state.progress));
      const introPush = (1 - state.intro) * 5;
      camera.position.z = START_Z + introPush + (END_Z - START_Z) * p;
      camera.position.x = state.px * 0.6 + Math.sin(t * 0.3) * 0.12;
      camera.position.y = 2.3 + state.py * -0.3 + Math.sin(t * 0.5) * 0.05 + p * 0.6;
      camera.lookAt(camera.position.x * 0.3, 3.1 + p * 0.3, camera.position.z - 10);
      camera.rotation.z = Math.sin(t * 0.25) * 0.01;

      camLights.forEach(l => l.position.copy(camera.position).add(l.userData.offset));

      // colour of the air: night palace → Goa dusk
      const k = THREE.MathUtils.smoothstep(p, 0.6, 1);
      tmpC.copy(NIGHT).lerp(DUSK, k);
      scene.background.copy(tmpC); scene.fog.color.copy(tmpC);
      scene.fog.far = 46 + k * 120;

      flames.forEach((f, i) => {
        const fl = 1 + Math.sin(t * 13 + f.ph) * 0.08 + Math.sin(t * 23 + f.ph * 2) * 0.05;
        f.fl.scale.set(0.16 * fl, 0.34 * fl, 1);
        f.gl.material.opacity = 0.45 + Math.sin(t * 9 + f.ph) * 0.08;
        if (f.floating) {
          const y = f.base.y + Math.sin(t * 0.6 + f.ph) * 0.25;
          const x = f.base.x + Math.sin(t * 0.3 + f.ph) * 0.2;
          f.d.position.set(x, y, f.base.z); f.fl.position.set(x, y + 0.17, f.base.z); f.gl.position.copy(f.fl.position);
        }
      });

      let i = 0;
      for (const b of beadBase) {
        const sw = Math.sin(t * 1.2 + b.pos.z * 0.3) * 0.05 * b.sway * (b.side ? 2 : 1);
        dummy.position.set(b.pos.x + sw, b.pos.y, b.pos.z + sw * 0.5);
        dummy.rotation.set(t * 0.2 + i, i, 0);
        dummy.updateMatrix(); beads.setMatrixAt(i++, dummy.matrix);
      }
      beads.instanceMatrix.needsUpdate = true;

      const arr = dGeo.attributes.position.array;
      for (let j = 0; j < DUST; j++) { arr[j * 3 + 1] += dt * 0.25; if (arr[j * 3 + 1] > 9) arr[j * 3 + 1] = 0; }
      dGeo.attributes.position.needsUpdate = true;
      skyMat.uniforms.uTime.value = t; seaMat.uniforms.uTime.value = t;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }
  tick();
  return state;
}
