/* Animated background: particle network + mouse field + click shockwaves */
(() => {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W, H, nodes = [], packets = [], waves = [];
  const mouse = { x: -9999, y: -9999 };
  const LINK = 140;

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
      r: (Math.random() * 1.6 + 0.6) * DPR,
      p: Math.random() * Math.PI * 2,
    }));
  }

  addEventListener("resize", resize);
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

  function frame() {
    ctx.clearRect(0, 0, W, H);
    const L = LINK * DPR;

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

    // links
    ctx.lineWidth = DPR * 0.8;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        if (Math.abs(dx) > L || Math.abs(dy) > L) continue;
        const d = Math.hypot(dx, dy);
        if (d < L) {
          const near = Math.hypot(mouse.x - a.x, mouse.y - a.y) < 200 * DPR;
          ctx.strokeStyle = `rgba(57,255,136,${(1 - d / L) * (near ? 0.55 : 0.18)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    // nodes
    for (const n of nodes) {
      const glow = 0.5 + Math.sin(n.p) * 0.3;
      ctx.fillStyle = `rgba(120,255,170,${glow})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    }

    // data packets travelling along links
    if (Math.random() < 0.08) spawnPacket();
    packets = packets.filter((p) => p.t <= 1);
    for (const p of packets) {
      p.t += 0.025;
      const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.fillStyle = "#b6ff3b";
      ctx.shadowColor = "#b6ff3b"; ctx.shadowBlur = 10 * DPR;
      ctx.fillRect(x - 1.5 * DPR, y - 1.5 * DPR, 3 * DPR, 3 * DPR);
      ctx.shadowBlur = 0;
    }

    // shockwaves
    waves = waves.filter((w) => w.a > 0.02);
    for (const w of waves) {
      w.r += 9 * DPR; w.a *= 0.94;
      ctx.strokeStyle = `rgba(57,255,136,${w.a * 0.6})`;
      ctx.lineWidth = 2 * DPR;
      ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2); ctx.stroke();
    }

    if (!reduce) requestAnimationFrame(frame);
  }

  resize();
  frame();
})();
