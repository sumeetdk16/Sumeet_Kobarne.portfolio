/**
 * magnetic-button.js
 * Buttery-smooth magnetic pull effect for [data-magnetic] elements.
 *
 * Technique: continuous rAF lerp loop — no CSS transitions during movement,
 * so there's zero jank. CSS spring only fires on mouse-leave.
 *
 * Disabled on touch/pointer:coarse devices (phones & tablets).
 */
(function () {
  'use strict';

  // Skip entirely on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  // How far the button travels toward the cursor (0–1)
  const STRENGTH = 0.40;
  // Lerp factor per frame — higher = snappier, lower = more floaty (0.08–0.18 is sweet spot)
  const LERP = 0.12;
  // Spring-back CSS easing on mouse-leave
  const SPRING_MS = 700;
  const SPRING_EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

  function initMagnetic(el) {
    const inner = el.querySelector('[data-magnetic-inner]') || el;

    // Current interpolated position
    let curX = 0, curY = 0;
    // Target position (set on mousemove)
    let tgtX = 0, tgtY = 0;
    // Whether the mouse is inside the hit zone
    let active = false;
    let rafId = null;

    function loop() {
      // Lerp toward target
      curX += (tgtX - curX) * LERP;
      curY += (tgtY - curY) * LERP;

      // Apply with no CSS transition (we're driving it frame-by-frame)
      inner.style.transition = 'none';
      inner.style.transform = `translate(${curX}px, ${curY}px)`;

      // Keep looping while active or while still moving (> 0.01px away)
      if (active || Math.abs(tgtX - curX) > 0.01 || Math.abs(tgtY - curY) > 0.01) {
        rafId = requestAnimationFrame(loop);
      } else {
        // Fully settled — snap to exact zero and stop
        inner.style.transform = 'translate(0px, 0px)';
        rafId = null;
      }
    }

    function startLoop() {
      if (!rafId) rafId = requestAnimationFrame(loop);
    }

    function onMove(e) {
      active = true;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      tgtX = (e.clientX - cx) * STRENGTH;
      tgtY = (e.clientY - cy) * STRENGTH;
      startLoop();
    }

    function onLeave() {
      active = false;
      tgtX = 0;
      tgtY = 0;

      // Cancel the lerp loop and hand off to a CSS spring for the snap-back
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      inner.style.transition = `transform ${SPRING_MS}ms ${SPRING_EASE}`;
      inner.style.transform = 'translate(0px, 0px)';

      // After spring settles, clear the inline transition so hover styles work normally
      const tid = setTimeout(() => {
        inner.style.transition = '';
        curX = 0;
        curY = 0;
      }, SPRING_MS);

      // Clean up timer if element is removed
      el._magneticTimer = tid;
    }

    el.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseleave', onLeave);
  }

  function init() {
    document.querySelectorAll('[data-magnetic]').forEach(initMagnetic);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
