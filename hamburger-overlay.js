/**
 * Hamburger Menu Overlay
 * Orange gradient full-screen overlay with circular clip-path reveal
 * from the hamburger button position, plus staggered link entrance.
 */
(function () {
  function init() {
    var hamburger = document.getElementById('nav-hamburger');
    var drawer    = document.getElementById('nav-drawer');
    if (!hamburger || !drawer) return;

    var links = drawer.querySelectorAll('.nav-drawer-link');

    // Write the hamburger centre as CSS custom properties so the
    // clip-path circle origin in CSS tracks the real button position.
    function setOrigin() {
      var r = hamburger.getBoundingClientRect();
      var x = Math.round(r.left + r.width  / 2);
      var y = Math.round(r.top  + r.height / 2);
      document.documentElement.style.setProperty('--ham-x', x + 'px');
      document.documentElement.style.setProperty('--ham-y', y + 'px');
    }

    setOrigin();
    window.addEventListener('resize', setOrigin);

    // Stagger links in/out whenever the drawer gains or loses .open
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName !== 'class') return;
        if (drawer.classList.contains('open')) {
          setOrigin(); // refresh in case layout shifted
          links.forEach(function (link, i) {
            link.style.transitionDelay = (0.22 + i * 0.08) + 's';
            link.classList.add('ham-in');
          });
        } else {
          links.forEach(function (link) {
            link.style.transitionDelay = '0s';
            link.classList.remove('ham-in');
          });
        }
      });
    }).observe(drawer, { attributes: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
