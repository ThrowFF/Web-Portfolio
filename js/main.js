/* =====================================================================
   Shared helpers
   ===================================================================== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const params = new URLSearchParams(location.search);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(pointer: fine)").matches;
const store = {
  get(k, d) { try { const v = sessionStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const CLICKABLE = "a,button,.card,.level,.shot"; // what the cursor and hover sound react to
const READ_REACH = 24; // px around a description where its glow switches on and a click can start selecting it
const rectDist = (r, x, y) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));

const gameById = (id) => GAMES.find((g) => g.id === id);
const genreById = (id) => GENRES.find((g) => g.id === id);
const engineName = (id) => (ENGINES.find((e) => e.id === id) || { name: id }).name;
const coverOf = (g) => g.cover || (g.youtube ? `https://i.ytimg.com/vi/${g.youtube}/hqdefault.jpg` : "");
const ytEmbed = (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
const hashPos = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return [20 + Math.abs(h % 60), 20 + Math.abs((h >> 8) % 60)]; };

function placeholderArt(g) {
  const [x, y] = hashPos(g.title);
  return `<div class="ph" style="--px:${x}%;--py:${y}%">${esc(g.title)}</div>`;
}
function platformBadges(g) {
  return (g.platforms || []).map((p) => `<span class="badge ${esc(p)}">${esc((PLATFORMS[p] || { short: p }).short)}</span>`).join("");
}
function genreChips(g) {
  return (g.genres || []).map((id) => `<a class="chip" href="genre.html?g=${esc(id)}">${esc((genreById(id) || { name: id }).name)}</a>`).join("");
}

/* =====================================================================
   Shell: nav, scroll progress, cursor, modal, toast, wipe, footer (injected)
   ===================================================================== */
function buildShell() {
  const initials = PROFILE.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  document.body.insertAdjacentHTML("afterbegin", `
    <canvas id="bg-canvas" aria-hidden="true"></canvas>
    <div class="bg-vignette" aria-hidden="true"></div>
    <div class="xp" aria-hidden="true"><i></i></div>
    <nav class="nav">
      <a class="logo" href="index.html" title="Back to home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9v11.5h4.5v-6h4v6h4.5V9"/></svg>${esc(PROFILE.brand || initials + ".dev")}</a>
      <button class="nav-toggle" aria-label="Menu">MENU</button>
      <div class="nav-links">
        <a href="index.html#games">Games</a>
        <a href="index.html#genres">Genres</a>
        <a href="index.html#experience">Experience</a>
        <a href="index.html#skills">Skills</a>
        <a href="index.html#contact">Contact</a>
      </div>
    </nav>`);
  document.body.insertAdjacentHTML("beforeend", `
    <footer class="wrap">
      <p>© ${new Date().getFullYear()} ${esc(PROFILE.name)} · Hosted on GitHub Pages</p>
    </footer>
    <div class="modal" id="modal" role="dialog" aria-modal="true">
      <div class="modal-box"><span class="modal-title"></span><button class="modal-close">Close ✕</button><div class="modal-content"></div></div>
    </div>
    <div class="toast" id="toast" role="status"><div class="trophy">★</div><div><small>Achievement unlocked</small><b></b></div></div>
    <button class="sound-toggle" type="button" aria-label="Sound"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="spk" d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path class="waves" d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/><path class="mute" d="M16 9.5l5 5m0-5-5 5"/></svg></button>
    <div class="wipe" aria-hidden="true">${"<i></i>".repeat(WIPE.cols)}<div class="wipe-hud"><small></small><b></b><span class="wipe-bar"></span></div></div>
  `);
  $(".nav-toggle").addEventListener("click", () => $(".nav-links").classList.toggle("open"));
  $$(".nav-links a").forEach((a) => a.addEventListener("click", () => $(".nav-links").classList.remove("open")));
}

/* =====================================================================
   Crosshair cursor + hit sparks
   ===================================================================== */
function cursor() {
  if (!finePointer || reduceMotion) return;
  document.body.classList.add("custom-cursor");
  document.body.insertAdjacentHTML("beforeend", PROFILE.cursor === "crosshair"
    ? `<div class="cursor crosshair off"><i></i><i></i><i></i><i></i></div>`
    : `<div class="cursor arrow off">
        <svg class="ptr" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 2v17.5l4.6-4.1 3 6.6 3-1.4-2.9-6.4H17z"/></svg>
        <svg class="hand" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14V4a2 2 0 0 1 4 0v5a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L6 14z"/><path class="crease" d="M10 9v3.5M14 10v3M18 11v2.5"/></svg>
      </div>`);
  const cur = $(".cursor");
  addEventListener("mousemove", (e) => {
    cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    cur.classList.remove("off");
  });
  document.documentElement.addEventListener("mouseleave", () => cur.classList.add("off"));
  document.addEventListener("mouseover", (e) => {
    cur.classList.toggle("hover", !!e.target.closest(CLICKABLE));
    cur.classList.toggle("on-light", !!e.target.closest(".btn.solid"));
  });
  addEventListener("mousedown", (e) => {
    cur.classList.remove("fire"); void cur.offsetWidth; cur.classList.add("fire"); // restart the kick
    sparks(e.clientX, e.clientY, 8);
  });
}
/* =====================================================================
   Text selection only starts on (or near) text. Rapid clicks on empty space
   would otherwise make the browser select the nearest paragraph. Descriptions
   get the same reach as their glow; other text needs a click on the letters.
   ===================================================================== */
function overText(x, y) {
  let node, i;
  if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); if (p) { node = p.offsetNode; i = p.offset; } }
  else if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); if (r) { node = r.startContainer; i = r.startOffset; } }
  if (!node || node.nodeType !== Node.TEXT_NODE) return false;
  // the caret snaps to the nearest text, so check the pointer is really on a character beside it
  const range = document.createRange();
  for (const j of [i - 1, i]) {
    if (j < 0 || j >= node.length) continue;
    range.setStart(node, j); range.setEnd(node, j + 1);
    for (const b of range.getClientRects()) if (x >= b.left - 2 && x <= b.right + 2 && y >= b.top - 3 && y <= b.bottom + 3) return true;
  }
  return false;
}
function selectOnlyText() {
  if (!finePointer) return;
  document.addEventListener("mousedown", (e) => {
    if (e.button !== 0 || e.target.closest("a,button,input,textarea,select,iframe")) return;
    const x = e.clientX, y = e.clientY;
    if (overText(x, y) || $$(".readable").some((el) => rectDist(el.getBoundingClientRect(), x, y) < READ_REACH)) return;
    e.preventDefault(); // no selection starts from empty space…
    getSelection().removeAllRanges(); // …and clicking empty space still clears an existing one
  });
}

/* =====================================================================
   Sound: small UI sounds synthesised with Web Audio (no audio files) and
   the on/off toggle in the bottom-left corner (the choice is remembered)
   ===================================================================== */
const sfx = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, out = null, noise = null, on = true;
  try { on = localStorage.getItem("sound") !== "off"; } catch {}

  // Browsers only allow audio after a click or key press, so the context is created on the first one
  function unlock() {
    if (!AC) return;
    if (!ctx) {
      ctx = new AC();
      out = ctx.createGain(); out.gain.value = 0.7; out.connect(ctx.destination);
      noise = ctx.createBuffer(1, ctx.sampleRate / 2, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
  }
  const live = () => on && ctx;

  // Pitched blip: instant attack, exponential fade, optional pitch slide
  function tone(f, dur, gain, { to = f, type = "sine", at = 0 } = {}) {
    const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (to !== f) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05);
  }
  // Band-passed noise with an optional filter sweep: clicks and whooshes
  function hiss(dur, gain, { f = 1000, to = f, q = 1, at = 0 } = {}) {
    const t = ctx.currentTime + at, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; bp.type = "bandpass"; bp.Q.value = q;
    bp.frequency.setValueAtTime(f, t);
    if (to !== f) bp.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bp).connect(g).connect(out); s.start(t); s.stop(t + dur + 0.05);
  }

  return {
    get on() { return on; },
    set(v) { on = v; try { localStorage.setItem("sound", v ? "on" : "off"); } catch {} },
    unlock,
    hover() { if (live()) tone(2200, 0.035, 0.02, { type: "triangle" }); },
    click() { if (live()) { tone(220, 0.09, 0.09, { to: 110 }); hiss(0.04, 0.03, { f: 3500, q: 0.8 }); } },
    whoosh() { if (live()) hiss(0.45, 0.08, { f: 2200, to: 300, q: 1.4 }); },
    chime() { if (live()) { tone(880, 0.22, 0.04); tone(1318.5, 0.3, 0.035, { at: 0.08 }); } },
  };
})();

function sound() {
  const btn = $(".sound-toggle");
  const paint = () => {
    btn.classList.toggle("off", !sfx.on);
    btn.setAttribute("aria-pressed", sfx.on);
    btn.title = sfx.on ? "Sound on" : "Sound off";
  };
  paint();
  addEventListener("pointerdown", sfx.unlock, true); // capture: runs before the click sound below
  addEventListener("keydown", sfx.unlock, true);
  btn.addEventListener("click", () => { sfx.set(!sfx.on); paint(); sfx.chime(); }); // chime only plays when switching on
  addEventListener("pointerdown", () => sfx.click());
  // a tick each time the pointer reaches something clickable (not while moving around inside it)
  let last = null;
  if (finePointer) document.addEventListener("mouseover", (e) => {
    const el = e.target.closest(CLICKABLE);
    if (el && el !== last) sfx.hover();
    last = el;
  });
}

function sparks(x, y, n) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement("i");
    s.className = "hit-spark";
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.5, r = 30 + Math.random() * 30;
    s.style.left = x + "px"; s.style.top = y + "px";
    s.style.setProperty("--dx", Math.cos(a) * r + "px"); s.style.setProperty("--dy", Math.sin(a) * r + "px");
    document.body.appendChild(s); setTimeout(() => s.remove(), 600);
  }
}

/* =====================================================================
   Text spotlight: letters near the pointer light up in a soft circle that
   trails it, grows in over descriptions and shrinks away when you leave
   ===================================================================== */
function textGlow() {
  const els = $$(".readable");
  if (!finePointer || reduceMotion || !els.length) return;
  els.forEach((el) => (el.dataset.text = el.textContent)); // the lit copy drawn by .readable::after
  const R = 120, lit = new Set(); // spotlight radius (px)
  let px = -9999, py = -9999, sx = px, sy = py, power = 0, running = false;
  const frame = () => {
    sx += (px - sx) * 0.22; sy += (py - sy) * 0.22;
    // light up while the pointer is on (or right beside) any description, so gaps between lines don't flicker
    let near = Infinity;
    const boxes = els.map((el) => {
      const r = el.getBoundingClientRect();
      near = Math.min(near, rectDist(r, px, py));
      return r;
    });
    const on = near < READ_REACH;
    power += ((on ? 1 : 0) - power) * (on ? 0.14 : 0.08);
    running = on || power > 0.01;
    const rad = running ? R * power : 0;
    // one shared circle, so the glow spills across neighbouring lines and paragraphs
    els.forEach((el, i) => {
      const r = boxes[i];
      if (rad && sx > r.left - rad && sx < r.right + rad && sy > r.top - rad && sy < r.bottom + rad) {
        el.style.setProperty("--r", rad + "px"); el.style.setProperty("--mx", sx - r.left + "px"); el.style.setProperty("--my", sy - r.top + "px");
        lit.add(el);
      } else if (lit.delete(el)) el.style.setProperty("--r", "0px");
    });
    if (running) requestAnimationFrame(frame);
  };
  const wake = () => { if (!running) { running = true; requestAnimationFrame(frame); } };
  addEventListener("mousemove", (e) => {
    px = e.clientX; py = e.clientY;
    if (power < 0.01) { sx = px; sy = py; } // a fresh spotlight starts on the pointer instead of flying in
    wake();
  });
  document.documentElement.addEventListener("mouseleave", () => { px = py = -9999; });
  addEventListener("scroll", wake, { passive: true });
}

/* =====================================================================
   Scroll progress bar
   ===================================================================== */
function scrollProgress() {
  const bar = $(".xp i");
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? Math.min(1, scrollY / max) : 1;
    bar.style.width = pct * 100 + "%";
    if (pct > 0.98 && max > 400) unlock("completionist", "Completionist: scrolled the whole page");
  };
  addEventListener("scroll", update, { passive: true }); update();
}

/* =====================================================================
   Reveal on scroll, counters
   ===================================================================== */
const revealObs = "IntersectionObserver" in window
  ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } }), { threshold: 0.12 })
  : null;
function reveal(root = document) { $$(".reveal:not(.in)", root).forEach((el) => (revealObs ? revealObs.observe(el) : el.classList.add("in"))); }

function countUp(el) {
  const raw = el.textContent, m = raw.match(/^(\d+)(.*)$/);
  if (!m || reduceMotion) return;
  const target = +m[1], suffix = m[2];
  let v = 0; const step = Math.max(1, Math.ceil(target / 30));
  const t = setInterval(() => { v = Math.min(target, v + step); el.textContent = v + suffix; if (v >= target) clearInterval(t); }, 40);
}

/* =====================================================================
   Achievements (toast queue)
   ===================================================================== */
const toastQ = []; let toastBusy = false;
function unlock(id, text) {
  const got = store.get("ach", []);
  if (got.includes(id)) return;
  got.push(id); store.set("ach", got);
  toastQ.push(text); nextToast();
}
function nextToast() {
  if (toastBusy || !toastQ.length) return;
  toastBusy = true;
  const t = $("#toast"); $("b", t).textContent = toastQ.shift();
  t.classList.add("show"); sfx.chime();
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => { toastBusy = false; nextToast(); }, 500); }, 3200);
}

/* Konami code easter egg: ↑↑↓↓←→←→BA */
function konami() {
  const code = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let i = 0;
  addEventListener("keydown", (e) => {
    i = e.key.toLowerCase() === code[i].toLowerCase() || e.key === code[i] ? i + 1 : 0;
    if (i === code.length) {
      i = 0; unlock("konami", "Cheat Code: +30 lives");
      for (let k = 0; k < 14; k++) setTimeout(() => sparks(Math.random() * innerWidth, Math.random() * innerHeight, 12), k * 90);
    }
  });
}

/* =====================================================================
   Modal: trailer + lightbox
   ===================================================================== */
function openModal(html, title = "") {
  const m = $("#modal");
  $(".modal-content", m).innerHTML = html;
  $(".modal-title", m).textContent = title;
  m.classList.add("open");
}
function closeModal() { const m = $("#modal"); m.classList.remove("open"); setTimeout(() => ($(".modal-content", m).innerHTML = ""), 300); }
function openTrailer(g) {
  if (!g.youtube) return;
  openModal(`<div class="video"><iframe src="${ytEmbed(g.youtube)}" title="${esc(g.title)} trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`, g.title);
  unlock("cinephile", "Cinephile: watched a trailer");
}
function modalEvents() {
  const m = $("#modal");
  m.addEventListener("click", (e) => { if (e.target === m || e.target.closest(".modal-close")) closeModal(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}

/* =====================================================================
   Page transitions: shutters drop from where you clicked, a loading card
   names the destination, and the next page opens them again
   ===================================================================== */
// ms; style.css reads --close/--fill/--hold/--open. The loading bar fills 0 → 100% (fill) on the page you
// leave, *then* the page changes, and the new page starts with the bar already full. Nothing moves while
// the browser swaps pages, so its frozen in-between frame can never show as a jump.
const WIPE = { cols: 6, step: 32, close: 320, fill: 420, hold: 160, open: 460 };

// "/", "/index" and "/index.html" are the same page (Netlify serves all three)
const pageKey = (u) => u.pathname.replace(/\.html$/, "").replace(/\/index$/, "/");

function wipeLabel(url, a) {
  const page = pageKey(url).split("/").pop() || "index", q = url.searchParams;
  const g = gameById(q.get("id")), ge = genreById(q.get("g"));
  if (page === "genre" && ge) return { k: "Genre", t: ge.name };
  if (page === "game" && g) return { k: "Game", t: g.title };
  if (page === "play" && g) return { k: "Play in browser", t: g.title };
  if (page === "index") { const h = url.hash.slice(1); return { k: "Home", t: h ? h[0].toUpperCase() + h.slice(1) : PROFILE.name }; }
  return { k: "Loading", t: a ? a.textContent.trim() : "" };
}

function transitions() {
  const w = $(".wipe"), shutters = $$("i", w), hud = $(".wipe-hud", w);
  w.style.cssText = `--close:${WIPE.close}ms;--fill:${WIPE.fill}ms;--hold:${WIPE.hold}ms;--open:${WIPE.open}ms`;
  let originCol = 2, px = innerWidth / 2;

  // Stagger outwards from the origin column; returns the furthest shutter's delay
  const play = (state, info) => {
    originCol = info.c ?? originCol;
    $("small", hud).textContent = info.k || "";
    $("b", hud).textContent = info.t || "";
    shutters.forEach((s, i) => s.style.setProperty("--d", Math.abs(i - originCol) * WIPE.step + "ms"));
    w.classList.remove("in", "out"); void w.offsetWidth; w.classList.add(state);
    return Math.max(originCol, WIPE.cols - 1 - originCol) * WIPE.step;
  };
  const open = (info) => {
    const reach = play("in", info);
    setTimeout(() => w.classList.remove("in"), WIPE.hold + reach + WIPE.open + 60);
  };

  // Arrived through a wipe: page starts covered, jump to the #section behind the shutters, then open
  const pending = store.get("wipe", null);
  if (pending) {
    store.set("wipe", null);
    if (!reduceMotion) {
      const el = location.hash && document.getElementById(location.hash.slice(1));
      if (el) { const r = document.documentElement.style; r.scrollBehavior = "auto"; el.scrollIntoView(); r.scrollBehavior = ""; }
      open(pending);
    }
  }

  addEventListener("pointerdown", (e) => (px = e.clientX), true); // card clicks are re-dispatched with clientX 0
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank" || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (pageKey(url) === pageKey(location) && url.search === location.search) {
      // Same page (e.g. nav "index.html#games" while on "/"): glide to the section, no reload
      e.preventDefault();
      const el = url.hash && document.getElementById(url.hash.slice(1));
      el ? el.scrollIntoView() : scrollTo(0, 0);
      if (url.hash !== location.hash) history.pushState(null, "", url.hash || location.pathname + location.search);
      return;
    }
    if (reduceMotion) return;
    e.preventDefault();
    const info = { ...wipeLabel(url, a), c: Math.min(WIPE.cols - 1, Math.floor((px / innerWidth) * WIPE.cols)) };
    store.set("wipe", info);
    sfx.whoosh();
    // fetch the next page while the bar fills, so the swap itself is quick
    document.head.append(Object.assign(document.createElement("link"), { rel: "prefetch", href: url.href }));
    const reach = play("out", info);
    // go once the shutters are shut and the bar (which starts as the card fades in) has reached 100%
    setTimeout(() => location.assign(url.href), Math.max(reach + WIPE.close, WIPE.close * 0.8 + WIPE.fill) + 40);
  });

  // Back/forward cache restores this page still covered: open it back up
  addEventListener("pageshow", (e) => { if (e.persisted && w.classList.contains("out")) open(wipeLabel(new URL(location.href))); });
}

/* =====================================================================
   Game card
   ===================================================================== */
function cardHTML(g, i = 0) {
  const cover = coverOf(g);
  return `
  <article class="card spawn" style="--d:${Math.min(i, 12) * 0.06}s" data-id="${esc(g.id)}">
    <div class="thumb">
      ${cover ? `<img src="${esc(cover)}" alt="${esc(g.title)}" loading="lazy">` : placeholderArt(g)}
      <div class="badges">${platformBadges(g)}</div>
      <span class="engine badge">${esc(engineName(g.engine).toUpperCase())}</span>
      ${g.youtube ? `<button class="play-trailer" data-trailer="${esc(g.id)}" aria-label="Play ${esc(g.title)} trailer"><span class="play-btn"></span><small>Watch trailer</small></button>` : ""}
    </div>
    <div class="card-body">
      <a href="game.html?id=${esc(g.id)}" class="card-title">${esc(g.title)} <span>${esc(g.year || "")}</span></a>
      <p class="card-short">${esc(g.short || "")}</p>
      <div class="card-tags">${genreChips(g)}</div>
    </div>
  </article>`;
}
function renderGrid(el, list) {
  el.innerHTML = list.length ? list.map(cardHTML).join("") : `<div class="empty">More games coming soon</div>`;
  $$(".card", el).forEach((c) => {
    c.addEventListener("click", (e) => {
      if (e.target.closest("[data-trailer]")) { openTrailer(gameById(c.dataset.id)); return; }
      if (e.target.closest("a")) return;
      $("a.card-title", c).click();
    });
  });
}
function swapGrid(el, list) {
  const cards = $$(".card", el);
  if (!cards.length || reduceMotion) return renderGrid(el, list);
  cards.forEach((c) => c.classList.add("despawn"));
  setTimeout(() => renderGrid(el, list), 230);
}

/* =====================================================================
   HOME
   ===================================================================== */
function pageHome() {
  const P = PROFILE, main = $("#app");
  const featured = GAMES.filter((g) => g.featured);
  const engineCounts = Object.fromEntries(ENGINES.map((e) => [e.id, GAMES.filter((g) => g.engine === e.id).length]));

  main.innerHTML = `
  <section class="hero"><div class="wrap">
    <div class="hero-inner">
      <div class="hero-status reveal"><span class="dot"></span>Available for new projects · ${esc(P.location)}</div>
      <h1 class="reveal"><span class="hi">Hi, I'm</span>${esc(P.name)}</h1>
      <div class="typer reveal" id="typer"></div>
      <p class="hero-about readable reveal">${esc(P.about)}</p>
      <div class="hero-cta reveal">
        <a class="btn solid" href="#games">View my games</a>
        <a class="btn" href="#contact">Hire me</a>
        ${P.resume ? `<a class="btn" href="${esc(P.resume)}" target="_blank" rel="noopener">Résumé ↓</a>` : ""}
      </div>
      <div class="stats reveal">${P.stats.map((s) => `<div class="stat"><b class="count-up">${esc(s.value)}</b><span class="readable">${esc(s.label)}</span></div>`).join("")}</div>
    </div>
  </div></section>

  ${featured.length ? `<div class="marquee"><div class="marquee-track">${[...featured, ...featured, ...featured, ...featured].map((g) => `<a href="game.html?id=${esc(g.id)}">${esc(g.title)}</a>`).join("")}</div></div>` : ""}

  <section id="games"><div class="wrap">
    <div class="sec-head reveal">
      <div class="sec-tag">Selected work</div>
      <h2 class="sec-title">My <em>Games</em></h2>
      <p class="sec-sub readable">Pick an engine or filter by platform. Open a game for its trailer, screenshots and store links.</p>
    </div>
    <div class="reveal">
      <div class="tabs" id="engine-tabs">
        <span class="tab-pill"></span>
        <button class="tab active" data-engine="all">All<span class="count">${GAMES.length}</span></button>
        ${ENGINES.map((e) => `<button class="tab" data-engine="${esc(e.id)}">${esc(e.name)}<span class="count">${engineCounts[e.id]}</span></button>`).join("")}
      </div>
      <div class="filters" id="platform-filters">
        <span class="lbl">Platform</span>
        <button class="filter on" data-platform="all">All</button>
        ${Object.entries(PLATFORMS).filter(([k]) => GAMES.some((g) => g.platforms.includes(k))).map(([k, p]) => `<button class="filter" data-platform="${esc(k)}">${esc(p.name)}</button>`).join("")}
      </div>
    </div>
    <div class="grid" id="game-grid"></div>
  </div></section>

  <section id="genres"><div class="wrap">
    <div class="sec-head reveal">
      <div class="sec-tag">Genres</div>
      <h2 class="sec-title">Browse by <em>Genre</em></h2>
      <p class="sec-sub readable">Pick a genre to see every game I've made in it.</p>
    </div>
    <div class="levels">${GENRES.map((ge, i) => {
      const n = GAMES.filter((g) => g.genres.includes(ge.id)).length;
      return `<a class="level reveal ${n ? "" : "locked"}" href="genre.html?g=${esc(ge.id)}" style="--rd:${(i % 4) * 60}ms">
        <div class="lvl-no">${String(i + 1).padStart(2, "0")}</div>
        <h3>${esc(ge.name)}</h3><p>${esc(ge.blurb)}</p>
        <div class="lvl-foot"><span>${n} game${n === 1 ? "" : "s"}</span><span class="go">→</span></div>
      </a>`;
    }).join("")}</div>
  </div></section>

  <section id="experience"><div class="wrap">
    <div class="sec-head reveal">
      <div class="sec-tag">Career</div>
      <h2 class="sec-title">Experience &amp; <em>Qualifications</em></h2>
    </div>
    <div class="two-col">
      <div class="quests">${EXPERIENCE.map((q, i) => `
        <div class="quest reveal ${i === 0 ? "current" : ""}">
          <div class="quest-head"><h3>${esc(q.role)}</h3>${i === 0 ? `<span class="q-state">Current</span>` : ""}</div>
          <div class="quest-head"><span class="q-company">${esc(q.company)}</span><span class="q-period">${esc(q.period)}</span></div>
          <ul>${q.points.map((p) => `<li class="readable">${esc(p)}</li>`).join("")}</ul>
        </div>`).join("")}
      </div>
      <div>
        <h3 class="sec-tag reveal" style="margin-bottom:6px">Education</h3>
        ${EDUCATION.map((e) => `<div class="edu reveal"><div class="ico">${esc(e.title.slice(0, 2).toUpperCase())}</div><div><h4>${esc(e.title)}</h4><p>${esc(e.place)}${e.period ? ` · ${esc(e.period)}` : ""}</p></div></div>`).join("")}
      </div>
    </div>
  </div></section>

  <section id="skills"><div class="wrap">
    <div class="sec-head reveal">
      <div class="sec-tag">Toolkit</div>
      <h2 class="sec-title">Skills &amp; <em>Expertise</em></h2>
    </div>
    ${SKILLS.map((s) => `<div class="inv-group reveal"><h4>${esc(s.group)}</h4><div class="slots">${s.items.map((it) => `<span class="slot">${esc(it)}</span>`).join("")}</div></div>`).join("")}
  </div></section>

  <section id="contact"><div class="wrap">
    <div class="contact-box reveal">
      <div class="sec-tag">Contact</div>
      <h2>Let's build your next <em>game</em>.</h2>
      <p class="sub readable">${esc(P.contactNote || "")}</p>
      <a class="btn solid" href="mailto:${esc(P.email)}">${esc(P.email)}</a>
      <div class="socials">${P.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join("")}</div>
    </div>
  </div></section>`;

  // typer
  typer($("#typer"), P.taglines);

  // counters when visible
  const cObs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { countUp(e.target); cObs.unobserve(e.target); } }));
  $$(".count-up").forEach((el) => cObs.observe(el));

  // tabs + filters
  let engine = "all", platform = "all";
  const grid = $("#game-grid"), tabs = $("#engine-tabs"), pill = $(".tab-pill", tabs);
  const filtered = () => GAMES.filter((g) => (engine === "all" || g.engine === engine) && (platform === "all" || g.platforms.includes(platform)));
  const movePill = () => {
    const a = $(".tab.active", tabs);
    Object.assign(pill.style, { left: a.offsetLeft + "px", top: a.offsetTop + "px", width: a.offsetWidth + "px", height: a.offsetHeight + "px" }); // follows the tab onto a wrapped row
  };
  $$(".tab", tabs).forEach((t) => t.addEventListener("click", () => {
    $$(".tab", tabs).forEach((x) => x.classList.toggle("active", x === t));
    engine = t.dataset.engine; movePill(); swapGrid(grid, filtered());
  }));
  $$(".filter", $("#platform-filters")).forEach((f) => f.addEventListener("click", () => {
    $$(".filter").forEach((x) => x.classList.toggle("on", x === f));
    platform = f.dataset.platform; swapGrid(grid, filtered());
  }));
  addEventListener("resize", movePill);
  requestAnimationFrame(movePill);

  // spawn the grid the first time it scrolls into view
  const gObs = new IntersectionObserver((es) => { if (es[0].isIntersecting) { renderGrid(grid, filtered()); gObs.disconnect(); } }, { threshold: 0.05 });
  gObs.observe(grid);
}

function typer(el, lines) {
  if (!el) return;
  if (reduceMotion) { el.textContent = lines[0]; return; }
  let li = 0, ci = 0, del = false;
  (function step() {
    const s = lines[li];
    el.textContent = s.slice(0, ci);
    if (!del && ci < s.length) ci++;
    else if (!del) { del = true; return setTimeout(step, 1600); }
    else if (ci > 0) ci--;
    else { del = false; li = (li + 1) % lines.length; }
    setTimeout(step, del ? 28 : 55);
  })();
}

/* =====================================================================
   GENRE PAGE
   ===================================================================== */
function pageGenre() {
  const ge = genreById(params.get("g"));
  const main = $("#app");
  if (!ge) { main.innerHTML = notFound("Genre not found"); return; }
  document.title = `${ge.name} games · ${PROFILE.name}`;
  const list = GAMES.filter((g) => g.genres.includes(ge.id));
  const engines = ENGINES.filter((e) => list.some((g) => g.engine === e.id));
  unlock("explorer", "Explorer: browsed a genre");

  main.innerHTML = `
  <div class="wrap page-head">
    <div class="crumbs"><a href="index.html">Home</a> / <a href="index.html#genres">Genres</a> / ${esc(ge.name)}</div>
    <div class="sec-tag">Genre</div>
    <h1 class="sec-title">${esc(ge.name)} <em>Games</em></h1>
    <p class="sec-sub readable">${esc(ge.blurb)} · ${list.length} game${list.length === 1 ? "" : "s"}</p>
    ${engines.length > 1 ? `<div class="filters" id="genre-engine"><span class="lbl">Engine</span><button class="filter on" data-e="all">All</button>${engines.map((e) => `<button class="filter" data-e="${esc(e.id)}">${esc(e.name)}</button>`).join("")}</div>` : ""}
  </div>
  <div class="wrap"><div class="grid" id="game-grid"></div></div>
  <section><div class="wrap">
    <div class="sec-tag">Other genres</div>
    <div class="genre-switch">${GENRES.filter((x) => x.id !== ge.id).map((x) => `<a class="filter" href="genre.html?g=${esc(x.id)}">${esc(x.name)}</a>`).join("")}</div>
  </div></section>`;

  const grid = $("#game-grid");
  renderGrid(grid, list);
  $$("#genre-engine .filter").forEach((f) => f.addEventListener("click", () => {
    $$("#genre-engine .filter").forEach((x) => x.classList.toggle("on", x === f));
    swapGrid(grid, f.dataset.e === "all" ? list : list.filter((g) => g.engine === f.dataset.e));
  }));
}

/* =====================================================================
   GAME PAGE
   ===================================================================== */
function pageGame() {
  const g = gameById(params.get("id"));
  const main = $("#app");
  if (!g) { main.innerHTML = notFound("Game not found"); return; }
  document.title = `${g.title} · ${PROFILE.name}`;
  const cover = coverOf(g);
  const related = GAMES.filter((x) => x.id !== g.id && x.genres.some((ge) => g.genres.includes(ge))).slice(0, 3);
  const firstGenre = genreById(g.genres[0]);

  main.innerHTML = `
  <div class="wrap page-head">
    <div class="crumbs"><a href="index.html">Home</a> / ${firstGenre ? `<a href="genre.html?g=${esc(firstGenre.id)}">${esc(firstGenre.name)}</a> / ` : ""}${esc(g.title)}</div>
    <div class="game-hero">
      <div class="reveal">
        <div class="video" id="video">
          ${g.youtube
            ? `<button class="poster" aria-label="Play trailer">${cover ? `<img src="${esc(cover)}" alt="">` : placeholderArt(g)}<span class="play-btn"></span></button>`
            : `${cover ? `<img src="${esc(cover)}" alt="" style="width:100%;height:100%;object-fit:cover">` : `<div class="no-video">${esc(g.title)}<br>TRAILER COMING SOON</div>`}`}
        </div>
      </div>
      <aside class="info-panel reveal">
        <div class="sec-tag">${esc(engineName(g.engine))} project</div>
        <h1>${esc(g.title)}</h1>
        <p class="lede readable">${esc(g.short || "")}</p>
        <div class="info-row"><span>Engine</span><span>${esc(engineName(g.engine))}</span></div>
        ${g.role ? `<div class="info-row"><span>My role</span><span>${esc(g.role)}</span></div>` : ""}
        ${g.year ? `<div class="info-row"><span>Year</span><span>${esc(g.year)}</span></div>` : ""}
        <div class="info-row"><span>Platforms</span><span>${platformBadges(g)}</span></div>
        <div class="info-row"><span>Genres</span><span>${genreChips(g)}</span></div>
        <div class="links">
          ${g.webgl ? `<a class="btn solid" href="play.html?id=${esc(g.id)}"><span>Play in browser</span><span>▶</span></a>` : ""}
          ${(g.links || []).map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener"><span>${esc(l.label)}</span><span>↗</span></a>`).join("")}
        </div>
      </aside>
    </div>
  </div>

  <section style="padding-top:30px"><div class="wrap">
    <div class="sec-tag reveal">About the game</div>
    <div class="desc reveal" style="margin-top:16px">${esc(g.description || "").split(/\n+/).map((p) => `<p class="readable">${p}</p>`).join("")}</div>
  </div></section>

  ${g.screenshots && g.screenshots.length ? `
  <section style="padding-top:30px"><div class="wrap">
    <div class="sec-tag reveal" style="margin-bottom:16px">Screenshots</div>
    <div class="shots">${g.screenshots.map((s, i) => `<button class="shot reveal" data-src="${esc(s)}" style="--rd:${i * 60}ms"><img src="${esc(s)}" alt="${esc(g.title)} screenshot ${i + 1}" loading="lazy"></button>`).join("")}</div>
  </div></section>` : ""}

  ${related.length ? `
  <section><div class="wrap">
    <div class="sec-tag" style="margin-bottom:16px">You might also like</div>
    <div class="grid" id="related"></div>
  </div></section>` : ""}`;

  const poster = $("#video .poster");
  if (poster) poster.addEventListener("click", () => {
    $("#video").innerHTML = `<iframe src="${ytEmbed(g.youtube)}" title="${esc(g.title)} trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    unlock("cinephile", "Cinephile: watched a trailer");
  });
  $$(".shot").forEach((s) => s.addEventListener("click", () => openModal(`<img class="full" src="${esc(s.dataset.src)}" alt="">`, g.title)));
  // Mobile games ship portrait screenshots: switch to tall tiles once one loads
  const shots = $(".shots");
  if (shots) $$("img", shots).forEach((img) => {
    const check = () => img.naturalHeight > img.naturalWidth && shots.classList.add("tall");
    img.complete ? check() : img.addEventListener("load", check, { once: true });
  });
  if (related.length) renderGrid($("#related"), related);
}

/* =====================================================================
   PLAY PAGE (Unity WebGL build in an iframe)
   ===================================================================== */
function pagePlay() {
  const g = gameById(params.get("id"));
  const main = $("#app");
  if (!g || !g.webgl) { main.innerHTML = notFound("No browser build for this game"); return; }
  document.title = `Play ${g.title} · ${PROFILE.name}`;
  main.innerHTML = `
  <div class="wrap page-head">
    <div class="crumbs"><a href="index.html">Home</a> / <a href="game.html?id=${esc(g.id)}">${esc(g.title)}</a> / Play</div>
    <div class="player-bar">
      <h1 class="sec-title" style="margin:0">${esc(g.title)}</h1>
      <div style="display:flex;gap:10px"><button class="btn small" id="fs">⛶ Fullscreen</button><a class="btn small" href="game.html?id=${esc(g.id)}">← Back</a></div>
    </div>
    <div class="player-frame" id="frame"><iframe src="${esc(g.webgl)}" title="${esc(g.title)}" allow="fullscreen; autoplay; gamepad" allowfullscreen></iframe></div>
    <p class="play-tip readable">Tip: click inside the game to give it keyboard focus. Best on desktop.</p>
  </div>`;
  $("#fs").addEventListener("click", () => { const f = $("#frame"); (f.requestFullscreen || f.webkitRequestFullscreen).call(f); });
  unlock("player2", "Ready Player: launched a browser build");
}

function notFound(msg) {
  return `<div class="wrap page-head" style="text-align:center;padding:120px 20px">
    <div class="sec-tag">Error 404</div>
    <h1 class="sec-title">Game <em>over</em></h1>
    <p class="sec-sub" style="margin:14px auto 28px">${esc(msg)}.</p>
    <a class="btn solid" href="index.html">Back to home</a></div>`;
}

/* =====================================================================
   Boot everything
   ===================================================================== */
(function init() {
  buildShell();
  const page = document.body.dataset.page;
  ({ home: pageHome, genre: pageGenre, game: pageGame, play: pagePlay, notfound: () => ($("#app").innerHTML = notFound("This page doesn't exist")) }[page] || pageHome)();
  modalEvents(); transitions(); cursor(); selectOnlyText(); sound(); textGlow(); scrollProgress(); konami();
  reveal();
})();
