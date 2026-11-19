/* La Despensa de Salchi — interfaz */
(function () {
  'use strict';
  const E = window.Engine;
  const CAT = E.CATALOG;
  const app = document.getElementById('app');
  const fx = document.getElementById('fx');
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.prototype.slice.call((el || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const fmt = (n) => Math.round(n).toLocaleString('es-MX');

  // ---------- Guardado ----------
  const KEY = 'salchi.save.v1';
  const DEF = { name: '', datos: 'infantil', sound: true, vib: true, level: 1, stars: {}, best: {}, huesitos: 60,
    boost: { undo: 3, hint: 3, shuffle: 2, slot: 1 }, found: {}, daily: { last: '', streak: 0, lastPlay: '' }, seen: {}, cur: null };
  let S = load();
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || 'null') || {};
      const out = Object.assign(clone(DEF), s);
      out.boost = Object.assign({}, DEF.boost, s.boost || {});
      out.daily = Object.assign({}, DEF.daily, s.daily || {});
      return out;
    } catch (e) { return clone(DEF); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* sin espacio */ } }
  function today(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function tickDays() {
    const t = today();
    if (S.daily.lastPlay === t) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    S.daily.streak = S.daily.lastPlay === today(y) ? S.daily.streak + 1 : 1;
    S.daily.lastPlay = t;
    save();
  }
  const NAME = () => esc(S.name || 'amig@');

  // ---------- Sonido (sintetizado, sin archivos) ----------
  let AC = null;
  function ac() {
    if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (C) AC = new C(); }
    if (AC && AC.state === 'suspended') AC.resume();
    return AC;
  }
  function tone(f, d, type, v, t0, f2) {
    if (!S.sound) return;
    const a = ac(); if (!a) return;
    const t = a.currentTime + (t0 || 0);
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v || 0.1, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(a.destination);
    o.start(t); o.stop(t + d + 0.03);
  }
  const SFX = {
    tap: () => tone(880, 0.06, 'triangle', 0.05),
    pick: () => { tone(620, 0.08, 'triangle', 0.09); tone(940, 0.07, 'sine', 0.05, 0.03); },
    drop: () => tone(360, 0.11, 'triangle', 0.12, 0, 250),
    bad: () => tone(230, 0.14, 'sine', 0.08, 0, 170),
    match: (st) => { const b = 523.25 * Math.pow(2, Math.min((st || 1) - 1, 7) / 12 * 2); [1, 1.26, 1.5, 2].forEach((m, i) => tone(b * m, 0.17, 'triangle', 0.1, i * 0.055)); },
    reveal: () => tone(700, 0.1, 'sine', 0.06, 0, 1050),
    win: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.24, 'triangle', 0.11, i * 0.11)),
    woof: () => { tone(520, 0.08, 'triangle', 0.09, 0, 300); tone(560, 0.1, 'triangle', 0.09, 0.14, 300); },
    coin: () => { tone(988, 0.08, 'square', 0.04); tone(1319, 0.16, 'square', 0.04, 0.07); },
    ice: () => { tone(1500, 0.06, 'sine', 0.05); tone(1900, 0.09, 'sine', 0.04, 0.05); },
    unlock: () => { tone(600, 0.06, 'square', 0.04); tone(900, 0.14, 'triangle', 0.08, 0.06); },
    star: (i) => tone(660 * Math.pow(1.26, i), 0.2, 'triangle', 0.1)
  };
  function vib(ms) { if (S.vib && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* nada */ } } }
  document.addEventListener('pointerdown', () => ac(), { once: true });

  // ---------- Íconos ----------
  const ST = 'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
  const STARP = 'M12 2.5l2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 16.8l-5.6 2.9 1.1-6.2-4.6-4.4 6.3-.9z';
  const I = {
    gear: `<svg viewBox="0 0 24 24" ${ST}><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.6"/><rect x="13.5" y="5" width="4" height="14" rx="1.6"/></svg>`,
    map: `<svg viewBox="0 0 24 24" ${ST}><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/></svg>`,
    back: `<svg viewBox="0 0 24 24" ${ST} stroke-width="2.8"><path d="M15 5l-7 7 7 7"/></svg>`,
    undo: `<svg viewBox="0 0 24 24" ${ST} stroke-width="2.7"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>`,
    hint: `<svg viewBox="0 0 24 24" ${ST} stroke-width="2.7"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>`,
    shuffle: `<svg viewBox="0 0 24 24" ${ST} stroke-width="2.5"><path d="M4 7h3.5c2 0 3.2 1 4.2 2.7l2.6 4.6c1 1.7 2.2 2.7 4.2 2.7H20M17 14l3 3-3 3M4 17h3.5c1.2 0 2-.3 2.8-1M14.2 8c.8-.7 1.7-1 2.8-1H20M17 4l3 3-3 3"/></svg>`,
    basket: `<svg viewBox="0 0 24 24" ${ST} stroke-width="2.4"><path d="M3 10h18l-2 10H5L3 10zM7.5 10L11 4M16.5 10L13 4M9 14v3M12 14v3M15 14v3"/></svg>`,
    snow: `<svg viewBox="0 0 24 24" ${ST} stroke-width="2.8"><path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" ${ST} stroke-width="2.6"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`,
    close: `<svg viewBox="0 0 24 24" ${ST} stroke-width="2.8"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
    check: `<svg viewBox="0 0 24 24" ${ST} stroke-width="3.4"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
    home: `<svg viewBox="0 0 24 24" ${ST}><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/></svg>`,
    restart: `<svg viewBox="0 0 24 24" ${ST} stroke-width="2.6"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5z"/></svg>`,
    book: `<svg viewBox="0 0 24 24" ${ST}><path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zM4 20a2 2 0 0 0 2 2h13v-4"/></svg>`,
    shop: `<svg viewBox="0 0 24 24" ${ST}><path d="M4 9l1.5-5h13L20 9M4 9h16v11H4zM4 9c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 2 3s2-1.3 2-3c0 1.7 1.3 3 3 3s3-1.3 3-3"/></svg>`,
    star: (fill) => `<svg viewBox="0 0 24 24"><path d="${STARP}" fill="${fill || '#ffcb45'}" stroke="#8a4a00" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
    bone: `<svg viewBox="0 0 24 24"><g transform="rotate(-30 12 12)" fill="#fff1d6" stroke="#c99a5b" stroke-width=".9"><rect x="6" y="10" width="12" height="4" rx="2"/><circle cx="6" cy="9.6" r="2.6"/><circle cx="6" cy="14.4" r="2.6"/><circle cx="18" cy="9.6" r="2.6"/><circle cx="18" cy="14.4" r="2.6"/></g></svg>`,
    flame: `<svg viewBox="0 0 24 24"><path d="M12 2.5c1 3.5 5.5 5.5 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.7 1.6-4.3 2.7-5.4.3 1.9 1.3 3 2.7 3.2-.5-3.2.6-5.8.1-8.3z" fill="#ff7a1a"/><path d="M12 12c.6 1.8 2.6 2.6 2.6 4.8a2.6 2.6 0 0 1-5.2 0c0-1.3.8-2.1 1.3-2.6.2.9.7 1.3 1.3 1.4-.2-1.4.3-2.6 0-3.6z" fill="#ffd54f"/></svg>`,
    chest: `<svg viewBox="0 0 32 30"><rect x="3" y="12" width="26" height="15" rx="3" fill="#7b3fe4"/><path d="M3 14 Q3 4 16 4 Q29 4 29 14 Z" fill="#9a5cff"/><rect x="3" y="12.5" width="26" height="3" fill="#ffcb45"/><rect x="13" y="10" width="6" height="8" rx="1.5" fill="#ffcb45"/><circle cx="16" cy="14" r="1.2" fill="#7a4a00"/><rect x="6" y="6" width="3" height="6" rx="1.5" fill="#fff" opacity=".4"/></svg>`,
    trophy: `<svg viewBox="0 0 32 30"><path d="M10 7 H5 Q5 15 11 15 M22 7 H27 Q27 15 21 15" fill="none" stroke="#e0a100" stroke-width="2.4"/><path d="M9 3 H23 V12 Q23 20 16 20 Q9 20 9 12 Z" fill="#ffcb45"/><rect x="11" y="5" width="2.5" height="10" rx="1.25" fill="#fff" opacity=".5"/><rect x="14" y="20" width="4" height="4" fill="#e0a100"/><rect x="9.5" y="24" width="13" height="4" rx="1.5" fill="#7c3f1a"/></svg>`,
    heart: `<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.3C1 8.1 3.2 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.6 0 5.8 3.6 4.3 7.2C19.5 16.4 12 21 12 21z" fill="#ff7d9b"/></svg>`,
    sparkle: (c) => `<svg viewBox="0 0 24 24"><path d="M12 2C12.8 8 16 11.2 22 12C16 12.8 12.8 16 12 22C11.2 16 8 12.8 2 12C8 11.2 11.2 8 12 2Z" fill="${c || '#ffcb45'}"/></svg>`,
    soundOn: `<svg viewBox="0 0 24 24" ${ST}><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>`,
    fridge: `<svg viewBox="0 0 32 32" ${ST}><rect x="8" y="3" width="16" height="26" rx="3"/><path d="M8 12h16M12 7v2.5M12 16v4"/></svg>`,
    shelfI: `<svg viewBox="0 0 32 32" ${ST}><rect x="5" y="4" width="22" height="24" rx="2"/><path d="M5 12h22M5 20h22"/></svg>`,
    cabinet: `<svg viewBox="0 0 32 32" ${ST}><rect x="4" y="4" width="24" height="24" rx="2"/><path d="M16 4v24M12.5 15v3M19.5 15v3"/></svg>`,
    spray: `<svg viewBox="0 0 32 32" ${ST}><path d="M12 11h8v3l2 3v11H10V17l2-3z"/><path d="M14 11V6h6l3 2M24 5l2-1M24 8h3"/></svg>`,
    boxes: `<svg viewBox="0 0 32 32" ${ST}><rect x="4" y="16" width="11" height="11" rx="1"/><rect x="17" y="16" width="11" height="11" rx="1"/><rect x="10.5" y="5" width="11" height="11" rx="1"/></svg>`,
    gift: `<svg viewBox="0 0 40 56"><rect x="5" y="22" width="30" height="32" rx="4" fill="#8a52ec"/><rect x="3" y="16" width="34" height="9" rx="3" fill="#a678ff"/><rect x="17" y="16" width="6" height="38" fill="#ffcb45"/><path d="M20 16 C14 5 5 9 12 15 Z M20 16 C26 5 35 9 28 15 Z" fill="#ffcb45"/></svg>`,
    noshuf: `<svg viewBox="0 0 24 24" fill="none" stroke="#7048d0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h3.5c2 0 3.2 1 4.2 2.7l2.6 4.6c1 1.7 2.2 2.7 4.2 2.7H20M17 14l3 3-3 3M4 17h3.5c1.2 0 2-.3 2.8-1M14.2 8c.8-.7 1.7-1 2.8-1H20M17 4l3 3-3 3"/><path d="M3 21L21 3" stroke="#d94f7c" stroke-width="2.6"/></svg>`
  };
  const ZONE_ICON = [I.shelfI, I.cabinet, I.fridge, I.spray, I.boxes];

  // ---------- Dibujos de productos ----------
  const T = 'text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900"';
  function face(y, x) {
    x = x || 20;
    return `<g class="eyes"><ellipse cx="${x - 4.5}" cy="${y}" rx="1.55" ry="1.8" fill="#2b1a10"/><ellipse cx="${x + 4.5}" cy="${y}" rx="1.55" ry="1.8" fill="#2b1a10"/><circle cx="${x - 4}" cy="${y - 0.7}" r=".55" fill="#fff"/><circle cx="${x + 5}" cy="${y - 0.7}" r=".55" fill="#fff"/></g>` +
      `<path class="heyes" d="M${x - 6.2} ${y + 0.6} Q${x - 4.5} ${y - 1.8} ${x - 2.8} ${y + 0.6} M${x + 2.8} ${y + 0.6} Q${x + 4.5} ${y - 1.8} ${x + 6.2} ${y + 0.6}" fill="none" stroke="#2b1a10" stroke-width="1.2" stroke-linecap="round"/>` +
      `<path d="M${x - 1.8} ${y + 2.1} Q${x} ${y + 3.8} ${x + 1.8} ${y + 2.1}" fill="none" stroke="#2b1a10" stroke-width="1" stroke-linecap="round"/>` +
      `<circle cx="${x - 7.6}" cy="${y + 2}" r="1.7" fill="#ff7d9b" opacity=".6"/><circle cx="${x + 7.6}" cy="${y + 2}" r="1.7" fill="#ff7d9b" opacity=".6"/>`;
  }
  const gl = (x, y, h) => `<rect x="${x}" y="${y}" width="3.4" height="${h}" rx="1.7" fill="#fff" opacity=".42"/>`;
  const SH = {
    carton: (p) => `<path d="M6 16 L20 5 L34 16 Z" fill="${p.c2}"/><rect x="17" y="2" width="6" height="5" rx="1" fill="${p.c2}"/><rect x="6" y="15" width="28" height="39" rx="3" fill="${p.c}"/><rect x="6" y="23" width="28" height="12" fill="#fff"/><text x="20" y="31.6" ${T} font-size="6.4" fill="${p.c2}">${p.tag}</text>${face(44)}${gl(8, 16, 36)}<rect x="29" y="15" width="5" height="39" rx="2" fill="#000" opacity=".12"/>`,
    cup: (p, tc) => `<path d="M7 19 H33 L30 54 H10 Z" fill="${p.c}"/><rect x="5" y="13" width="30" height="7" rx="3.5" fill="${p.c2}"/><text x="20" y="28.6" ${T} font-size="6" fill="${tc}">${p.tag}</text><circle cx="20" cy="35.4" r="3.4" fill="${p.c3}"/><circle cx="19" cy="34.4" r="1" fill="#fff" opacity=".7"/>${face(45.5)}<path d="M10.5 20 L12.5 52 H15 L13 20 Z" fill="#fff" opacity=".42"/><path d="M27 20 H33 L30 54 H26.5 Z" fill="#000" opacity=".12"/>`,
    can: (p, tc) => `<rect x="8" y="10" width="24" height="44" rx="5" fill="${p.c}"/><rect x="9" y="7" width="22" height="5" rx="2.5" fill="#dcdce4"/><path d="M8 30 Q20 24 32 30 V35 Q20 29 8 35 Z" fill="#fff" opacity=".85"/><text x="20" y="23" ${T} font-size="7.2" fill="${tc}">${p.tag}</text>${face(45)}${gl(10.5, 12, 40)}<rect x="27" y="10" width="5" height="44" rx="2.5" fill="#000" opacity=".14"/>`,
    bottle: (p) => `<rect x="15" y="3" width="10" height="6" rx="1.5" fill="${p.c2}"/><path d="M15 9 H25 L29 16 H11 Z" fill="${p.c}"/><rect x="9" y="15" width="22" height="39" rx="7" fill="${p.c}"/><rect x="9" y="22" width="22" height="12" fill="#fff"/><text x="20" y="30.4" ${T} font-size="6.3" fill="${p.c2}">${p.tag}</text>${face(44.5)}${gl(11.5, 17, 35)}<rect x="26" y="15" width="5" height="39" rx="2.5" fill="#000" opacity=".12"/>`,
    box: (p, tc) => `<rect x="6" y="5" width="28" height="49" rx="3" fill="${p.c}"/><rect x="6" y="5" width="28" height="8" rx="3" fill="${p.c2}"/><text x="20" y="20" ${T} font-size="5" fill="${tc}">${p.tag}</text><circle cx="20" cy="30" r="6" fill="${p.c3}"/><circle cx="18" cy="28.5" r="1.1" fill="#6b3b1a"/><circle cx="22" cy="31.5" r="1.1" fill="#6b3b1a"/><circle cx="21.6" cy="27.4" r=".8" fill="#6b3b1a"/>${face(44.5)}${gl(8, 14, 38)}<rect x="29" y="5" width="5" height="49" rx="2" fill="#000" opacity=".13"/>`,
    bag: (p, tc) => `<rect x="5" y="5" width="30" height="6" rx="1.5" fill="${p.c2}"/><path d="M6 10 H34 Q37 32 34 54 H6 Q3 32 6 10 Z" fill="${p.c}"/><text x="20" y="21" ${T} font-size="6.8" font-style="italic" fill="${tc}">${p.tag}</text><circle cx="16" cy="31" r="4.4" fill="${p.c3}"/><circle cx="24" cy="32.4" r="4.4" fill="${p.c3}"/>${face(45)}<path d="M8.5 12 Q6.5 32 8.5 52 H11.5 Q9.5 32 11.5 12 Z" fill="#fff" opacity=".35"/><path d="M30 10 H34 Q37 32 34 54 H30 Q32 32 30 10 Z" fill="#000" opacity=".12"/>`,
    jar: (p) => `<rect x="9" y="11" width="22" height="8" rx="2.5" fill="${p.c2}"/><rect x="7" y="18" width="26" height="36" rx="8" fill="${p.c}"/><rect x="7" y="23" width="26" height="12" fill="#fff6e3"/><text x="20" y="31.4" ${T} font-size="5.6" fill="${p.c2}">${p.tag}</text>${face(44.5)}${gl(9.5, 20, 32)}<rect x="27" y="18" width="6" height="36" rx="3" fill="#000" opacity=".12"/>`,
    squeeze: (p, tc) => `<path d="M17.5 3 H22.5 L25 11 H15 Z" fill="${p.c2}"/><rect x="13" y="10" width="14" height="5" rx="1.5" fill="${p.c2}"/><path d="M12 15 H28 Q32 20 32 28 V50 Q32 54 28 54 H12 Q8 54 8 50 V28 Q8 20 12 15 Z" fill="${p.c}"/><text x="20" y="24" ${T} font-size="4.9" fill="${tc}">${p.tag}</text><ellipse cx="20" cy="32" rx="7" ry="5.4" fill="#fff"/><circle cx="20" cy="32" r="3.3" fill="${p.c3}"/>${face(45)}${gl(10, 22, 29)}<path d="M27 15 H28 Q32 20 32 28 V50 Q32 54 28 54 H27 Z" fill="#000" opacity=".12"/>`,
    pump: (p) => `<rect x="17" y="3" width="6" height="9" rx="1" fill="#f2f2f2"/><rect x="22" y="4" width="9" height="3" rx="1.5" fill="#f2f2f2"/><rect x="14" y="11" width="12" height="5" rx="1.5" fill="${p.c2}"/><rect x="8" y="16" width="24" height="38" rx="7" fill="${p.c}"/><rect x="8" y="21" width="24" height="13" fill="#fff" opacity=".93"/><text x="20" y="27.4" ${T} font-size="5.1" fill="${p.c2}">${p.tag}</text><path d="M20 28.6 q-2.4 2 0 4 q2.4 -2 0 -4 Z" fill="${p.c2}"/>${face(44.5)}${gl(10.5, 18, 34)}<rect x="27" y="16" width="5" height="38" rx="2.5" fill="#000" opacity=".12"/>`,
    jug: (p) => `<rect x="21" y="3" width="9" height="6" rx="1.5" fill="${p.c2}"/><path d="M8 20 Q8 12 15 12 H21 V9 H30 V12 Q34 13 34 20 V50 Q34 54 30 54 H12 Q8 54 8 50 Z" fill="${p.c}"/><ellipse cx="27.5" cy="19.5" rx="2.4" ry="4.2" fill="#000" opacity=".25"/><rect x="8" y="26" width="26" height="11" fill="#fff"/><text x="21" y="33.6" ${T} font-size="6.2" fill="${p.c2}">${p.tag}</text>${face(46, 21)}${gl(10.5, 16, 35)}<rect x="29" y="14" width="5" height="40" rx="2.5" fill="#000" opacity=".12"/>`,
    roll: (p) => `<rect x="7" y="13" width="26" height="41" rx="4" fill="#fff"/><rect x="7" y="22" width="26" height="11" fill="${p.c}"/><text x="20" y="29.8" ${T} font-size="5.4" fill="#fff">${p.tag}</text><ellipse cx="20" cy="13" rx="13" ry="4" fill="#efe9e0"/><ellipse cx="20" cy="13" rx="4" ry="1.5" fill="#b3a28c"/>${face(44)}<rect x="28" y="13" width="5" height="41" fill="#000" opacity=".07"/>`,
    gift: () => `<rect x="5" y="22" width="30" height="32" rx="4" fill="#8a52ec"/><rect x="3" y="16" width="34" height="9" rx="3" fill="#a678ff"/><rect x="17" y="16" width="6" height="38" fill="#ffcb45"/><path d="M20 16 C14 5 5 9 12 15 Z M20 16 C26 5 35 9 28 15 Z" fill="#ffcb45"/>${face(40)}${gl(7, 25, 26)}<circle cx="9.5" cy="31" r="1.2" fill="#fff"/><circle cx="31" cy="27" r="1" fill="#fff"/><circle cx="30.5" cy="47" r="1.3" fill="#fff"/>`
  };
  const SVGC = {};
  function prodSVG(k) {
    if (!SVGC[k]) { const p = CAT[k]; SVGC[k] = `<svg viewBox="0 0 40 56" aria-hidden="true">${SH[p.shape](p, p.tc || '#fff')}</svg>`; }
    return SVGC[k];
  }
  function itemHTML(k, c, s, cls) {
    const p = CAT[k];
    const d = (-(((c * 3 + s) * 0.53) % 3.1)).toFixed(2);
    return `<div class="it a-${p.anim} ${cls || ''}" data-c="${c}" data-s="${s}" style="--d:${d}s" role="img" aria-label="${p.name}"><div class="bob">${prodSVG(k)}</div></div>`;
  }

  // ---------- Salchi ----------
  function salchiBody() {
    return `<svg viewBox="0 0 172 114" aria-hidden="true">
      <ellipse cx="86" cy="106" rx="64" ry="5" fill="#000" opacity=".18"/>
      <path class="tail" d="M30 54 Q13 42 17 25" fill="none" stroke="#9a4f1d" stroke-width="6.5" stroke-linecap="round"/>
      <rect x="38" y="80" width="12" height="22" rx="6" fill="#8a4318"/><rect x="54" y="80" width="12" height="22" rx="6" fill="#9a4f1d"/>
      <rect x="104" y="80" width="12" height="22" rx="6" fill="#8a4318"/><rect x="120" y="80" width="12" height="22" rx="6" fill="#9a4f1d"/>
      <ellipse cx="44" cy="102" rx="7.5" ry="3.8" fill="#e8ad6e"/><ellipse cx="60" cy="102" rx="7.5" ry="3.8" fill="#e8ad6e"/><ellipse cx="110" cy="102" rx="7.5" ry="3.8" fill="#e8ad6e"/><ellipse cx="126" cy="102" rx="7.5" ry="3.8" fill="#e8ad6e"/>
      <rect x="26" y="47" width="113" height="41" rx="20.5" fill="#b8642a"/>
      <path d="M44 82 Q86 94 127 82" fill="none" stroke="#e8ad6e" stroke-width="6" stroke-linecap="round"/>
      <rect x="36" y="51" width="78" height="6" rx="3" fill="#fff" opacity=".2"/>
      <ellipse cx="139" cy="45" rx="23" ry="21" fill="#b8642a"/>
      <ellipse cx="156" cy="56" rx="15.5" ry="10.5" fill="#e8ad6e"/>
      <ellipse cx="166.5" cy="51.5" rx="5.2" ry="4.4" fill="#2b1a10"/><circle cx="165" cy="50" r="1.4" fill="#fff" opacity=".7"/>
      <path d="M150 62 Q156 66 162 62" fill="none" stroke="#2b1a10" stroke-width="2" stroke-linecap="round"/>
      <path d="M154 64 Q156.5 72 159.5 64 Z" fill="#ff7d9b"/>
      <g class="s-eyes"><circle cx="143" cy="39" r="4.4" fill="#2b1a10"/><circle cx="144.6" cy="37.5" r="1.5" fill="#fff"/></g>
      <circle cx="141" cy="31" r="2.7" fill="#e8ad6e"/>
      <circle cx="150" cy="53" r="4.2" fill="#ff8fa3" opacity=".55"/>
      <path d="M125 31 Q112 35 116 60 Q120 72 131 64 Q133 45 129 33 Z" fill="#7a3a12"/>
      <path d="M114 58 Q122 72 139 65" fill="none" stroke="#ff8fb1" stroke-width="7.5" stroke-linecap="round"/>
      <circle cx="127" cy="72" r="4.6" fill="#ffcb45" stroke="#b37f00" stroke-width="1"/>
    </svg>`;
  }
  function salchiFace(mood, paws) {
    let eyes = '<g class="s-eyes"><circle cx="38" cy="44" r="5.2" fill="#2b1a10"/><circle cx="39.7" cy="42.3" r="1.7" fill="#fff"/><circle cx="62" cy="44" r="5.2" fill="#2b1a10"/><circle cx="63.7" cy="42.3" r="1.7" fill="#fff"/></g>';
    let mouth = '<path d="M43 66 Q50 72 57 66" fill="none" stroke="#2b1a10" stroke-width="2.3" stroke-linecap="round"/><path d="M46.5 69 Q50 78 53.5 69 Z" fill="#ff7d9b"/>';
    let extra = '';
    if (mood === 'joy') {
      eyes = '<path d="M32.5 46 Q38 39 43.5 46 M56.5 46 Q62 39 67.5 46" fill="none" stroke="#2b1a10" stroke-width="3.6" stroke-linecap="round"/>';
      mouth = '<path d="M41 65 Q50 79 59 65 Z" fill="#2b1a10"/><path d="M45.5 71 Q50 79 54.5 71 Z" fill="#ff7d9b"/>';
      extra = '<g transform="translate(76 6) scale(.75)"><path d="M12 21s-7.5-4.6-9.5-9.3C1 8.1 3.2 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.6 0 5.8 3.6 4.3 7.2C19.5 16.4 12 21 12 21z" fill="#ff7d9b"/></g>';
    } else if (mood === 'sad') {
      eyes = '<circle cx="38" cy="46" r="4.6" fill="#2b1a10"/><circle cx="62" cy="46" r="4.6" fill="#2b1a10"/><path d="M31 38 L43 41 M69 38 L57 41" stroke="#7a3a12" stroke-width="3" stroke-linecap="round"/>';
      mouth = '<path d="M44 70 Q50 65 56 70" fill="none" stroke="#2b1a10" stroke-width="2.3" stroke-linecap="round"/>';
    } else if (mood === 'sleep') {
      eyes = '<path d="M33 45 Q38 48 43 45 M57 45 Q62 48 67 45" fill="none" stroke="#2b1a10" stroke-width="3" stroke-linecap="round"/>';
      mouth = '<path d="M47 68 Q50 70 53 68" fill="none" stroke="#2b1a10" stroke-width="2" stroke-linecap="round"/>';
      extra = '<text x="80" y="22" font-family="Lilita,sans-serif" font-size="16" fill="#fff" stroke="#4f2ca3" stroke-width="3" paint-order="stroke">z</text><text x="90" y="10" font-family="Lilita,sans-serif" font-size="12" fill="#fff" stroke="#4f2ca3" stroke-width="3" paint-order="stroke">z</text>';
    }
    const pw = paws ? '<ellipse cx="34" cy="104" rx="10" ry="7" fill="#b8642a"/><ellipse cx="66" cy="104" rx="10" ry="7" fill="#b8642a"/><path d="M30 106v3M34 106v3M38 106v3M62 106v3M66 106v3M70 106v3" stroke="#7a3a12" stroke-width="1.4" stroke-linecap="round"/>' : '';
    return `<svg viewBox="0 0 100 ${paws ? 112 : 100}" aria-hidden="true">
      <ellipse cx="22" cy="55" rx="12" ry="25" fill="#7a3a12" transform="rotate(12 22 55)"/>
      <ellipse cx="78" cy="55" rx="12" ry="25" fill="#7a3a12" transform="rotate(-12 78 55)"/>
      <path d="M28 84 Q50 98 72 84 L50 100 Z" fill="#ff8fb1"/>
      <ellipse cx="50" cy="48" rx="29" ry="30" fill="#b8642a"/>
      <ellipse cx="50" cy="66" rx="18" ry="14" fill="#e8ad6e"/>
      <circle cx="37" cy="33" r="3.3" fill="#e8ad6e"/><circle cx="63" cy="33" r="3.3" fill="#e8ad6e"/>
      ${eyes}
      <ellipse cx="50" cy="58" rx="7" ry="5" fill="#2b1a10"/><ellipse cx="48" cy="56.5" rx="2" ry="1.2" fill="#fff" opacity=".6"/>
      ${mouth}
      <circle cx="31" cy="58" r="4.6" fill="#ff8fa3" opacity=".55"/><circle cx="69" cy="58" r="4.6" fill="#ff8fa3" opacity=".55"/>
      ${pw}${extra}
    </svg>`;
  }
  const LIGHTS = (() => {
    const cols = ['#ffcb45', '#ff8fb1', '#8fd3ff', '#9be08a', '#ffffff', '#ffb36b', '#c9a5ff'];
    let s = '<svg viewBox="0 0 300 18" preserveAspectRatio="none"><path d="M0 4 Q25 14 50 6 T100 6 T150 6 T200 6 T250 6 T300 4" fill="none" stroke="#5e3a1a" stroke-width="1.5"/>';
    for (let i = 0; i < 12; i++) { const x = 12 + i * 25; s += `<circle class="bulb" style="animation-delay:${(i * 0.37) % 2.4}s" cx="${x}" cy="${11 + (i % 2) * 2}" r="4" fill="${cols[i % cols.length]}"/>`; }
    return s + '</svg>';
  })();

  // ---------- Avisos ----------
  let toastT = null;
  function toast(title, text, opts) {
    opts = opts || {};
    const z = $('#toast') || app;
    const old = $('.toast', app); if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    const top = $('.hud') ? ($('.hud').offsetTop + $('.hud').offsetHeight + 6) : 14;
    el.style.top = top + 'px';
    el.innerHTML = `<div class="av">${opts.pic || salchiFace(opts.mood || 'happy')}</div><div class="tx"><b>${title}</b>${text ? `<span>${text}</span>` : ''}</div><button class="x" aria-label="Cerrar">${I.close}</button>`;
    el.querySelector('.x').addEventListener('click', () => hideToast(el));
    app.appendChild(el);
    clearTimeout(toastT);
    toastT = setTimeout(() => hideToast(el), opts.ms || 4800);
    void z;
  }
  function hideToast(el) { if (!el || !el.isConnected) return; el.classList.add('out'); setTimeout(() => el.remove(), 260); }

  function burst(x, y, n, kinds) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('div');
      p.className = 'part';
      const a = Math.random() * Math.PI * 2, r = 50 + Math.random() * 60;
      p.style.left = x + 'px'; p.style.top = y + 'px';
      p.style.setProperty('--dx', Math.cos(a) * r + 'px');
      p.style.setProperty('--dy', Math.sin(a) * r - 30 + 'px');
      p.style.setProperty('--r', (Math.random() * 300 - 150) + 'deg');
      const k = pick(kinds || ['s', 's', 'h', 'c']);
      p.innerHTML = k === 'h' ? I.heart : k === 'c' ? `<svg viewBox="0 0 10 10"><rect width="10" height="10" rx="2.5" fill="${pick(['#7048d0', '#ff8fb1', '#4a93e6', '#62c45a', '#ffcb45'])}"/></svg>` : I.sparkle(pick(['#ffcb45', '#fff', '#ffd84a']));
      fx.appendChild(p);
      setTimeout(() => p.remove(), 950);
    }
  }
  function popText(x, y, txt) {
    const el = document.createElement('div');
    el.className = 'pts'; el.textContent = txt;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    fx.appendChild(el); setTimeout(() => el.remove(), 1050);
  }
  function comboText(n, mult) {
    $$('.combo', fx).forEach((e) => e.remove());
    const el = document.createElement('div');
    el.className = 'combo';
    const rays = '<svg class="rays" viewBox="-100 -100 200 200"><g fill="#ffe27a" opacity=".5">' + [...Array(12)].map((_, i) => `<polygon points="0,0 -9,-100 9,-100" transform="rotate(${i * 30})"/>`).join('') + '</g></svg>';
    el.innerHTML = `${rays}<span class="c1">${pick(['¡COMBO!', '¡GUAU!', '¡GENIAL!', '¡SÚPER!'])}</span><span class="c2">Racha ${n} · ×${mult}</span>`;
    fx.appendChild(el); setTimeout(() => el.remove(), 1250);
  }

  // ---------- Ventanas ----------
  function modal(html, cls) {
    closeModal();
    const m = document.createElement('div');
    m.className = 'modal ' + (cls || '');
    m.innerHTML = html;
    app.appendChild(m);
    return m;
  }
  function closeModal() { $$('.modal', app).forEach((m) => m.remove()); }

  // ---------- Navegación ----------
  let screen = '';
  function go(name, arg) {
    endGame();
    closeModal();
    screen = name;
    ({ onb: renderOnb, home: renderHome, game: startGame, map: renderMap, col: renderCol })[name](arg);
  }
  const ACTS = {};
  app.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b || !app.contains(b)) return;
    const fn = ACTS[b.dataset.act];
    if (fn) { SFX.tap(); fn(b, e); }
  });

  // ---------- Bienvenida: pedir nombre ----------
  function renderOnb(editing) {
    app.innerHTML = `<div class="screen onb">
      <div class="logo"><div class="l1 lil ol">LA DESPENSA</div><div class="l2 lil ol">de Salchi</div></div>
      <div class="floaty" style="width:200px">${salchiBody()}</div>
      <div class="bubble">¡Guau! Soy <b>Salchi</b> y cuido esta despensa. ¿Cómo te llamas?</div>
      <form class="card" id="onbf" autocomplete="off">
        <label class="lbl" for="nm">Tu nombre</label>
        <input class="inp" id="nm" maxlength="14" placeholder="Escribe tu nombre" value="${esc(S.name)}" enterkeyhint="done">
        <span class="lbl">Datos curiosos</span>
        <div class="seg" role="group" aria-label="Nivel de los datos">
          <button type="button" data-d="infantil" aria-pressed="${S.datos === 'infantil'}">Infantil<small>Corto y fácil</small></button>
          <button type="button" data-d="general" aria-pressed="${S.datos === 'general'}">General<small>Con más detalle</small></button>
        </div>
        <button class="btn green big" type="submit" style="min-height:62px;font-size:26px">¡A acomodar!</button>
      </form>
    </div>`;
    const f = $('#onbf');
    $$('.seg button', f).forEach((b) => b.addEventListener('click', () => { S.datos = b.dataset.d; $$('.seg button', f).forEach((x) => x.setAttribute('aria-pressed', x === b)); SFX.tap(); }));
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = $('#nm').value.trim().replace(/\s+/g, ' ');
      if (!v) { $('#nm').focus(); SFX.bad(); $('#nm').animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }], 250); return; }
      S.name = v.slice(0, 14);
      save(); SFX.woof();
      go('home');
    });
    void editing;
  }

  // ---------- Inicio ----------
  const totalStars = () => Object.keys(S.stars).reduce((a, k) => a + S.stars[k], 0);
  const pillBones = () => `<span class="pill" aria-label="Huesitos"><span class="ic">${I.bone}</span><span class="bones">${fmt(S.huesitos)}</span></span>`;
  function renderHome() {
    tickDays();
    const n = S.level;
    const z = E.zoneOf(n);
    const found = Object.keys(S.found).length, totalK = E.ORDER.length;
    const ready = S.daily.last !== today();
    const nm = NAME();
    const greet = pick([`¡Hola, ${nm}! ¿Acomodamos la despensa?`, `¡Guau, ${nm}! Te estaba esperando.`, `${nm}, hoy huele a galletitas.`, `¡Vamos por el nivel ${n}, ${nm}!`, `${nm}, ¿me ayudas a ordenar?`]);
    const shelfRows = [['leche', 'agua', 'galletas'], ['yogur', 'papitas', 'jabon']];
    const mini = shelfRows.map((r, ri) => `<div class="srow">${r.map((k, ci) => `<div class="cub" style="--cubh:66px;--ih:48px;--iw:34px"><span class="lampglow"></span><span class="lamp"></span><div class="front">${[0, 1, 2].map((s) => `<div class="slot">${itemHTML(k, ri * 3 + ci, s)}</div>`).join('')}</div></div>`).join('')}</div><div class="plank"></div>`).join('');
    app.innerHTML = `<div class="screen home">
      <div class="topbar">${pillBones()}<span class="pill"><span class="ic">${I.star()}</span>${totalStars()}</span><span class="sp"></span><button class="ibtn" data-act="settings" aria-label="Ajustes">${I.gear}</button></div>
      <div class="logo"><div class="l1 lil ol">LA DESPENSA</div><div class="l2 lil ol">de Salchi</div></div>
      <div class="mini-shelf"><div class="lights" style="right:14px">${LIGHTS}</div>${mini}</div>
      <div class="widgets">
        <button class="wcard" data-act="col"><span class="w-ic">${I.trophy.replace('<svg', '<svg class="w-ic"')}</span><span class="t">Colección</span><div class="bar"><i style="width:${Math.round(found / totalK * 100)}%"></i><b>${found}/${totalK}</b></div></button>
        <button class="wcard ${ready ? 'ready' : ''}" data-act="daily">${I.chest.replace('<svg', '<svg class="w-ic"')}<span class="t">Cofre diario</span>${ready ? '<span class="mini-btn">Abrir</span>' : '<span class="muted" style="font:800 12px Nunito">Vuelve mañana</span>'}</button>
        <div class="wcard">${I.flame.replace('<svg', '<svg class="w-ic"')}<span class="t">Racha</span><span class="v">${S.daily.streak} ${S.daily.streak === 1 ? 'día' : 'días'}</span></div>
      </div>
      <div class="home-bottom">
        <div class="hb-row"><div class="salchi-wrap floaty">${salchiBody()}</div><div class="bubble">${greet}</div></div>
        <button class="btn green big" data-act="play"><span class="lil ol" style="--sc:#1b5e1a">JUGAR</span><small>Nivel ${n} · ${esc(z.name)}${n % 10 === 0 ? ' · Cofre' : ''}</small></button>
        <div class="hb-links">
          <button class="btn cream sm" data-act="map">${I.map}Camino</button>
          <button class="btn cream sm" data-act="col">${I.book}Colección</button>
          <button class="btn cream sm" data-act="shop">${I.shop}Tienda</button>
        </div>
      </div>
    </div>`;
  }
  ACTS.play = () => go('game', S.level);
  ACTS.map = () => go('map');
  ACTS.col = () => go('col');
  ACTS.home = () => go('home');
  ACTS.shop = () => openShop();
  ACTS.settings = () => openSettings();
  ACTS.daily = () => openDaily();
  ACTS.close = () => closeModal();

  // ---------- Cofre diario ----------
  function openDaily() {
    if (S.daily.last === today()) { toast('El cofre ya se abrió hoy', `Vuelve mañana, ${NAME()}. ¡Salchi lo cuida!`); return; }
    const m = modal(`<div class="sheet">
      <button class="close" data-act="close" aria-label="Cerrar">${I.close}</button>
      <h2>Cofre diario</h2>
      <div class="chestbig shake" id="cb">${I.chest}</div>
      <p id="dtx">Racha de ${S.daily.streak} ${S.daily.streak === 1 ? 'día' : 'días'}: ¡entre más días seguidos, mejor premio!</p>
      <button class="btn gold" id="dopen" style="min-height:56px;font-size:22px">Abrir</button>
    </div>`);
    $('#dopen', m).addEventListener('click', () => {
      const bones = 20 + Math.min(S.daily.streak, 7) * 5 + Math.floor(Math.random() * 15);
      const bk = pick(['undo', 'hint', 'shuffle', 'slot']);
      S.huesitos += bones; S.boost[bk]++; S.daily.last = today(); save();
      SFX.coin(); SFX.win();
      const cb = $('#cb', m); cb.classList.remove('shake'); cb.classList.add('open');
      const r = cb.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 22);
      $('#dtx', m).innerHTML = `<b style="color:#4f2ca3;font-size:18px">+${bones} huesitos y +1 ${BNAME[bk]}</b>`;
      const b = $('#dopen', m); b.textContent = '¡Gracias, Salchi!'; b.className = 'btn green'; b.style.minHeight = '56px';
      b.onclick = () => { closeModal(); if (screen === 'home') renderHome(); };
    });
  }

  // ---------- Tienda ----------
  const BNAME = { undo: 'Deshacer', hint: 'Pista', shuffle: 'Mezclar', slot: 'Canasta' };
  const BDESC = { undo: 'Regresa tu último movimiento.', hint: 'Salchi te enseña una jugada.', shuffle: 'Reacomoda lo que se ve.', slot: 'Una canasta con 3 huecos extra.' };
  const BICON = { undo: I.undo, hint: I.hint, shuffle: I.shuffle, slot: I.basket };
  const PRICE = { undo: 20, hint: 25, shuffle: 40, slot: 50 };
  function openShop(focus) {
    const rows = Object.keys(BNAME).map((k) => `<div class="shoprow"><span class="ti">${BICON[k]}</span><div class="tx"><b>${BNAME[k]} · tienes ${S.boost[k]}</b><span>${BDESC[k]}</span></div><button class="btn ${focus === k ? 'gold' : 'green'} sm" data-buy="${k}" ${S.huesitos < PRICE[k] ? 'disabled' : ''}><span style="display:inline-flex;width:20px">${I.bone}</span>${PRICE[k]}</button></div>`).join('');
    const m = modal(`<div class="sheet">
      <button class="close" data-act="close" aria-label="Cerrar">${I.close}</button>
      <h2>Tiendita de Salchi</h2>
      <p>Tienes <b style="color:#4f2ca3">${fmt(S.huesitos)} huesitos</b>. Se ganan jugando y en el cofre diario.</p>
      ${rows}
    </div>`);
    $$('[data-buy]', m).forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.buy;
      if (S.huesitos < PRICE[k]) { SFX.bad(); return; }
      S.huesitos -= PRICE[k]; S.boost[k]++; save(); SFX.coin();
      const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 8, ['s']);
      openShop(k);
      refreshBones(); if (G) renderBoosters();
    }));
  }
  function refreshBones() { $$('.bones').forEach((e) => { e.textContent = fmt(S.huesitos); }); }

  // ---------- Ajustes ----------
  function openSettings() {
    const m = modal(`<div class="sheet" style="text-align:left">
      <button class="close" data-act="close" aria-label="Cerrar">${I.close}</button>
      <h2 style="text-align:center">Ajustes</h2>
      <label class="lbl" for="nm2">Tu nombre</label>
      <div class="row"><input class="inp" id="nm2" maxlength="14" value="${esc(S.name)}" style="flex:2"><button class="btn purple sm" id="svn" style="flex:1">Guardar</button></div>
      <span class="lbl">Datos curiosos</span>
      <div class="seg" role="group" aria-label="Nivel de los datos">
        <button type="button" data-d="infantil" aria-pressed="${S.datos === 'infantil'}">Infantil<small>Corto y fácil</small></button>
        <button type="button" data-d="general" aria-pressed="${S.datos === 'general'}">General<small>Con más detalle</small></button>
      </div>
      <div class="toggle">Sonidos<button class="sw" role="switch" aria-label="Sonidos" aria-checked="${S.sound}" data-t="sound"></button></div>
      <div class="toggle">Vibración (Android)<button class="sw" role="switch" aria-label="Vibración" aria-checked="${S.vib}" data-t="vib"></button></div>
      <button class="btn cream sm" id="rst" style="color:#a8355c">Borrar progreso</button>
      <p style="text-align:center;font-size:12px">La Despensa de Salchi · funciona sin internet</p>
    </div>`);
    $('#svn', m).addEventListener('click', () => { const v = $('#nm2', m).value.trim(); if (!v) return; S.name = v.slice(0, 14); save(); SFX.woof(); toast(`¡Mucho gusto, ${NAME()}!`, 'Salchi ya se aprendió tu nombre.', { mood: 'joy' }); if (screen === 'home') renderHome(); });
    $$('.seg button', m).forEach((b) => b.addEventListener('click', () => { S.datos = b.dataset.d; save(); $$('.seg button', m).forEach((x) => x.setAttribute('aria-pressed', x === b)); SFX.tap(); }));
    $$('.sw', m).forEach((b) => b.addEventListener('click', () => { const k = b.dataset.t; S[k] = !S[k]; save(); b.setAttribute('aria-checked', S[k]); SFX.tap(); }));
    let armed = false;
    $('#rst', m).addEventListener('click', (e) => {
      if (!armed) { armed = true; e.currentTarget.textContent = 'Toca otra vez para borrar todo'; SFX.bad(); return; }
      try { localStorage.removeItem(KEY); } catch (er) { /* nada */ }
      S = load(); closeModal(); go('onb');
    });
  }

  // =====================================================================
  //  PARTIDA
  // =====================================================================
  let levelNew = [];
  let G = null, sel = null, busy = false, drag = null, hintData = null, idleT = null, tutoEl = null, peekMood = 'happy', tipCount = 0, onResize = null;
  const BASKET = () => G.comps.length - 1;

  function startGame(n) {
    n = n || S.level;
    G = E.generate(n);
    if (S.cur && S.cur.n === n) { Object.assign(G, clone(S.cur.g)); G.history = []; }
    sel = null; busy = false; hintData = null; tipCount = 0; levelNew = [];
    const z = E.zoneOf(n);
    const sub = n % 10 === 0 ? 'Nivel cofre · ' + z.name : 'Pasillo ' + (z.tier + 1) + ' · ' + z.name;
    app.innerHTML = `<div class="screen game">
      <header class="hud">
        <div class="hud-r1">
          <button class="ibtn" data-act="pause" aria-label="Pausa" style="background:#8a62e6">${I.pause}</button>
          <div class="lvl"><span class="lil ol">Nivel ${n}</span><small>${esc(sub)}</small></div>
          ${pillBones()}
        </div>
        <div class="hud-r2">
          <div class="score"><small>PUNTOS</small><span class="lil ol" id="score">0</span></div>
          <div class="starbar"><div class="track" role="progressbar" aria-label="Estrellas por puntos" aria-valuemin="0" aria-valuemax="${G.stars[2]}"><i id="sfill"></i>
            ${[0, 1, 2].map((i) => `<svg class="mk" id="mk${i}" viewBox="0 0 24 24" style="left:${(G.stars[i] / G.stars[2] * 100).toFixed(1)}%"><path d="${STARP}"/></svg>`).join('')}
          </div></div>
        </div>
      </header>
      <div class="metas" id="metas"></div>
      <div class="board-wrap" id="bw"><div class="shelf" id="shelf"></div><div class="basket" id="basket"></div></div>
      <nav class="boosters" id="boosters" aria-label="Ayudas"></nav>
    </div>`;
    const shelf = $('#shelf');
    shelf.addEventListener('pointerdown', onDown);
    $('#basket').addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    onResize = () => { layout(); };
    window.addEventListener('resize', onResize);
    renderBoosters();
    updateHUD();
    layout();
    renderBoard(G.comps);
    persist();
    resetIdle();
    setTimeout(intro, 350);
  }
  function endGame() {
    if (!G) return;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onCancel);
    window.removeEventListener('resize', onResize);
    clearTimeout(idleT); removeTuto(); clearGhost();
    G = null; drag = null;
  }
  function persist() {
    if (!G) return;
    S.cur = { n: G.n, g: { comps: G.comps, score: G.score, streak: G.streak, bestStreak: G.bestStreak, matches: G.matches, catMatches: G.catMatches, giftOpened: G.giftOpened, usedShuffle: G.usedShuffle, moves: G.moves, found: G.found } };
    save();
  }

  function intro() {
    if (!G) return;
    const n = G.n, z = E.zoneOf(n);
    if (n === 1 && !S.seen.tuto) { showTuto(); return; }
    if (n % 10 === 1 && n > 1 && !S.seen['z' + z.tier]) {
      S.seen['z' + z.tier] = true; save();
      const txt = [
        '',
        'Detrás de cada hueco hay más productos. Vacía el frente y lo de atrás pasa adelante.',
        'Algunos huecos están congelados. Haz tríos en los huecos de al lado para derretir el hielo.',
        'Hay cajas con candado. Cada trío que hagas en cualquier lugar acerca la llave.',
        '¡Más cajas sorpresa! Junta 3 cajas iguales para abrirlas y llevarte premios.'
      ][Math.min(z.tier, 4)] || 'Ahora todo se mezcla y hay más productos. ¡Tú puedes!';
      modal(`<div class="sheet"><div style="width:110px;margin:0 auto">${salchiFace('joy')}</div><h2>¡Pasillo nuevo: ${esc(z.name)}!</h2><p>${txt}</p><button class="btn green" data-act="close" style="min-height:56px;font-size:22px">¡Entendido!</button></div>`);
      SFX.woof();
      return;
    }
    toast(n % 10 === 0 ? `¡Nivel cofre, ${NAME()}!` : `¡A acomodar, ${NAME()}!`, G.metas.filter((m) => !m.bonus).map((m) => m.text).join(' · '), { ms: 3500 });
  }

  // ---------- Tamaños según la pantalla ----------
  function layout() {
    if (!G) return;
    const bw = $('#bw'); if (!bw) return;
    const rows = G.P.rows;
    const basketOn = G.comps[BASKET()].active;
    const W = bw.clientWidth;
    const game = $('.game');
    const cubW = (W - 18 - 14) / 3;
    let iw = Math.min(56, (cubW - 10) / 3);
    let ih = iw * 1.4;
    const nRows = rows + (basketOn ? 1 : 0);
    // Normal: luz 15 + repisa 17 por fila. Compacto: luz 9 + repisa 12.
    let H = bw.clientHeight - 44 - 10;
    let lamp = 15;
    const fixedN = 22 + rows * 32 + (basketOn ? 37 : 0);
    let tight = false;
    if (fixedN + nRows * ih > H) {
      const ihN = (H - fixedN) / nRows;
      if (ihN >= 38) ih = ihN;
      else {
        tight = true; lamp = 9;
        H = bw.clientHeight - 34 - 8;
        const fixedT = 20 + rows * 21 + (basketOn ? 30 : 0);
        ih = Math.min(ih, (H - fixedT) / nRows);
      }
    }
    game.classList.toggle('tight', tight);
    ih = Math.max(ih, 26); iw = ih / 1.4;
    const r = $('.game').style;
    r.setProperty('--iw', iw.toFixed(1) + 'px');
    r.setProperty('--ih', ih.toFixed(1) + 'px');
    r.setProperty('--cubh', (ih + lamp).toFixed(1) + 'px');
  }

  // ---------- Dibujar el estante ----------
  function cubHTML(c, ci, o) {
    let h = `<div class="cub${o.glow === ci ? ' glow' : ''}" data-c="${ci}"><span class="lampglow"></span><span class="lamp"></span>`;
    if (c.back && c.back.length) {
      const L = c.back[0];
      const pos = L.length === 3 ? [0, 1, 2] : L.length === 2 ? [0, 1] : [1];
      const row = [null, null, null]; L.forEach((k, i) => { row[pos[i]] = k; });
      h += '<div class="backrow">' + row.map((k, s) => `<div class="slot">${k ? itemHTML(k, ci, s, 'back') : ''}</div>`).join('') + '</div>';
      h += `<span class="depth">+${c.back.reduce((a, b) => a + b.length, 0)}</span>`;
    }
    h += '<div class="front">' + c.front.map((k, s) => {
      let cls = '';
      if (k) {
        if (o.drop && o.drop.c === ci && o.drop.s === s) cls += ' drop';
        if (o.match === ci) cls += ' match happy';
        if (o.enter && o.enter.indexOf(ci) >= 0) cls += ' enter';
        if (sel && sel.c === ci && sel.s === s) cls += ' sel happy';
        if (hintData && hintData.from.c === ci && hintData.from.s === s) cls += ' hinted happy';
      }
      const hs = hintData && hintData.to.c === ci && hintData.to.s === s && !k ? ' hintslot' : '';
      const emptyMark = !k && c.basket ? '<span class="eslot"></span>' : '';
      return `<div class="slot${hs}" data-c="${ci}" data-s="${s}">${k ? itemHTML(k, ci, s, cls) : emptyMark}</div>`;
    }).join('') + '</div>';
    if (c.frozen > 0) h += `<div class="ice${o.iced && o.iced.indexOf(ci) >= 0 ? ' crack' : ''}"><span class="badge">${I.snow}×${c.frozen}</span></div>`;
    if (c.lock > 0) h += `<div class="crate"><svg class="padlock" viewBox="0 0 34 38"><path d="M9 17V11a8 8 0 0 1 16 0v6" fill="none" stroke="#7a7f8c" stroke-width="4.5"/><rect x="4" y="16" width="26" height="20" rx="5" fill="#ffcb45" stroke="#b37f00" stroke-width="2"/><circle cx="17" cy="25" r="3" fill="#7a4a00"/><rect x="15.6" y="26" width="2.8" height="6" rx="1.4" fill="#7a4a00"/></svg><span class="badge">${I.lock}${c.lock}</span></div>`;
    return h + '</div>';
  }
  function renderBoard(comps, o) {
    o = o || {};
    const P = G.P;
    let h = `<div class="lights">${LIGHTS}</div><div class="peek ${o.joy ? 'joy' : ''}" id="peek">${salchiFace(peekMood, true)}</div>`;
    for (let r = 0; r < P.rows; r++) {
      h += '<div class="srow">';
      for (let c = 0; c < P.cols; c++) { const ci = r * P.cols + c; h += cubHTML(comps[ci], ci, o); }
      h += '</div><div class="plank"></div>';
    }
    $('#shelf').innerHTML = h;
    const bi = comps.length - 1;
    $('#basket').innerHTML = comps[bi].active ? `<span class="tag">Canasta extra</span>${cubHTML(comps[bi], bi, o)}` : '';
  }
  function setPeek(m, joy) {
    peekMood = m;
    const p = $('#peek'); if (!p) return;
    p.innerHTML = salchiFace(m, true);
    if (joy) { p.classList.remove('joy'); void p.offsetWidth; p.classList.add('joy'); }
  }
  function resetIdle() {
    clearTimeout(idleT);
    if (peekMood === 'sleep') setPeek('happy');
    idleT = setTimeout(() => { if (G && !busy) setPeek('sleep'); }, 25000);
  }

  // ---------- HUD ----------
  function updateHUD() {
    if (!G) return;
    $('#score').textContent = fmt(G.score);
    const pct = Math.min(100, G.score / G.stars[2] * 100);
    $('#sfill').style.width = pct + '%';
    $('.track').setAttribute('aria-valuenow', G.score);
    G.stars.forEach((t, i) => $('#mk' + i).classList.toggle('lit', G.score >= t));
    $('#metas').innerHTML = G.metas.map((m) => {
      const v = E.metaProgress(G, m), done = v >= m.target;
      let ic;
      if (m.id === 'cat') { const k = G.kinds.find((x) => CAT[x].cat === m.cat) || 'leche'; ic = prodSVG(k); }
      else if (m.id === 'gift') ic = I.gift;
      else if (m.id === 'streak') ic = I.flame;
      else ic = I.noshuf;
      const prog = m.bonus ? (done ? 'Bonus' : 'Perdido') : (done ? '¡Listo!' : v + ' / ' + m.target);
      const SHORT = { lac: 'Lácteos', beb: 'Bebidas', des: 'Despensa', lim: 'Limpieza' };
      const label = m.bonus ? 'Sin Mezclar' : m.id === 'cat' ? 'Tríos de ' + SHORT[m.cat] : m.id === 'gift' ? 'Cajas sorpresa' : 'Racha de ' + m.target;
      return `<div class="meta ${done ? 'done' : ''} ${m.bonus ? 'bonus' : ''}"><span class="mi">${ic}</span><span class="mt"><span>${esc(label)}</span><b>${prog}</b></span></div>`;
    }).join('');
  }
  function renderBoosters() {
    if (!$('#boosters')) return;
    $('#boosters').innerHTML = ['undo', 'hint', 'shuffle', 'slot'].map((k) => {
      const c = S.boost[k];
      const on = (k === 'hint' && hintData) || (k === 'slot' && G && G.comps[BASKET()].active);
      return `<button class="bst ${on ? 'on' : ''}" data-act="b_${k}" aria-label="${BNAME[k]} (${c})"><span class="ti">${BICON[k]}</span><span class="cnt ${c ? '' : 'buy'}">${c || '+'}</span><span class="nm">${BNAME[k]}</span></button>`;
    }).join('');
  }

  // ---------- Arrastrar y tocar ----------
  function compAt(x, y) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const cub = el.closest('.cub');
    if (!cub || !cub.dataset.c || !(app.contains(cub))) return null;
    const c = +cub.dataset.c;
    const slot = el.closest('.slot[data-s]');
    return { c, s: slot ? +slot.dataset.s : null, el: cub };
  }
  function onDown(e) {
    if (!G || busy || e.button > 0) return;
    resetIdle();
    removeTuto(true);
    const it = e.target.closest('.it');
    if (it && !it.classList.contains('back')) {
      const c = +it.dataset.c, s = +it.dataset.s;
      if (!E.interactable(G, c)) { sealedNotice(c, it.closest('.cub')); return; }
      e.preventDefault();
      drag = { c, s, kind: G.comps[c].front[s], x0: e.clientX, y0: e.clientY, moved: false, el: it, id: e.pointerId, target: null };
      return;
    }
    const at = compAt(e.clientX, e.clientY);
    if (at && sel) { e.preventDefault(); tryMove(sel, { c: at.c, s: at.s }); return; }
    if (at && !E.interactable(G, at.c)) sealedNotice(at.c, at.el);
  }
  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved && Math.hypot(dx, dy) > 8) {
      drag.moved = true;
      sel = null; $$('.it.sel').forEach((x) => x.classList.remove('sel', 'happy'));
      const gh = document.createElement('div');
      gh.className = 'ghost';
      const st = getComputedStyle($('.game'));
      gh.style.setProperty('--iw', st.getPropertyValue('--iw'));
      gh.style.setProperty('--ih', st.getPropertyValue('--ih'));
      gh.innerHTML = prodSVG(drag.kind);
      document.body.appendChild(gh);
      drag.ghost = gh;
      drag.el.classList.add('lift');
      SFX.pick(); vib(8);
    }
    if (drag.moved) {
      e.preventDefault();
      drag.ghost.style.left = e.clientX + 'px';
      drag.ghost.style.top = e.clientY + 'px';
      const ih = parseFloat(getComputedStyle($('.game')).getPropertyValue('--ih')) || 50;
      const at = compAt(e.clientX, e.clientY - ih * 0.45) || compAt(e.clientX, e.clientY);
      $$('.cub.ok,.cub.bad').forEach((x) => x.classList.remove('ok', 'bad'));
      drag.target = null;
      if (at && at.c !== drag.c) {
        const ok = E.interactable(G, at.c) && G.comps[at.c].front.indexOf(null) >= 0;
        at.el.classList.add(ok ? 'ok' : 'bad');
        if (ok) drag.target = at;
      }
    }
  }
  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    clearGhost();
    $$('.cub.ok,.cub.bad').forEach((x) => x.classList.remove('ok', 'bad'));
    if (d.moved) {
      d.el.classList.remove('lift');
      if (d.target) tryMove({ c: d.c, s: d.s }, { c: d.target.c, s: d.target.s });
      else SFX.bad();
      return;
    }
    // Toque
    if (sel && sel.c === d.c && sel.s === d.s) { sel = null; d.el.classList.remove('sel', 'happy'); return; }
    if (sel && sel.c !== d.c && G.comps[d.c].front.indexOf(null) >= 0) { tryMove(sel, { c: d.c, s: null }); return; }
    $$('.it.sel').forEach((x) => x.classList.remove('sel', 'happy'));
    sel = { c: d.c, s: d.s };
    d.el.classList.add('sel', 'happy');
    SFX.pick(); vib(6);
  }
  function onCancel() { if (!drag) return; if (drag.el) drag.el.classList.remove('lift'); drag = null; clearGhost(); $$('.cub.ok,.cub.bad').forEach((x) => x.classList.remove('ok', 'bad')); }
  function clearGhost() { $$('.ghost').forEach((g) => g.remove()); }

  const seenSealed = {};
  function sealedNotice(c, el) {
    SFX.bad();
    if (el) { el.classList.remove('nudge'); void el.offsetWidth; el.classList.add('nudge'); }
    const comp = G.comps[c];
    const k = comp.frozen > 0 ? 'ice' : 'lock';
    if (seenSealed[k]) return;
    seenSealed[k] = true;
    if (k === 'ice') toast('¡Está congelado!', `Haz ${comp.frozen} ${comp.frozen === 1 ? 'trío' : 'tríos'} en los huecos de al lado para derretirlo.`, { pic: `<span style="color:#1670b0;width:34px;height:34px;display:flex">${I.snow}</span>` });
    else toast('Caja con candado', `Te faltan ${comp.lock} tríos en cualquier lugar para conseguir la llave.`, { pic: `<span style="color:#b37f00;width:34px;height:34px;display:flex">${I.lock}</span>` });
  }

  // ---------- Mover y resolver ----------
  function tryMove(from, to) {
    if (!G || busy) return;
    const fromC = from.c;
    if (to.c === fromC) { sel = null; renderBoard(G.comps); return; }
    if (!E.interactable(G, to.c)) { sealedNotice(to.c, $(`.cub[data-c="${to.c}"]`)); return; }
    if (G.comps[to.c].front.indexOf(null) < 0) { SFX.bad(); const el = $(`.cub[data-c="${to.c}"]`); if (el) { el.classList.remove('nudge'); void el.offsetWidth; el.classList.add('nudge'); } return; }
    const pre = clone(G.comps);
    const ev = E.move(G, from, to);
    sel = null;
    if (!ev.moved) { SFX.bad(); renderBoard(G.comps); return; }
    hintData = null; renderBoosters();
    if (G.n === 1 && !S.seen.tuto) { S.seen.tuto = true; save(); }
    SFX.drop(); vib(10);
    const disp = clone(pre);
    disp[ev.to.c].front[ev.to.s] = disp[fromC].front[from.s];
    disp[fromC].front[from.s] = null;
    play(ev, disp, ev.to);
  }

  function play(ev, disp, dropAt) {
    busy = true;
    const first = ev.matches[0];
    if (first && disp) {
      renderBoard(disp, { drop: dropAt, match: first.ci, glow: first.ci });
      setTimeout(() => { if (G) finish(ev); }, 430);
    } else {
      if (disp) renderBoard(disp, { drop: dropAt });
      setTimeout(() => { if (G) finish(ev); }, disp ? (ev.promoted.length ? 140 : 0) : 380);
    }
  }

  function centerOf(ci) {
    const el = $(`.cub[data-c="${ci}"]`);
    if (!el) return { x: innerWidth / 2, y: innerHeight / 2 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function finish(ev) {
    const mood = ev.matches.length ? 'joy' : peekMood === 'sad' ? 'happy' : peekMood;
    peekMood = mood;
    renderBoard(G.comps, { enter: ev.promoted, iced: ev.iced, joy: ev.matches.length > 0 });
    if (ev.promoted.length && !ev.matches.length) SFX.reveal();
    ev.matches.forEach((m, i) => {
      setTimeout(() => {
        const p = centerOf(m.ci);
        burst(p.x, p.y, m.kind === 'gift' ? 20 : 12, m.kind === 'gift' ? ['s', 'c', 'h'] : ['s', 's', 'h', 'c']);
        popText(p.x, p.y - 10, '+' + m.pts);
        SFX.match(m.streak);
      }, i * 160);
    });
    if (ev.matches.length) {
      vib([12, 30, 12]);
      const last = ev.matches[ev.matches.length - 1];
      if (last.streak >= 2) setTimeout(() => comboText(last.streak, last.mult.toFixed(1).replace('.0', '')), 120);
      setTimeout(() => setPeek('happy'), 1400);
      ev.matches.forEach((m) => discover(m.kind));
    }
    if (ev.thawed.length) { SFX.ice(); ev.thawed.forEach((ci) => { const p = centerOf(ci); burst(p.x, p.y, 10, ['s']); }); if (ev.rescued) toast('¡Salchi te ayudó!', 'Derritió el hielo y abrió los candados para que puedas terminar.', { mood: 'joy' }); }
    if (ev.unlocked.length) { SFX.unlock(); ev.unlocked.forEach((ci) => { const p = centerOf(ci); burst(p.x, p.y, 10, ['s', 'c']); }); }
    if (ev.iced.length) SFX.ice();
    updateHUD();
    renderBoosters();
    busy = false;
    if (ev.win) { clearTimeout(idleT); S.cur = null; save(); setTimeout(showWin, 750); return; }
    persist();
    if (ev.stuck) { setPeek('sad'); setTimeout(showStuck, 450); }
  }

  function discover(kind) {
    if (kind === 'gift') {
      const bk = pick(['undo', 'hint', 'shuffle', 'slot', 'bones']);
      if (bk === 'bones') { S.huesitos += 15; toast('¡Caja sorpresa!', '+15 huesitos para tu tiendita.', { pic: I.gift, ms: 3500 }); }
      else { S.boost[bk]++; toast('¡Caja sorpresa!', `+1 ${BNAME[bk]}. ¡Qué suerte, ${NAME()}!`, { pic: I.gift, ms: 3500 }); }
      SFX.coin(); save(); refreshBones(); return;
    }
    const p = CAT[kind];
    const dato = S.datos === 'general' ? p.g : p.i;
    if (!S.found[kind]) {
      S.found[kind] = true; save(); levelNew.push(kind);
      toast(`¡Nuevo en tu colección: ${p.name}!`, `${E.CATS[p.cat].name} · ${p.where}. ${dato}`, { pic: `<div class="it a-${p.anim}" style="--iw:34px;--ih:48px"><div class="bob">${prodSVG(kind)}</div></div>`, ms: 6500 });
      return;
    }
    tipCount++;
    if (tipCount % 4 === 0) toast(`${p.name} · ${E.CATS[p.cat].name}`, `Se guarda en: ${p.where}.`, { pic: `<div class="it" style="--iw:34px;--ih:48px"><div class="bob">${prodSVG(kind)}</div></div>`, ms: 3500 });
  }

  // ---------- Ayudas ----------
  function useBoost(k) {
    if (!G || busy) return;
    resetIdle();
    if (S.boost[k] <= 0) { openShop(k); return; }
    if (k === 'undo') {
      if (!G.history.length) { toast('Nada que deshacer', 'Primero mueve algún producto.'); return; }
      E.undo(G); S.boost.undo--; save();
      sel = null; hintData = null;
      SFX.reveal(); renderBoard(G.comps, { enter: [] }); updateHUD(); renderBoosters(); persist(); setPeek('happy');
    } else if (k === 'hint') {
      if (hintData) { hintData = null; renderBoard(G.comps); renderBoosters(); return; }
      const h = E.hint(G);
      if (!h) { toast('Mmm… déjame pensar', 'Vacía un hueco por completo para ver qué hay detrás.', { mood: 'sad' }); return; }
      S.boost.hint--; save();
      hintData = h; sel = null;
      renderBoard(G.comps); renderBoosters(); SFX.reveal();
      setTimeout(() => { if (G && hintData === h) { hintData = null; renderBoard(G.comps); renderBoosters(); } }, 5000);
    } else if (k === 'shuffle') {
      S.boost.shuffle--; save();
      const ev = E.shuffleBoard(G, Date.now());
      hintData = null; sel = null;
      SFX.reveal();
      const all = G.comps.map((_, i) => i);
      renderBoard(G.comps, { enter: all });
      play(ev, null, null);
    } else if (k === 'slot') {
      if (G.comps[BASKET()].active) { toast('Ya tienes la canasta', 'Úsala como un hueco más del estante.'); return; }
      E.activateBasket(G); S.boost.slot--; save();
      SFX.coin(); layout(); renderBoard(G.comps); renderBoosters(); persist();
      toast('¡Canasta extra!', 'Tienes 3 huecos más abajo del estante.', { mood: 'joy', ms: 3000 });
    }
  }
  ['undo', 'hint', 'shuffle', 'slot'].forEach((k) => { ACTS['b_' + k] = () => useBoost(k); });

  // ---------- Tutorial (nivel 1) ----------
  function showTuto() {
    const h = E.hint(G);
    if (!h) return;
    const a = $(`.it[data-c="${h.from.c}"][data-s="${h.from.s}"]:not(.back)`);
    const b = $(`.slot[data-c="${h.to.c}"][data-s="${h.to.s}"]`);
    if (!a || !b) return;
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    tutoEl = document.createElement('div');
    tutoEl.className = 'hand';
    tutoEl.style.left = '0px'; tutoEl.style.top = '0px';
    tutoEl.style.setProperty('--x1', (ra.left + ra.width / 2 - 10) + 'px');
    tutoEl.style.setProperty('--y1', (ra.top + ra.height / 2) + 'px');
    tutoEl.style.setProperty('--x2', (rb.left + rb.width / 2 - 10) + 'px');
    tutoEl.style.setProperty('--y2', (rb.top + rb.height / 2) + 'px');
    tutoEl.innerHTML = '<svg viewBox="0 0 46 52"><path d="M15 4c2.5 0 4 2 4 4.5V22l2-1c2-1 4 0 5 2l1 .5c2-1 4.5 0 5 2.5 2-.5 4 1 4 3.5V38c0 7-5.5 12-12 12h-2c-5 0-8.5-2.5-11-6.5L5 33c-1.5-2.5 0-5 2.5-5 1.5 0 2.8.8 3.5 2l1 1.5V8.5C12 6 13 4 15 4z" fill="#fff" stroke="#4f2ca3" stroke-width="2.6" stroke-linejoin="round"/></svg>';
    fx.appendChild(tutoEl);
    toast(`¡Hola, ${NAME()}!`, 'Arrastra un producto a un hueco libre. Junta 3 iguales en un mismo hueco y ¡puf!', { ms: 7000, mood: 'joy' });
  }
  function removeTuto() { if (tutoEl) { tutoEl.remove(); tutoEl = null; } }

  // ---------- Pausa ----------
  ACTS.pause = () => {
    modal(`<div class="sheet">
      <div style="width:96px;margin:0 auto">${salchiFace('happy')}</div>
      <h2>Pausa</h2>
      <p>Tu partida se guarda sola, ${NAME()}. Puedes salir y seguir después.</p>
      <button class="btn green" data-act="close" style="min-height:56px;font-size:22px">${I.play}Seguir jugando</button>
      <div class="row"><button class="btn cream sm" data-act="restart">${I.restart}Reiniciar</button><button class="btn cream sm" data-act="home">${I.home}Inicio</button></div>
      <div class="toggle">Sonidos<button class="sw" role="switch" aria-label="Sonidos" aria-checked="${S.sound}" id="psw"></button></div>
    </div>`);
    $('#psw').addEventListener('click', (e) => { S.sound = !S.sound; save(); e.currentTarget.setAttribute('aria-checked', S.sound); });
  };
  ACTS.restart = () => { const n = G ? G.n : S.level; S.cur = null; save(); go('game', n); };
  ACTS.next = () => go('game', S.level);
  ACTS.replay = (b) => { const n = +b.dataset.n; if (S.cur && S.cur.n !== n) S.cur = null; go('game', n); };

  // ---------- Sin espacio ----------
  function showStuck() {
    if (!G) return;
    const opt = (k, txt) => `<button class="btn ${S.boost[k] > 0 ? 'green' : 'gold'} sm" data-act="s_${k}">${BICON[k]}${txt} ${S.boost[k] > 0 ? '(' + S.boost[k] + ')' : '· ' + PRICE[k]}</button>`;
    modal(`<div class="sheet">
      <div style="width:100px;margin:0 auto">${salchiFace('sad')}</div>
      <h2>¡Uy, ya no hay espacio!</h2>
      <p>Tranqui, ${NAME()}, aquí tengo unos trucos:</p>
      ${G.comps[BASKET()].active ? '' : opt('slot', 'Canasta extra')}
      ${opt('shuffle', 'Mezclar')}
      ${opt('undo', 'Deshacer')}
      <button class="btn cream sm" data-act="restart">${I.restart}Empezar el nivel otra vez</button>
    </div>`);
  }
  ['slot', 'shuffle', 'undo'].forEach((k) => {
    ACTS['s_' + k] = () => {
      if (S.boost[k] <= 0) {
        if (S.huesitos < PRICE[k]) { toast('Faltan huesitos', 'Juega otros niveles o abre el cofre diario.', { mood: 'sad' }); return; }
        S.huesitos -= PRICE[k]; S.boost[k]++; save(); refreshBones(); SFX.coin();
      }
      closeModal(); setPeek('happy'); useBoost(k);
    };
  });

  // ---------- Nivel completado ----------
  function showWin() {
    if (!G) return;
    const n = G.n;
    const f = E.finalize(G);
    const chest = n % 10 === 0;
    const bones = 10 + f.stars * 5 + (chest ? 50 : 0) + G.giftOpened * 10;
    const prevBest = S.best[n] || 0;
    S.huesitos += bones;
    S.stars[n] = Math.max(S.stars[n] || 0, f.stars);
    S.best[n] = Math.max(prevBest, f.total);
    if (chest) ['undo', 'hint', 'shuffle', 'slot'].forEach((k) => S.boost[k]++);
    S.level = Math.max(S.level, n + 1);
    S.cur = null;
    save();
    const newOnes = levelNew.slice(0, 2);
    const cheer = pick([`¡Eres lo máximo, ${NAME()}!`, `¡Qué despensa tan bonita, ${NAME()}!`, `¡Guau, ${NAME()}! Quedó perfecto.`, `${NAME()}, ¡Salchi está orgullosísimo!`]);
    const rays = '<svg class="rays" viewBox="-100 -100 200 200"><g fill="#7048d0">' + [...Array(12)].map((_, i) => `<polygon points="0,0 -13,-100 13,-100" transform="rotate(${i * 30})"/>`).join('') + '</g></svg>';
    const m = modal(`${rays}<div class="sheet">
      <div class="ribbon"><span class="lil ol">¡Nivel ${n} listo!</span></div>
      <div class="stars">
        <svg viewBox="0 0 24 24" style="--t:rotate(-12deg)"><path d="${STARP}" fill="#ffcb45" stroke="#8a4a00" stroke-width="1.3" stroke-linejoin="round"/></svg>
        <svg viewBox="0 0 24 24" class="mid"><path d="${STARP}" fill="#ffcb45" stroke="#8a4a00" stroke-width="1.1" stroke-linejoin="round"/></svg>
        <svg viewBox="0 0 24 24" style="--t:rotate(12deg)"><path d="${STARP}" fill="#ffcb45" stroke="#8a4a00" stroke-width="1.3" stroke-linejoin="round"/></svg>
      </div>
      <div class="wscore"><div style="width:56px;flex:none">${salchiFace('joy')}</div><div style="flex:1;display:flex;flex-direction:column;align-items:flex-start;line-height:1"><small style="font:900 11px Nunito;letter-spacing:.08em;color:#ece2ff">PUNTOS</small><span class="lil ol" id="wsc">0</span><span style="font:800 13px Nunito;color:#fff;margin-top:4px">${cheer}</span></div>${f.total > prevBest && prevBest > 0 ? '<span class="chip" style="background:#ff7a1a;color:#fff">¡Récord!</span>' : ''}</div>
      <div class="wbox">
        <b class="lil" style="font-size:17px;color:#7048d0">Metas del nivel</b>
        ${f.metas.map((x) => `<div class="mrow"><span class="ck ${x.done ? 'y' : ''}">${x.done ? I.check : ''}</span><span>${esc(x.text)}</span><b>${x.done ? '+' + x.bonusPts : ''}</b></div>`).join('')}
      </div>
      ${newOnes.length ? `<div class="newfound"><div class="pic">${itemHTML(newOnes[0], 0, 0, 'a-' + CAT[newOnes[0]].anim)}</div><div style="display:flex;flex-direction:column;gap:3px"><span class="chip" style="align-self:flex-start;background:#8a52ec;color:#fff">NUEVO EN TU COLECCIÓN</span><b class="lil" style="font-size:18px">${CAT[newOnes[0]].name}${newOnes.length > 1 ? ' y más' : ''}</b><span style="font:800 12.5px/1.35 Nunito">${esc(S.datos === 'general' ? CAT[newOnes[0]].g : CAT[newOnes[0]].i)}</span></div></div>` : ''}
      <div class="rewards"><div>${I.bone}+${bones} huesitos</div>${chest ? `<div>${I.chest}+1 de cada ayuda</div>` : `<div>${I.star()}${f.stars} ${f.stars === 1 ? 'estrella' : 'estrellas'}</div>`}</div>
      <button class="btn green big" data-act="next"><span class="lil ol" style="--sc:#1b5e1a">SIGUIENTE</span><small>Nivel ${n + 1}</small></button>
      <div class="row"><button class="btn purple sm" data-act="map">${I.map}Camino</button><button class="btn purple sm" data-act="home">${I.home}Inicio</button></div>
    </div>`, 'win');
    SFX.win();
    const svs = $$('.stars svg', m);
    svs.forEach((s, i) => setTimeout(() => {
      s.classList.add(i < f.stars ? 'on' : 'off');
      if (i < f.stars) { SFX.star(i); const r = s.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 10, ['s']); }
    }, 350 + i * 300));
    const el = $('#wsc', m); const t0 = performance.now();
    (function count(t) { const k = Math.min(1, (t - t0) / 900); el.textContent = fmt(f.total * (1 - Math.pow(1 - k, 3))); if (k < 1 && el.isConnected) requestAnimationFrame(count); })(t0);
    setPeek('joy');
  }

  // =====================================================================
  //  CAMINO
  // =====================================================================
  function renderMap() {
    const cur = S.level;
    const top = Math.max(cur + 12, 15), bottom = Math.max(1, cur - 8);
    const xs = [0, 64, 0, -64];
    let y = 20, nodes = '', pts = [], banners = '';
    const NODE_H = 94, BAN_H = 76;
    for (let n = top; n >= bottom; n--) {
      if (n % 10 === 0 || n === top) {
        const z = E.zoneOf(n);
        const locked = z.from > cur;
        banners += `<div class="zbanner ${locked ? 'locked' : ''}" style="top:${y}px"><span class="zi">${locked ? I.lock : ZONE_ICON[Math.min(z.tier, 4)]}</span><div><b>Pasillo ${z.tier + 1} · ${esc(z.name)}</b><small>Niveles ${z.from}–${z.to} · ${esc(z.novelty)}</small></div></div>`;
        y += BAN_H;
      }
      const x = xs[n % 4];
      const cy = y + 8 + (n % 10 === 0 ? 39 : n === cur ? 35 : 29);
      pts.push([x, cy]);
      const chest = n % 10 === 0;
      const st = n < cur ? 'done' : n === cur ? 'cur' : 'lock';
      let inner;
      if (chest) inner = I.chest;
      else inner = n;
      const stars = n < cur ? `<div class="ns">${[1, 2, 3].map((i) => I.star(i <= (S.stars[n] || 0) ? '#ffcb45' : '#c9a079')).join('')}</div>` : '';
      const who = n === cur ? `<div class="who floaty">${salchiFace('joy')}</div>` : '';
      const label = chest ? `<span class="nl">Nivel ${n} · Cofre</span>` : '';
      const tag = st === 'lock' ? 'div' : 'button';
      nodes += `<${tag} class="node ${st} ${chest ? 'chest' : ''}" style="left:calc(50% + ${x}px);top:${y + 8}px" ${st !== 'lock' ? `data-act="replay" data-n="${n}" aria-label="Jugar nivel ${n}"` : ''}><span class="c">${inner}</span>${stars}${label}${who}</${tag}>`;
      y += NODE_H;
    }
    const total = y + 20;
    const poly = pts.map(([x, cy]) => `${(190 + x)},${cy}`).join(' ');
    app.innerHTML = `<div class="screen map">
      <div class="shead"><button class="ibtn" data-act="home" aria-label="Volver" style="background:#8a62e6">${I.back}</button><div><h1>Camino infinito</h1><small>Cada 10 niveles: pasillo nuevo y más reto</small></div></div>
      <div class="scroll" id="msc"><div class="path" style="height:${total}px">
        <svg width="380" height="${total}" viewBox="0 0 380 ${total}" style="position:absolute;left:50%;margin-left:-190px;top:0" aria-hidden="true"><polyline points="${poly}" fill="none" stroke="#c98a4a" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${poly}" fill="none" stroke="#fff3dc" stroke-width="5" stroke-dasharray="2 13" stroke-linecap="round" stroke-linejoin="round"/></svg>
        ${banners}${nodes}
      </div></div>
      <button class="btn green big" data-act="play" style="flex:none"><span class="lil ol" style="--sc:#1b5e1a">JUGAR · ${cur}</span></button>
    </div>`;
    const curEl = $('.node.cur');
    if (curEl) $('#msc').scrollTop = Math.max(0, curEl.offsetTop - $('#msc').clientHeight / 2 + 40);
  }

  // =====================================================================
  //  COLECCIÓN
  // =====================================================================
  function renderCol() {
    const found = E.ORDER.filter((k) => S.found[k]).length;
    app.innerHTML = `<div class="screen col">
      <div class="shead"><button class="ibtn" data-act="home" aria-label="Volver" style="background:#8a62e6">${I.back}</button><div><h1>Colección</h1><small>Junta un trío de algo nuevo para desbloquear su dato</small></div></div>
      <div class="prog">${I.trophy.replace('<svg', '<svg style="width:38px;height:36px;flex:none"')}<div style="flex:1;display:flex;flex-direction:column;gap:4px"><b style="font:900 14px Nunito">${found} de ${E.ORDER.length} productos</b><div class="bar"><i style="width:${Math.round(found / E.ORDER.length * 100)}%"></i></div></div></div>
      <div class="scroll"><div class="grid">
        ${E.ORDER.map((k, i) => {
          const p = CAT[k], got = !!S.found[k], C = E.CATS[p.cat];
          return `<button class="pcard ${got ? '' : 'lockd'}" ${got ? `data-act="pinfo" data-k="${k}"` : 'disabled'} aria-label="${got ? p.name : 'Producto por descubrir'}"><div class="pic">${itemHTML(k, i, 0, got ? '' : 'back')}</div><span class="nm">${got ? p.name : '???'}</span>${got ? `<span class="chip" style="background:${C.soft};color:${C.color}">${C.name}</span>` : '<span class="chip" style="background:#efe3d2;color:#7a5f4c">Por descubrir</span>'}</button>`;
        }).join('')}
      </div></div>
    </div>`;
  }
  ACTS.pinfo = (b) => {
    const k = b.dataset.k, p = CAT[k], C = E.CATS[p.cat];
    modal(`<div class="sheet">
      <button class="close" data-act="close" aria-label="Cerrar">${I.close}</button>
      <div style="height:120px;display:flex;justify-content:center;align-items:flex-end"><div class="it a-${p.anim} happy" style="--iw:80px;--ih:112px"><div class="bob">${prodSVG(k)}</div></div></div>
      <h2>${p.name}</h2>
      <span class="chip" style="align-self:center;background:${C.soft};color:${C.color};font-size:12px">${C.name}</span>
      <div class="wbox" style="box-shadow:0 4px 0 #e2bd8f"><span class="lbl">Dónde se guarda</span><b style="font:900 15px Nunito">${p.where}</b></div>
      <div class="wbox" style="box-shadow:0 4px 0 #e2bd8f"><span class="lbl">Dato ${S.datos === 'general' ? 'general' : 'infantil'}</span><span style="font:800 14px/1.4 Nunito">${S.datos === 'general' ? p.g : p.i}</span></div>
    </div>`);
  };

  // ---------- Arranque ----------
  document.addEventListener('visibilitychange', () => { if (document.hidden && G) persist(); });
  if (!S.name) go('onb'); else go('home');
  window.__salchi = { get G() { return G; }, get S() { return S; }, E };
})();
