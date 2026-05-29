/**
 * Pixelated Canvas — Aceternity UI-style portrait effect
 * Samples profile.jpg as a grid of circle dots, then applies
 * mouse-driven swirl distortion + jitter on hover.
 *
 * Props (matched to Aceternity defaults):
 *   cellSize=4, dotScale=0.85, shape="circle", grayscale=true
 *   distortionMode="swirl", distortionStrength=3, distortionRadius=80
 *   followSpeed=0.15, fadeSpeed=0.08, jitterStrength=3, jitterSpeed=3
 *   dropoutStrength=0.25, maxFps=60
 */
(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────────── */
  var CELL          = 4;     // cellSize: px per sample cell
  var DOT_SCALE     = 0.85;  // dotScale: dot radius = CELL*DOT_SCALE/2
  var DROPOUT       = 0.25;  // skip very dark / near-black pixels
  var GRAYSCALE     = true;  // render greyscale to match existing aesthetic

  var DIST_MODE     = 'swirl';
  var DIST_STRENGTH = 3;     // swirl angle multiplier
  var DIST_RADIUS   = 80;    // px — radius of distortion influence
  var FOLLOW_SPD    = 0.15;  // pointer smoothing 0..1
  var FADE_IN_SPD   = 0.16;  // influence ramp-up speed
  var FADE_OUT_SPD  = 0.08;  // influence fade-out speed
  var JIT_STR       = 3;     // jitter amplitude px
  var JIT_SPD       = 3;     // jitter frequency
  var MAX_FPS       = 60;

  /* ── Main builder ───────────────────────────────────────── */
  function build(img) {
    var portrait = img.parentElement;
    if (!portrait || !portrait.classList.contains('portrait')) return;

    /* measure from laid-out element */
    var W = portrait.offsetWidth  || 280;
    var H = portrait.offsetHeight || 340;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var dotR = (CELL * DOT_SCALE) / 2;

    /* ── Create canvas ───────────────────────────────────── */
    var canvas = document.createElement('canvas');
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.className = 'portrait-pixel-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = [
      'position:absolute', 'inset:0',
      'width:100%', 'height:100%',
      'border-radius:var(--r)',
      'pointer-events:none',
      'display:block',
      'will-change:transform',
    ].join(';');

    /* insert before the img so portrait-ring stays on top */
    portrait.insertBefore(canvas, img);
    /* hide original — keep in DOM so onerror fallback still works */
    img.style.opacity = '0';

    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    /* ── Sample image → dot array ─────────────────────────── */
    var off = document.createElement('canvas');
    off.width  = W;
    off.height = H;
    var octx = off.getContext('2d');
    octx.drawImage(img, 0, 0, W, H);
    var px = octx.getImageData(0, 0, W, H).data;

    var half = CELL / 2;
    var dots = [];

    for (var sy = half; sy < H; sy += CELL) {
      for (var sx = half; sx < W; sx += CELL) {
        var pi  = (Math.floor(sy) * W + Math.floor(sx)) * 4;
        var r   = px[pi], g = px[pi + 1], b = px[pi + 2], a = px[pi + 3];
        if (a < 10) continue;

        var lum = 0.299 * r + 0.587 * g + 0.114 * b;

        /* dropout: skip very dark pixels so the bg peeks through */
        if (lum < 255 * DROPOUT * 0.5) continue;

        if (GRAYSCALE) { r = g = b = lum; }

        dots.push({
          bx: sx, by: sy,
          r: r | 0, g: g | 0, b: b | 0, a: a,
          jOff: Math.random() * Math.PI * 2,
        });
      }
    }

    /* ── Pointer + fade state ────────────────────────────── */
    var pRaw   = { x: W / 2, y: H / 2 };
    var pSmooth = { x: W / 2, y: H / 2 };
    var active = false;
    var influence = 0;          // 0..1 animation blend
    var bgColor = '';

    function getBg() {
      var v = getComputedStyle(document.documentElement)
                .getPropertyValue('--bg').trim();
      return v || '#0a0a0a';
    }

    /* attach events to the portrait container */
    portrait.addEventListener('mouseenter', function () {
      active = true;
    }, { passive: true });

    portrait.addEventListener('mousemove', function (e) {
      var rect = portrait.getBoundingClientRect();
      pRaw.x = e.clientX - rect.left;
      pRaw.y = e.clientY - rect.top;
    }, { passive: true });

    portrait.addEventListener('mouseleave', function () {
      active = false;
    }, { passive: true });

    /* ── Animation loop ──────────────────────────────────── */
    var interval = 1000 / MAX_FPS;
    var lastTs   = 0;

    function frame(ts) {
      requestAnimationFrame(frame);
      if (ts - lastTs < interval) return;
      lastTs = ts;

      var t = ts * 0.001;

      /* blend influence */
      if (active) {
        influence = Math.min(1, influence + FADE_IN_SPD);
      } else {
        influence = Math.max(0, influence - FADE_OUT_SPD);
      }

      /* smooth pointer follow */
      pSmooth.x += (pRaw.x - pSmooth.x) * FOLLOW_SPD;
      pSmooth.y += (pRaw.y - pSmooth.y) * FOLLOW_SPD;

      /* clear */
      bgColor = getBg();
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);

      /* draw dots */
      for (var d = 0; d < dots.length; d++) {
        var dot = dots[d];
        var tx  = dot.bx;
        var ty  = dot.by;

        if (influence > 0) {
          var dx   = dot.bx - pSmooth.x;
          var dy   = dot.by - pSmooth.y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < DIST_RADIUS && dist > 0) {
            var inf = (1 - dist / DIST_RADIUS) * influence;

            /* swirl: rotate each dot around the pointer by inf × strength radians */
            if (DIST_MODE === 'swirl') {
              var angle = inf * DIST_STRENGTH * 0.8;
              var cos = Math.cos(angle);
              var sin = Math.sin(angle);
              tx = pSmooth.x + dx * cos - dy * sin;
              ty = pSmooth.y + dx * sin + dy * cos;
            } else if (DIST_MODE === 'repel') {
              var nd = dist > 0 ? dist : 0.001;
              tx = dot.bx + (dx / nd) * DIST_STRENGTH * 15 * inf;
              ty = dot.by + (dy / nd) * DIST_STRENGTH * 15 * inf;
            }

            /* jitter */
            if (JIT_STR > 0) {
              tx += Math.sin(t * JIT_SPD + dot.jOff)        * JIT_STR * inf;
              ty += Math.cos(t * JIT_SPD + dot.jOff * 1.37) * JIT_STR * inf;
            }
          }
        }

        ctx.fillStyle  = 'rgb(' + dot.r + ',' + dot.g + ',' + dot.b + ')';
        ctx.globalAlpha = dot.a / 255;
        ctx.beginPath();
        ctx.arc(tx, ty, dotR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(frame);
  }

  /* ── Init: wait for image load + layout ─────────────────── */
  function init() {
    var img = document.querySelector('.portrait > img');
    if (!img) return;

    /* skip on touch-only devices — no distortion makes sense */
    var hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function go() {
      /* wait one rAF for layout to settle */
      requestAnimationFrame(function () {
        build(img);
        /* if no hover, still render static pixelated — keep portrait CSS doing its job */
        if (!hasHover) {
          /* show img back — mobile just sees the original portrait */
          img.style.opacity = '';
          /* remove canvas */
          var c = document.querySelector('.portrait-pixel-canvas');
          if (c) c.remove();
        }
      });
    }

    if (img.complete && img.naturalWidth > 0) {
      go();
    } else {
      img.addEventListener('load',  go, { once: true });
      /* if image fails onerror fires, portrait-fb shows — do nothing */
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
