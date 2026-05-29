/**
 * Morphing Text — MagicUI style
 *
 * Two overlapping spans cross-fade through an SVG blur+threshold filter,
 * producing the liquid "melting" transition between words.
 */
(function () {
  'use strict';

  var TEXTS = [
    'Software Engineer',
    'Full Stack Dev',
    'Problem Solver',
    'Code Craftsman',
    'Web Developer',
    'CP Enthusiast',
    'System Designer',
    'Open Source Fan',
  ];

  var MORPH_TIME  = 1.2;  // seconds for one morph transition
  var COOLDOWN    = 2.8;  // seconds to hold each word

  /* ── Inject SVG blur+threshold filter once ───────────────── */
  function injectFilter() {
    if (document.getElementById('morph-filter')) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
    svg.innerHTML =
      '<defs>' +
        '<filter id="morph-filter">' +
          '<feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>' +
          '<feColorMatrix in="blur" mode="matrix" ' +
            'values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"/>' +
        '</filter>' +
      '</defs>';
    document.body.insertBefore(svg, document.body.firstChild);
  }

  function init() {
    var wrap = document.querySelector('.morphing-text-wrap');
    if (!wrap) return;

    injectFilter();

    /* Two text spans */
    var elA = document.createElement('span');
    var elB = document.createElement('span');
    elA.className = 'morph-span';
    elB.className = 'morph-span';
    wrap.appendChild(elA);
    wrap.appendChild(elB);

    /* Apply the SVG filter to container */
    wrap.style.filter = 'url(#morph-filter)';

    /* ── Animation state ─────────────────────────────────────── */
    var idx      = 0;          // index of the CURRENTLY displayed word
    var state    = 'cooldown'; // 'cooldown' | 'morphing'
    var elapsed  = 0;
    var lastTs   = null;

    /* Show the current word fully (no morph) */
    function showCurrent() {
      elA.textContent   = TEXTS[idx % TEXTS.length];
      elA.style.filter  = 'blur(0px)';
      elA.style.opacity = '1';
      elB.textContent   = TEXTS[(idx + 1) % TEXTS.length];
      elB.style.filter  = 'blur(8px)';
      elB.style.opacity = '0';
    }

    /* Set morph at fraction 0→1 (0 = current fully visible, 1 = next fully visible) */
    function setMorph(fraction) {
      elA.textContent = TEXTS[idx       % TEXTS.length];
      elB.textContent = TEXTS[(idx + 1) % TEXTS.length];

      /* elA fades out */
      var f1    = 1 - fraction;
      var blur1 = Math.min(8 / (f1 + 0.001) - 8, 100);
      elA.style.filter  = 'blur(' + blur1.toFixed(1) + 'px)';
      elA.style.opacity = Math.pow(f1, 0.4 / 3);

      /* elB fades in */
      var blur2 = Math.min(8 / (fraction + 0.001) - 8, 100);
      elB.style.filter  = 'blur(' + blur2.toFixed(1) + 'px)';
      elB.style.opacity = Math.pow(fraction, 0.4 / 3);
    }

    function frame(ts) {
      requestAnimationFrame(frame);

      if (lastTs === null) { lastTs = ts; showCurrent(); return; }
      var dt   = Math.min((ts - lastTs) / 1000, 0.1);
      lastTs   = ts;
      elapsed += dt;

      if (state === 'cooldown') {
        if (elapsed >= COOLDOWN) {
          elapsed = 0;
          state   = 'morphing';
        } else {
          showCurrent();
        }
      } else {
        /* morphing */
        var fraction = Math.min(elapsed / MORPH_TIME, 1);
        setMorph(fraction);

        if (fraction >= 1) {
          idx     = (idx + 1) % TEXTS.length;
          elapsed = 0;
          state   = 'cooldown';
          showCurrent();
        }
      }
    }

    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
