/**
 * focus-cards.js
 * Aceternity-style Focus Cards effect.
 *
 * Enter: fast (CSS 0.22s) — feels responsive.
 * Exit:  slow (CSS 0.55s) — blur dissolves gracefully.
 *
 * The JS holds a leaveTimer so the exit transition fully plays
 * before classes are cleared. Moving to another card cancels the
 * timer immediately so there's no flicker between cards.
 */
(function () {
  function initFocusCards(grid) {
    const wrappers = Array.from(grid.querySelectorAll('.r'));
    // Only keep wrappers that actually contain a card
    const cardWrappers = wrappers.filter(w => w.querySelector('.proj-card-new'));

    let leaveTimer = null;

    function activate(activeWrapper) {
      // Cancel any pending exit
      if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }

      grid.classList.add('has-focus');
      cardWrappers.forEach(function (w) {
        const isActive = w === activeWrapper;
        w.classList.toggle('focused-wrapper', isActive);
        const c = w.querySelector('.proj-card-new');
        if (c) c.classList.toggle('focused', isActive);
      });
    }

    function deactivate() {
      // Remove focused markers immediately so the focused card
      // starts its own exit transition right away
      cardWrappers.forEach(function (w) {
        w.classList.remove('focused-wrapper');
        const c = w.querySelector('.proj-card-new');
        if (c) c.classList.remove('focused');
      });

      // Wait for the CSS exit transition (0.55s) to finish before
      // removing has-focus, so siblings fade back smoothly
      leaveTimer = setTimeout(function () {
        grid.classList.remove('has-focus');
        leaveTimer = null;
      }, 520);
    }

    cardWrappers.forEach(function (wrapper) {
      const card = wrapper.querySelector('.proj-card-new');

      card.addEventListener('mouseenter', function () {
        activate(wrapper);
      });

      card.addEventListener('mouseleave', function (e) {
        // If moving directly to another card in the same grid, activate() will
        // fire immediately after — don't start the exit timer in that case.
        // We use a 0ms timeout so the next mouseenter fires first if applicable.
        leaveTimer = setTimeout(function () {
          deactivate();
        }, 0);
      });
    });

    // Safety: if the mouse leaves the whole grid, always clean up
    grid.addEventListener('mouseleave', function () {
      if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
      deactivate();
    });
  }

  function setup() {
    document.querySelectorAll('.proj-grid-new').forEach(initFocusCards);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
