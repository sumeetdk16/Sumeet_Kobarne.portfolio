/**
 * Circle-spread theme transition
 * Wraps window.__setTheme with a View Transitions API radial reveal
 * that expands from the button click position.
 */
(function () {
  var lastX = window.innerWidth  / 2;
  var lastY = window.innerHeight / 2;

  // Capture click origin in the capture phase (runs before shader.js listener)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('#theme-btn, #nav-drawer-theme-btn');
    if (btn) {
      lastX = e.clientX;
      lastY = e.clientY;
    }
  }, true);

  function patch() {
    if (!window.__setTheme) {
      // shader.js not ready yet — retry in a tick
      setTimeout(patch, 30);
      return;
    }

    var _original = window.__setTheme;
    var _patched  = false;

    // Guard: only patch once
    if (window.__themeCirclePatched) return;
    window.__themeCirclePatched = true;

    window.__setTheme = function (t) {
      var x = lastX;
      var y = lastY;

      // Fallback: no View Transitions support
      if (!document.startViewTransition) {
        _original(t);
        return;
      }

      var maxR = Math.hypot(
        Math.max(x, window.innerWidth  - x),
        Math.max(y, window.innerHeight - y)
      );

      // Freeze background-clip:text elements to prevent glitch in snapshot
      document.documentElement.classList.add('vt-in-progress');

      var transition = document.startViewTransition(function () {
        _original(t);
      });

      transition.ready.then(function () {
        document.documentElement.animate(
          {
            clipPath: [
              'circle(0px at ' + x + 'px ' + y + 'px)',
              'circle(' + maxR + 'px at ' + x + 'px ' + y + 'px)'
            ]
          },
          {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });

      transition.finished.then(function () {
        document.documentElement.classList.remove('vt-in-progress');
      }).catch(function () {
        document.documentElement.classList.remove('vt-in-progress');
      });
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patch);
  } else {
    patch();
  }
})();
