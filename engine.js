/* La Despensa de Salchi — motor del juego (sin DOM, se puede probar en Node) */
(function (root) {
  'use strict';

  // ---------- Catálogo ----------
  // shape: forma del dibujo · cat: categoría · anim: gesto · where: dónde se guarda
  const CATALOG = {
    leche:      { name: 'Leche', tag: 'LECHE', shape: 'carton', c: '#4a93e6', c2: '#1b56a6', c3: '#ffffff', cat: 'lac', anim: 'hop', where: 'Refrigerador (ya abierta)',
      i: 'La leche tiene calcio, que ayuda a tener huesos y dientes fuertes.',
      g: 'La leche UHT cerrada aguanta meses en la alacena; ya abierta va al refri y se toma en pocos días.' },
    agua:       { name: 'Agua', tag: 'AGUA', shape: 'bottle', c: '#79cdf4', c2: '#1670b0', c3: '#ffffff', cat: 'beb', anim: 'idle', where: 'Lugar fresco, sin sol',
      i: 'El agua natural es la mejor bebida cuando tienes sed.',
      g: 'Guarda garrafones y botellas a la sombra: el sol y el calor afectan el plástico y el sabor.' },
    galletas:   { name: 'Galletas', tag: 'GALLETAS', shape: 'box', c: '#3c78dc', c2: '#1a4596', c3: '#e8ac62', cat: 'des', anim: 'wobble', where: 'Alacena, bien cerradas',
      i: 'Cierra bien el paquete para que las galletas sigan crujientes.',
      g: 'Fíjate en la porción de la etiqueta: los datos suelen ser por 2 o 3 galletas, no por paquete.' },
    jugo:       { name: 'Jugo', tag: 'JUGO', shape: 'carton', c: '#ffa03a', c2: '#c25400', c3: '#ffffff', cat: 'beb', anim: 'sway', where: 'Alacena; abierto, al refri',
      i: 'La fruta entera llena más que el jugo porque tiene fibra.',
      g: 'Un jugo abierto va al refri. Aunque diga “natural”, trae el azúcar de la fruta: mejor en vaso chico.' },
    papitas:    { name: 'Papitas', tag: 'Papas', shape: 'bag', c: '#48b852', c2: '#1f7a29', c3: '#ffd95c', cat: 'des', anim: 'wobble', where: 'Alacena',
      i: 'Las papitas son botana: un puñito y a seguir jugando.',
      g: 'Las botanas suelen llevar el sello “exceso sodio”; compáralas antes de comprar.' },
    jabon:      { name: 'Jabón', tag: 'JABÓN', shape: 'pump', c: '#66c766', c2: '#2e7d32', c3: '#ffffff', cat: 'lim', anim: 'shake', where: 'Baño o área de limpieza',
      i: 'Lávate las manos con jabón mientras cantas “Las mañanitas”.',
      g: 'Lavarse las manos con jabón al menos 20 segundos ayuda a prevenir enfermedades.' },
    yogur:      { name: 'Yogur', tag: 'YOGUR', shape: 'cup', c: '#f27aa5', c2: '#b8235a', c3: '#e8203f', cat: 'lac', anim: 'bounce', where: 'Refrigerador',
      i: 'El yogur tiene bacterias buenas que ayudan a tu pancita.',
      g: 'Prefiere yogur natural y endúlzalo tú: muchos de sabor traen bastante azúcar añadida.' },
    cereal:     { name: 'Cereal', tag: 'CEREAL', shape: 'box', c: '#8a4ad8', c2: '#4e1f96', c3: '#ffd95c', cat: 'des', anim: 'shake', where: 'Alacena, bolsa cerrada',
      i: 'El cereal se guarda cerrado para que no se haga chicloso.',
      g: 'El primer ingrediente de la lista es el que más trae: busca cereales con más fibra y menos azúcar.' },
    refresco:   { name: 'Refresco', tag: 'COLA', shape: 'can', c: '#ea4440', c2: '#9e1b1b', c3: '#ffffff', cat: 'beb', anim: 'shake', where: 'Alacena',
      i: 'El refresco tiene mucha azúcar: es para de vez en cuando.',
      g: 'Los sellos negros del empaque (“exceso azúcares”) te ayudan a comparar productos rápido.' },
    miel:       { name: 'Miel', tag: 'MIEL', shape: 'jar', c: '#f7ad2e', c2: '#8f520c', c3: '#ffffff', cat: 'des', anim: 'sway', where: 'Alacena (no en el refri)',
      i: 'La miel la hacen las abejas con el néctar de las flores.',
      g: 'Bien tapada casi no caduca; si se cristaliza, entíbiala a baño María. No se da a bebés menores de 1 año.' },
    papel:      { name: 'Papel', tag: 'PAPEL', shape: 'roll', c: '#86bd4c', c2: '#4b7a1f', c3: '#ffffff', cat: 'lim', anim: 'sway', where: 'Lugar seco y ventilado',
      i: 'El papel se guarda en un lugar seco para que no se moje.',
      g: 'La humedad echa a perder el papel y favorece el moho: guárdalo seco y ventilado.' },
    catsup:     { name: 'Catsup', tag: 'CATSUP', shape: 'squeeze', c: '#e53a33', c2: '#9e1b1b', c3: '#ff7a4d', cat: 'des', anim: 'bounce', where: 'Refrigerador (ya abierta)',
      i: 'La catsup se hace con jitomate.',
      g: 'Después de abrirla, guárdala en el refri para que conserve su sabor y color.' },
    helado:     { name: 'Helado', tag: 'HELADO', shape: 'cup', c: '#ffbcd0', c2: '#d6336c', c3: '#c2185b', tc: '#9c1a4a', cat: 'lac', anim: 'wobble', where: 'Congelador',
      i: 'El helado vive en el congelador. ¡Si se derrite, ya no se vuelve a congelar!',
      g: 'Un helado derretido no debe volver a congelarse: cambia su textura y pueden crecer bacterias.' },
    cafe:       { name: 'Café', tag: 'CAFÉ', shape: 'can', c: '#38a24e', c2: '#1d6b2e', c3: '#ffffff', cat: 'beb', anim: 'idle', where: 'Alacena, frasco cerrado',
      i: 'El café es bebida de adultos; los peques mejor leche o agua.',
      g: 'Guárdalo en frasco bien cerrado, lejos de luz y humedad, para que no pierda aroma.' },
    mostaza:    { name: 'Mostaza', tag: 'MOSTAZA', shape: 'squeeze', c: '#ffc624', c2: '#a86f00', c3: '#e65100', tc: '#6b4200', cat: 'des', anim: 'bounce', where: 'Refrigerador (ya abierta)',
      i: 'La mostaza se hace con semillitas de mostaza.',
      g: 'La mostaza abierta se conserva mejor y más tiempo en el refri.' },
    detergente: { name: 'Detergente', tag: 'LAVA', shape: 'jug', c: '#3a84e6', c2: '#154c99', c3: '#ffffff', cat: 'lim', anim: 'sway', where: 'Área de lavado, lejos de comida',
      i: 'El detergente no es comida: se guarda lejos de los alimentos.',
      g: 'Guarda limpiadores en su envase original, lejos de alimentos y fuera del alcance de niños y mascotas.' },
    avena:      { name: 'Avena', tag: 'AVENA', shape: 'bag', c: '#dca157', c2: '#8a5418', c3: '#f6e2b8', cat: 'des', anim: 'idle', where: 'Alacena, frasco hermético',
      i: 'La avena te da energía para toda la mañana.',
      g: 'La avena tiene fibra que ayuda a sentirte satisfecho; guárdala en frasco hermético.' },
    dulces:     { name: 'Dulces', tag: 'DULCES', shape: 'jar', c: '#f27cbc', c2: '#9c175c', c3: '#ffffff', cat: 'des', anim: 'wobble', where: 'Alacena',
      i: 'Después de un dulce, ¡a cepillarse los dientes!',
      g: 'Comer azúcar muy seguido favorece las caries: mejor de postre que a cada rato.' },
    cacahuate:  { name: 'Crema de cacahuate', tag: 'CREMA', shape: 'jar', c: '#ec7d34', c2: '#8f3a0c', c3: '#ffffff', cat: 'des', anim: 'bounce', where: 'Alacena',
      i: 'La crema de cacahuate se hace con cacahuates molidos.',
      g: 'Si el aceite se separa arriba es normal: solo revuélvela. Hay personas alérgicas al cacahuate.' },
    gift:       { name: 'Caja sorpresa', tag: '', shape: 'gift', c: '#8a52ec', c2: '#ffcb45', c3: '#ffffff', cat: 'esp', anim: 'bounce', where: '', i: '', g: '' }
  };
  const ORDER = ['leche', 'agua', 'galletas', 'jugo', 'papitas', 'jabon', 'yogur', 'cereal', 'refresco', 'miel', 'papel', 'catsup', 'helado', 'cafe', 'mostaza', 'detergente', 'avena', 'dulces', 'cacahuate'];
  const CATS = {
    lac: { name: 'Lácteos y fríos', color: '#1b56a6', soft: '#e3eefb' },
    beb: { name: 'Bebidas', color: '#0f6b66', soft: '#dcf3f0' },
    des: { name: 'Despensa', color: '#8a4f00', soft: '#fbefd6' },
    lim: { name: 'Limpieza', color: '#2e6b33', soft: '#e2f2e3' },
    esp: { name: 'Especial', color: '#5b2bb5', soft: '#efe5ff' }
  };
  const ZONES = ['Estante', 'Alacena', 'Refrigerador', 'Zona de limpieza', 'Bodega'];
  const ZONE_NEW = ['Lo básico', 'Capa trasera', 'Productos congelados', 'Candados con llave', 'Cajas sorpresa dobles'];
  function zoneOf(n) {
    const t = Math.floor((n - 1) / 10);
    if (t < 5) return { tier: t, name: ZONES[t], novelty: ZONE_NEW[t], from: t * 10 + 1, to: t * 10 + 10 };
    return { tier: t, name: 'Remix ' + (t - 4), novelty: 'Todo mezclado y más productos', from: t * 10 + 1, to: t * 10 + 10 };
  }

  // ---------- Azar con semilla (cada nivel siempre sale igual) ----------
  function rngFor(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function levelParams(n) {
    const tier = Math.floor((n - 1) / 10), inT = (n - 1) % 10, chest = n % 10 === 0;
    const cols = 3;
    let rows = n <= 3 ? 3 : tier === 0 ? 4 : tier === 1 ? 4 : 5;
    if (chest) rows = Math.min(rows + 1, 5);
    let depth;
    if (tier === 0) depth = n <= 4 ? 1 : 2;
    else if (tier === 1) depth = inT < 5 ? 2 : 3;
    else depth = Math.min(3 + Math.floor((tier - 2) / 2), 5);
    if (chest) depth = Math.min(depth + 1, 6);
    let types = Math.min(4 + tier * 2 + Math.floor(inT / 3) + (chest ? 1 : 0), ORDER.length);
    if (n === 1) types = 3;
    if (n === 2) types = 4;
    let empties;
    if (depth === 1) empties = 6;
    else if (tier === 0) empties = 5;
    else if (tier === 1) empties = 4;
    else empties = tier >= 5 ? 3 : 4;
    const frozen = (tier === 2 || tier >= 5) ? (chest ? 2 : 1) : 0;
    const locks = (tier === 3 || tier >= 5) ? (chest ? 2 : 1) : 0;
    const gifts = tier === 4 ? 2 : (n % 3 === 0 ? 1 : 0);
    return { n, tier, inT, chest, rows, cols, depth, types, empties, frozen, locks, gifts };
  }

  function emptyComp() { return { front: [null, null, null], back: [], frozen: 0, lock: 0 }; }

  function generate(n) {
    const P = levelParams(n);
    const rnd = rngFor(n * 7919 + 13);
    const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const shuffle = (arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; };
    const C = P.rows * P.cols;
    const comps = [];
    for (let i = 0; i < C; i++) comps.push(emptyComp());

    // Compartimentos especiales (nunca en la fila de abajo para que se vean claro)
    const order = shuffle([...Array(C).keys()]);
    const special = order.filter((i) => Math.floor(i / P.cols) < P.rows - 1);
    let k = 0;
    for (let f = 0; f < P.frozen; f++) comps[special[k++]].frozen = P.chest ? 3 : 2;
    for (let l = 0; l < P.locks; l++) comps[special[k++]].lock = 3 + Math.min(P.tier, 4);
    const sealed = new Set(special.slice(0, k));
    const free = order.filter((i) => !sealed.has(i));

    // Huecos libres al frente (máximo 2 por compartimento)
    const empty = new Set();
    const per = {};
    const cand = shuffle(free.flatMap((ci) => [0, 1, 2].map((s) => [ci, s])));
    for (const [ci, s] of cand) {
      if (empty.size >= P.empties) break;
      if ((per[ci] || 0) >= 2) continue;
      per[ci] = (per[ci] || 0) + 1;
      empty.add(ci * 3 + s);
    }

    // Capas de atrás
    const backSizes = comps.map(() => {
      const L = [];
      if (P.depth > 1) {
        const d = rnd() < 0.7 ? P.depth - 1 : ri(0, P.depth - 1);
        for (let j = 0; j < d; j++) L.push(rnd() < 0.15 ? 1 : (rnd() < 0.45 ? 2 : 3));
      }
      return L;
    });
    let total = C * 3 - empty.size + backSizes.reduce((s, L) => s + L.reduce((a, b) => a + b, 0), 0);
    let guard = 0;
    while (total % 3 !== 0 && guard++ < 50) {
      const withBack = backSizes.map((L, i) => (L.length ? i : -1)).filter((i) => i >= 0);
      if (withBack.length) {
        const L = backSizes[withBack[ri(0, withBack.length - 1)]];
        if (L[L.length - 1] > 1) L[L.length - 1]--; else L.pop();
      } else {
        const slot = cand.find(([ci, s]) => !empty.has(ci * 3 + s));
        empty.add(slot[0] * 3 + slot[1]);
      }
      total--;
    }

    // Bolsa de productos: siempre en tríos completos
    const triples = total / 3;
    const pool = [];
    const giftT = Math.min(P.gifts, Math.max(0, triples - 2));
    for (let g = 0; g < giftT; g++) pool.push('gift', 'gift', 'gift');
    const eligible = ORDER.slice(0, Math.min(ORDER.length, P.types + 2 + P.tier * 2));
    const chosen = shuffle(eligible.slice()).slice(0, P.types);
    const rest = triples - giftT;
    const kindCount = {};
    for (let i = 0; i < rest; i++) {
      const kind = chosen[i % chosen.length];
      kindCount[kind] = (kindCount[kind] || 0) + 1;
      pool.push(kind, kind, kind);
    }
    shuffle(pool);

    // Repartir
    let p = 0;
    for (let ci = 0; ci < C; ci++) for (let s = 0; s < 3; s++) if (!empty.has(ci * 3 + s)) comps[ci].front[s] = pool[p++];
    for (let ci = 0; ci < C; ci++) comps[ci].back = backSizes[ci].map((sz) => { const L = []; for (let j = 0; j < sz; j++) L.push(pool[p++]); return L; });

    // Que ninguna capa empiece con tres iguales
    const layers = () => { const out = []; comps.forEach((c) => { out.push(c.front); c.back.forEach((b) => out.push(b)); }); return out; };
    for (let tries = 0; tries < 400; tries++) {
      const bad = layers().find((L) => L.length === 3 && L[0] && L[0] === L[1] && L[1] === L[2]);
      if (!bad) break;
      const all = layers();
      const other = all[ri(0, all.length - 1)];
      const oi = ri(0, other.length - 1);
      if (!other[oi] || other[oi] === bad[0]) continue;
      const t = bad[2]; bad[2] = other[oi]; other[oi] = t;
    }

    // Metas
    const catTriples = {};
    Object.keys(kindCount).forEach((kd) => { const c = CATALOG[kd].cat; catTriples[c] = (catTriples[c] || 0) + kindCount[kd]; });
    const cats = Object.keys(catTriples).sort((a, b) => catTriples[b] - catTriples[a]);
    const mainCat = cats[0];
    const catTarget = Math.max(1, Math.min(catTriples[mainCat], 2 + Math.floor(P.tier / 2) + (P.chest ? 1 : 0)));
    const metas = [{ id: 'cat', cat: mainCat, target: catTarget, text: 'Haz ' + catTarget + (catTarget === 1 ? ' trío de ' : ' tríos de ') + CATS[mainCat].name.toLowerCase() }];
    if (giftT) metas.push({ id: 'gift', target: giftT, text: giftT > 1 ? 'Abre ' + giftT + ' cajas sorpresa' : 'Abre la caja sorpresa' });
    else { const st = n <= 3 ? 2 : 3 + (P.tier >= 2 ? 1 : 0); metas.push({ id: 'streak', target: st, text: 'Logra una racha de ' + st }); }
    metas.push({ id: 'noshuffle', bonus: true, target: 1, text: 'Sin usar Mezclar' });

    const base = triples * 100;
    const stars = [base, Math.round((base * 1.3 + 300) / 50) * 50, Math.round((base * 1.6 + 600) / 50) * 50];

    comps.push(Object.assign(emptyComp(), { basket: true, active: false }));
    return {
      n, P, comps, metas, stars, triples, kinds: chosen,
      score: 0, streak: 0, bestStreak: 0, matches: 0, catMatches: {}, giftOpened: 0,
      usedShuffle: false, moves: 0, history: [], found: [], done: false
    };
  }

  // ---------- Reglas ----------
  function isBasket(g, ci) { return !!g.comps[ci].basket; }
  function interactable(g, ci) {
    const c = g.comps[ci];
    if (!c) return false;
    if (c.basket) return c.active;
    return c.frozen <= 0 && c.lock <= 0;
  }
  function neighbors(g, ci) {
    if (isBasket(g, ci)) return [];
    const { rows, cols } = g.P;
    const r = Math.floor(ci / cols), col = ci % cols, out = [];
    if (r > 0) out.push(ci - cols);
    if (r < rows - 1) out.push(ci + cols);
    if (col > 0) out.push(ci - 1);
    if (col < cols - 1) out.push(ci + 1);
    return out;
  }
  function itemsLeft(c) { return c.front.filter(Boolean).length + c.back.reduce((s, L) => s + L.length, 0); }

  function snapshot(g) {
    return JSON.stringify({ comps: g.comps, score: g.score, streak: g.streak, bestStreak: g.bestStreak, matches: g.matches, catMatches: g.catMatches, giftOpened: g.giftOpened, moves: g.moves, found: g.found });
  }
  function restore(g, s) { Object.assign(g, JSON.parse(s)); }

  function promote(g, ci, ev) {
    const c = g.comps[ci];
    if (c.front.some(Boolean) || !c.back.length) return false;
    const L = c.back.shift();
    const pos = L.length === 3 ? [0, 1, 2] : L.length === 2 ? [0, 1] : [1];
    c.front = [null, null, null];
    L.forEach((k, i) => { c.front[pos[i]] = k; });
    ev.promoted.push(ci);
    return true;
  }

  function checkMatch(g, ci, ev, cascade) {
    const c = g.comps[ci];
    const f = c.front;
    if (!(f[0] && f[0] === f[1] && f[1] === f[2])) return false;
    const kind = f[0];
    c.front = [null, null, null];
    g.matches++;
    ev.matchCount++;
    const streak = g.streak + ev.matchCount;
    const mult = Math.min(3, 1 + 0.5 * (streak - 1)) * (cascade ? 1.5 : 1);
    const pts = Math.round(100 * mult / 10) * 10;
    g.score += pts;
    const cat = CATALOG[kind].cat;
    if (kind === 'gift') g.giftOpened++;
    else g.catMatches[cat] = (g.catMatches[cat] || 0) + 1;
    if (kind !== 'gift' && g.found.indexOf(kind) < 0) g.found.push(kind);
    ev.matches.push({ ci, kind, pts, streak, mult });
    // Hielo: se derrite con tríos al lado
    neighbors(g, ci).forEach((ni) => {
      const n = g.comps[ni];
      if (n.frozen > 0) { n.frozen--; if (n.frozen === 0) ev.thawed.push(ni); else ev.iced.push(ni); }
    });
    // Candados: cualquier trío acerca la llave
    g.comps.forEach((n, ni) => { if (n.lock > 0) { n.lock--; if (n.lock === 0) ev.unlocked.push(ni); } });
    return true;
  }

  function settle(g, ci, ev, cascade) {
    // Resolver tríos y capas que pasan al frente, en cadena
    let changed = true, depth = 0;
    while (changed && depth++ < 10) {
      changed = false;
      if (checkMatch(g, ci, ev, cascade || depth > 1)) changed = true;
      if (promote(g, ci, ev)) changed = true;
    }
  }

  function newEvents() { return { moved: false, matches: [], promoted: [], thawed: [], iced: [], unlocked: [], matchCount: 0, rescued: false }; }

  function finishMove(g, ev) {
    if (ev.matchCount > 0) { g.streak += ev.matchCount; g.bestStreak = Math.max(g.bestStreak, g.streak); }
    else g.streak = 0;
    rescueSealed(g, ev);
    ev.win = isWin(g);
    ev.stuck = !ev.win && isStuck(g);
    if (ev.win) g.done = true;
    return ev;
  }

  // Si el hielo o un candado dejaran el nivel sin salida, Salchi los abre
  function rescueSealed(g, ev) {
    const sealed = g.comps.map((c, i) => (!c.basket && (c.frozen > 0 || c.lock > 0) ? i : -1)).filter((i) => i >= 0);
    if (!sealed.length) return;
    const counts = {};
    g.comps.forEach((c, i) => {
      if (sealed.indexOf(i) >= 0) return;
      c.front.forEach((k) => { if (k) counts[k] = (counts[k] || 0) + 1; });
      c.back.forEach((L) => L.forEach((k) => { counts[k] = (counts[k] || 0) + 1; }));
    });
    const canStillMatch = Object.keys(counts).some((k) => counts[k] >= 3);
    if (!canStillMatch) {
      sealed.forEach((i) => { const c = g.comps[i]; if (c.frozen > 0) ev.thawed.push(i); if (c.lock > 0) ev.unlocked.push(i); c.frozen = 0; c.lock = 0; });
      ev.rescued = true;
    }
  }

  function move(g, from, to) {
    const ev = newEvents();
    if (g.done) return ev;
    if (from.c === to.c) return ev;
    if (!interactable(g, from.c) || !interactable(g, to.c)) return ev;
    const src = g.comps[from.c], dst = g.comps[to.c];
    const kind = src.front[from.s];
    if (!kind) return ev;
    let s = to.s;
    if (s == null || dst.front[s]) s = dst.front.indexOf(null);
    if (s < 0) return ev;
    g.history.push(snapshot(g));
    if (g.history.length > 20) g.history.shift();
    src.front[from.s] = null;
    dst.front[s] = kind;
    g.moves++;
    ev.moved = true;
    ev.to = { c: to.c, s };
    g.lastMove = { from: from.c, to: to.c };
    settle(g, to.c, ev, false);
    settle(g, from.c, ev, false);
    return finishMove(g, ev);
  }

  function isWin(g) { return g.comps.every((c) => itemsLeft(c) === 0); }
  function emptySlots(g) {
    let n = 0;
    g.comps.forEach((c, i) => { if (interactable(g, i)) n += c.front.filter((x) => !x).length; });
    return n;
  }
  function isStuck(g) { return emptySlots(g) === 0; }

  function activateBasket(g) {
    const b = g.comps[g.comps.length - 1];
    if (b.active) return false;
    b.active = true;
    return true;
  }

  function undo(g) {
    if (!g.history.length) return false;
    restore(g, g.history.pop());
    g.done = false;
    return true;
  }

  // Mezclar: reacomoda lo visible. Si no hay espacio, junta un trío a propósito.
  function shuffleBoard(g, seed) {
    const rnd = rngFor((seed || Date.now()) >>> 0);
    const ev = newEvents();
    const slots = [], items = [];
    g.comps.forEach((c, ci) => {
      if (!interactable(g, ci)) return;
      c.front.forEach((k, s) => { slots.push([ci, s]); if (k) items.push(k); });
    });
    if (!items.length) return ev;
    g.history.push(snapshot(g));
    const stuck = isStuck(g);
    const sh = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    let bestLayout = null;
    for (let t = 0; t < 60; t++) {
      const its = sh(items.slice());
      while (its.length < slots.length) its.push(null);
      sh(its);
      const layout = {};
      slots.forEach(([ci, s], i) => { (layout[ci] = layout[ci] || [null, null, null])[s] = its[i]; });
      const triples = Object.keys(layout).filter((ci) => { const f = layout[ci]; return f[0] && f[0] === f[1] && f[1] === f[2]; }).length;
      if (!stuck && triples === 0) { bestLayout = layout; break; }
      if (stuck) { bestLayout = layout; break; }
    }
    Object.keys(bestLayout).forEach((ci) => { g.comps[ci].front = bestLayout[ci]; });
    if (stuck) {
      // Formar un trío para liberar espacio
      const counts = {};
      slots.forEach(([ci, s]) => { const k = g.comps[ci].front[s]; if (k) counts[k] = (counts[k] || 0) + 1; });
      const kind = Object.keys(counts).find((k) => counts[k] >= 3);
      if (kind) {
        const target = +Object.keys(bestLayout)[0];
        for (let s = 0; s < 3; s++) {
          if (g.comps[target].front[s] === kind) continue;
          const src = slots.find(([ci, ss]) => !(ci === target) && g.comps[ci].front[ss] === kind);
          if (!src) break;
          const tmp = g.comps[target].front[s];
          g.comps[target].front[s] = kind;
          g.comps[src[0]].front[src[1]] = tmp;
        }
      }
    }
    g.usedShuffle = true;
    ev.shuffled = true;
    const touched = [...new Set(slots.map(([ci]) => ci))];
    touched.forEach((ci) => settle(g, ci, ev, false));
    return finishMove(g, ev);
  }

  // Pista: busca una jugada que forme trío
  function hint(g) {
    const vis = [];
    g.comps.forEach((c, ci) => { if (interactable(g, ci)) c.front.forEach((k, s) => { if (k) vis.push({ c: ci, s, k }); }); });
    // 1) compartimento con 2 iguales y un hueco
    for (let ci = 0; ci < g.comps.length; ci++) {
      if (!interactable(g, ci)) continue;
      const f = g.comps[ci].front;
      const empt = f.indexOf(null);
      if (empt < 0) continue;
      const ks = f.filter(Boolean);
      if (ks.length === 2 && ks[0] === ks[1]) {
        const src = vis.find((v) => v.k === ks[0] && v.c !== ci);
        if (src) return { from: { c: src.c, s: src.s }, to: { c: ci, s: empt }, kind: ks[0], type: 'trio' };
      }
    }
    // 2) un compartimento con 1 y hueco, y hay 2 más afuera
    for (let ci = 0; ci < g.comps.length; ci++) {
      if (!interactable(g, ci)) continue;
      const f = g.comps[ci].front;
      const ks = f.filter(Boolean);
      if (ks.length === 1 && f.filter((x) => !x).length === 2) {
        const others = vis.filter((v) => v.k === ks[0] && v.c !== ci);
        if (others.length >= 2) return { from: { c: others[0].c, s: others[0].s }, to: { c: ci, s: f.indexOf(null) }, kind: ks[0], type: 'pair' };
      }
    }
    // 3) un tipo con 3+ visibles: llevarlo al compartimento que ya tiene más de ese tipo
    const counts = {};
    vis.forEach((v) => { counts[v.k] = (counts[v.k] || 0) + 1; });
    const kinds = Object.keys(counts).filter((k) => counts[k] >= 3).sort((x, y) => counts[y] - counts[x]);
    for (const kind of kinds) {
      let best = -1, bestScore = -1;
      g.comps.forEach((c, ci) => {
        if (!interactable(g, ci)) return;
        const have = c.front.filter((x) => x === kind).length;
        const emp = c.front.filter((x) => !x).length;
        if (!emp || have + emp < 3 || c.front.some((x) => x && x !== kind)) return;
        const sc = have * 10 + emp;
        if (sc > bestScore) { bestScore = sc; best = ci; }
      });
      if (best < 0) continue;
      const srcs = vis.filter((v) => v.k === kind && v.c !== best);
      srcs.sort((x, y) => g.comps[x.c].front.filter((k) => k === kind).length - g.comps[y.c].front.filter((k) => k === kind).length);
      if (srcs.length) return { from: { c: srcs[0].c, s: srcs[0].s }, to: { c: best, s: g.comps[best].front.indexOf(null) }, kind, type: 'gather' };
    }
    // 4) hacer espacio: sacar el producto distinto de un compartimento con 2 iguales
    for (let ci = 0; ci < g.comps.length; ci++) {
      if (!interactable(g, ci)) continue;
      const f = g.comps[ci].front;
      if (f.some((x) => !x)) continue;
      const pair = f.find((k, i) => f.indexOf(k) !== i);
      if (!pair) continue;
      const odd = f.findIndex((k) => k !== pair);
      for (let di = 0; di < g.comps.length; di++) {
        if (di === ci || !interactable(g, di)) continue;
        const e = g.comps[di].front.indexOf(null);
        if (e >= 0) return { from: { c: ci, s: odd }, to: { c: di, s: e }, kind: f[odd], type: 'space' };
      }
    }
    // 5) destapar: vaciar el compartimento con menos productos que tenga algo atrás
    const order = g.comps.map((c, ci) => ({ c, ci })).filter((o) => interactable(g, o.ci) && o.c.back.length && o.c.front.some(Boolean))
      .sort((x, y) => x.c.front.filter(Boolean).length - y.c.front.filter(Boolean).length);
    for (const o of order) {
      const s = o.c.front.findIndex(Boolean);
      const kind = o.c.front[s];
      let best = -1, bestScore = -1;
      g.comps.forEach((d, di) => {
        if (di === o.ci || !interactable(g, di)) return;
        const e = d.front.filter((x) => !x).length;
        if (!e) return;
        const same = d.front.filter((x) => x === kind).length;
        const others = d.front.filter((x) => x && x !== kind).length;
        const sc = same * 10 - others * 3 + e - (d.back.length ? 2 : 0);
        if (sc > bestScore) { bestScore = sc; best = di; }
      });
      if (best >= 0) return { from: { c: o.ci, s }, to: { c: best, s: g.comps[best].front.indexOf(null) }, kind, type: 'reveal' };
    }
    // 6) cualquier movimiento que no regrese el anterior
    const lm = g.lastMove;
    for (const v of vis) {
      for (let di = 0; di < g.comps.length; di++) {
        if (di === v.c || !interactable(g, di)) continue;
        const e = g.comps[di].front.indexOf(null);
        if (e < 0) continue;
        if (lm && lm.from === di && lm.to === v.c) continue;
        return { from: { c: v.c, s: v.s }, to: { c: di, s: e }, kind: v.k, type: 'any' };
      }
    }
    return null;
  }

  function metaProgress(g, m) {
    if (m.id === 'cat') return Math.min(m.target, g.catMatches[m.cat] || 0);
    if (m.id === 'gift') return Math.min(m.target, g.giftOpened);
    if (m.id === 'streak') return Math.min(m.target, g.bestStreak);
    if (m.id === 'noshuffle') return g.usedShuffle ? 0 : 1;
    return 0;
  }

  function finalize(g) {
    const metas = g.metas.map((m) => {
      const done = metaProgress(g, m) >= m.target;
      return Object.assign({}, m, { done, bonusPts: done ? (m.bonus ? 500 : 300) : 0 });
    });
    const bonus = metas.reduce((s, m) => s + m.bonusPts, 0);
    const total = g.score + bonus;
    const stars = g.stars.filter((t) => total >= t).length;
    return { base: g.score, bonus, total, stars: Math.max(1, stars), metas };
  }

  const Engine = { CATALOG, ORDER, CATS, zoneOf, levelParams, generate, move, undo, shuffleBoard, hint, activateBasket, interactable, neighbors, isWin, isStuck, emptySlots, finalize, metaProgress, itemsLeft };
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
  else root.Engine = Engine;
})(this);
