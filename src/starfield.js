/**
 * Starfield Animation — ClearLight AI
 *
 * "Flying through space" canvas animation. Stars stream outward from a
 * central vanishing point. As they approach they elongate into soft white
 * streaks with a gentle blur. No prismatic effects, no shooting stars —
 * clean and performant.
 *
 * Performance notes:
 *   • 180 pre-allocated stars (no per-frame allocation)
 *   • fillRect + rotate for streaks (no arc / radialGradient)
 *   • Single clearRect per frame
 *   • Pauses when tab is hidden
 *   • DPR capped at 2x
 *
 * Usage:
 *   import { createStarfield } from './starfield.js';
 *   const sf = createStarfield(canvas, { speed: 0.8 });
 *   sf.start();
 */

const DEFAULTS = {
  speed: 1,
  starCount: 540,
  maxDepth: 1200,
};

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function resetStar(s, w, h, maxDepth, initial) {
  s.x = randomBetween(-w, w);
  s.y = randomBetween(-h, h);
  s.z = initial ? randomBetween(1, maxDepth) : maxDepth;
  // Slight warmth variation — mostly white with hints of warm/cool
  const warmth = Math.random();
  if (warmth < 0.7) {
    // Pure white / slightly warm
    s.r = 255;
    s.g = 252 + (Math.random() * 3) | 0;
    s.b = 245 + (Math.random() * 10) | 0;
  } else if (warmth < 0.85) {
    // Faint gold tint
    s.r = 255;
    s.g = 240 + (Math.random() * 15) | 0;
    s.b = 220 + (Math.random() * 20) | 0;
  } else {
    // Faint blue-white tint
    s.r = 230 + (Math.random() * 25) | 0;
    s.g = 235 + (Math.random() * 20) | 0;
    s.b = 255;
  }
}

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

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

  function frame() {
    if (!running) return;
    if (paused) {
      animId = requestAnimationFrame(frame);
      return;
    }

    const spd = opts.speed * 2.5;

    ctx.clearRect(0, 0, w, h);

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

      if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) {
        resetStar(s, w, h, opts.maxDepth, false);
        continue;
      }

      const depthRatio = 1 - s.z / opts.maxDepth; // 0 = far, 1 = near

      // Radial distance from center (0 = center, 1 = edge of viewport)
      const dx = sx - halfW;
      const dy = sy - halfH;
      const radialDist = Math.sqrt(dx * dx + dy * dy) / Math.max(halfW, halfH);
      const angle = Math.atan2(dy, dx);

      // Brightness scales with proximity
      const alpha = 0.08 + depthRatio * 0.92;
      const baseSize = 0.3 + depthRatio * 1.2;

      // Streak length is proportional to RADIAL distance from center
      // Center = tiny dot, edge = long streak. Depth also contributes.
      const radialFactor = radialDist * radialDist; // quadratic — tight center, long edges
      const depthFactor = Math.max(0, depthRatio - 0.1);
      const streakLen = baseSize + radialFactor * depthFactor * 120;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`;
      ctx.fillRect(-streakLen * 0.5, -baseSize * 0.3, streakLen, baseSize * 0.6);
      ctx.restore();
    }

    animId = requestAnimationFrame(frame);
  }

  function onVisibility() {
    paused = document.hidden;
  }

  let resizeTimeout = null;
  function onResize() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 120);
  }

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
