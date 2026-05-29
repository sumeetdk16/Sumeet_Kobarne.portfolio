/**
 * Light Rays — MagicUI style background effect
 *
 * Matches the MagicUI defaults:
 *   count=7, color=rgba(160,210,255,0.2), blur=36px,
 *   opacity=0.65, speed=14s, length=70vh
 *
 * Injects animated ray divs into every <section> except .hero.
 */
(function () {
  'use strict';

  var RAY_COUNT  = 7;
  var RAY_COLOR  = 'rgba(160, 210, 255, 0.18)';
  var RAY_BLUR   = 36;      /* px */
  var RAY_OPACITY = 0.6;    /* max opacity */
  var RAY_SPEED  = 14;      /* seconds base */
  var RAY_LENGTH = '70vh';

  function buildRays(section) {
    /* Wrap needs overflow:hidden so rays don't bleed outside the section */
    var wrap = document.createElement('div');
    wrap.className = 'lr-wrap';
    wrap.setAttribute('aria-hidden', 'true');
    section.insertBefore(wrap, section.firstChild);

    for (var i = 0; i < RAY_COUNT; i++) {
      var ray = document.createElement('div');
      ray.className = 'lr-ray';

      /* Spread rays evenly with subtle random jitter */
      var left    = (i / (RAY_COUNT - 1)) * 80 + 10 + (Math.random() - 0.5) * 8;
      var width   = 45 + Math.random() * 75;
      var rot     = (Math.random() - 0.5) * 22;        /* deg */
      var dur     = RAY_SPEED * (0.7 + Math.random() * 0.6);
      var delay   = -(Math.random() * dur);             /* stagger via negative delay */
      var op      = RAY_OPACITY * (0.5 + Math.random() * 0.5);

      ray.style.cssText = [
        '--lr-rot:'     + rot.toFixed(1)  + 'deg',
        '--lr-op:'      + op.toFixed(2),
        'left:'         + left.toFixed(1) + '%',
        'width:'        + width.toFixed(0) + 'px',
        'height:'       + RAY_LENGTH,
        'filter:blur('  + RAY_BLUR + 'px)',
        'animation-duration:'      + dur.toFixed(1)   + 's',
        'animation-delay:'         + delay.toFixed(1) + 's',
      ].join(';');

      wrap.appendChild(ray);
    }
  }

  function init() {
    document.querySelectorAll('section:not(.hero)').forEach(function (sec) {
      /* avoid double-init */
      if (sec.querySelector('.lr-wrap')) return;
      /* section must be positioned so the absolute wrap anchors correctly */
      if (getComputedStyle(sec).position === 'static') {
        sec.style.position = 'relative';
      }
      buildRays(sec);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
