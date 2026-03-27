/**
 * Starfield Animation — ClearLight AI
 *
 * A "flying through space" canvas animation inspired by the classic
 * Windows Starfield Simulation screensaver. Stars stream outward from
 * a central vanishing point toward the viewer with depth perspective,
 * warm color tints, glow halos, motion-blur trails, and occasional
 * shooting stars.
 *
 * Usage:
 *   import { createStarfield } from './starfield.js';
 *   const sf = createStarfield(canvasElement, { speed: 1 });
 *   sf.start();
 *   // later: sf.stop();
 *
 * The module is allocation-light at runtime — all star objects are
 * pre-allocated and recycled.
 */

// ─── Color palette (warm tints) ──────────────────────────────────────
const STAR_COLORS = [
  { r: 255, g: 253, b: 245 }, // warm white / cream
  { r: 229, g: 182, b: 115 }, // gold  (#e5b673 — brand gold)
  { r: 200, g: 195, b: 220 }, // faint lavender
  { r: 195, g: 220, b: 240 }, // ice blue
  { r: 255, g: 245, b: 230 }, // soft peach
  { r: 210, g: 200, b: 255 }, // pale violet
  { r: 255, g: 240, b: 200 }, // candlelight
  { r: 230, g: 230, b: 250 }, // ghost lavender
];

// ─── Defaults ────────────────────────────────────────────────────────
const DEFAULTS = {
  /** Overall speed multiplier (1 = gentle drift, 2 = faster cruise). */
  speed: 1,
  /** Number of stars in the field. */
  starCount: 600,
  /** Maximum depth value (farther = smaller/dimmer). */
  maxDepth: 1500,
  /** Whether to render shooting stars. */
  shootingStars: true,
  /** Average interval between shooting stars in ms. */
  shootingStarInterval: 4000,
  /** Trail length multiplier for motion blur streaks. */
  trailLength: 1,
};

// ─── Helpers ─────────────────────────────────────────────────────────

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pickColor() {
  return STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0];
}

// ─── Star recycling ──────────────────────────────────────────────────

function resetStar(star, w, h, maxDepth, initial) {
  // Position in 3-D space, centered on the viewport.
  star.x = randomBetween(-w, w);
  star.y = randomBetween(-h, h);
  // On first frame, spread depth uniformly; on recycle, push to back.
  star.z = initial ? randomBetween(1, maxDepth) : maxDepth;
  // Previous projected position (for trails).
  star.px = 0;
  star.py = 0;
  star.pValid = false;
  // Visual properties.
  const c = pickColor();
  star.r = c.r;
  star.g = c.g;
  star.b = c.b;
}

// ─── Shooting star ───────────────────────────────────────────────────

function createShootingStar(w, h) {
  // Pick a random edge to start from and streak across.
  const angle = randomBetween(0, Math.PI * 2);
  const speed = randomBetween(6, 14);
  const len = randomBetween(80, 200);
  const life = randomBetween(40, 90); // frames
  const cx = w * 0.5;
  const cy = h * 0.5;
  // Start somewhere in the outer third of the canvas.
  const dist = randomBetween(0.25, 0.45) * Math.max(w, h);
  return {
    x: cx + Math.cos(angle + Math.PI) * dist,
    y: cy + Math.sin(angle + Math.PI) * dist,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    len,
    life,
    maxLife: life,
    r: 255,
    g: randomBetween(220, 255) | 0,
    b: randomBetween(180, 230) | 0,
  };
}

// ─── Public factory ──────────────────────────────────────────────────

export function createStarfield(canvas, options = {}) {
  const opts = { ...DEFAULTS, ...options };

  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let halfW = 0;
  let halfH = 0;
  let animId = null;
  let running = false;

  // Pre-allocate star pool.
  const stars = new Array(opts.starCount);
  for (let i = 0; i < opts.starCount; i++) {
    stars[i] = { x: 0, y: 0, z: 0, px: 0, py: 0, pValid: false, r: 255, g: 255, b: 255 };
  }

  // Shooting stars (small live array, rarely more than 2-3 at once).
  let shooters = [];
  let shooterTimer = 0;

  // ── Sizing ──────────────────────────────────────────────────────
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    halfW = w * 0.5;
    halfH = h * 0.5;
  }

  // ── Initialise stars ────────────────────────────────────────────
  function initStars() {
    for (let i = 0; i < stars.length; i++) {
      resetStar(stars[i], w, h, opts.maxDepth, true);
    }
  }

  // ── Frame ───────────────────────────────────────────────────────
  function frame() {
    if (!running) return;

    const speed = opts.speed * 2; // tuned for "gentle drift"

    // Semi-transparent clear for very subtle ghosting (adds to depth feel).
    ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
    ctx.fillRect(0, 0, w, h);

    // ── Stars ─────────────────────────────────────────────────
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      // Advance depth.
      s.z -= speed;

      // Recycle if past the viewer.
      if (s.z <= 0) {
        resetStar(s, w, h, opts.maxDepth, false);
        continue;
      }

      // Project 3-D → 2-D.
      const k = 300 / s.z; // focal length factor
      const sx = s.x * k + halfW;
      const sy = s.y * k + halfH;

      // Off-screen cull.
      if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) {
        resetStar(s, w, h, opts.maxDepth, false);
        continue;
      }

      // Depth-based size & brightness.
      const depthRatio = 1 - s.z / opts.maxDepth; // 0 = far, 1 = near
      const radius = 0.3 + depthRatio * 2.5;
      const alpha = 0.15 + depthRatio * 0.85;

      // ── Trail / motion blur ──────────────────────────────
      if (s.pValid && depthRatio > 0.25) {
        const trailAlpha = alpha * 0.35 * Math.min(1, (depthRatio - 0.25) / 0.5);
        const trailWidth = Math.max(0.5, radius * 0.6);
        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgba(${s.r},${s.g},${s.b},${trailAlpha})`;
        ctx.lineWidth = trailWidth * opts.trailLength;
        ctx.stroke();
      }

      // ── Glow halo (brighter/larger stars only) ────────────
      if (depthRatio > 0.55 && radius > 1.5) {
        const glowRadius = radius * 3.5;
        const grad = ctx.createRadialGradient(sx, sy, radius * 0.3, sx, sy, glowRadius);
        grad.addColorStop(0, `rgba(${s.r},${s.g},${s.b},${alpha * 0.4})`);
        grad.addColorStop(0.4, `rgba(${s.r},${s.g},${s.b},${alpha * 0.1})`);
        grad.addColorStop(1, `rgba(${s.r},${s.g},${s.b},0)`);
        ctx.beginPath();
        ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // ── Star dot ──────────────────────────────────────────
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.r},${s.g},${s.b},${alpha})`;
      ctx.fill();

      // Store previous position for next frame's trail.
      s.px = sx;
      s.py = sy;
      s.pValid = true;
    }

    // ── Shooting stars ──────────────────────────────────────────
    if (opts.shootingStars) {
      shooterTimer++;
      const spawnInterval = (opts.shootingStarInterval / 16.67) | 0; // convert ms → frames
      if (shooterTimer >= spawnInterval) {
        shooterTimer = 0;
        shooters.push(createShootingStar(w, h));
      }

      for (let i = shooters.length - 1; i >= 0; i--) {
        const sh = shooters[i];
        sh.x += sh.vx * opts.speed;
        sh.y += sh.vy * opts.speed;
        sh.life--;

        const lifeRatio = sh.life / sh.maxLife;
        const tailX = sh.x - sh.vx * (sh.len / 10) * opts.speed;
        const tailY = sh.y - sh.vy * (sh.len / 10) * opts.speed;

        // Gradient streak.
        const grad = ctx.createLinearGradient(tailX, tailY, sh.x, sh.y);
        grad.addColorStop(0, `rgba(${sh.r},${sh.g},${sh.b},0)`);
        grad.addColorStop(1, `rgba(${sh.r},${sh.g},${sh.b},${lifeRatio * 0.8})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(sh.x, sh.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Bright head dot.
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${lifeRatio})`;
        ctx.fill();

        if (sh.life <= 0) {
          shooters.splice(i, 1);
        }
      }
    }

    animId = requestAnimationFrame(frame);
  }

  // ── Resize handler (debounced) ──────────────────────────────────
  let resizeTimeout = null;
  function onResize() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
    }, 100);
  }

  // ── Public API ──────────────────────────────────────────────────

  function start() {
    if (running) return;
    running = true;
    resize();
    initStars();
    window.addEventListener('resize', onResize);
    animId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    window.removeEventListener('resize', onResize);
    if (resizeTimeout) clearTimeout(resizeTimeout);
  }

  /**
   * Update options at runtime (e.g., change speed).
   * Only the keys you pass will be updated.
   */
  function setOptions(newOpts) {
    Object.assign(opts, newOpts);
  }

  return { start, stop, setOptions };
}
