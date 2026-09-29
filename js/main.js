/* ============================================================
   Yogisha Rani — portfolio
   Everything pixel-y is drawn from tiny string maps onto canvases
   and scaled up with image-rendering: pixelated. No libraries.
   ============================================================ */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------------- sprite data ---------------- */

  const PAL = {
    k: "#16121d", // outline
    o: "#382c3f", // hood / hoodie
    O: "#5c3242", // hood maroon mottling
    h: "#241e2c", // bangs
    H: "#3a3146", // bang highlight
    s: "#d9ab8a", // skin
    S: "#b88669", // skin shade
    e: "#1a1420", // eye
    w: "#f3ead6", // eye sparkle
    c: "#e39a9a", // blush
    m: "#121017", // mask
    M: "#221e29", // mask fold
    r: "#c0484f", // rune
    p: "#2c2d48", // trousers
    b: "#15121c", // shoes
  };

  // 16 x 22, three-quarter view facing right: a big chibi hood, sweeping bangs,
  // two separate eyes with a sparkle, and the black mask with the red rune.
  const HEAD = [
    "................",
    ".....kkkkkk.....",
    "...kkoooOookk...",
    "..kooOoooooOok..",
    ".kooOooooooooOk.",
    ".koohhhhhhhhhok.",
    ".kohHhhhhhhhsok.",
    ".kohhhhhhhsssok.",
    ".kohhhsssssssok.",
    ".kohsewssewssok.",
    ".kohseesseessok.",
    ".kooscsssscsok..",
    ".koommmmmmmmok..",
    "..kommmrmmMok...",
    "...kmmrmrmmk....",
  ];
  const BODY = [
    "...kooooooook...",
    "..koOoooooOook..",
    "..ksoooooooosk..",
    "...kooooooook...",
  ];
  const LEGS = {
    stand: [
      "...kppppppppk...",
      "....kppkkppk....",
      "....kbbk.kbbk...",
    ],
    strideA: [
      "...kppppppppk...",
      "...kppk..kppk...",
      "..kbbk....kbbbk.",
    ],
    strideB: [
      "...kppppppppk...",
      "....kppkkpk.....",
      "...kbbk..kbbk...",
    ],
  };
  // blink: the eye row with the sparkle turns to skin, leaving a closed-eye line
  const BLINK_ROW = ".kohsssssssssok.";

  const idle = [...HEAD, ...BODY, ...LEGS.stand];
  const FRAMES = {
    idle,
    blink: [...idle.slice(0, 9), BLINK_ROW, ...idle.slice(10)],
    walk: [
      [...HEAD, ...BODY, ...LEGS.strideA],
      [...HEAD, ...BODY, ...LEGS.strideB],
      [...HEAD, ...BODY, ...LEGS.strideA],
      [...HEAD, ...BODY, ...LEGS.stand],
    ],
  };

  // 12 x 12 front-facing portrait
  const FACE = [
    "...kkkkkk...",
    ".kkooOoookk.",
    "kooOooooOook",
    "kohhhhhhhhok",
    "kohHhhhhhsok",
    "kohhhhssssok",
    "kosewsswesok",
    "koseesseesok",
    "koscssssscok",
    "kommmmmmmmok",
    "kommmmrmmmok",
    "kommmrmrmmok",
  ];

  function drawMap(ctx, map, pal, { flip = false, ox = 0, oy = 0, scale = 1 } = {}) {
    const w = map[0].length;
    for (let y = 0; y < map.length; y++) {
      const row = map[y];
      for (let x = 0; x < row.length; x++) {
        const c = row[x];
        if (c === "." || c === " " || !pal[c]) continue;
        ctx.fillStyle = pal[c];
        const px = flip ? w - 1 - x : x;
        ctx.fillRect(ox + px * scale, oy + y * scale, scale, scale);
      }
    }
  }

  // portraits (nav + dialogue)
  $$('canvas[data-sprite="face"]').forEach((cv) => {
    const ctx = cv.getContext("2d");
    drawMap(ctx, FACE, PAL);
  });

  /* ---------------- pixel icons ---------------- */

  const ICONS = {
    heart: { pal: { r: "#d6a3b0", R: "#f0cfd6" }, map: [
      ".rr.rr..",
      "rRrrrrr.",
      "rrrrrrr.",
      "rrrrrrr.",
      ".rrrrr..",
      "..rrr...",
      "...r....",
      "........"] },
    star: { pal: { y: "#dcc58e", Y: "#f3e5bd" }, map: [
      "...y....",
      "...y....",
      "..yYy...",
      "yyyYyyy.",
      ".yyyyy..",
      "..yyy...",
      ".yy.yy..",
      ".y...y.."] },
    scroll: { pal: { c: "#a8906a", m: "#e7dcc0", b: "#8a7658" }, map: [
      "..cccccc",
      ".cmmmmmc",
      ".cmbbbmc",
      ".cmmmmmc",
      ".cmbbmmc",
      ".cmmmmmc",
      "cccccc..",
      "........"] },
    chest: { pal: { b: "#4a3527", B: "#7b5a3e", y: "#dcc58e" }, map: [
      "........",
      ".bbbbbb.",
      "bBBBBBBb",
      "bbbbbbbb",
      "bBByyBBb",
      "bBByyBBb",
      "bBBBBBBb",
      "bbbbbbbb"] },
    gem: { pal: { a: "#b7a6d9", A: "#e1d8f2" }, map: [
      "........",
      "..aaaa..",
      ".aAAaaa.",
      "aAaaaaaa",
      ".aaaaaa.",
      "..aaaa..",
      "...aa...",
      "........"] },
    key: { pal: { y: "#dcc58e" }, map: [
      "........",
      ".yyy....",
      "y...y...",
      "y...yyyy",
      "y...y.y.",
      ".yyy..y.",
      "........",
      "........"] },
    potion: { pal: { c: "#8a7658", w: "#cfd3e4", s: "#8fbdb3", S: "#c3e0d8" }, map: [
      "...cc...",
      "...ww...",
      "..w..w..",
      ".w....w.",
      ".wssssw.",
      ".wsSssw.",
      "..wwww..",
      "........"] },
    bolt: { pal: { y: "#dcc58e" }, map: [
      "....yy..",
      "...yy...",
      "..yy....",
      ".yyyyy..",
      "...yy...",
      "..yy....",
      ".yy.....",
      "........"] },
  };
  const iconCache = {};
  function iconURL(name) {
    if (iconCache[name]) return iconCache[name];
    const def = ICONS[name];
    if (!def) return "";
    const cv = document.createElement("canvas");
    cv.width = cv.height = 8;
    drawMap(cv.getContext("2d"), def.map, def.pal);
    return (iconCache[name] = cv.toDataURL());
  }
  $$("i[data-icon]").forEach((el) => {
    el.style.backgroundImage = `url(${iconURL(el.dataset.icon)})`;
    el.setAttribute("aria-hidden", "true");
  });

  /* ---------------- starry sky ---------------- */

  const sky = $("#sky");
  const sctx = sky.getContext("2d");
  const SKY_PX = 2; // one "pixel" = 2 css px
  const STAR_COLORS = ["#efe7cf", "#d4c9ea", "#e9d8a0", "#bcd6ce", "#e7c9d2"];
  let stars = [];
  let shooting = null;
  let nextShot = 4000;
  let skyW = 0, skyH = 0;

  function buildStars() {
    const dpr = 1; // pixel look: keep canvas at low res on purpose
    skyW = Math.ceil(innerWidth / SKY_PX);
    skyH = Math.ceil(innerHeight / SKY_PX);
    sky.width = skyW * dpr;
    sky.height = skyH * dpr;
    const count = Math.round((skyW * skyH) / 900);
    stars = Array.from({ length: count }, () => {
      const layer = Math.random() < 0.65 ? 0 : Math.random() < 0.75 ? 1 : 2;
      return {
        x: Math.random() * skyW,
        y: Math.random() * skyH,
        layer,
        c: STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0],
        base: 0.25 + Math.random() * 0.45 + layer * 0.12,
        amp: 0.15 + Math.random() * 0.25,
        sp: 0.4 + Math.random() * 1.2,
        ph: Math.random() * Math.PI * 2,
        big: layer === 2 && Math.random() < 0.5,
      };
    });
  }

  function drawSky(t) {
    sctx.clearRect(0, 0, skyW, skyH);
    const sy = scrollY / SKY_PX;
    const speeds = [0.04, 0.08, 0.14];
    for (const s of stars) {
      let y = (s.y - sy * speeds[s.layer]) % skyH;
      if (y < 0) y += skyH;
      const a = reduceMotion ? s.base : clamp(s.base + Math.sin(t * 0.001 * s.sp + s.ph) * s.amp, 0.05, 1);
      sctx.globalAlpha = a;
      sctx.fillStyle = s.c;
      const x = s.x | 0, yy = y | 0;
      if (s.big) {
        // soft plus-shaped star
        sctx.fillRect(x, yy, 1, 1);
        sctx.globalAlpha = a * 0.55;
        sctx.fillRect(x - 1, yy, 1, 1);
        sctx.fillRect(x + 1, yy, 1, 1);
        sctx.fillRect(x, yy - 1, 1, 1);
        sctx.fillRect(x, yy + 1, 1, 1);
      } else {
        sctx.fillRect(x, yy, 1, 1);
      }
    }
    // shooting star
    if (shooting) {
      const sh = shooting;
      sh.x += sh.vx; sh.y += sh.vy; sh.life -= 1;
      for (let i = 0; i < 14; i++) {
        sctx.globalAlpha = (1 - i / 14) * 0.7 * clamp(sh.life / 20, 0, 1);
        sctx.fillStyle = "#efe7cf";
        sctx.fillRect((sh.x - sh.vx * i * 0.6) | 0, (sh.y - sh.vy * i * 0.6) | 0, 1, 1);
      }
      if (sh.life <= 0 || sh.x < -20 || sh.y > skyH + 20) shooting = null;
    }
    sctx.globalAlpha = 1;
  }

  /* ---------------- hero scene: moon, hills, little house ---------------- */

  const scene = $("#scene");
  const hctx = scene.getContext("2d");
  const SCENE_PX = 4;

  function hills(w, base, amp, seed, freq) {
    const out = new Array(w);
    for (let x = 0; x < w; x++) {
      const v =
        Math.sin((x + seed) * 0.021 * freq) * 0.55 +
        Math.sin((x + seed * 2.3) * 0.047 * freq) * 0.3 +
        Math.sin((x + seed * 0.7) * 0.11 * freq) * 0.15;
      out[x] = Math.round(base - v * amp);
    }
    return out;
  }

  function drawScene() {
    const rect = scene.getBoundingClientRect();
    const w = Math.ceil(rect.width / SCENE_PX);
    const h = Math.ceil(rect.height / SCENE_PX);
    scene.width = w;
    scene.height = h;
    hctx.clearRect(0, 0, w, h);

    // moon
    const narrow = w < 160; // < 640 css px
    const mx = Math.round(w * (narrow ? 0.84 : 0.82));
    const my = Math.round(narrow ? h * 0.1 : h * 0.2);
    const r = Math.max(7, Math.round(Math.min(w, h) * 0.075));
    // halo rings (quantised, very faint)
    for (let ring = 3; ring >= 1; ring--) {
      const rr = r + ring * 4;
      hctx.fillStyle = `rgba(239, 231, 207, ${0.025 * (4 - ring)})`;
      for (let y = -rr; y <= rr; y++)
        for (let x = -rr; x <= rr; x++)
          if (x * x + y * y <= rr * rr) hctx.fillRect(mx + x, my + y, 1, 1);
    }
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        const d = x * x + y * y;
        if (d > r * r) continue;
        // soft terminator: shade the lower-left edge
        const shade = (x + r * 0.35) ** 2 + (y - r * 0.3) ** 2 > r * r * 1.15;
        hctx.fillStyle = shade ? "#d6ccb0" : "#efe7cf";
        hctx.fillRect(mx + x, my + y, 1, 1);
      }
    }
    // craters
    hctx.fillStyle = "#d9cfb4";
    [[-0.35, -0.2, 0.18], [0.3, 0.25, 0.14], [0.1, -0.45, 0.1], [-0.1, 0.45, 0.09]].forEach(([cx, cy, cr]) => {
      const R = Math.max(1, Math.round(cr * r));
      for (let y = -R; y <= R; y++)
        for (let x = -R; x <= R; x++)
          if (x * x + y * y <= R * R) hctx.fillRect(mx + Math.round(cx * r) + x, my + Math.round(cy * r) + y, 1, 1);
    });

    // hills: far -> near. Nearest matches page background so the hero melts into the page.
    const layers = [
      { base: h * 0.74, amp: h * 0.07, seed: 40, freq: 0.8, c: "#1f1f3d", trees: false },
      { base: h * 0.83, amp: h * 0.05, seed: 170, freq: 1.2, c: "#18182f", trees: true },
      { base: h * 0.93, amp: h * 0.035, seed: 320, freq: 1.6, c: "#0f1020", trees: false },
    ];
    let nearTop = null;
    layers.forEach((L, i) => {
      const top = hills(w, L.base, L.amp, L.seed, L.freq);
      hctx.fillStyle = L.c;
      for (let x = 0; x < w; x++) hctx.fillRect(x, top[x], 1, h - top[x]);
      if (L.trees) {
        // little pines
        let x = 6;
        while (x < w - 4) {
          const th = 6 + ((x * 7919) % 7);
          const baseY = top[x];
          for (let k = 0; k < th; k++) {
            const half = Math.floor((k / th) * 3.2);
            hctx.fillRect(x - half, baseY - th + k, half * 2 + 1, 1);
          }
          x += 7 + ((x * 104729) % 23);
        }
      }
      if (i === 2) nearTop = top;
    });

    // tiny house with a warm window, sitting on the near hill
    const hx = Math.round(w * (w < 160 ? 0.14 : 0.2));
    const hy = nearTop[hx] - 1;
    hctx.fillStyle = "#0f1020";
    hctx.fillRect(hx - 6, hy - 7, 12, 8); // walls
    for (let k = 0; k < 5; k++) hctx.fillRect(hx - 7 + k, hy - 8 - k, 14 - k * 2, 1); // roof
    hctx.fillRect(hx + 3, hy - 13, 2, 4); // chimney
    hctx.fillStyle = "#dcc58e";
    hctx.fillRect(hx - 3, hy - 5, 2, 2); // window
    hctx.fillStyle = "rgba(220, 197, 142, 0.12)";
    hctx.fillRect(hx - 5, hy - 7, 6, 6); // window glow
    hctx.fillStyle = "rgba(220, 197, 142, 0.35)";
    hctx.fillRect(hx + 1, hy - 4, 2, 4); // door light
  }

  /* ---------------- ground strip + walker ---------------- */

  const ground = $("#ground");
  const gcv = $("#groundCanvas");
  const gctx = gcv.getContext("2d");
  const walker = $("#walker");
  const wcv = $("#walkerCanvas");
  const wctx = wcv.getContext("2d");
  const firefly = $("#firefly");
  const bubble = $("#bubble");
  const GROUND_PX = 4;

  const sections = $$("main > section[id]");
  let sectionMarks = []; // [{id, x}] in css px
  let currentSection = "hero";

  function scrollMax() { return Math.max(1, document.documentElement.scrollHeight - innerHeight); }
  function walkRange() { return { min: 16, max: innerWidth - 16 - walker.offsetWidth }; }

  function computeMarks() {
    const { min, max } = walkRange();
    const sm = scrollMax();
    sectionMarks = sections.map((s) => {
      const p = clamp((s.offsetTop - 80) / sm, 0, 1);
      return { id: s.id, x: min + p * (max - min) + walker.offsetWidth / 2 };
    });
  }

  function drawGround() {
    const w = Math.ceil(innerWidth / GROUND_PX);
    const h = Math.ceil(ground.offsetHeight / GROUND_PX);
    gcv.width = w;
    gcv.height = h;
    gctx.clearRect(0, 0, w, h);
    const soilTop = h - 4; // 4 px * 4 = 16 css px band
    // soil
    gctx.fillStyle = "#121327";
    gctx.fillRect(0, soilTop, w, h - soilTop);
    gctx.fillStyle = "#17182f";
    for (let x = 0; x < w; x += 1) if ((x * 37) % 11 === 0) gctx.fillRect(x, soilTop + 2 + ((x * 13) % 2), 2, 1);
    // grass line + tufts
    for (let x = 0; x < w; x++) {
      gctx.fillStyle = "#2e4640";
      gctx.fillRect(x, soilTop, 1, 1);
      const n = (x * 2654435761) >>> 0;
      if (n % 5 === 0) { gctx.fillStyle = "#3b5a52"; gctx.fillRect(x, soilTop - 1, 1, 1); }
      if (n % 17 === 0) { gctx.fillStyle = "#3b5a52"; gctx.fillRect(x, soilTop - 2, 1, 2); }
      if (n % 61 === 0) { gctx.fillStyle = n % 2 ? "#d6a3b0" : "#dcc58e"; gctx.fillRect(x, soilTop - 2, 1, 1); }
      if (n % 97 === 0) { gctx.fillStyle = "#2a2b45"; gctx.fillRect(x, soilTop, 2, 1); }
    }
    // lamp posts at section positions
    sectionMarks.forEach((m) => {
      const lx = Math.round(m.x / GROUND_PX);
      const lit = m.id === currentSection;
      gctx.fillStyle = "#2a2b45";
      gctx.fillRect(lx, soilTop - 7, 1, 7);
      gctx.fillRect(lx - 1, soilTop - 8, 3, 1);
      gctx.fillStyle = lit ? "#f0dca6" : "#8a7d62";
      gctx.fillRect(lx, soilTop - 9, 1, 1);
      if (lit) {
        gctx.fillStyle = "rgba(240, 220, 166, 0.16)";
        gctx.fillRect(lx - 2, soilTop - 11, 5, 5);
        gctx.fillStyle = "rgba(240, 220, 166, 0.08)";
        gctx.fillRect(lx - 3, soilTop - 12, 7, 7);
      }
    });
  }

  let wx = 16;         // current x (css px)
  let manualX = null;  // set by arrow keys until the next scroll
  let facing = 1;
  let frameT = 0;
  let walkFrame = 0;
  let blinkUntil = 0;
  let nextBlink = 2500;
  let lastDrawn = "";

  function renderWalker(state, now) {
    let map, key;
    if (state === "walk") { map = FRAMES.walk[walkFrame]; key = "w" + walkFrame; }
    else if (now < blinkUntil) { map = FRAMES.blink; key = "b"; }
    else { map = FRAMES.idle; key = "i"; }
    key += facing;
    if (key === lastDrawn) return;
    lastDrawn = key;
    wctx.clearRect(0, 0, wcv.width, wcv.height);
    drawMap(wctx, map, PAL, { flip: facing < 0 });
  }

  const LINES = {
    hero: ["hi! scroll and i'll walk along", "the moon's nice tonight"],
    about: ["that's me! the real one", "ECS at KIIT, class of builders"],
    quests: ["IOCL had so much sensor data", "grape uav was my first web gig"],
    adventures: ["KIITO has 14k+ users now!", "focus fox is almost at 2k", "bounceblitz vs neverbounce: a tie!", "my bot asks before it deletes", "the glove says letters out loud!", "where is my bus? check KIIT Transit", "click a screenshot to zoom"],
    inventory: ["power bi's in my bag too ✦", "so many chips…"],
    trophies: ["top 50 at SIH!", "88+ devs in the chapter"],
    save: ["don't forget to save :)", "say hi by email!"],
  };
  let bubbleTimer = null;
  function placeBubble() {
    const bw = bubble.offsetWidth;
    const centre = wx + walker.offsetWidth / 2;
    const left = clamp(centre - bw / 2, 8, innerWidth - bw - 8);
    bubble.style.left = `${left - wx}px`;
    bubble.style.setProperty("--tail", `${centre - left}px`);
  }
  let lineIdx = 0;
  function say(text) {
    bubble.textContent = text;
    bubble.classList.add("show");
    placeBubble();
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove("show"), 2600);
  }
  walker.addEventListener("click", () => {
    const pool = LINES[currentSection] || LINES.hero;
    say(pool[lineIdx++ % pool.length]);
  });

  const keys = { left: false, right: false };
  addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, [contenteditable]")) return;
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d") keys.right = true;
  });
  addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d") keys.right = false;
  });
  addEventListener("scroll", () => { manualX = null; }, { passive: true });

  /* ---------------- main loop ---------------- */

  let last = performance.now();
  let flyX = 0, flyY = 40;
  let skyAcc = 0;
  let prevScroll = -1;

  function loop(now) {
    const dt = Math.min(64, now - last);
    last = now;

    // sky at ~30fps
    skyAcc += dt;
    if (skyAcc > 33 || scrollY !== prevScroll) {
      skyAcc = 0;
      prevScroll = scrollY;
      nextShot -= 33;
      if (!shooting && nextShot <= 0 && !reduceMotion) {
        shooting = { x: skyW * (0.3 + Math.random() * 0.7), y: Math.random() * skyH * 0.35, vx: -1.6, vy: 0.7, life: 70 };
        nextShot = 7000 + Math.random() * 9000;
      }
      drawSky(now);
    }

    // walker target
    const { min, max } = walkRange();
    const p = clamp(scrollY / scrollMax(), 0, 1);
    let target = min + p * (max - min);
    if (keys.left || keys.right) {
      manualX = clamp((manualX ?? wx) + (keys.right ? 1 : -1) * dt * 0.18, min, max);
    }
    if (manualX !== null) target = manualX;

    const dx = target - wx;
    const moving = Math.abs(dx) > 0.6;
    wx = reduceMotion ? target : wx + clamp(dx * 0.12, -dt * 0.35, dt * 0.35);
    if (moving) {
      facing = dx > 0 ? 1 : -1;
      frameT += dt;
      if (frameT > 120) { frameT = 0; walkFrame = (walkFrame + 1) % FRAMES.walk.length; }
    }
    if (!moving && manualX === null && p < 0.001) facing = 1;
    if (now > nextBlink) { blinkUntil = now + 140; nextBlink = now + 2500 + Math.random() * 3000; }
    renderWalker(moving ? "walk" : "idle", now);
    const bob = moving && walkFrame % 2 === 1 ? -3 : 0;
    walker.style.transform = `translate3d(${wx.toFixed(1)}px, ${bob}px, 0)`;
    if (bubble.classList.contains("show")) placeBubble();

    // firefly drifts behind her head
    const fxT = wx + 24 - facing * 30 + Math.cos(now * 0.0017) * 14;
    const fyT = 92 + Math.sin(now * 0.0023) * 7;
    flyX = lerp(flyX, fxT, 0.04);
    flyY = lerp(flyY, fyT, 0.06);
    firefly.style.transform = `translate3d(${flyX.toFixed(1)}px, ${(-flyY).toFixed(1)}px, 0)`;
    firefly.style.opacity = (0.55 + Math.sin(now * 0.003) * 0.35).toFixed(2);

    requestAnimationFrame(loop);
  }

  /* ---------------- dialogue box ---------------- */

  const DIALOG = [
    "Hi, I'm Yogisha! I build apps, ML models, and things with too many wires.",
    "Around 16,000 students use apps I've built: KIITO (14k+) and Focus Fox (~2k).",
    "At IOCL Panipat I worked with large volumes of refinery data and trained models to find process faults.",
    "Lately: an email verifier that matches paid tools, an AI ops platform, and a local AI agent.",
    "Scroll down to look around. I'll walk along the bottom with you.",
  ];
  const dialog = $("#dialog");
  const dText = $("#dialogText");
  let dIdx = 0, dChar = 0, dTimer = null, dAuto = null;

  function typeLine() {
    clearTimeout(dTimer);
    clearTimeout(dAuto);
    const line = DIALOG[dIdx];
    if (reduceMotion) { dText.textContent = line; dChar = line.length; scheduleAuto(); return; }
    dChar = 0;
    const step = () => {
      dChar++;
      dText.textContent = line.slice(0, dChar);
      if (dChar < line.length) dTimer = setTimeout(step, line[dChar - 1] === "," || line[dChar - 1] === "." ? 160 : 28);
      else scheduleAuto();
    };
    step();
  }
  function scheduleAuto() {
    if (dIdx < DIALOG.length - 1) dAuto = setTimeout(nextLine, 4200);
  }
  function nextLine() {
    const line = DIALOG[dIdx];
    if (dChar < line.length) { // finish current line first
      clearTimeout(dTimer);
      dText.textContent = line;
      dChar = line.length;
      scheduleAuto();
      return;
    }
    dIdx = (dIdx + 1) % DIALOG.length;
    typeLine();
  }
  dialog.addEventListener("click", nextLine);
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); nextLine(); }
  });

  /* ---------------- campfire ---------------- */

  const fire = $("#campfire");
  const fctx = fire.getContext("2d");
  const FIRE_COLS = ["#f3e2b0", "#e8c07e", "#d9956a", "#b86f5a"];
  function drawFire(t) {
    fctx.clearRect(0, 0, 24, 24);
    // flames
    for (let x = 8; x <= 15; x++) {
      const centre = 1 - Math.abs(x - 11.5) / 4.5;
      const hgt = Math.round(3 + centre * 7 + (reduceMotion ? 0 : Math.sin(t * 0.008 + x * 1.7) * 1.6 + Math.sin(t * 0.013 + x) * 1));
      for (let k = 0; k < hgt; k++) {
        const rel = k / Math.max(1, hgt);
        fctx.fillStyle = FIRE_COLS[rel < 0.3 ? 3 : rel < 0.6 ? 2 : rel < 0.85 ? 1 : 0];
        if (rel < 0.3 && centre > 0.5) fctx.fillStyle = FIRE_COLS[1];
        fctx.fillRect(x, 19 - k, 1, 1);
      }
    }
    // logs
    fctx.fillStyle = "#5a4130";
    fctx.fillRect(5, 19, 14, 2);
    fctx.fillStyle = "#3f2d22";
    fctx.fillRect(6, 21, 12, 1);
    fctx.fillStyle = "#7b5a3e";
    fctx.fillRect(7, 19, 2, 1);
    fctx.fillRect(15, 20, 2, 1);
    // stones
    fctx.fillStyle = "#2f3050";
    [[3, 21], [20, 21], [4, 20], [19, 20]].forEach(([x, y]) => fctx.fillRect(x, y, 2, 1));
  }
  let fireOn = false;
  if (!reduceMotion) {
    new IntersectionObserver(([e]) => { fireOn = e.isIntersecting; if (fireOn) fireTick(); }).observe(fire);
  }
  function fireTick(t = performance.now()) {
    drawFire(t);
    if (fireOn) setTimeout(() => requestAnimationFrame(fireTick), 110);
  }
  drawFire(0);

  /* ---------------- nav ---------------- */

  const navToggle = $("#navToggle");
  const navMenu = $("#navMenu");
  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  $$("#navMenu a").forEach((a) => a.addEventListener("click", () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }));

  const navLinks = new Map($$("#navMenu a").map((a) => [a.getAttribute("href").slice(1), a]));
  const secObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      if (id === currentSection) return;
      currentSection = id;
      navLinks.forEach((a, key) => a.classList.toggle("active", key === id));
      drawGround();
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => secObserver.observe(s));

  /* ---------------- reveal on scroll ---------------- */

  const revealer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); revealer.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  $$(".reveal").forEach((el) => revealer.observe(el));

  /* ---------------- lightbox ---------------- */

  const lb = $("#lightbox");
  const lbImg = $("img", lb);
  let lbReturn = null;
  function openLB(img) {
    lbReturn = document.activeElement;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lb.hidden = false;
    $(".lightbox-close", lb).focus();
  }
  function closeLB() {
    lb.hidden = true;
    lbImg.removeAttribute("src");
    if (lbReturn) lbReturn.focus();
  }
  $$("[data-lightbox]").forEach((fig) => {
    fig.tabIndex = 0;
    fig.setAttribute("role", "button");
    const img = $("img", fig);
    fig.setAttribute("aria-label", `Enlarge: ${img.alt}`);
    fig.addEventListener("click", () => openLB(img));
    fig.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLB(img); } });
  });
  lb.addEventListener("click", closeLB);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) closeLB(); });

  /* ---------------- boot ---------------- */

  function layout() {
    buildStars();
    drawScene();
    computeMarks();
    drawGround();
    drawSky(performance.now());
  }
  let rT;
  addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(layout, 120); });
  addEventListener("load", () => { computeMarks(); drawGround(); });

  layout();
  wx = walkRange().min;
  flyX = wx;
  typeLine();
  setTimeout(() => say("hi! scroll and i'll walk along"), 1400);
  requestAnimationFrame(loop);
})();
