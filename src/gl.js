import * as THREE from 'three';

const isMobile = matchMedia('(max-width: 760px)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

/* ================================================================
   SPARKLES — twinkling 4-point gold glints floating in 3D depth
   ================================================================ */
export function createBokeh(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 50);
  camera.position.z = 6;

  const COUNT = isMobile ? 90 : 160;
  const pos = new Float32Array(COUNT * 3), size = new Float32Array(COUNT), seed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 2] = -Math.random() * 12 + 2;
    size[i] = Math.random() < 0.12 ? 1.8 + Math.random() * 1.4 : 0.5 + Math.random() * 0.9;
    seed[i] = Math.random() * 100;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.NormalBlending, premultipliedAlpha: true,
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uDPR: { value: dpr }, uAlpha: { value: 0 }, uBurst: { value: 0 }, uH: { value: innerHeight } },
    vertexShader: `
      attribute float aSize; attribute float aSeed;
      uniform float uTime, uScroll, uDPR, uBurst, uH;
      varying float vTw; varying float vRot; varying float vDepth;
      void main(){
        vec3 p = position;
        float depth = clamp((2.0 - p.z) / 12.0, 0.0, 1.0);        // 0 near … 1 far
        p.y = mod(p.y + 8.0 + uTime*0.07 + uScroll*mix(2.2, 0.6, depth), 16.0) - 8.0;
        p.x += sin(uTime*0.2 + aSeed)*0.25;
        p.z += sin(uTime*0.15 + aSeed*1.7)*0.4 + uBurst*2.5*(1.0-depth);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float tw = 0.5 + 0.5*sin(uTime*(1.2 + fract(aSeed*7.0)*2.2) + aSeed*3.0);
        vTw = pow(tw, 3.0);
        vRot = uTime*0.35*(fract(aSeed)-0.5) + aSeed;
        vDepth = depth;
        gl_PointSize = aSize * (uH * 0.045) * (6.0 / -mv.z) * uDPR * (0.6 + 0.6*vTw);
      }`,
    fragmentShader: `
      uniform float uAlpha; varying float vTw; varying float vRot; varying float vDepth;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float cs = cos(vRot), sn = sin(vRot);
        c = mat2(cs, -sn, sn, cs) * c;
        float d = length(c);
        float core = exp(-d*d*160.0);
        float rx = exp(-abs(c.y)*55.0) * max(0.0, 1.0 - abs(c.x)*2.0);
        float ry = exp(-abs(c.x)*55.0) * max(0.0, 1.0 - abs(c.y)*2.0);
        vec2 c2 = mat2(0.7071,-0.7071,0.7071,0.7071) * c;
        float rd = (exp(-abs(c2.y)*90.0)*max(0.0,1.0-abs(c2.x)*3.2) + exp(-abs(c2.x)*90.0)*max(0.0,1.0-abs(c2.y)*3.2)) * 0.45;
        float halo = exp(-d*d*28.0) * 0.28;
        float i = (core*1.3 + rx + ry + rd + halo) * (0.25 + 0.75*vTw);
        vec3 col = mix(vec3(1.0, 0.97, 0.86), vec3(0.95, 0.74, 0.36), smoothstep(0.0, 0.4, d));
        float a = clamp(i, 0.0, 1.0) * uAlpha * mix(1.0, 0.55, vDepth);
        gl_FragColor = vec4(col * a, a);
      }`
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    mat.uniforms.uH.value = innerHeight;
  };
  resize(); addEventListener('resize', resize);

  let tx = 0, ty = 0;
  addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - 0.5); ty = (e.clientY / innerHeight - 0.5); }, { passive: true });

  const state = { velocity: 0, active: false, alpha: 0, burst: 0 };
  const clock = new THREE.Clock();
  let scrollAcc = 0;
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (state.active && !document.hidden) {
      scrollAcc += THREE.MathUtils.clamp(state.velocity, -80, 80) * 0.0009;
      mat.uniforms.uTime.value += dt;
      mat.uniforms.uScroll.value = scrollAcc;
      mat.uniforms.uAlpha.value = state.alpha;
      mat.uniforms.uBurst.value = state.burst;
      points.rotation.y += (tx * 0.25 - points.rotation.y) * 0.03;
      points.rotation.x += (ty * 0.15 - points.rotation.x) * 0.03;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }
  tick();
  return state;
}

/* ================================================================
   AGNI — procedural sacred fire with rising embers
   ================================================================ */
export function createFire(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: false });
  renderer.setPixelRatio(Math.min(DPR, 1.5));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uPower: { value: 0.6 } },
    vertexShader: `void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `
      precision highp float;
      uniform float uTime; uniform vec2 uRes; uniform float uPower;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
      float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=0.5; } return v; }
      void main(){
        vec2 uv = gl_FragCoord.xy / uRes;
        vec2 p = uv - vec2(0.5, 0.1);
        p.x *= uRes.x / uRes.y;
        float t = uTime;
        float h = clamp(p.y, 0.0, 1.0);
        float n1 = fbm(vec2(p.x*3.2, p.y*2.4 - t*1.7));
        float n2 = fbm(vec2(p.x*7.0 + 4.0, p.y*5.0 - t*3.1));
        float sway = (n1 - 0.5) * 0.22 * (0.2 + h*1.6);
        float w = mix(0.2, 0.012, smoothstep(0.0, 0.62*uPower + 0.18, h)) * (0.85 + 0.3*uPower);
        float dx = abs(p.x + sway);
        float body = 1.0 - smoothstep(w*0.35, w, dx);
        body *= smoothstep(-0.03, 0.05, p.y);
        float top = 0.42*uPower + 0.22;
        body *= 1.0 - smoothstep(top*0.55, top, h + (n2 - 0.5)*0.32);
        float heat = body * (0.55 + 0.75*n2);
        vec3 col = vec3(0.0);
        col = mix(col, vec3(0.55,0.04,0.0), smoothstep(0.02,0.25,heat));
        col = mix(col, vec3(1.0,0.33,0.02), smoothstep(0.25,0.55,heat));
        col = mix(col, vec3(1.0,0.72,0.22), smoothstep(0.55,0.82,heat));
        col = mix(col, vec3(1.0,0.96,0.82), smoothstep(0.82,1.1,heat));
        float a = smoothstep(0.02, 0.35, heat);
        float emb = 0.0;
        for (int i = 0; i < 24; i++) {
          float fi = float(i);
          float s = hash(vec2(fi, 3.7));
          float life = fract(t*(0.12 + s*0.18) + s*7.0);
          vec2 ep = vec2((hash(vec2(fi,1.3)) - 0.5)*0.32 + sin(t*1.3 + fi)*0.04*life, 0.04 + life*0.85*uPower + life*0.15);
          float d = length(p - ep);
          emb += smoothstep(0.009, 0.0, d) * (1.0 - life) * 1.4;
        }
        col += vec3(1.0,0.6,0.2) * emb;
        a = max(a, clamp(emb,0.0,1.0));
        float g = exp(-length(vec2(p.x*1.1, (p.y-0.12)*0.8))*3.4) * (0.32 + 0.25*uPower);
        col += vec3(1.0,0.42,0.1) * g;
        a = max(a, g*0.9);
        gl_FragColor = vec4(col, a);
      }`
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    mat.uniforms.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  };
  resize(); addEventListener('resize', resize);
  const state = { visible: false, power: 0.6 };
  const clock = new THREE.Clock();
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (state.visible) {
      mat.uniforms.uTime.value += dt;
      mat.uniforms.uPower.value += (state.power - mat.uniforms.uPower.value) * 0.06;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }
  tick();
  return state;
}
