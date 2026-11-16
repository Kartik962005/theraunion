import * as THREE from 'three';

const isMobile = matchMedia('(max-width: 760px)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

/* ================================================================
   GOLD BOKEH — soft out-of-focus lights drifting over the site
   ================================================================ */
export function createBokeh(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true });
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);

  const COUNT = isMobile ? 70 : 120;
  const pos = new Float32Array(COUNT * 3), size = new Float32Array(COUNT), seed = new Float32Array(COUNT), depth = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = Math.random() * 2 - 1; pos[i * 3 + 1] = Math.random() * 2 - 1; pos[i * 3 + 2] = 0;
    const d = Math.random();
    depth[i] = d;
    size[i] = (isMobile ? 1 : 1.25) * (d < 0.08 ? 46 + Math.random() * 40 : d < 0.35 ? 10 + Math.random() * 14 : 3 + Math.random() * 7);
    seed[i] = Math.random() * 100;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('aDepth', new THREE.BufferAttribute(depth, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.NormalBlending, premultipliedAlpha: true,
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uDPR: { value: DPR }, uAlpha: { value: 0 }, uBurst: { value: 0 } },
    vertexShader: `
      attribute float aSize; attribute float aSeed; attribute float aDepth;
      uniform float uTime, uScroll, uDPR, uBurst;
      varying float vDepth; varying float vTw;
      void main(){
        vec3 p = position;
        float speed = mix(0.035, 0.012, aDepth);
        p.y = mod(p.y + 1.0 + uTime*speed + uScroll*mix(1.6,0.35,aDepth), 2.0) - 1.0;
        p.x += sin(uTime*0.25 + aSeed)*0.06*(1.0-aDepth*0.5) + cos(uTime*0.11 + aSeed*2.0)*0.03;
        p.y += uBurst * (1.0 - aDepth) * 0.15;
        vDepth = aDepth;
        vTw = 0.65 + 0.35*sin(uTime*(0.8+fract(aSeed)*1.6) + aSeed);
        gl_Position = vec4(p.xy, 0.0, 1.0);
        gl_PointSize = aSize * uDPR * (1.0 + uBurst*0.4);
      }`,
    fragmentShader: `
      uniform float uAlpha; varying float vDepth; varying float vTw;
      void main(){
        vec2 c = gl_PointCoord - 0.5; float r = length(c);
        float edge = mix(0.18, 0.04, vDepth);
        float disc = 1.0 - smoothstep(0.5 - edge, 0.5, r);
        float rim = smoothstep(0.32, 0.47, r) * (1.0 - smoothstep(0.47, 0.5, r)) * (1.0 - vDepth) * 0.5;
        float core = exp(-r*r*18.0) * vDepth;
        vec3 gold = mix(vec3(1.0,0.78,0.42), vec3(1.0,0.92,0.72), vDepth);
        float a = (disc*mix(0.07,0.55,vDepth) + rim*0.35 + core*0.6) * vTw * uAlpha;
        gl_FragColor = vec4(gold * a, a);
      }`
  });
  scene.add(new THREE.Points(geo, mat));

  const resize = () => renderer.setSize(innerWidth, innerHeight, false);
  resize(); addEventListener('resize', resize);

  const state = { velocity: 0, active: false, alpha: 0, burst: 0 };
  const clock = new THREE.Clock();
  let scrollAcc = 0;
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (state.active) {
      scrollAcc += THREE.MathUtils.clamp(state.velocity, -80, 80) * 0.00035;
      mat.uniforms.uTime.value += dt;
      mat.uniforms.uScroll.value = scrollAcc;
      mat.uniforms.uAlpha.value = state.alpha;
      mat.uniforms.uBurst.value = state.burst;
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
