import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/600-italic.css';
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/500.css';
import '@fontsource/pinyon-script/400.css';
import '@fontsource/tiro-devanagari-hindi/400.css';
import './style.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createPetals } from './gl.js';
import { createPalace } from './palace.js';
import { DAYS, ICONS, VOWS, WEDDING_MOMENT } from './data.js';
import { rangoli, lineMandala, toran, paisley, diya } from './ornaments.js';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 760px)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const DEVA = ['१', '२', '३', '४', '५', '६', '७'];

/* ---------- stable viewport height ---------- */
const setVH = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
setVH();
let lastW = innerWidth;
addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; setVH(); ScrollTrigger.refresh(); } });
addEventListener('orientationchange', () => setTimeout(() => { setVH(); ScrollTrigger.refresh(); }, 300));

/* ---------- ornaments ---------- */
const PAL = {
  door: ['#8c1a2b', '#5a0f1f', '#d8b56a', '#a8792f', '#f6e4b0'],
  invite: ['#f29a1f', '#c2185b', '#d8b56a', '#2e8b57', '#ffd34d'],
  tag: ['#f29a1f', '#d63aa0', '#d8b56a', '#3fb27f', '#ffd34d']
};
$$('[data-rangoli]').forEach(el => { el.innerHTML = rangoli({ palette: PAL[el.dataset.rangoli], stroke: '#e9c87d' }); });
$$('[data-linemandala]').forEach(el => { el.innerHTML = lineMandala(); });
$$('[data-toran]').forEach(el => { el.innerHTML = toran({ width: isMobile ? 420 : 900, drops: isMobile ? 7 : 13 }); });
$$('[data-paisley]').forEach(el => { el.innerHTML = paisley(); });
$$('[data-diya]').forEach(el => { el.outerHTML = diya(); });
$$('.draw').forEach(p => { try { const l = Math.ceil(p.getTotalLength()); p.style.setProperty('--len', l); } catch {} });

/* ---------- schedule ---------- */
const DAY_PAL = [
  ['#f29a1f', '#c2185b', '#d8b56a', '#ff8a1f', '#ffd34d'],
  ['#ffc61a', '#d63aa0', '#d8b56a', '#3fb27f', '#ff5fa2'],
  ['#ff5a2c', '#8c1a2b', '#d8b56a', '#3fb27f', '#ffd34d']
];
$('#days').innerHTML = DAYS.map((d, di) => `
  <div class="day">
    <div class="day__rangoli">${rangoli({ palette: DAY_PAL[di], stroke: '#e9c87d' })}</div>
    <div class="day__head">
      <div class="day__num">${d.date}</div>
      <div class="day__meta"><b>${d.weekday} · Nov</b><span>${d.title}</span></div>
    </div>
    <div class="day__list">
      <div class="day__line"><i></i></div>
      ${d.events.map(e => `
        <article class="ev${e.grand ? ' ev--grand' : ''}" style="--c:${e.accent}">
          <div class="ev__icon">${ICONS[e.icon]}</div>
          <h3 class="ev__name">${e.name}</h3>
          <p class="ev__desc">${e.desc}</p>
          <div class="ev__row"><span>${ICONS.clock}${e.time}</span><span>${ICONS.pin}${e.venue}</span></div>
        </article>`).join('')}
    </div>
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
const vowSlides = $('#vowSlides');
vowSlides.innerHTML = VOWS.map(v => `<div class="vow"><b>${v.hi}</b><p>${v.en}</p></div>`).join('');
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
$('#copyTag').addEventListener('click', async () => { await copy('#theRAunion'); toast('Hashtag copied ✨'); });
$('#shareBtn').addEventListener('click', async () => {
  const data = { title: 'Apeksha & Raghav · #theRAunion', text: 'You’re invited to the wedding of Apeksha & Raghav · 24–26 Nov 2026 · Taj Cidade de Goa Horizon', url: location.origin + location.pathname };
  if (navigator.share) { try { await navigator.share(data); } catch {} }
  else { await copy(data.url); toast('Invitation link copied'); }
});

/* ---------- film (picks quality for the device) ---------- */
const video = $('#filmVideo'), playBtn = $('#filmPlay');
playBtn.addEventListener('click', () => {
  if (!video.src) {
    const big = Math.max(screen.width, screen.height) * (devicePixelRatio || 1) >= 1700 && !isMobile && !(navigator.connection && navigator.connection.saveData);
    video.src = big ? 'media/film-1080.mp4' : 'media/film-720.mp4';
  }
  video.controls = true; video.play();
});
video.addEventListener('play', () => playBtn.classList.add('is-hidden'));

/* ---------- WebGL ---------- */
let palace = null, petals = null;
try { palace = createPalace($('#palace')); } catch (e) { console.warn('palace off', e); }
try { petals = createPetals($('#gl')); } catch (e) { console.warn('petals off', e); }

/* ---------- smooth scroll ---------- */
const lenis = new Lenis({ duration: 1.2, smoothWheel: true, syncTouch: false, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
lenis.stop();
lenis.on('scroll', (e) => { ScrollTrigger.update(); if (petals) petals.velocity = e.velocity; });
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
let lastY = scrollY;
addEventListener('scroll', () => { if (petals) { petals.velocity = (scrollY - lastY) * 0.8; lastY = scrollY; } }, { passive: true });
gsap.ticker.add(() => { if (petals) petals.velocity *= 0.9; });

/* ---------- gate ---------- */
const seal = $('#seal');
const readyGate = () => {
  if (!seal.disabled) return;
  seal.disabled = false;
  $('#gateHint').textContent = 'Tap the seal to open your invitation';
};
addEventListener('load', readyGate);
setTimeout(readyGate, 6000);
if (document.fonts) document.fonts.ready.then(() => setTimeout(readyGate, 400));

gsap.from('.gate__toran', { yPercent: -100, duration: 1.4, ease: 'bounce.out', delay: 0.2 });
gsap.from('.gate__center > *', { y: 20, opacity: 0, stagger: 0.12, duration: 1, delay: 0.5, ease: 'power3.out' });

function openGate() {
  seal.disabled = true;
  if (navigator.vibrate) navigator.vibrate(18);
  const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
  tl.to(seal, { scale: 1.25, duration: 0.25, ease: 'power2.out' })
    .to(seal, { scale: 0, rotate: 140, opacity: 0, duration: 0.45, ease: 'back.in(2)' })
    .to('.gate__center > :not(.gate__seal-row)', { opacity: 0, y: -20, duration: 0.4, stagger: 0.05 }, '<')
    .to('.gate__seal-row .diya', { opacity: 0, scale: 0.5, duration: 0.4 }, '<')
    .to('.gate__toran', { yPercent: -120, duration: 0.9, ease: 'power2.in' }, '<0.1')
    .add(() => { if (petals) { petals.active = true; petals.shower(); } }, '-=0.3')
    .to('.gate__door--l', { rotateY: -110, duration: 2, ease: 'power2.inOut' }, '-=0.4')
    .to('.gate__door--r', { rotateY: 110, duration: 2, ease: 'power2.inOut' }, '<')
    .to('#gate', { opacity: 0, duration: 0.7, ease: 'none' }, '-=0.7')
    .add(() => { $('#gate').remove(); document.body.classList.remove('is-locked'); lenis.start(); ScrollTrigger.refresh(); })
    .add(journeyIntro(), '-=2.2');
}
seal.addEventListener('click', openGate);

function journeyIntro() {
  const tl = gsap.timeline();
  if (palace) tl.to(palace, { intro: 1, duration: 3.2, ease: 'power3.out' }, 0);
  tl.fromTo('.jx__mandala .draw', { strokeDashoffset: (i, el) => el.style.getPropertyValue('--len') || 600 }, { strokeDashoffset: 0, duration: 2.6, stagger: 0.01, ease: 'power2.inOut' }, 0.2)
    .from('.jx__om', { y: 30, opacity: 0, duration: 1, ease: 'power3.out' }, 0.6)
    .from('.jx__shloka', { y: 30, opacity: 0, duration: 1.2, ease: 'power3.out' }, 0.9)
    .from('.jx__hint, .journey__cue', { opacity: 0, duration: 1 }, 1.6);
  return tl;
}

/* ---------- scroll choreography ---------- */
function scenes() {
  gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });

  /* JOURNEY through the palace */
  const jt = gsap.timeline({
    scrollTrigger: {
      trigger: '.journey', start: 'top top', end: () => '+=' + innerHeight * 5.5, scrub: 1, pin: true, anticipatePin: 1,
      onUpdate: self => { if (palace) palace.progress = self.progress; },
      onLeave: () => { if (palace) palace.visible = false; },
      onEnterBack: () => { if (palace) palace.visible = true; }
    }
  });
  jt.to('.journey__cue', { opacity: 0, duration: 0.4 }, 0)
    .to('.jx--1', { opacity: 0, scale: 1.25, filter: 'blur(6px)', duration: 0.8 }, 0.6)
    .fromTo('.jx--2', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.6)
    .fromTo('.jx--2 .char', { yPercent: 120, rotateX: -90, opacity: 0 }, { yPercent: 0, rotateX: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: 'back.out(1.6)' }, 1.6)
    .fromTo('.jx--2 .jx__amp, .jx--2 .jx__deva, .jx--2 .eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 }, 2.0)
    .to('.jx--2', { opacity: 0, scale: 1.2, filter: 'blur(6px)', duration: 0.7 }, 3.6)
    .fromTo('.jx--3', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, 4.4)
    .fromTo('.jx__dates span', { opacity: 0, rotateY: -90 }, { opacity: 1, rotateY: 0, stagger: 0.15, duration: 0.6, ease: 'back.out(2)' }, 4.6)
    .to('.jx--3', { opacity: 0, scale: 1.2, filter: 'blur(6px)', duration: 0.7 }, 6.2)
    .fromTo('.jx--4', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, 7.6)
    .to({}, { duration: 1.6 });

  /* invitation */
  $$('.fade-words').forEach(el => gsap.to(el.querySelectorAll('.w'), { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 55%', scrub: true } }));
  $$('.corner').forEach(c => gsap.to(c.querySelectorAll('.draw'), { strokeDashoffset: 0, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: c, start: 'top 95%', end: 'top 45%', scrub: 1 } }));
  gsap.to('.invite__rangoli svg', { rotate: 120, scale: 1.2, ease: 'none', scrollTrigger: { trigger: '.invite', start: 'top bottom', end: 'bottom top', scrub: true } });
  const cards = $$('.couple__card');
  gsap.from(cards[0], { rotateY: -85, x: -50, opacity: 0, transformOrigin: '0% 50%', ease: 'power2.out', scrollTrigger: { trigger: '.couple', start: 'top 92%', end: 'top 50%', scrub: 1 } });
  gsap.from(cards[1], { rotateY: 85, x: 50, opacity: 0, transformOrigin: '100% 50%', ease: 'power2.out', scrollTrigger: { trigger: '.couple', start: 'top 92%', end: 'top 50%', scrub: 1 } });
  gsap.from('.couple__knot', { scale: 0, rotate: -270, ease: 'back.out(2)', scrollTrigger: { trigger: '.couple', start: 'top 70%', end: 'top 45%', scrub: 1 } });

  /* arch reveal */
  const at = gsap.timeline({ scrollTrigger: { trigger: '.arch', start: 'top top', end: '+=160%', scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true } });
  at.to('.arch__frame', { width: () => innerWidth, height: () => innerHeight, maxWidth: () => innerWidth, borderRadius: 0, boxShadow: '0 0 0 0px #f7f0e3, 0 0 0 0px #b98e3e, 0 0 0 0 rgba(0,0,0,0)', ease: 'power2.inOut', duration: 1 })
    .to('.arch__frame img', { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
    .fromTo('.arch__text', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4 }, 0.75)
    .to({}, { duration: 0.35 });

  /* saptapadi: walk around the sacred fire */
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
    trigger: '.vows', start: 'top top', end: () => '+=' + innerHeight * 3.5, pin: true, scrub: 1, anticipatePin: 1,
    onUpdate: self => {
      const p = self.progress;
      gsap.set('.agni__trail', { strokeDashoffset: 817 * (1 - p) });
      placeCouple(p);
      setVow(Math.min(6, Math.floor(p * 7)));
      gsap.set('.agni__fire', { scale: 1 + p * 0.25 });
    }
  });
  gsap.from('.vows__head > *', { y: 40, opacity: 0, stagger: 0.12, scrollTrigger: { trigger: '.vows', start: 'top 80%', end: 'top 20%', scrub: 1 } });

  /* gallery cover-flow */
  const track = $('.gallery__track'), gcards = $$('.gcard');
  const dist = () => track.scrollWidth - innerWidth;
  let galleryOn = false;
  gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: '.gallery', start: 'top top', end: () => '+=' + dist() * 1.2, scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
      onToggle: s => { galleryOn = s.isActive; },
      onUpdate: s => gsap.set('.gallery__progress span', { scaleX: s.progress }) }
  });
  const coverflow = () => {
    const cx = innerWidth / 2;
    gcards.forEach(c => {
      const r = c.getBoundingClientRect();
      const d = gsap.utils.clamp(-1.4, 1.4, (r.left + r.width / 2 - cx) / (innerWidth * 0.75));
      gsap.set(c, { rotateY: d * -40, z: -Math.abs(d) * 170, scale: 1 - Math.abs(d) * 0.08, opacity: 1 - Math.abs(d) * 0.35, transformPerspective: 1000 });
    });
  };
  coverflow();
  gsap.ticker.add(() => { if (galleryOn) coverflow(); });
  gsap.from('.gallery__head', { y: 40, opacity: 0, scrollTrigger: { trigger: '.gallery', start: 'top 80%', end: 'top 20%', scrub: 1 } });

  /* film */
  gsap.fromTo('.film__frame', { rotateX: 40, scale: 0.78, y: 60, transformPerspective: 900 }, { rotateX: 0, scale: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: '.film', start: 'top 85%', end: 'center 60%', scrub: 1 } });
  gsap.from('.film h2, .film .eyebrow', { y: 40, opacity: 0, stagger: 0.1, scrollTrigger: { trigger: '.film', start: 'top 85%', end: 'top 45%', scrub: 1 } });

  /* countdown */
  gsap.from('.cd__cell', { rotateX: -90, y: 30, opacity: 0, stagger: 0.12, duration: 0.9, ease: 'back.out(1.6)', transformPerspective: 600, scrollTrigger: { trigger: '.countdown', start: 'top 75%' } });
  gsap.from('.countdown__diyas .diya', { y: -30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'bounce.out', scrollTrigger: { trigger: '.countdown', start: 'top 80%' } });

  /* schedule */
  gsap.from('.schedule__head > *', { y: 40, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.schedule', start: 'top 75%' } });
  $$('.day').forEach(day => {
    gsap.fromTo(day.querySelector('.day__rangoli svg'), { rotate: -180, scale: 0.3, opacity: 0 }, { rotate: 90, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: day, start: 'top 95%', end: 'bottom top', scrub: true } });
    gsap.from(day.querySelector('.day__num'), { rotateY: -100, opacity: 0, duration: 1.2, ease: 'expo.out', transformPerspective: 600, scrollTrigger: { trigger: day, start: 'top 80%' } });
    gsap.from(day.querySelector('.day__meta'), { x: 30, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: day, start: 'top 80%' } });
    gsap.to(day.querySelector('.day__line i'), { scaleY: 1, ease: 'none', scrollTrigger: { trigger: day.querySelector('.day__list'), start: 'top 75%', end: 'bottom 60%', scrub: true } });
    day.querySelectorAll('.ev').forEach((ev, i) => {
      gsap.fromTo(ev, { rotateX: -70, rotateZ: i % 2 ? 4 : -4, y: 80, opacity: 0, transformPerspective: 900 },
        { rotateX: 0, rotateZ: 0, y: 0, opacity: 1, ease: 'power3.out', scrollTrigger: { trigger: ev, start: 'top 98%', end: 'top 68%', scrub: 1 } });
      gsap.from(ev.querySelector('.ev__icon'), { scale: 0, rotate: -120, ease: 'back.out(2)', scrollTrigger: { trigger: ev, start: 'top 85%', end: 'top 65%', scrub: 1 } });
    });
  });

  /* venue */
  gsap.fromTo('.venue__sea .sun', { y: -10 }, { y: 70, ease: 'none', scrollTrigger: { trigger: '.venue__sea', start: 'top 85%', end: 'bottom 20%', scrub: true } });
  gsap.from('.venue .display, .venue__addr, .venue__note', { y: 40, opacity: 0, stagger: 0.12, scrollTrigger: { trigger: '.venue', start: 'top 80%', end: 'top 40%', scrub: 1 } });

  /* hashtag */
  gsap.to('.tag__rangoli svg', { rotate: 180, ease: 'none', scrollTrigger: { trigger: '.tag', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.tag__word', { scale: 0.5, rotateX: 70, opacity: 0, transformPerspective: 700, ease: 'power3.out', scrollTrigger: { trigger: '.tag', start: 'top 80%', end: 'center 60%', scrub: 1 } });

  /* footer */
  gsap.from('.foot > *:not(.foot__toran)', { y: 30, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.foot', start: 'top 80%' } });

  ScrollTrigger.create({ trigger: '.schedule', start: 'top 60%', end: 'bottom 40%', onToggle: s => { if (petals) gsap.to(petals, { density: s.isActive ? 0.55 : 1, duration: 1 }); } });
}

if (!reduce) scenes();
else if (palace) { palace.intro = 1; }
addEventListener('load', () => ScrollTrigger.refresh());
