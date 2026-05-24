/* ═══════════════════════════════════════════
   VARIABLE PROXIMITY — Vanilla JS
   Each letter's font-variation-settings interpolates
   based on mouse distance from that letter.
   ═══════════════════════════════════════════ */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const RADIUS  = 120;
  const FALLOFF = 'gaussian';
  const FROM = { wght: 300, opsz: 9  };
  const TO   = { wght: 700, opsz: 144 };

  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('touchmove', e => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: true });

  function calcFalloff(dist) {
    const norm = Math.min(Math.max(1 - dist / RADIUS, 0), 1);
    switch (FALLOFF) {
      case 'exponential': return norm * norm;
      case 'gaussian':    return Math.exp(-((dist / (RADIUS / 2)) ** 2) / 2);
      default:            return norm;
    }
  }

  function wrapChars(el) {
    const html = el.innerHTML;
    const wrapped = html.replace(/(<[^>]+>)|([^<])/g, (match, tag, char) => {
      if (tag) return tag;
      if (char === ' ') return '<span class="vp-space">&nbsp;</span>';
      return `<span class="vp-char">${char}</span>`;
    });
    el.innerHTML = wrapped;
    el.querySelectorAll('.vp-char').forEach(span => {
      span.style.fontVariationSettings = `'wght' ${FROM.wght}, 'opsz' ${FROM.opsz}`;
    });
  }

  function startLoop(els) {
    let lastX = null, lastY = null;
    function tick() {
      requestAnimationFrame(tick);
      if (mouse.x === lastX && mouse.y === lastY) return;
      lastX = mouse.x; lastY = mouse.y;
      els.forEach(el => {
        el.querySelectorAll('.vp-char').forEach(span => {
          const r   = span.getBoundingClientRect();
          const cx  = r.left + r.width  / 2;
          const cy  = r.top  + r.height / 2;
          const dx  = mouse.x - cx;
          const dy  = mouse.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const t    = calcFalloff(dist);
          const wght = FROM.wght + (TO.wght - FROM.wght) * t;
          const opsz = FROM.opsz + (TO.opsz  - FROM.opsz) * t;
          span.style.fontVariationSettings = `'wght' ${wght.toFixed(1)}, 'opsz' ${opsz.toFixed(1)}`;
        });
      });
    }
    requestAnimationFrame(tick);
  }

  function init() {
    const targets = document.querySelectorAll('[data-vp]');
    if (!targets.length) return;
    targets.forEach(el => {
      el.style.fontFamily = "'Fraunces', Georgia, serif";
      wrapChars(el);
    });
    startLoop(targets);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
