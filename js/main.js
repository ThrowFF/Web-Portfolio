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
   Shell: nav, XP bar, cursor, modal, toast, wipe, footer (injected)
   ===================================================================== */
function buildShell() {
  const initials = PROFILE.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  document.body.insertAdjacentHTML("afterbegin", `
    <canvas id="bg-canvas" aria-hidden="true"></canvas>
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="bg-vignette" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>
    <div class="xp" aria-hidden="true"><i></i></div>
    <div class="xp-label" aria-hidden="true">LV 1</div>
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
      <div class="gg">GG · THANKS FOR PLAYING</div>
      © ${new Date().getFullYear()} ${esc(PROFILE.name)} · Built by hand, hosted on Netlify
    </footer>
    <div class="modal" id="modal" role="dialog" aria-modal="true">
      <div class="modal-box"><span class="modal-title"></span><button class="modal-close">[ESC] CLOSE</button><div class="modal-content"></div></div>
    </div>
    <div class="toast" id="toast" role="status"><div class="trophy">★</div><div><small>ACHIEVEMENT UNLOCKED</small><b></b></div></div>
    <div class="wipe" aria-hidden="true">${"<i></i>".repeat(WIPE.cols)}<div class="wipe-hud"><small></small><b></b><span class="wipe-bar"></span></div></div>
  `);
  $(".nav-toggle").addEventListener("click", () => $(".nav-links").classList.toggle("open"));
  $$(".nav-links a").forEach((a) => a.addEventListener("click", () => $(".nav-links").classList.remove("open")));
}

/* =====================================================================
   Boot screen (first visit per session)
   ===================================================================== */
function boot() {
  if (store.get("booted", false) || reduceMotion) return Promise.resolve();
  store.set("booted", true);
  document.body.insertAdjacentHTML("afterbegin", `
    <div id="boot"><div class="boot-inner">
      <div class="boot-log"></div>
      <div class="boot-bar"><i></i></div>
      <div class="press-start">PRESS START</div>
      <div class="boot-skip">click or press any key</div>
    </div></div>`);
  const el = $("#boot"), log = $(".boot-log", el), bar = $(".boot-bar i", el), ps = $(".press-start", el);
  const lines = [
    `> loading player profile... <span>${esc(PROFILE.name)}</span>`,
    `> mounting engines... <span>${ENGINES.map((e) => e.name).join(" + ")}</span>`,
    `> indexing games... <span>${GAMES.length} found</span>`,
    `> compiling shaders... <span>ok</span>`,
    `> ready.`,
  ];
  return new Promise((resolve) => {
    let i = 0, done = false;
    const finish = () => {
      if (done) return; done = true;
      el.classList.add("done"); setTimeout(() => el.remove(), 600);
      removeEventListener("keydown", finish); el.removeEventListener("click", finish);
      resolve();
    };
    addEventListener("keydown", finish); el.addEventListener("click", finish);
    const tick = setInterval(() => {
      if (i < lines.length) { log.innerHTML += (i ? "\n" : "") + lines[i]; i++; bar.style.width = (i / lines.length) * 100 + "%"; }
      else { clearInterval(tick); ps.classList.add("show"); setTimeout(finish, 1800); }
    }, 260);
  });
}

/* =====================================================================
   Crosshair cursor + hit sparks
   ===================================================================== */
function cursor() {
  if (!finePointer || reduceMotion) return;
  document.body.classList.add("custom-cursor");
  document.body.insertAdjacentHTML("beforeend", `<div class="cursor off"></div><div class="reticle off"><i></i><i></i><i></i><i></i></div>`);
  const ring = $(".cursor"), ret = $(".reticle"), parts = [ring, ret];
  let x = 0, y = 0, cx = 0, cy = 0, seen = false;
  addEventListener("mousemove", (e) => {
    x = e.clientX; y = e.clientY;
    if (!seen) { seen = true; cx = x; cy = y; } // first move: ring starts on the pointer instead of flying in
    ret.style.transform = `translate(${x}px,${y}px)`;
    parts.forEach((p) => p.classList.remove("off"));
  });
  document.documentElement.addEventListener("mouseleave", () => parts.forEach((p) => p.classList.add("off")));
  (function loop() { cx += (x - cx) * 0.28; cy += (y - cy) * 0.28; ring.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  document.addEventListener("mouseover", (e) => {
    const on = !!e.target.closest("a,button,.card,.level,.shot");
    parts.forEach((p) => p.classList.toggle("hover", on));
  });
  addEventListener("mousedown", (e) => {
    parts.forEach((p) => { p.classList.remove("fire"); void p.offsetWidth; p.classList.add("fire"); }); // restart recoil
    sparks(e.clientX, e.clientY, 8);
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
   XP bar: scroll progress with level ups
   ===================================================================== */
function xpBar() {
  const bar = $(".xp i"), label = $(".xp-label");
  let lvl = 1;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? Math.min(1, scrollY / max) : 1;
    bar.style.width = pct * 100 + "%";
    const n = Math.min(10, Math.floor(pct * 9.999) + 1);
    if (n !== lvl) {
      if (n > lvl) { label.classList.add("levelup"); setTimeout(() => label.classList.remove("levelup"), 300); }
      lvl = n;
    }
    label.textContent = lvl === 10 ? "MAX LV" : "LV " + lvl;
    if (pct > 0.98 && max > 400) unlock("completionist", "Completionist: scrolled the whole page");
  };
  addEventListener("scroll", update, { passive: true }); update();
}

/* =====================================================================
   Reveal on scroll, tilt, glitch, counters
   ===================================================================== */
const revealObs = "IntersectionObserver" in window
  ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } }), { threshold: 0.12 })
  : null;
function reveal(root = document) { $$(".reveal:not(.in)", root).forEach((el) => (revealObs ? revealObs.observe(el) : el.classList.add("in"))); }

function tilt(el, max = 10) {
  if (!finePointer || reduceMotion) return;
  el.addEventListener("mousemove", (e) => {
    const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateY(${(px - 0.5) * max}deg) rotateX(${(0.5 - py) * max}deg) translateY(-4px)`;
    el.style.setProperty("--gx", px * 100 + "%"); el.style.setProperty("--gy", py * 100 + "%");
  });
  el.addEventListener("mouseleave", () => (el.style.transform = ""));
}

function glitchLoop() {
  if (reduceMotion) return;
  setInterval(() => {
    const els = $$(".glitch"); if (!els.length) return;
    const el = els[(Math.random() * els.length) | 0];
    el.classList.add("active"); setTimeout(() => el.classList.remove("active"), 700);
  }, 2600);
}

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
  t.classList.add("show");
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
  openModal(`<div class="video"><iframe src="${ytEmbed(g.youtube)}" title="${esc(g.title)} trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`, "▶ " + g.title);
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
const WIPE = { cols: 6, step: 32, close: 320, hold: 140, open: 460 }; // ms; style.css reads --close/--hold/--open

// "/", "/index" and "/index.html" are the same page (Netlify serves all three)
const pageKey = (u) => u.pathname.replace(/\.html$/, "").replace(/\/index$/, "/");

function wipeLabel(url, a) {
  const page = pageKey(url).split("/").pop() || "index", q = url.searchParams;
  const g = gameById(q.get("id")), ge = genreById(q.get("g"));
  if (page === "genre" && ge) return { k: `World ${String(GENRES.indexOf(ge) + 1).padStart(2, "0")}`, t: ge.name };
  if (page === "game" && g) return { k: "Loading game", t: g.title };
  if (page === "play" && g) return { k: "Launching build", t: g.title };
  if (page === "index") return { k: "Returning to", t: url.hash.slice(1) || "Main menu" };
  return { k: "Loading", t: a ? a.textContent.trim() : "" };
}

function transitions() {
  const w = $(".wipe"), shutters = $$("i", w), hud = $(".wipe-hud", w);
  w.style.cssText = `--close:${WIPE.close}ms;--hold:${WIPE.hold}ms;--open:${WIPE.open}ms`;
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
    setTimeout(() => location.assign(url.href), play("out", info) + WIPE.close + 40);
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
  <article class="card spawn" style="--d:${Math.min(i, 12) * 0.07}s" data-id="${esc(g.id)}">
    <div class="glare"></div>
    <div class="thumb">
      ${cover ? `<img src="${esc(cover)}" alt="${esc(g.title)}" loading="lazy">` : placeholderArt(g)}
      <div class="badges">${platformBadges(g)}</div>
      <span class="engine badge">${esc(engineName(g.engine).toUpperCase())}</span>
      ${g.youtube ? `<button class="play-trailer" data-trailer="${esc(g.id)}" aria-label="Play ${esc(g.title)} trailer"><span class="play-btn"></span><small>WATCH TRAILER</small></button>` : ""}
    </div>
    <div class="card-body">
      <a href="game.html?id=${esc(g.id)}" class="card-title">${esc(g.title)} <span>${esc(g.year || "")}</span></a>
      <p class="card-short">${esc(g.short || "")}</p>
      <div class="card-tags">${genreChips(g)}</div>
    </div>
  </article>`;
}
function renderGrid(el, list) {
  el.innerHTML = list.length ? list.map(cardHTML).join("") : `<div class="empty">MORE GAMES COMING SOON</div>`;
  $$(".card", el).forEach((c) => {
    tilt(c, 8);
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
  const initials = P.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const featured = GAMES.filter((g) => g.featured);
  const engineCounts = Object.fromEntries(ENGINES.map((e) => [e.id, GAMES.filter((g) => g.engine === e.id).length]));
  const totalYears = parseInt(P.stats[0]?.value) || 5;

  main.innerHTML = `
  <section class="hero"><div class="wrap">
    <div class="hero-grid">
      <div>
        <div class="hero-hello reveal">&gt; player_one.connect() <span class="ok">// OK</span></div>
        <h1 class="reveal">Hi, I'm<br><span class="glitch" data-text="${esc(P.name)}">${esc(P.name)}</span></h1>
        <div class="typer reveal" id="typer"></div>
        <p class="hero-about reveal">${esc(P.about)}</p>
        <div class="hero-cta reveal">
          <a class="btn solid" href="#games"><span class="key">A</span> View my games</a>
          <a class="btn" href="#contact"><span class="key">B</span> Hire me</a>
          ${P.resume ? `<a class="btn" href="${esc(P.resume)}" target="_blank" rel="noopener">Résumé ↓</a>` : ""}
        </div>
        <div class="stats reveal">${P.stats.map((s) => `<div class="stat"><b class="count-up">${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join("")}</div>
      </div>
      <div class="reveal">
        <div class="player-card" id="player-card">
          <div class="pc-top">
            <div class="avatar">${P.avatar ? `<img src="${esc(P.avatar)}" alt="${esc(P.name)}">` : initials}</div>
            <div><div class="pc-name">${esc(P.name)}</div><div class="pc-class">CLASS: ${esc(P.role)}</div></div>
          </div>
          ${ENGINES.map((e) => `<div class="pc-row"><span>${esc(e.name.toUpperCase())}</span><span>${engineCounts[e.id]} game${engineCounts[e.id] === 1 ? "" : "s"}</span></div><div class="bar"><i data-w="${engineCounts[e.id] ? Math.min(100, 40 + engineCounts[e.id] * 15) : 0}"></i></div>`).join("")}
          <div class="pc-row"><span>EXPERIENCE</span><span>LV ${totalYears * 10}</span></div><div class="bar"><i data-w="${Math.min(100, totalYears * 18)}"></i></div>
          <div class="pc-row"><span>LOCATION</span><span>${esc(P.location)}</span></div>
          <div class="pc-status">Available for new projects</div>
        </div>
      </div>
    </div>
    <div class="scroll-hint">▼ SCROLL TO PLAY ▼</div>
  </div></section>

  ${featured.length ? `<div class="marquee"><div class="marquee-track">${[...featured, ...featured, ...featured, ...featured].map((g) => `<a href="game.html?id=${esc(g.id)}">${esc(g.title)}</a>`).join("")}</div></div>` : ""}

  <section id="games"><div class="wrap">
    <div class="sec-head reveal">
      <div class="sec-tag">Select your engine</div>
      <h2 class="sec-title">My <em>Games</em></h2>
      <p class="sec-sub">Pick an engine, filter by platform, hover a card to watch the trailer.</p>
    </div>
    <div class="reveal">
      <div class="tabs" id="engine-tabs">
        <span class="tab-pill"></span>
        <button class="tab active" data-engine="all">All<span class="count">${GAMES.length}</span></button>
        ${ENGINES.map((e) => `<button class="tab" data-engine="${esc(e.id)}">${esc(e.name)}<span class="count">${engineCounts[e.id]}</span></button>`).join("")}
      </div>
      <div class="filters" id="platform-filters">
        <span class="lbl">PLATFORM:</span>
        <button class="filter on" data-platform="all">All</button>
        ${Object.entries(PLATFORMS).filter(([k]) => GAMES.some((g) => g.platforms.includes(k))).map(([k, p]) => `<button class="filter" data-platform="${esc(k)}">${esc(p.name)}</button>`).join("")}
      </div>
    </div>
    <div class="grid" id="game-grid"></div>
  </div></section>

  <section id="genres"><div class="wrap">
    <div class="sec-head reveal">
      <div class="sec-tag">Level select</div>
      <h2 class="sec-title">Browse by <em>Genre</em></h2>
      <p class="sec-sub">Each genre is a level. Pick one to see every game I've made in it.</p>
    </div>
    <div class="levels">${GENRES.map((ge, i) => {
      const n = GAMES.filter((g) => g.genres.includes(ge.id)).length;
      const stars = Math.min(3, n);
      return `<a class="level reveal ${n ? "" : "locked"}" href="genre.html?g=${esc(ge.id)}" style="transition-delay:${(i % 4) * 60}ms">
        <div class="lvl-no">WORLD ${String(i + 1).padStart(2, "0")}</div>
        <h3>${esc(ge.name)}</h3><p>${esc(ge.blurb)}</p>
        <div class="lvl-foot"><span class="stars">${"★".repeat(stars)}<span class="off">${"★".repeat(3 - stars)}</span></span><span>${n} game${n === 1 ? "" : "s"} <span class="go">▶</span></span></div>
      </a>`;
    }).join("")}</div>
  </div></section>

  <section id="experience"><div class="wrap">
    <div class="sec-head reveal">
      <div class="sec-tag">Quest log</div>
      <h2 class="sec-title">Experience &amp; <em>Qualifications</em></h2>
    </div>
    <div class="two-col">
      <div class="quests">${EXPERIENCE.map((q, i) => `
        <div class="quest reveal ${i === 0 ? "current" : ""}">
          <div class="quest-head"><h3>${esc(q.role)}</h3><span class="q-state">${i === 0 ? "ACTIVE QUEST" : "COMPLETED"}</span></div>
          <div class="quest-head"><span class="q-company">${esc(q.company)}</span><span class="q-period">${esc(q.period)}</span></div>
          <ul>${q.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
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
      <div class="sec-tag">Inventory</div>
      <h2 class="sec-title">Skills &amp; <em>Loadout</em></h2>
    </div>
    ${SKILLS.map((s) => `<div class="inv-group reveal"><h4>${esc(s.group)}</h4><div class="slots">${s.items.map((it) => `<span class="slot">${esc(it)}</span>`).join("")}</div></div>`).join("")}
  </div></section>

  <section id="contact"><div class="wrap">
    <div class="contact-box reveal">
      <div class="sec-tag">Player 2 has entered</div>
      <h2>Let's build your next <span class="glitch" data-text="game" style="color:var(--green)">game</span>.</h2>
      <p class="sub">${esc(P.contactNote || "")}</p>
      <a class="btn solid" href="mailto:${esc(P.email)}"><span class="key">START</span> ${esc(P.email)}</a>
      <div class="socials">${P.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join("")}</div>
    </div>
  </div></section>`;

  // typer
  typer($("#typer"), P.taglines);

  // player card bars + tilt
  tilt($("#player-card"), 12);
  setTimeout(() => $$(".player-card .bar i").forEach((b) => (b.style.width = b.dataset.w + "%")), 600);

  // counters when visible
  const cObs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { countUp(e.target); cObs.unobserve(e.target); } }));
  $$(".count-up").forEach((el) => cObs.observe(el));

  // tabs + filters
  let engine = "all", platform = "all";
  const grid = $("#game-grid"), tabs = $("#engine-tabs"), pill = $(".tab-pill", tabs);
  const filtered = () => GAMES.filter((g) => (engine === "all" || g.engine === engine) && (platform === "all" || g.platforms.includes(platform)));
  const movePill = () => { const a = $(".tab.active", tabs); pill.style.left = a.offsetLeft + "px"; pill.style.width = a.offsetWidth + "px"; };
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
  unlock("explorer", "Explorer: entered a new world");

  main.innerHTML = `
  <div class="wrap page-head">
    <div class="crumbs"><a href="index.html">Home</a> / <a href="index.html#genres">Genres</a> / ${esc(ge.name)}</div>
    <div class="sec-tag">World ${String(GENRES.indexOf(ge) + 1).padStart(2, "0")}</div>
    <h1 class="sec-title"><span class="glitch" data-text="${esc(ge.name)}">${esc(ge.name)}</span> <em>Games</em></h1>
    <p class="sec-sub">${esc(ge.blurb)} · ${list.length} game${list.length === 1 ? "" : "s"}</p>
    ${engines.length > 1 ? `<div class="filters" id="genre-engine"><span class="lbl">ENGINE:</span><button class="filter on" data-e="all">All</button>${engines.map((e) => `<button class="filter" data-e="${esc(e.id)}">${esc(e.name)}</button>`).join("")}</div>` : ""}
  </div>
  <div class="wrap"><div class="grid" id="game-grid"></div></div>
  <section><div class="wrap">
    <div class="sec-tag">Warp to another world</div>
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
        <h1 class="glitch" data-text="${esc(g.title)}">${esc(g.title)}</h1>
        <p style="color:var(--muted);margin:8px 0 14px">${esc(g.short || "")}</p>
        <div class="info-row"><span>Engine</span><span>${esc(engineName(g.engine))}</span></div>
        ${g.role ? `<div class="info-row"><span>My role</span><span>${esc(g.role)}</span></div>` : ""}
        ${g.year ? `<div class="info-row"><span>Year</span><span>${esc(g.year)}</span></div>` : ""}
        <div class="info-row"><span>Platforms</span><span>${platformBadges(g)}</span></div>
        <div class="info-row"><span>Genres</span><span>${genreChips(g)}</span></div>
        <div class="links">
          ${g.webgl ? `<a class="btn solid" href="play.html?id=${esc(g.id)}"><span>▶ Play in browser</span><span class="key">A</span></a>` : ""}
          ${(g.links || []).map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener"><span>${esc(l.label)}</span><span>↗</span></a>`).join("")}
        </div>
      </aside>
    </div>
  </div>

  <section style="padding-top:30px"><div class="wrap">
    <div class="sec-tag reveal">Mission briefing</div>
    <div class="desc reveal" style="margin-top:14px">${esc(g.description || "").split(/\n+/).map((p) => `<p>${p}</p>`).join("")}</div>
  </div></section>

  ${g.screenshots && g.screenshots.length ? `
  <section style="padding-top:30px"><div class="wrap">
    <div class="sec-tag reveal" style="margin-bottom:16px">Screenshots</div>
    <div class="shots">${g.screenshots.map((s, i) => `<button class="shot reveal" data-src="${esc(s)}" style="transition-delay:${i * 60}ms"><img src="${esc(s)}" alt="${esc(g.title)} screenshot ${i + 1}" loading="lazy"></button>`).join("")}</div>
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
    <p style="font-size:13px;color:var(--muted);margin-top:12px">Tip: click inside the game to give it keyboard focus. Best on desktop.</p>
  </div>`;
  $("#fs").addEventListener("click", () => { const f = $("#frame"); (f.requestFullscreen || f.webkitRequestFullscreen).call(f); });
  unlock("player2", "Ready Player: launched a browser build");
}

function notFound(msg) {
  return `<div class="wrap page-head" style="text-align:center;padding:120px 20px">
    <div class="sec-tag">Error 404</div>
    <h1 class="sec-title"><span class="glitch" data-text="GAME OVER">GAME OVER</span></h1>
    <p class="sec-sub" style="margin:14px auto 28px">${esc(msg)}.</p>
    <a class="btn solid" href="index.html"><span class="key">A</span> Continue</a></div>`;
}

/* =====================================================================
   Boot everything
   ===================================================================== */
(async function init() {
  buildShell();
  const page = document.body.dataset.page;
  ({ home: pageHome, genre: pageGenre, game: pageGame, play: pagePlay, notfound: () => ($("#app").innerHTML = notFound("This page doesn't exist")) }[page] || pageHome)();
  modalEvents(); transitions(); cursor(); xpBar(); glitchLoop(); konami();
  reveal();
  await boot();
  if (page === "home") setTimeout(() => unlock("welcome", "Welcome, Player One"), 900);
})();
