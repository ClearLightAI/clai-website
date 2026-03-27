/**
 * Starfield Animation — ClearLight AI
 *
 * "Flying through space" canvas animation. Stars stream outward from a
 * central vanishing point. As they approach the viewer they elongate into
 * streaks and, at very close range, split into a prismatic rainbow fan
 * using the brand palette — like light refracting through a prism.
 *
 * Performance-first design:
 *   • 200 pre-allocated stars (no per-frame allocation)
 *   • fillRect + rotate for streaks (no arc / radialGradient per star)
 *   • Single full-clear per frame (no ghosting composites)
 *   • Shooting stars use simple lines, no gradients
 *   • requestAnimationFrame with visibility-pause
 *
 * Usage:
 *   import { createStarfield } from './starfield.js';
 *   const sf = createStarfield(canvas, { speed: 0.8 });
 *   sf.start();
 */

// ─── Brand palette for prismatic dispersion ─────────────────────────
const PRISM_COLORS = [
  { r: 229, g: 182, b: 115 }, // gold   #e5b673
  { r: 255, g: 220, b: 160 }, // warm amber
  { r: 255, g: 253, b: 245 }, // hot white core
  { r: 124, g: 184, b: 223 }, // blue   #7cb8df
  { r: 184, g: 160, b: 224 }, // purple #b8a0e0
];

// Star base colors — warm, muted tones that feel like distant starlight
const STAR_COLORS = [
  { r: 255, g: 250, b: 240 }, // warm white
  { r: 229, g: 182, b: 115 }, // brand gold
  { r: 220, g: 215, b: 235 }, // faint lavender
  { r: 200, g: 225, b: 245 }, // ice blue
  { r: 255, g: 240, b: 210 }, // candlelight
  { r: 235, g: 230, b: 250 }, // ghost violet
];

const DEFAULTS = {
  speed: 1,
  starCount: 200,
  maxDepth: 1200,
  shootingStars: true,
  shootingStarInterval: 5000,
  /** Depth ratio at which prismatic dispersion begins (0–1). */
  prismThreshold: 0.7,
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pickColor() {
  return STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0];
}

function resetStar(s, w, h, maxDepth, initial) {
  s.x = randomBetween(-w, w);
  s.y = randomBetween(-h, h);
  s.z = initial ? randomBetween(1, maxDepth) : maxDepth;
  const c = pickColor();
  s.r = c.r;
  s.g = c.g;
  s.b = c.b;
}

// ─── Shooting star (simple, no gradients) ────────────────────────────

function createShootingStar(w, h) {
  const angle = randomBetween(0, Math.PI * 2);
  const speed = randomBetween(8, 16);
  const dist = randomBetween(0.2, 0.4) * Math.max(w, h);
  const cx = w * 0.5;
  const cy = h * 0.5;
  return {
    x: cx + Math.cos(angle + Math.PI) * dist,
    y: cy + Math.sin(angle + Math.PI) * dist,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: randomBetween(30, 60) | 0,
    maxLife: 0, // set after creation
    tailLen: randomBetween(60, 140),
  };
}

// ─── Public factory ──────────────────────────────────────────────────

export function createStarfield(canvas, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  const ctx = canvas.getContext("2d");

  let w = 0;
  let h = 0;
  let halfW = 0;
  let halfH = 0;
  let animId = null;
  let running = false;
  let paused = false;

  // Pre-allocate star pool
  const stars = new Array(opts.starCount);
  for (let i = 0; i < opts.starCount; i++) {
    stars[i] = { x: 0, y: 0, z: 0, r: 255, g: 255, b: 255 };
  }

  let shooters = [];
  let shooterTimer = 0;

  // ── Sizing ──────────────────────────────────────────────────────
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x for perf
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    halfW = w * 0.5;
    halfH = h * 0.5;
  }

  function initStars() {
    for (let i = 0; i < stars.length; i++) {
      resetStar(stars[i], w, h, opts.maxDepth, true);
    }
  }

  // ── Frame ───────────────────────────────────────────────────────
  function frame() {
    if (!running) return;
    if (paused) {
      animId = requestAnimationFrame(frame);
      return;
    }

    const spd = opts.speed * 2.5;

    // Full clear — cheaper than semi-transparent fill + looks crisper
    ctx.clearRect(0, 0, w, h);

    // ── Stars ─────────────────────────────────────────────────
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.z -= spd;

      if (s.z <= 0) {
        resetStar(s, w, h, opts.maxDepth, false);
        continue;
      }

      const k = 280 / s.z;
      const sx = s.x * k + halfW;
      const sy = s.y * k + halfH;

      // Off-screen cull (generous margin for streaks)
      if (sx < -60 || sx > w + 60 || sy < -60 || sy > h + 60) {
        resetStar(s, w, h, opts.maxDepth, false);
        continue;
      }

      const depthRatio = 1 - s.z / opts.maxDepth; // 0 = far, 1 = near

      // ── Prismatic dispersion (near stars) ──────────────────
      if (depthRatio > opts.prismThreshold) {
        drawPrismStar(ctx, sx, sy, halfW, halfH, depthRatio, opts.prismThreshold);
        continue;
      }

      // ── Normal star: elongated streak along radial direction ──
      const alpha = 0.1 + depthRatio * 0.9;
      const baseSize = 0.4 + depthRatio * 1.8;

      // Streak length grows with proximity
      const streakLen = depthRatio > 0.3
        ? baseSize + (depthRatio - 0.3) * 18
        : baseSize;

      // Angle from center
      const dx = sx - halfW;
      const dy = sy - halfH;
      const angle = Math.atan2(dy, dx);

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
      // Draw as a rotated rectangle — fast, no arc needed
      ctx.fillRect(-streakLen * 0.5, -baseSize * 0.3, streakLen, baseSize * 0.6);
      ctx.restore();
    }

    // ── Shooting stars ────────────────────────────────────────────
    if (opts.shootingStars) {
      shooterTimer++;
      const interval = (opts.shootingStarInterval / 16.67) | 0;
      if (shooterTimer >= interval) {
        shooterTimer = 0;
        const sh = createShootingStar(w, h);
        sh.maxLife = sh.life;
        shooters.push(sh);
      }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        sh.x += sh.vx * opts.speed;
        sh.y += sh.vy * opts.speed;
        sh.life--;

        const lifeRatio = sh.life / sh.maxLife;
        const tailX = sh.x - sh.vx * (sh.tailLen / 12);
        const tailY = sh.y - sh.vy * (sh.tailLen / 12);

        // Simple line — no gradient needed
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(sh.x, sh.y);
        ctx.strokeStyle = `rgba(255,250,240,${lifeRatio * 0.6})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Head dot
        ctx.globalAlpha = lifeRatio;
        ctx.fillStyle = "#fffaf0";
        ctx.fillRect(sh.x - 0.8, sh.y - 0.8, 1.6, 1.6);
        ctx.globalAlpha = 1;

        if (sh.life <= 0) shooters.splice(i, 1);
      }
    }

    animId = requestAnimationFrame(frame);
  }

  // ── Prismatic dispersion drawing ────────────────────────────────
  // When a star is very close, it splits into multiple colored streaks
  // fanning out like light through a prism — using brand palette colors.
  function drawPrismStar(ctx, sx, sy, hw, hh, depthRatio, threshold) {
    const dx = sx - hw;
    const dy = sy - hh;
    const angle = Math.atan2(dy, dx);

    // How far into the prism zone (0 = just entered, 1 = right on top)
    const prismIntensity = (depthRatio - threshold) / (1 - threshold);
    const baseAlpha = 0.3 + prismIntensity * 0.7;

    // Fan spread increases with proximity
    const spreadAngle = prismIntensity * 0.18; // radians
    const baseLen = 12 + prismIntensity * 35;
    const baseWidth = 0.6 + prismIntensity * 1.2;

    ctx.save();
    ctx.translate(sx, sy);

    for (let j = 0; j < PRISM_COLORS.length; j++) {
      const c = PRISM_COLORS[j];
      // Each color ray fans out slightly from the center ray
      const offset = (j - (PRISM_COLORS.length - 1) * 0.5) * spreadAngle;
      const rayAngle = angle + offset;
      const rayLen = baseLen * (0.7 + Math.random() * 0.3); // slight variation
      const rayAlpha = baseAlpha * (j === 2 ? 1 : 0.6 + prismIntensity * 0.3); // core is brightest

      ctx.save();
      ctx.rotate(rayAngle);
      ctx.globalAlpha = rayAlpha;
      ctx.fillStyle = `rgb(${c.r},${c.g},${c.b})`;
      ctx.fillRect(-rayLen * 0.3, -baseWidth * 0.5, rayLen, baseWidth);
      ctx.restore();
    }

    ctx.restore();
  }

  // ── Visibility pause — stop rendering when tab is hidden ────────
  function onVisibility() {
    paused = document.hidden;
  }

  // ── Resize (debounced) ──────────────────────────────────────────
  let resizeTimeout = null;
  function onResize() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 120);
  }

  // ── Public API ──────────────────────────────────────────────────

  function start() {
    if (running) return;
    running = true;
    resize();
    initStars();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    animId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);
    if (resizeTimeout) clearTimeout(resizeTimeout);
  }

  function setOptions(newOpts) {
    Object.assign(opts, newOpts);
  }

  return { start, stop, setOptions };
}
