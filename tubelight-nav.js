/**
 * Tubelight Navbar Effect
 * A glowing white bar tracks the active / hovered nav link just below
 * the pill, casting a soft downward light-cone — like a fluorescent tube.
 */
(function () {
  function init() {
    var nav  = document.querySelector('.nav');
    var pill = document.querySelector('.nav-pill');
    var links = document.querySelectorAll('.nav-a');
    if (!nav || !pill || !links.length) return;

    // The tubelight element lives inside .nav (sibling of .nav-pill),
    // positioned absolute so it can overflow below the pill without clipping.
    var tube = document.createElement('div');
    tube.className = 'nav-tubelight';
    tube.setAttribute('aria-hidden', 'true');
    nav.appendChild(tube);

    function moveTo(el) {
      var navRect  = nav.getBoundingClientRect();
      var elRect   = el.getBoundingClientRect();
      // Bar is 68% of link width, centred over the link
      var shrink   = elRect.width * 0.16; // 16% inset on each side = 68% total
      tube.style.left    = (elRect.left - navRect.left + shrink) + 'px';
      tube.style.width   = (elRect.width - shrink * 2) + 'px';
      tube.style.opacity = '1';
    }

    function restoreActive() {
      var active = document.querySelector('.nav-a.on');
      if (active) moveTo(active);
      else tube.style.opacity = '0';
    }

    // Initial position — skip transition so it snaps on load
    var active = document.querySelector('.nav-a.on');
    if (active) {
      tube.style.transition = 'none';
      moveTo(active);
      requestAnimationFrame(function () {
        tube.style.transition = '';
      });
    } else {
      tube.style.opacity = '0';
    }

    links.forEach(function (link) {
      link.addEventListener('mouseenter', function () { moveTo(link); });
      link.addEventListener('mouseleave', restoreActive);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
