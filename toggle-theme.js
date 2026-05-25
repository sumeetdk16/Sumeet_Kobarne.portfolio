/**
 * toggle-theme.js
 * Lightswind UI — toggle-theme, ported to vanilla JS
 * Uses the View Transitions API for smooth animated theme switching.
 * Animation: "circle-spread" (expands from the button outward)
 */
(function () {
  const DURATION       = 420;
  const ANIMATION_TYPE = 'circle-spread'; // change to any supported type below

  // ── Supported types:
  //   circle-spread | round-morph | swipe-left | swipe-right
  //   swipe-up | swipe-down | diag-down-right | fade-in-out
  //   shrink-grow | wave-ripple | none

  // ── Inject view-transition reset so JS animations take full control ──
  const styleReset = document.createElement('style');
  styleReset.textContent = `
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation: none;
      mix-blend-mode: normal;
    }
  `;
  document.head.appendChild(styleReset);

  // ── Read persisted theme on load ────────────────────────────────────
  (function applyStoredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }

  // ── Update all theme button icons ────────────────────────────────────
  function syncIcons() {
    const dark = isDark();
    document.querySelectorAll('.theme-btn, .nav-drawer-theme-btn').forEach(btn => {
      btn.textContent = dark ? '☀️' : '🌙';
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  // ── Run the animation via View Transitions API ───────────────────────
  function runAnimation(btn) {
    const rect = btn.getBoundingClientRect();
    const x    = rect.left + rect.width  / 2;
    const y    = rect.top  + rect.height / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth  - x),
      Math.max(y, window.innerHeight - y)
    );
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    switch (ANIMATION_TYPE) {
      case 'circle-spread':
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`] },
          { duration: DURATION, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
        );
        break;

      case 'round-morph':
        document.documentElement.animate(
          [{ opacity: 0, transform: 'scale(0.8) rotate(5deg)' }, { opacity: 1, transform: 'scale(1) rotate(0deg)' }],
          { duration: DURATION * 1.2, easing: 'cubic-bezier(0.68,-0.55,0.265,1.55)', pseudoElement: '::view-transition-new(root)' }
        );
        break;

      case 'swipe-left':
        document.documentElement.animate(
          { clipPath: [`inset(0 0 0 ${vw}px)`, 'inset(0 0 0 0)'] },
          { duration: DURATION, easing: 'cubic-bezier(0.2,0,0,1)', pseudoElement: '::view-transition-new(root)' }
        );
        break;

      case 'swipe-right':
        document.documentElement.animate(
          { clipPath: [`inset(0 ${vw}px 0 0)`, 'inset(0 0 0 0)'] },
          { duration: DURATION, easing: 'cubic-bezier(0.2,0,0,1)', pseudoElement: '::view-transition-new(root)' }
        );
        break;

      case 'swipe-up':
        document.documentElement.animate(
          { clipPath: [`inset(${vh}px 0 0 0)`, 'inset(0 0 0 0)'] },
          { duration: DURATION, easing: 'cubic-bezier(0.2,0,0,1)', pseudoElement: '::view-transition-new(root)' }
        );
        break;

      case 'swipe-down':
        document.documentElement.animate(
          { clipPath: [`inset(0 0 ${vh}px 0)`, 'inset(0 0 0 0)'] },
          { duration: DURATION, easing: 'cubic-bezier(0.2,0,0,1)', pseudoElement: '::view-transition-new(root)' }
        );
        break;

      case 'diag-down-right':
        document.documentElement.animate(
          { clipPath: ['polygon(0 0,0 0,0 0,0 0)', 'polygon(0 0,100% 0,100% 100%,0 100%)'] },
          { duration: DURATION * 1.5, easing: 'cubic-bezier(0.4,0,0.2,1)', pseudoElement: '::view-transition-new(root)' }
        );
        break;

      case 'fade-in-out':
        document.documentElement.animate(
          { opacity: [0, 1] },
          { duration: DURATION * 0.5, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
        );
        break;

      case 'shrink-grow':
        document.documentElement.animate(
          [{ transform: 'scale(0.9)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
          { duration: DURATION * 1.2, easing: 'cubic-bezier(0.19,1,0.22,1)', pseudoElement: '::view-transition-new(root)' }
        );
        document.documentElement.animate(
          [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.05)', opacity: 0 }],
          { duration: DURATION * 1.2, easing: 'cubic-bezier(0.19,1,0.22,1)', pseudoElement: '::view-transition-old(root)' }
        );
        break;

      case 'wave-ripple':
        document.documentElement.animate(
          { clipPath: [`circle(0% at 50% 50%)`, `circle(${maxRadius}px at 50% 50%)`] },
          { duration: DURATION * 1.5, easing: 'cubic-bezier(0.68,-0.55,0.265,1.55)', pseudoElement: '::view-transition-new(root)' }
        );
        break;

      case 'none':
      default:
        break;
    }
  }

  // ── Toggle handler ───────────────────────────────────────────────────
  async function toggleTheme(btn) {
    const newDark = !isDark();

    // View Transitions API — fall back gracefully if not supported
    if (!document.startViewTransition) {
      document.documentElement.setAttribute('data-theme', newDark ? 'dark' : 'light');
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
      syncIcons();
      return;
    }

    const transition = document.startViewTransition(() => {
      document.documentElement.setAttribute('data-theme', newDark ? 'dark' : 'light');
      localStorage.setItem('theme', newDark ? 'dark' : 'light');
      syncIcons();
    });

    await transition.ready;
    runAnimation(btn);
  }

  // ── Wire up all theme buttons ────────────────────────────────────────
  function init() {
    syncIcons(); // set correct icon on load

    document.querySelectorAll('.theme-btn, .nav-drawer-theme-btn').forEach(btn => {
      btn.addEventListener('click', () => toggleTheme(btn));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
