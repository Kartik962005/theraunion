import '@fontsource/cormorant-garamond/latin-300.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/cinzel/latin-400.css';
import '@fontsource/pinyon-script/latin-400.css';
import '@fontsource/tiro-devanagari-hindi/devanagari-400.css';
import '@fontsource/tiro-devanagari-hindi/latin-400.css';
import './style.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createSparkles } from './sparkles.js';
import { DAYS, VOWS, WEDDING_MOMENT } from './data.js';
import { lineMandala } from './ornaments.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 760px)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const DEVA = ['१', '२', '३', '४', '५', '६', '७'];

/* always start at the top (browsers otherwise restore the last scroll spot) */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
addEventListener('pageshow', () => window.scrollTo(0, 0));

/* ---------- stable viewport height ---------- */
const setVH = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
setVH();
let lastW = innerWidth;
addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; setVH(); ScrollTrigger.refresh(); } });
addEventListener('orientationchange', () => setTimeout(() => { setVH(); ScrollTrigger.refresh(); }, 300));

/* ---------- fine-line mandalas ---------- */
$$('[data-linemandala]').forEach(el => { el.innerHTML = lineMandala(); });
$$('.draw').forEach(p => { try { p.style.setProperty('--len', Math.ceil(p.getTotalLength())); } catch {} });

/* ---------- hero video (portrait for phones, landscape for wide screens) ---------- */
const heroVideo = $('#heroVideo');
const portrait = innerWidth / innerHeight < 1;
heroVideo.poster = portrait ? 'media/hero-portrait.jpg' : 'media/hero-landscape.jpg';
heroVideo.src = portrait ? 'media/hero-portrait.mp4' : 'media/hero-landscape.mp4';
heroVideo.muted = true;
const playHero = () => { const p = heroVideo.play(); if (p) p.catch(() => {}); };
playHero();

/* ---------- schedule (editorial) ---------- */
$('#days').innerHTML = DAYS.map(d => `
  <div class="day">
    <div class="day__head">
      <div class="day__num"><span>${d.date}</span></div>
      <div class="day__meta"><b>${d.weekday} · November</b><span>${d.title}</span></div>
    </div>
    <div class="day__rule"></div>
    ${d.events.map(e => {
      const [t] = e.time.split(' onwards');
      const name = e.name.replace(/ & /g, ' <em>&amp;</em> ').replace(/ \/ /g, ' <em>/</em> ');
      return `
      <article class="ev${e.grand ? ' ev--grand' : ''}">
        <div class="ev__time"><span class="mask"><span>${t}</span></span><small>onwards</small></div>
        <div class="ev__body">
          <h3 class="ev__name mask"><span>${name}</span></h3>
          <p class="ev__desc mask"><span>${e.desc}</span></p>
          <p class="ev__venue">${e.venue}</p>
        </div>
      </article>`;
    }).join('')}
  </div>`).join('');

/* ---------- calendar file ---------- */
(function buildICS() {
  const pad = n => String(n).padStart(2, '0');
  const fmt = (iso, hm, addH = 0) => {
    const [h, m] = hm.split(':').map(Number);
    const d = new Date(`${iso}T${pad(h)}:${pad(m)}:00+05:30`);
    d.setMinutes(d.getMinutes() + addH * 60);
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//theRAunion//Wedding//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Apeksha & Raghav Wedding'];
  DAYS.forEach(d => d.events.forEach((e, i) => {
    L.push('BEGIN:VEVENT', `UID:${d.iso}-${i}@theraunion`, `DTSTAMP:${fmt('2026-11-01', '00:00')}`,
      `DTSTART:${fmt(d.iso, e.start)}`, `DTEND:${fmt(d.iso, e.start, e.hours)}`,
      `SUMMARY:${e.name} · Apeksha & Raghav`,
      `LOCATION:${e.venue.replace(/,/g, '\\,')}\\, Taj Cidade de Goa Horizon\\, Dona Paula\\, Goa`,
      `DESCRIPTION:${e.time} · ${e.desc.replace(/,/g, '\\,')} #theRAunion`, 'END:VEVENT');
  }));
  L.push('END:VCALENDAR');
  $('#icsBtn').href = URL.createObjectURL(new Blob([L.join('\r\n')], { type: 'text/calendar' }));
})();

/* ---------- countdown ---------- */
(function countdown() {
  const target = new Date(WEDDING_MOMENT).getTime();
  const els = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    if (diff === 0) { $('#countdown').hidden = true; $('.cd__done').hidden = false; return; }
    const v = { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 };
    for (const k in v) {
      const t = String(v[k]).padStart(2, '0');
      if (els[k].textContent !== t) { els[k].textContent = t; els[k].classList.remove('flip'); void els[k].offsetWidth; els[k].classList.add('flip'); }
    }
    setTimeout(tick, 1000 - (Date.now() % 1000));
  };
  tick();
})();

/* ---------- vows DOM ---------- */
$('#vowSlides').innerHTML = VOWS.map(v => `<div class="vow"><b>${v.hi}</b><p>${v.en}</p></div>`).join('');
const nodesG = $('.agni__nodes');
VOWS.forEach((_, i) => {
  const a = (-90 + (i / 7) * 360) * Math.PI / 180;
  const x = 150 + Math.cos(a) * 130, y = 150 + Math.sin(a) * 130;
  nodesG.insertAdjacentHTML('beforeend', `<circle cx="${x}" cy="${y}" r="12"/><text x="${x}" y="${y}">${DEVA[i]}</text>`);
});

/* ---------- text splitting ---------- */
$$('[data-split]').forEach(el => { el.innerHTML = [...el.textContent].map(c => `<span class="char">${c}</span>`).join(''); });
$$('.fade-words').forEach(el => { el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' '); });

/* ---------- toast / share ---------- */
const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200); };
const copy = async (text) => {
  try { await navigator.clipboard.writeText(text); return true; }
  catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; }
};
$('#copyTag').addEventListener('click', async () => { await copy('#theRAunion'); toast('Hashtag copied'); });
$('#shareBtn').addEventListener('click', async () => {
  const data = { title: 'Apeksha & Raghav · #theRAunion', text: 'You’re invited to the wedding of Apeksha & Raghav · 24–26 Nov 2026 · Taj Cidade de Goa Horizon', url: 'https://theraunion.online' };
  if (navigator.share) { try { await navigator.share(data); } catch {} }
  else { await copy(data.url); toast('Link copied · theraunion.online'); }
});

/* ---------- film: the reel, with its song ---------- */
const video = $('#filmVideo'), playBtn = $('#filmPlay');
playBtn.addEventListener('click', () => {
  if (!video.src) {
    const hi = (devicePixelRatio || 1) * Math.min(innerWidth, 420) > 760 && !(navigator.connection && navigator.connection.saveData);
    video.src = hi ? 'media/reel-1080.mp4' : 'media/reel-720.mp4';
  }
  if (!heroVideo.paused) heroVideo.pause();
  video.muted = false; video.controls = true; video.play();
});
video.addEventListener('play', () => playBtn.classList.add('is-hidden'));

/* ---------- WebGL ---------- */
let bokeh = null;
try { bokeh = createSparkles($('#gl')); } catch (e) { console.warn('sparkles off', e); }

/* ---------- smooth scroll ---------- */
const lenis = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.7, touchMultiplier: 1, syncTouch: false });
lenis.stop();
lenis.on('scroll', (e) => { ScrollTrigger.update(); if (bokeh) bokeh.velocity = e.velocity; });
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
let lastY = scrollY;
addEventListener('scroll', () => { if (bokeh) { bokeh.velocity = (scrollY - lastY) * 0.8; lastY = scrollY; } }, { passive: true });
gsap.ticker.add(() => { if (bokeh) bokeh.velocity *= 0.9; });

/* ---------- gate ---------- */
const seal = $('#seal');
const readyGate = () => { if (!seal.disabled || !seal.isConnected || seal.dataset.opened) return; seal.disabled = false; $('#gateHint').textContent = 'Tap the seal to open'; };
addEventListener('load', readyGate);
setTimeout(readyGate, 5000);
if (document.fonts) document.fonts.ready.then(() => setTimeout(readyGate, 300));

gsap.set('.gate__inner > *', { opacity: 0, y: 18 });
gsap.timeline({ delay: 0.25 })
  .from('.gate__frame', { opacity: 0, scale: 1.04, duration: 1.4, ease: 'power2.out' })
  .to('.gate__inner > *', { opacity: 1, y: 0, stagger: 0.12, duration: 1, ease: 'power3.out' }, 0.3);

function openGate() {
  seal.disabled = true; seal.dataset.opened = '1';
  playHero();
  if (navigator.vibrate) navigator.vibrate(15);
  const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
  tl.to(seal, { scale: 0.86, duration: 0.18, ease: 'power2.out' })
    .to(seal, { scale: 1.6, opacity: 0, duration: 0.5, ease: 'power2.in' })
    .to('.gate__inner > :not(.seal)', { opacity: 0, y: -14, duration: 0.5, stagger: 0.04 }, '<')
    .to('.gate__frame', { opacity: 0, scale: 1.06, duration: 0.6 }, '<')
    .to('.gate__half--top', { yPercent: -101, duration: 1.5, ease: 'expo.inOut' }, '-=0.2')
    .to('.gate__half--bot', { yPercent: 101, duration: 1.5, ease: 'expo.inOut' }, '<')
    .add(() => { if (bokeh) { bokeh.active = true; gsap.to(bokeh, { alpha: 1, duration: 2.5 }); gsap.fromTo(bokeh, { burst: 1 }, { burst: 0, duration: 3, ease: 'power2.out' }); } }, '<0.3')
    .add(() => { $('#gate').remove(); document.body.classList.remove('is-locked'); window.scrollTo(0, 0); lenis.scrollTo(0, { immediate: true }); lenis.start(); ScrollTrigger.refresh(); })
    .add(heroIntro(), '-=1.1');
}
seal.addEventListener('click', openGate);

function heroIntro() {
  const tl = gsap.timeline();
  tl.fromTo('.hero__video', { scale: 1.18 }, { scale: 1, duration: 3.2, ease: 'power2.out' }, 0)
    .from('.hx__mantra', { opacity: 0, y: -12, duration: 1 }, 0.3)
    .from('.hx__eyebrow', { opacity: 0, letterSpacing: '1em', duration: 1.4, ease: 'power3.out' }, 0.4)
    .from('.hx__names .char', { yPercent: 110, opacity: 0, duration: 1.2, stagger: 0.05, ease: 'expo.out' }, 0.6)
    .from('.hx__amp', { opacity: 0, scale: 0.6, duration: 1 }, 1.0)
    .from('.hx__date > *', { opacity: 0, y: 16, stagger: 0.08, duration: 0.8 }, 1.2)
    .from('.hx__month, .hero__cue', { opacity: 0, duration: 1 }, 1.5);
  return tl;
}

/* ---------- scroll choreography ---------- */
const road = { rot: 0 };
function sizeRoad() {
  const w = innerWidth, h = innerHeight, world = $('.road__world');
  const land = w > h;
  const k = land ? Math.max(w / 2576, h / 1447) : Math.max(w / 1447, h / 2576);
  world.style.aspectRatio = 'auto';
  world.style.width = `${1447 * k}px`; world.style.height = `${2576 * k}px`;
  road.rot = land ? 90 : 0;
}
sizeRoad();
ScrollTrigger.addEventListener('refreshInit', sizeRoad);
gsap.set(['.road__world', '.hero__lines'], { x: 0, y: 0, xPercent: -50, yPercent: -50 });
gsap.set('.road__car', { x: 0, y: 0, xPercent: -50 });

function scenes() {
  gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });

  /* HERO: film folds into an arch window */
  const archW = () => Math.min(innerWidth * 0.68, innerWidth > 900 ? 440 : 360);
  const ht = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: () => '+=' + innerHeight * 3, scrub: 1.4, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
    onLeave: () => heroVideo.pause(), onEnterBack: playHero } });
  ht.to('.hero__cue', { opacity: 0, duration: 0.2 }, 0)
    .to('.hx--a', { yPercent: -18, opacity: 0, duration: 0.45, ease: 'power2.in' }, 0)
    .to('.hero__frame', { top: '44%', width: archW, height: () => innerHeight * 0.5, borderRadius: () => `${archW() / 2}px ${archW() / 2}px 0px 0px`, duration: 0.65, ease: 'power3.inOut' }, 0.2)
    .to('.hero__shade', { opacity: 0.25, duration: 0.5 }, 0.3)
    .fromTo('.hero__lines', { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.4 }, 0.7)
    .fromTo('.hx--b > *', { opacity: 0, y: 18 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.35 }, 0.75)
    .to({}, { duration: 0.3 });

  /* invitation */
  $$('.fade-words').forEach(el => gsap.to(el.querySelectorAll('.w'), { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: true } }));
  gsap.fromTo('.invite__mandala .draw', { strokeDashoffset: (i, el) => el.style.getPropertyValue('--len') || 600 }, { strokeDashoffset: 0, stagger: 0.004, ease: 'none', scrollTrigger: { trigger: '.invite', start: 'top 80%', end: 'bottom 70%', scrub: 1 } });
  const cards = $$('.couple__card');
  gsap.from(cards[0], { rotateY: 70, x: -40, opacity: 0, transformOrigin: '0% 50%', ease: 'power2.out', scrollTrigger: { trigger: '.couple', start: 'top 92%', end: 'top 45%', scrub: 1 } });
  gsap.from(cards[1], { rotateY: -70, x: 40, opacity: 0, transformOrigin: '100% 50%', ease: 'power2.out', scrollTrigger: { trigger: '.couple', start: 'top 92%', end: 'top 45%', scrub: 1 } });
  gsap.from('.couple__amp', { scale: 0.3, opacity: 0, ease: 'back.out(2)', scrollTrigger: { trigger: '.couple', start: 'top 70%', end: 'top 45%', scrub: 1 } });
  gsap.fromTo('.couple__photo img', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.couple', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* THE ROAD: the car drives in and comes to a stop */
  const rt = gsap.timeline({ scrollTrigger: { trigger: '.road', start: 'top top', end: () => '+=' + innerHeight * 3.6, scrub: 1.4, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
  rt.fromTo('.road__world', { scale: 1.22, x: 0, y: 0, xPercent: -50, yPercent: -47, rotate: () => road.rot }, { scale: 1, x: 0, y: 0, xPercent: -50, yPercent: -50, rotate: () => road.rot, duration: 6.6, ease: 'power2.out' }, 0)
    .fromTo('.road__car', { yPercent: -175 }, { yPercent: 0, duration: 6.4, ease: 'power3.out' }, 0)
    .fromTo('.road__car', { xPercent: -12 }, { xPercent: -50, duration: 4.2, ease: 'sine.inOut' }, 1.0)
    .fromTo('.road__car', { rotate: 0 }, { rotate: 7, duration: 1.8, ease: 'sine.out' }, 1.0)
    .to('.road__car', { rotate: -2.5, duration: 1.8, ease: 'sine.inOut' }, 2.8)
    .to('.road__car', { rotate: 0, duration: 1.6, ease: 'sine.out' }, 4.6)
    .to('.road__carimg', { scaleY: 0.985, transformOrigin: '50% 100%', duration: 0.35, ease: 'power1.out' }, 6.3)
    .to('.road__carimg', { scaleY: 1, duration: 0.7, ease: 'elastic.out(1,0.4)' }, 6.65)
    .to('.road__veil', { opacity: 1, duration: 1.2 }, 7.0)
    .fromTo('.road__text', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, 7.3)
    .to({}, { duration: 1.4 });

  /* SAPTAPADI: walk around the sacred fire */
  const slides = $$('.vow'), nodes = $$('.agni__nodes circle'), couple = $$('.agni__couple circle');
  let cur = -1;
  const setVow = (i) => {
    if (i === cur) return;
    const prev = slides[cur];
    if (prev) gsap.to(prev, { opacity: 0, y: -20, duration: 0.35, overwrite: true });
    gsap.fromTo(slides[i], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.1, overwrite: true });
    gsap.fromTo('#vowNum', { rotateX: -90, opacity: 0 }, { rotateX: 0, opacity: 1, duration: 0.5, onStart: () => { $('#vowNum').textContent = DEVA[i]; } });
    nodes.forEach((n, k) => n.classList.toggle('on', k <= i));
    cur = i;
  };
  setVow(0);
  const placeCouple = (p) => {
    const base = -90 + p * 360;
    couple.forEach((c, k) => {
      const a = (base - k * 9) * Math.PI / 180;
      c.setAttribute('cx', 150 + Math.cos(a) * 130); c.setAttribute('cy', 150 + Math.sin(a) * 130);
    });
  };
  placeCouple(0);
  ScrollTrigger.create({
    trigger: '.vows', start: 'top top', end: () => '+=' + innerHeight * 4.5, pin: true, scrub: 1.4, anticipatePin: 1,
    onUpdate: self => {
      const p = self.progress;
      gsap.set('.agni__trail', { strokeDashoffset: 817 * (1 - p) });
      placeCouple(p);
      setVow(Math.min(6, Math.floor(p * 7)));
      gsap.set('.agni__fire', { scale: 1 + p * 0.25 });
    }
  });
  gsap.from('.vows__head > *', { y: 40, opacity: 0, stagger: 0.12, scrollTrigger: { trigger: '.vows', start: 'top 80%', end: 'top 20%', scrub: 1 } });

  /* GALLERY cover-flow (positions computed from cached offsets — no per-frame layout reads) */
  const track = $('.gallery__track'), gcards = $$('.gcard'), gimgs = gcards.map(c => c.querySelector('img'));
  let centers = [];
  const measure = () => { centers = gcards.map(c => c.offsetLeft + c.offsetWidth / 2); };
  measure(); ScrollTrigger.addEventListener('refresh', measure);
  const dist = () => track.scrollWidth - innerWidth;
  const coverflow = () => {
    const x = gsap.getProperty(track, 'x') || 0, cx = innerWidth / 2;
    for (let i = 0; i < gcards.length; i++) {
      const d = gsap.utils.clamp(-1.5, 1.5, (centers[i] + x - cx) / (innerWidth * 0.7));
      gsap.set(gcards[i], { rotateY: d * -34, z: -Math.abs(d) * 150, scale: 1 - Math.abs(d) * 0.06, opacity: 1 - Math.abs(d) * 0.3, transformPerspective: 1100, force3D: true });
      gsap.set(gimgs[i], { xPercent: d * -8, scale: 1.12 });
    }
  };
  gsap.to(track, {
    x: () => -dist(), ease: 'none', onUpdate: coverflow,
    scrollTrigger: { trigger: '.gallery', start: 'top top', end: () => '+=' + dist() * 1.6, scrub: 1.4, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: s => gsap.set('.gallery__progress span', { scaleX: s.progress }) }
  });
  coverflow();
  gsap.from('.gallery__head', { y: 40, opacity: 0, scrollTrigger: { trigger: '.gallery', start: 'top 80%', end: 'top 20%', scrub: 1 } });

  /* FILM */
  gsap.fromTo('.film__frame', { rotateX: 32, scale: 0.82, y: 50, transformPerspective: 900 }, { rotateX: 0, scale: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: '.film', start: 'top 85%', end: 'center 60%', scrub: 1 } });
  gsap.from('.film h2, .film .eyebrow', { y: 40, opacity: 0, stagger: 0.1, scrollTrigger: { trigger: '.film', start: 'top 85%', end: 'top 45%', scrub: 1 } });

  /* COUNTDOWN */
  gsap.from('.cd__cell', { y: 30, opacity: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.countdown', start: 'top 78%' } });
  gsap.from('.cd', { scaleX: 0.4, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.countdown', start: 'top 78%' } });

  /* SCHEDULE — editorial reveals */
  gsap.from('.sched__head > *', { y: 30, opacity: 0, stagger: 0.12, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.sched', start: 'top 75%' } });
  $$('.day').forEach(day => {
    gsap.from(day.querySelector('.day__num span'), { yPercent: 100, duration: 0.8, ease: 'power4.out', scrollTrigger: { trigger: day, start: 'top 92%' } });
    gsap.from(day.querySelector('.day__meta'), { x: 18, opacity: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: day, start: 'top 92%' } });
    gsap.from(day.querySelector('.day__rule'), { scaleX: 0, duration: 0.9, ease: 'power3.inOut', scrollTrigger: { trigger: day, start: 'top 90%' } });
    day.querySelectorAll('.ev').forEach(ev => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: ev, start: 'top 96%' } });
      tl.from(ev.querySelectorAll('.mask > *'), { yPercent: 105, duration: 0.65, stagger: 0.05, ease: 'power3.out' })
        .from(ev.querySelectorAll('small, .ev__venue'), { opacity: 0, y: 6, duration: 0.5, stagger: 0.04 }, 0.12)
        .to(ev, { '--s': 1, duration: 0.8, ease: 'power3.inOut' }, 0.05);
    });
  });

  /* VENUE */
  gsap.from('.venue__photo', { clipPath: 'inset(100% 0 0 0)', duration: 1.5, ease: 'expo.inOut', scrollTrigger: { trigger: '.venue__photo', start: 'top 85%' } });
  gsap.fromTo('.venue__photo img', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.venue__photo', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.venue .display, .venue__addr, .venue .eyebrow', { y: 30, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.venue', start: 'top 78%' } });

  /* HASHTAG */
  gsap.fromTo('.tag__mandala .draw', { strokeDashoffset: (i, el) => el.style.getPropertyValue('--len') || 600 }, { strokeDashoffset: 0, stagger: 0.004, ease: 'none', scrollTrigger: { trigger: '.tag', start: 'top 85%', end: 'bottom 60%', scrub: 1 } });
  gsap.from('.tag__word', { y: 40, opacity: 0, letterSpacing: '0.2em', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.tag', start: 'top 70%' } });

  /* FOOTER */
  gsap.from('.foot > *', { y: 24, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.foot', start: 'top 82%' } });

  /* bokeh: quieter over the light, text-heavy sections */
  $$('.paper').forEach(p => ScrollTrigger.create({ trigger: p, start: 'top 50%', end: 'bottom 50%', onToggle: s => { if (bokeh) gsap.to(bokeh, { alpha: s.isActive ? 0.55 : 1, duration: 0.8 }); } }));
}

if (!reduce) scenes();
addEventListener('load', () => ScrollTrigger.refresh());
