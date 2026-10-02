/* ==========================================================================
   Roam — interactions
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ------------------------------------------------------------------
     Illustrated scenes (SVG) — one generator per landscape type
     ------------------------------------------------------------------ */
  let uid = 0;
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  const ridge = (rand, { y, amp, steps, jag = 1 }) => {
    let d = `M0 400 L0 ${y}`;
    for (let i = 1; i <= steps; i++) {
      const x = (400 / steps) * i;
      const peak = i % 2 ? -amp * (0.4 + rand() * 0.6) * jag : amp * rand() * 0.3;
      d += ` L${x.toFixed(1)} ${(y + peak).toFixed(1)}`;
    }
    return d + " L400 400 Z";
  };
  const wave = (y, amp, freq, phase = 0) => {
    let d = `M0 400 L0 ${y}`;
    for (let x = 0; x <= 400; x += 10) d += ` L${x} ${(y + Math.sin(x / freq + phase) * amp).toFixed(1)}`;
    return d + " L400 400 Z";
  };
  const grad = (id, stops, vertical = true) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops
      .map((c, i) => `<stop offset="${(i / (stops.length - 1)) * 100}%" stop-color="${c}"/>`)
      .join("")}</linearGradient>`;
  const stars = (rand, n, maxY) =>
    Array.from({ length: n }, () => `<circle cx="${(rand() * 400).toFixed(1)}" cy="${(rand() * maxY).toFixed(1)}" r="${(rand() * 1.2 + 0.3).toFixed(2)}" fill="#fff" opacity="${(rand() * 0.7 + 0.2).toFixed(2)}"/>`).join("");
  const layer = (depth, inner) => `<g class="layer" style="--depth:${depth}">${inner}</g>`;

  const scenes = {
    aurora(p = {}) {
      const id = `s${uid++}`, r = rng(p.seed || 7);
      const sky = p.sky || ["#04141c", "#0b2a3a", "#123c4a"];
      return {
        defs: grad(`${id}sky`, sky) + `<filter id="${id}b"><feGaussianBlur stdDeviation="9"/></filter>` +
          grad(`${id}au`, p.aurora || ["#3cf2b0", "#2bb6c9", "rgba(120,90,220,0)"]),
        body:
          `<rect width="400" height="400" fill="url(#${id}sky)"/>` + stars(r, 70, 220) +
          layer(-6, `<g filter="url(#${id}b)" opacity=".85"><path d="M-20 170 C 80 60, 160 200, 240 90 S 380 60, 430 120 L430 190 C 360 140, 300 230, 220 170 S 60 160, -20 240 Z" fill="url(#${id}au)"/><path d="M40 120 C 140 40, 220 130, 300 60 S 400 40, 440 70 L440 100 C 380 80, 320 150, 240 110 S 100 90, 40 160 Z" fill="url(#${id}au)" opacity=".6"/></g>`) +
          layer(4, `<path d="${ridge(r, { y: 270, amp: 90, steps: 9 })}" fill="#0d2430"/>`) +
          layer(8, `<path d="${ridge(r, { y: 300, amp: 50, steps: 13 })}" fill="#081820"/><rect y="320" width="400" height="80" fill="#06131a"/><path d="M0 320 H400" stroke="#3cf2b0" stroke-opacity=".25"/>`) +
          layer(12, `<path d="M0 360 C 120 345, 280 375, 400 352 L400 400 L0 400Z" fill="#040d12"/>`),
      };
    },
    peaks(p = {}) {
      const id = `s${uid++}`, r = rng(p.seed || 3);
      const sky = p.sky || ["#2a1b3d", "#7a3e5a", "#e58a5a", "#f6c27a"];
      const towers = `M70 400 L95 210 L110 150 L122 205 L140 120 L152 90 L166 128 L180 200 L200 140 L214 110 L230 170 L250 400 Z`;
      return {
        defs: grad(`${id}sky`, sky) + grad(`${id}rock`, p.rock || ["#3a2a3e", "#1b1420"]),
        body:
          `<rect width="400" height="400" fill="url(#${id}sky)"/>` +
          layer(-4, `<circle cx="300" cy="230" r="46" fill="#ffd9a0" opacity=".9"/>`) +
          layer(2, `<path d="${ridge(r, { y: 280, amp: 70, steps: 11 })}" fill="#8a4a5c" opacity=".55"/>`) +
          layer(6, `<path d="${towers}" fill="url(#${id}rock)" transform="translate(${p.shift || 40} 0)"/><path d="M143 112 L152 90 L161 114 L156 110 L152 116 L148 109Z M206 128 L214 110 L222 130 L218 126 L214 131 L210 125Z M134 140 L140 120 L146 138 L140 134Z" fill="#f3d9c4" opacity=".6" transform="translate(${p.shift || 40} 0)"/>`) +
          layer(10, `<path d="${ridge(r, { y: 330, amp: 40, steps: 8 })}" fill="#1a1220"/>`) +
          layer(14, `<path d="M0 370 C 100 350, 300 390, 400 360 L400 400 L0 400Z" fill="#0d0a10"/>`),
      };
    },
    kyoto(p = {}) {
      const id = `s${uid++}`, r = rng(p.seed || 11);
      const pagoda = (x, y, s) => {
        let g = "";
        for (let i = 0; i < 5; i++) {
          const w = (60 - i * 9) * s, yy = y - i * 26 * s;
          g += `<path d="M${x - w} ${yy} Q ${x} ${yy - 12 * s} ${x + w} ${yy} L${x + w * 0.7} ${yy - 8 * s} L${x - w * 0.7} ${yy - 8 * s}Z" fill="#160d1c"/><rect x="${x - w * 0.5}" y="${yy}" width="${w}" height="${18 * s}" fill="#160d1c"/>`;
        }
        return g + `<rect x="${x - 1.5 * s}" y="${y - 175 * s}" width="${3 * s}" height="${50 * s}" fill="#160d1c"/>`;
      };
      const lanterns = Array.from({ length: 14 }, (_, i) => {
        const x = 20 + i * 27 + r() * 8, y = 330 + Math.sin(i) * 6;
        return `<circle cx="${x}" cy="${y}" r="9" fill="#ff9a4d" opacity=".25"/><circle cx="${x}" cy="${y}" r="3.5" fill="#ffc27a"/>`;
      }).join("");
      return {
        defs: grad(`${id}sky`, p.sky || ["#1d1530", "#5b2f55", "#d3647a", "#f4a78a"]),
        body:
          `<rect width="400" height="400" fill="url(#${id}sky)"/>` + stars(r, 20, 120) +
          layer(-4, `<circle cx="110" cy="120" r="34" fill="#ffe6d0" opacity=".92"/>`) +
          layer(2, `<path d="${wave(270, 18, 50)}" fill="#3a2040" opacity=".8"/>`) +
          layer(6, pagoda(270, 315, 1)) +
          layer(9, `<path d="${wave(320, 8, 30, 2)}" fill="#120a16"/>`) +
          layer(12, lanterns),
      };
    },
    coast(p = {}) {
      const id = `s${uid++}`, r = rng(p.seed || 5);
      const houses = Array.from({ length: 22 }, () => {
        const x = 20 + r() * 150, y = 210 + r() * 90;
        return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(6 + r() * 7).toFixed(1)}" height="${(5 + r() * 6).toFixed(1)}" fill="${["#f2d4b0", "#e9a77b", "#f6e7cf", "#d98b6a"][Math.floor(r() * 4)]}"/>`;
      }).join("");
      const glints = Array.from({ length: 16 }, (_, i) => `<rect x="${270 + (r() - 0.5) * 60}" y="${262 + i * 8}" width="${30 - i * 1.4}" height="1.6" rx="1" fill="#ffd9a0" opacity="${0.8 - i * 0.04}"/>`).join("");
      return {
        defs: grad(`${id}sky`, p.sky || ["#2b2550", "#a24f6b", "#f08a5d", "#ffd08a"]) + grad(`${id}sea`, p.sea || ["#3b3a6e", "#151832"]),
        body:
          `<rect width="400" height="400" fill="url(#${id}sky)"/>` +
          layer(-5, `<circle cx="282" cy="240" r="38" fill="#ffe0a8"/>`) +
          layer(3, `<rect y="255" width="400" height="145" fill="url(#${id}sea)"/>` + glints) +
          layer(7, `<path d="M0 400 L0 180 C 40 170, 70 200, 110 190 C 150 180, 170 230, 200 260 L210 300 C 190 340, 120 380, 0 400Z" fill="#2a1a2a"/>` + houses) +
          layer(12, `<path d="M300 352 l30 0 l-6 8 l-20 0z M314 352 v-24 l12 22z" fill="#0f0d18"/>`),
      };
    },
    dunes(p = {}) {
      const id = `s${uid++}`, r = rng(p.seed || 9);
      return {
        defs: grad(`${id}sky`, p.sky || ["#0d1230", "#2d2a5a", "#8a5a7a", "#e9a77b"]) +
          grad(`${id}d1`, ["#d98b4a", "#8a4a2a"]) + grad(`${id}d2`, ["#b5622f", "#4d2414"]) + grad(`${id}d3`, ["#7a3a1d", "#24100a"]),
        body:
          `<rect width="400" height="400" fill="url(#${id}sky)"/>` + stars(r, 60, 180) +
          layer(-5, `<circle cx="290" cy="110" r="28" fill="#fff1d8"/><circle cx="290" cy="110" r="50" fill="#fff1d8" opacity=".08"/>`) +
          layer(3, `<path d="M0 280 C 80 220, 160 230, 230 270 S 360 250, 400 230 L400 400 L0 400Z" fill="url(#${id}d1)"/>`) +
          layer(7, `<path d="M0 320 C 120 260, 220 300, 300 290 S 380 300, 400 300 L400 400 L0 400Z" fill="url(#${id}d2)"/><g fill="#1a0c06"><ellipse cx="120" cy="296" rx="12" ry="5"/><path d="M110 296 q4 -14 10 -6 q6 -12 10 0 l0 4z"/></g>`) +
          layer(12, `<path d="M0 360 C 100 330, 250 380, 400 340 L400 400 L0 400Z" fill="url(#${id}d3)"/>`),
      };
    },
    jungle(p = {}) {
      const id = `s${uid++}`, r = rng(p.seed || 13);
      const palm = (x, y, s) => {
        let g = `<path d="M${x} ${y} q ${6 * s} ${-60 * s} ${-4 * s} ${-120 * s}" stroke="#08140f" stroke-width="${4 * s}" fill="none"/>`;
        const tx = x - 4 * s, ty = y - 120 * s;
        for (let a = 0; a < 7; a++) {
          const ang = (a / 7) * Math.PI * 2, ex = tx + Math.cos(ang) * 46 * s, ey = ty + Math.sin(ang) * 22 * s + 14 * s;
          g += `<path d="M${tx} ${ty} Q ${(tx + ex) / 2} ${ty - 18 * s} ${ex} ${ey}" stroke="#08140f" stroke-width="${5 * s}" fill="none" stroke-linecap="round"/>`;
        }
        return g;
      };
      const terraces = Array.from({ length: 6 }, (_, i) => `<path d="M0 ${250 + i * 22} C 100 ${235 + i * 22 + r() * 10}, 260 ${265 + i * 22}, 400 ${245 + i * 22} L400 ${262 + i * 22} C 260 ${282 + i * 22}, 100 ${252 + i * 22}, 0 ${268 + i * 22}Z" fill="${i % 2 ? "#2f6b48" : "#3f8a5a"}" opacity="${0.55 + i * 0.07}"/>`).join("");
      return {
        defs: grad(`${id}sky`, p.sky || ["#123328", "#3d7a5c", "#d6c98a", "#f3d79a"]),
        body:
          `<rect width="400" height="400" fill="url(#${id}sky)"/>` +
          layer(-5, `<circle cx="200" cy="190" r="40" fill="#fff0bf" opacity=".9"/>`) +
          layer(2, `<path d="${ridge(r, { y: 230, amp: 50, steps: 6 })}" fill="#24553f" opacity=".7"/>`) +
          layer(6, `<rect y="250" width="400" height="150" fill="#1d4a34"/>` + terraces) +
          layer(12, palm(330, 400, 1.3) + palm(60, 400, 1)),
      };
    },
  };
  // Palette variants used in the journeys row
  const variants = {
    peaks2: () => scenes.peaks({ seed: 21, shift: 90, sky: ["#0f1a33", "#2f4a7a", "#88a5c9", "#e5ddd0"], rock: ["#2c3550", "#121827"] }),
    coast2: () => scenes.coast({ seed: 33, sky: ["#0e2a3a", "#2f6a7a", "#9fd0c9", "#f4e3c0"], sea: ["#1f5866", "#0a1e26"] }),
    dunes2: () => scenes.dunes({ seed: 41, sky: ["#050816", "#141a3a", "#3a2a5a", "#7a4a6a"] }),
    aurora2: () => scenes.aurora({ seed: 51, sky: ["#0a0820", "#1d1640", "#2a1f50"], aurora: ["#b07cff", "#4fd6e0", "rgba(60,240,180,0)"] }),
  };

  const renderScene = (el, name) => {
    const make = scenes[name] || variants[name];
    if (!make) return;
    const { defs, body } = make();
    el.innerHTML = `<svg class="scene" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
  };
  $$("[data-scene]").forEach((el) => {
    const target = el.classList.contains("dest") ? $(".dest__art", el) : el;
    renderScene(target, el.dataset.scene);
  });

  /* ------------------------------------------------------------------
     Split headings into animated lines
     ------------------------------------------------------------------ */
  $$("[data-split]").forEach((el) => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((html, i) => `<span class="line"><span style="--i:${i}">${html.trim()}</span></span>`).join("");
  });

  /* ------------------------------------------------------------------
     Preloader
     ------------------------------------------------------------------ */
  const countEl = $("[data-loader-count]");
  const startReveal = () => {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-loaded");
    // Reveal hero content once the curtain lifts
    setTimeout(() => $$(".hero [data-reveal], .hero [data-split]").forEach((el) => el.classList.add("is-in")), reduceMotion ? 0 : 350);
  };
  if (reduceMotion) {
    startReveal();
  } else {
    let n = 0;
    const tick = () => {
      n = Math.min(100, n + Math.ceil((100 - n) / 9));
      countEl.textContent = n;
      if (n < 100) setTimeout(tick, 40);
      else setTimeout(startReveal, 220);
    };
    // Wait for fonts so headings don't shift as they animate
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(tick);
    setTimeout(() => n < 100 && (n = 99, tick()), 3500); // safety net
  }

  /* ------------------------------------------------------------------
     Scroll reveals
     ------------------------------------------------------------------ */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }),
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );
  $$("[data-reveal], [data-split]").forEach((el) => { if (!el.closest(".hero")) io.observe(el); });

  /* ------------------------------------------------------------------
     Nav: hide on scroll down, show on scroll up, highlight section
     ------------------------------------------------------------------ */
  const nav = $("[data-nav]");
  const progress = $(".progress span");
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    if (!document.body.classList.contains("menu-open")) nav.classList.toggle("is-hidden", y > lastY && y > 400);
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty("--p", max > 0 ? y / max : 0);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = $$(".nav__links a");
  const sectionIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
    }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  ["destinations", "journeys", "how", "stories", "contact"].forEach((id) => { const s = document.getElementById(id); s && sectionIO.observe(s); });

  /* Mobile menu */
  const toggle = $("[data-menu-toggle]");
  const menu = $("[data-menu]");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", !open);
    if (open) nav.classList.remove("is-hidden");
  };
  toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* ------------------------------------------------------------------
     Custom cursor + magnetic buttons
     ------------------------------------------------------------------ */
  if (finePointer && !reduceMotion) {
    document.body.classList.add("has-cursor");
    const cursor = $(".cursor"), label = $(".cursor__label");
    let mx = -100, my = -100, rx = -100, ry = -100;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; cursor.classList.remove("is-hidden"); }, { passive: true });
    document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
    const loop = () => {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      cursor.style.cssText = `--x:${mx}px;--y:${my}px;--rx:${rx}px;--ry:${ry}px`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("a, button, [data-cursor], label, select");
      const text = t && t.dataset.cursor;
      cursor.classList.toggle("is-hover", !!t && !text);
      cursor.classList.toggle("is-label", !!text);
      if (text) label.textContent = text;
    });

    $$("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty("--mx", `${(e.clientX - r.left - r.width / 2) * 0.25}px`);
        btn.style.setProperty("--my", `${(e.clientY - r.top - r.height / 2) * 0.35}px`);
      });
      btn.addEventListener("mouseleave", () => { btn.style.setProperty("--mx", "0px"); btn.style.setProperty("--my", "0px"); });
    });

    /* Hero parallax: the traveler leans toward the pointer */
    const hero = $("[data-hero]"), fig = $("[data-tilt-hero]");
    hero.addEventListener("mousemove", (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      fig.style.setProperty("--hx", `${nx * 24}px`);
      fig.style.setProperty("--hy", `${ny * 18}px`);
      fig.style.setProperty("--hr", `${nx * 4}deg`);
    });

    /* Destination cards: 3D tilt + layered parallax */
    $$(".dest").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--ry", `${px * 8}deg`);
        card.style.setProperty("--rx", `${-py * 8}deg`);
        card.style.setProperty("--px", px * 2);
        card.style.setProperty("--py", py * 2);
      });
      card.addEventListener("mouseleave", () => ["--rx", "--ry", "--px", "--py"].forEach((p) => card.style.removeProperty(p)));
    });
  }

  /* ------------------------------------------------------------------
     Starfield in hero
     ------------------------------------------------------------------ */
  const canvas = $("[data-stars]");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, pts = [], running = true;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = Array.from({ length: Math.round((w * h) / 9000) }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.1 + 0.2,
        s: Math.random() * 0.25 + 0.05, t: Math.random() * Math.PI * 2,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        if (!reduceMotion) { p.t += 0.02; p.x -= p.s; if (p.x < 0) p.x = w; }
        ctx.globalAlpha = 0.35 + Math.sin(p.t) * 0.3;
        ctx.fillStyle = "#f2efe9";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (running && !reduceMotion) requestAnimationFrame(draw);
    };
    resize(); draw();
    addEventListener("resize", resize);
    new IntersectionObserver(([e]) => {
      const was = running; running = e.isIntersecting;
      if (running && !was) draw();
    }).observe(canvas);
  }

  /* ------------------------------------------------------------------
     Destination filters
     ------------------------------------------------------------------ */
  const filters = $$(".filter");
  const cards = $$(".dest");
  cards.forEach((c) => c.addEventListener("transitionend", (e) => {
    if (e.propertyName === "opacity" && c.classList.contains("is-in")) c.classList.add("is-settled");
  }));
  filters.forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filters.forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", b === btn); });
    cards.forEach((c, i) => {
      const show = f === "all" || c.dataset.cat === f;
      c.classList.toggle("is-filtered", !show);
      if (show) {
        c.classList.remove("is-in", "is-settled");
        c.style.setProperty("--d", `${(i % 3) * 0.06}s`);
        requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add("is-in")));
      }
    });
  }));

  /* ------------------------------------------------------------------
     Pinned horizontal scroll for journeys (desktop)
     ------------------------------------------------------------------ */
  const hs = $("[data-hscroll]"), track = $("[data-hscroll-track]");
  const desktop = matchMedia("(min-width: 901px)");
  const sizeHS = () => {
    if (!desktop.matches) { hs.style.height = ""; track.style.transform = ""; return; }
    const dist = track.scrollWidth - innerWidth;
    hs.style.height = `${innerHeight + Math.max(0, dist)}px`;
  };
  let hx = 0, htarget = 0;
  const updateHS = () => {
    if (!desktop.matches) return;
    const r = hs.getBoundingClientRect();
    const dist = track.scrollWidth - innerWidth;
    htarget = clamp(-r.top / (hs.offsetHeight - innerHeight || 1), 0, 1) * dist;
  };
  const hsLoop = () => {
    hx = reduceMotion ? htarget : lerp(hx, htarget, 0.12);
    if (desktop.matches) track.style.transform = `translate3d(${-hx.toFixed(2)}px,0,0)`;
    requestAnimationFrame(hsLoop);
  };
  sizeHS(); updateHS(); hsLoop();
  addEventListener("scroll", updateHS, { passive: true });
  addEventListener("resize", () => { sizeHS(); updateHS(); });
  desktop.addEventListener("change", () => { sizeHS(); updateHS(); });

  /* ------------------------------------------------------------------
     Steps line draws as you scroll
     ------------------------------------------------------------------ */
  const steps = $("[data-steps]");
  const drawSteps = () => {
    const r = steps.getBoundingClientRect();
    const v = clamp((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.3), 0, 1);
    steps.style.setProperty("--draw", v.toFixed(3));
  };
  addEventListener("scroll", drawSteps, { passive: true });
  drawSteps();

  /* ------------------------------------------------------------------
     Count-up stats
     ------------------------------------------------------------------ */
  const countIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const el = e.target, end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || "";
    const fmt = (v) => v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    if (reduceMotion) { el.textContent = fmt(end); return; }
    const t0 = performance.now(), dur = 1800;
    const step = (t) => {
      const k = clamp((t - t0) / dur, 0, 1), eased = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(end * eased);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ------------------------------------------------------------------
     Testimonials carousel
     ------------------------------------------------------------------ */
  const quotes = $$(".quote"), dots = $$("[data-quotes-nav] button");
  let qi = 0, qTimer;
  const showQuote = (i) => {
    qi = (i + quotes.length) % quotes.length;
    quotes.forEach((q, k) => q.classList.toggle("is-active", k === qi));
    dots.forEach((d, k) => { d.classList.toggle("is-active", k === qi); d.setAttribute("aria-current", k === qi); });
  };
  const autoQuote = () => { clearInterval(qTimer); if (!reduceMotion) qTimer = setInterval(() => showQuote(qi + 1), 6500); };
  dots.forEach((d, k) => d.addEventListener("click", () => { showQuote(k); autoQuote(); }));
  autoQuote();

  /* ------------------------------------------------------------------
     Forms
     ------------------------------------------------------------------ */
  const destInput = $("[data-dest-input]"), datesInput = $("[data-dates-input]");
  const goContact = () => document.getElementById("contact").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });

  // Hero planner pre-fills the contact form
  $("[data-planner]").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.where.value) destInput.value = f.where.value;
    if (f.when.value) {
      const [y, m] = f.when.value.split("-");
      datesInput.value = new Date(y, m - 1).toLocaleString("en-US", { month: "long", year: "numeric" });
    }
    const msg = $("textarea[name=message]");
    if (!msg.value) msg.value = `Group of ${f.who.value}. `;
    goContact();
  });

  // Destination cards pre-fill the destination field
  $$("[data-dest]").forEach((a) => a.addEventListener("click", () => { destInput.value = a.dataset.dest; }));

  const form = $("[data-form]"), note = $("[data-form-note]");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    ["name", "email"].forEach((n) => {
      const input = form[n], field = input.closest(".field");
      const valid = input.value.trim() && input.checkValidity();
      field.classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      note.classList.remove("is-success");
      note.textContent = "Please add your name and a valid email.";
      form.querySelector(".is-invalid input").focus();
      return;
    }
    // Hook this up to your form backend (Formspree, Netlify Forms, etc.)
    form.classList.add("is-sent");
    note.classList.add("is-success");
    note.textContent = `Thank you, ${form.name.value.trim().split(" ")[0]}. A Roam planner will be in touch within one business day.`;
  });
  $$(".field input", form).forEach((i) => i.addEventListener("input", () => i.closest(".field").classList.remove("is-invalid")));

  $("[data-news]").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("input", e.target);
    input.value = "";
    input.placeholder = "You're on the list ✦";
  });

  $("[data-year]").textContent = new Date().getFullYear();
})();
