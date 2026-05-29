/**
 * Card Hover Effect — Aceternity UI style for .plat cards
 *
 * Matches the actual Aceternity structure:
 *   .plat           → transparent outer wrapper (position:relative)
 *     .card-spot    → spotlight, absolute inset:0, z-index:0
 *     .plat-inner   → the actual dark card, position:relative, z-index:1
 *
 * The spotlight fills the outer wrapper; the dark card sits on top of it.
 * This makes the light-gray glow peek around the edges of the black card.
 *
 * Sliding uses the FLIP technique driven directly on spot.style.
 */
(function () {
  'use strict';

  function initGrid(grid) {
    /* touch-only devices — skip */
    if ('ontouchstart' in window &&
        !window.matchMedia('(pointer: fine)').matches) return;

    var cards = Array.from(grid.querySelectorAll('.plat'));
    if (!cards.length) return;

    /* ── Restructure each card ───────────────────────────────────────────
       Wrap existing children in .plat-inner, add .card-spot before it.  */
    cards.forEach(function (card) {
      /* Wrap all current children in an inner card div */
      var inner = document.createElement('div');
      inner.className = 'plat-inner';
      while (card.firstChild) {
        inner.appendChild(card.firstChild);
      }

      /* Spotlight span — goes in BEFORE the inner card */
      var spot = document.createElement('span');
      spot.className = 'card-spot';

      card.appendChild(spot);
      card.appendChild(inner);
    });

    /* ── Hover animation ─────────────────────────────────────────────── */
    var prev     = null;
    var prevSpot = null;

    cards.forEach(function (card) {
      var spot = card.querySelector('.card-spot');

      card.addEventListener('mouseenter', function () {
        if (prev && prev !== card) {
          /* ── FLIP slide ────────────────────────────────────────────
             Snap the spotlight to the previous card's position,
             then animate it to this card's natural position.         */
          var pr = prev.getBoundingClientRect();
          var cr = card.getBoundingClientRect();
          var dx = pr.left - cr.left;
          var dy = pr.top  - cr.top;

          /* 1. Snap — no transition */
          spot.style.transition = 'none';
          spot.style.transform  = 'translate(' + dx + 'px,' + dy + 'px)';
          spot.style.opacity    = '1';

          /* 2. Force reflow so the snap commits */
          spot.offsetHeight; // eslint-disable-line no-unused-expressions

          /* 3. Animate to rest position */
          spot.style.transition = 'transform 0.6s cubic-bezier(.25,0.1,.25,1), opacity 0.3s ease';
          spot.style.transform  = 'translate(0px,0px)';

          /* 4. Fade out previous spot */
          prevSpot.style.transition = 'opacity 0.45s ease';
          prevSpot.style.opacity    = '0';
          prevSpot.style.transform  = 'translate(0px,0px)';

        } else if (!prev) {
          /* First hover — simple fade in */
          spot.style.transition = 'opacity 0.4s ease';
          spot.style.transform  = 'translate(0px,0px)';
          spot.style.opacity    = '1';
        }

        prev     = card;
        prevSpot = spot;
      }, { passive: true });
    });

    /* Cursor left the grid — fade out */
    grid.addEventListener('mouseleave', function () {
      if (prevSpot) {
        prevSpot.style.transition = 'opacity 0.5s ease';
        prevSpot.style.opacity    = '0';
      }
      prev     = null;
      prevSpot = null;
    }, { passive: true });
  }

  function init() {
    document.querySelectorAll('.plat-grid').forEach(initGrid);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
