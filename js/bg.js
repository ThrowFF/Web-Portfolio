/* Animated background: particle network + mouse field + click shockwaves.
   Wherever text sits on top, the web fades out so it never competes with what you're reading. */
(() => {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W, H, nodes = [], packets = [], waves = [], textRects = [];
  const mouse = { x: -9999, y: -9999 };
  const LINK = 140;
  const SLATE = "148,160,184", ACCENT = "224,179,108"; // match --accent in style.css

  // Free-standing text. Text inside these opaque panels is already shielded by the panel itself.
  const TEXT = "h1,h2,h3,h4,p,li,.sec-tag,.typer,.crumbs,.stat,.hero-status,.btn,.filter,.socials a";
  const SHIELDED = ".card,.quest,.level,.info-panel,.contact-box,.tabs,.marquee,.nav,.modal,.wipe,.toast";
  const FEATHER = [22, 15, 8, 2]; // padding per mask layer (px), soft outer edge to solid core

  function resize() {
    W = canvas.width = innerWidth * DPR;
    H = canvas.height = innerHeight * DPR;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    const count = Math.min(110, Math.floor((innerWidth * innerHeight) / 14000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35 * DPR,
      vy: (Math.random() - 0.5) * 0.35 * DPR,
      r: (Math.random() * 1.4 + 0.6) * DPR,
      p: Math.random() * Math.PI * 2,
    }));
    measure();
  }

  // Tight boxes around the text itself (not the whole block), in page coordinates so scrolling needs no re-measure
  function measure() {
    const range = document.createRange(), sx = scrollX, sy = scrollY;
    textRects = [];
    for (const el of document.querySelectorAll(TEXT)) {
      if (el.closest(SHIELDED)) continue;
      range.selectNodeContents(el);
      const b = range.getBoundingClientRect();
      if (b.width && b.height) textRects.push([b.left + sx, b.top + sy, b.width, b.height]);
    }
    if (reduce) draw();
  }

  addEventListener("resize", resize);
  addEventListener("load", measure);
  if (document.fonts) document.fonts.ready.then(measure);
  setInterval(measure, 700); // catches reveals, typing, cards spawning and filtering
  if (reduce) addEventListener("scroll", () => requestAnimationFrame(draw), { passive: true });
  addEventListener("mousemove", (e) => { mouse.x = e.clientX * DPR; mouse.y = e.clientY * DPR; });
  addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });
  addEventListener("pointerdown", (e) => {
    waves.push({ x: e.clientX * DPR, y: e.clientY * DPR, r: 0, a: 1 });
  });

  function spawnPacket() {
    if (nodes.length < 2) return;
    const a = nodes[(Math.random() * nodes.length) | 0];
    let best = null, bd = Infinity;
    for (const b of nodes) {
      if (b === a) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < LINK * DPR && d < bd) { bd = d; best = b; }
    }
    if (best) packets.push({ a, b: best, t: 0 });
  }

  function update() {
    for (const n of nodes) {
      // mouse: gentle attraction inside radius, push away very close
      const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
      if (d < 220 * DPR && d > 0) {
        const f = d < 60 * DPR ? -0.6 : 0.02;
        n.vx += (dx / d) * f; n.vy += (dy / d) * f;
      }
      // shockwave push
      for (const w of waves) {
        const wx = n.x - w.x, wy = n.y - w.y, wd = Math.hypot(wx, wy);
        if (Math.abs(wd - w.r) < 30 * DPR && wd > 0) { n.vx += (wx / wd) * 1.5 * w.a; n.vy += (wy / wd) * 1.5 * w.a; }
      }
      n.vx *= 0.97; n.vy *= 0.97;
      // keep a minimum drift
      if (Math.abs(n.vx) < 0.05) n.vx += (Math.random() - 0.5) * 0.05;
      if (Math.abs(n.vy) < 0.05) n.vy += (Math.random() - 0.5) * 0.05;
      n.x += n.vx; n.y += n.vy; n.p += 0.03;
      if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
      if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
    }
    if (Math.random() < 0.08) spawnPacket();
    packets = packets.filter((p) => p.t <= 1);
    for (const p of packets) p.t += 0.025;
    waves = waves.filter((w) => w.a > 0.02);
    for (const w of waves) { w.r += 9 * DPR; w.a *= 0.94; }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const L = LINK * DPR;

    // links: cool slate, warming to the accent around the pointer
    ctx.lineWidth = DPR * 0.8;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const near = Math.hypot(mouse.x - a.x, mouse.y - a.y) < 200 * DPR;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        if (Math.abs(dx) > L || Math.abs(dy) > L) continue;
        const d = Math.hypot(dx, dy);
        if (d < L) {
          ctx.strokeStyle = near ? `rgba(${ACCENT},${(1 - d / L) * 0.35})` : `rgba(${SLATE},${(1 - d / L) * 0.18})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    // nodes
    for (const n of nodes) {
      ctx.fillStyle = `rgba(${SLATE},${0.35 + Math.sin(n.p) * 0.15})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }

    // data packets travelling along links
    ctx.fillStyle = `rgba(${ACCENT},.85)`;
    ctx.shadowColor = `rgba(${ACCENT},.8)`; ctx.shadowBlur = 6 * DPR;
    for (const p of packets) {
      const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.fillRect(x - 1.25 * DPR, y - 1.25 * DPR, 2.5 * DPR, 2.5 * DPR);
    }
    ctx.shadowBlur = 0;

    // shockwaves
    ctx.lineWidth = 1.5 * DPR;
    for (const w of waves) {
      ctx.strokeStyle = `rgba(${ACCENT},${w.a * 0.35})`;
      ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2); ctx.stroke();
    }

    shieldText();
  }

  // Erase most of the web behind text: stacked, widening rounded boxes give a soft edge
  // (each layer removes 42% of what's left, so the core keeps only ~11% of the web)
  function shieldText() {
    if (!textRects.length) return;
    const ox = scrollX, oy = scrollY, vh = innerHeight;
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,.42)";
    for (const pad of FEATHER) {
      ctx.beginPath();
      for (const [x, y, w, h] of textRects) {
        const top = y - oy;
        if (top > vh + pad || top + h < -pad) continue;
        const rx = (x - ox - pad) * DPR, ry = (top - pad) * DPR, rw = (w + pad * 2) * DPR, rh = (h + pad * 2) * DPR;
        if (ctx.roundRect) ctx.roundRect(rx, ry, rw, rh, pad * DPR); else ctx.rect(rx, ry, rw, rh);
      }
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function tick() { update(); draw(); requestAnimationFrame(tick); }

  resize();
  reduce ? draw() : tick();
})();
