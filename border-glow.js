/**
 * Border Glow — ReactBits-style for .plat cards
 * Config: edgeSensitivity=10, glowRadius=25, coneSpread=10, borderRadius=50
 *
 * Uses --plat-angle (NOT --ga) because @property --ga is already registered
 * with inherits:false for the project-card spin effect, which would prevent
 * the value from reaching .plat::before.
 *
 * How it works:
 *  1. Compute the clock-hand angle from card centre → cursor
 *  2. Set --plat-angle so the conic-gradient cone aims at the cursor
 *  3. Compute edge proximity — only the outermost 10% of the card area
 *     (edgeSensitivity=10) ramps opacity 0→1, so the glow is invisible
 *     near the card centre and snaps on as the cursor nears an edge.
 */
(function () {
  'use strict';

  var EDGE_ZONE = 0.10;   // edgeSensitivity=10 → outer 10 % of card triggers glow

  function init() {
    var cards = document.querySelectorAll('.plat');
    if (!cards.length) return;

    // Touch-only devices have no mousemove — skip them
    if ('ontouchstart' in window &&
        !window.matchMedia('(pointer: fine)').matches) return;

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = this.getBoundingClientRect();
        var cx   = rect.width  / 2;
        var cy   = rect.height / 2;
        var mx   = e.clientX - rect.left;
        var my   = e.clientY - rect.top;

        // Angle from card centre → cursor.
        // +90° shifts so 0° = top, matching CSS conic-gradient's default start.
        var angle = Math.atan2(my - cy, mx - cx) * (180 / Math.PI) + 90;

        // Normalised distance from centre (0 = centre, 1 = edge) per axis
        var normX    = Math.abs(mx - cx) / cx;
        var normY    = Math.abs(my - cy) / cy;
        var edgeProx = Math.max(normX, normY);   // nearest edge wins

        // Ramp: 0 when cursor is in the inner (1 - EDGE_ZONE) of the card,
        //       1 when cursor is right at the card edge.
        var threshold = 1 - EDGE_ZONE;
        var opacity   = Math.max(0, Math.min(1,
          (edgeProx - threshold) / EDGE_ZONE
        ));

        // --plat-angle: no @property registration → inherits normally to ::before
        this.style.setProperty('--plat-angle',   angle + 'deg');
        this.style.setProperty('--plat-glow-op', opacity);
      }, { passive: true });

      card.addEventListener('mouseleave', function () {
        this.style.setProperty('--plat-glow-op', '0');
      }, { passive: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
