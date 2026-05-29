/**
 * kinetic-text.js
 * Faithful vanilla port of MagicUI's KineticText component.
 *
 * Each character in [data-kinetic] elements is wrapped in a <span.kt-char>.
 * Hovering a character bolds it (font-weight 900) while adjacent
 * siblings fall off in weight — creating a smooth kinetic wave.
 *
 * Uses CSS :has() for the neighbour cascade (supported in all modern browsers).
 * Falls back gracefully (just no wave) in older browsers.
 *
 * Design decisions:
 * - <em> children are flattened into the parent so the :has() sibling
 *   cascade works across the whole heading (not just within the em).
 *   Italic styling is preserved via a data-italic attribute on the spans.
 * - aria-label is set on the parent so screen readers read the full text.
 * - shiny-text gradient is re-applied per-char via CSS (see style.css).
 */
(function () {
  'use strict';

  function splitIntoChars(el) {
    // Capture full text for aria before we destroy innerHTML
    const fullText = el.textContent;
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';

    // Set accessible label so screen readers get the full heading
    if (!el.getAttribute('aria-label')) {
      el.setAttribute('aria-label', fullText.trim());
    }

    nodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split('').forEach(function (char) {
          el.appendChild(makeCharSpan(char, false));
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Flatten em/strong/etc. — preserve italic via data attr
        const isItalic = node.tagName === 'EM' || window.getComputedStyle(node).fontStyle === 'italic';
        node.textContent.split('').forEach(function (char) {
          el.appendChild(makeCharSpan(char, isItalic));
        });
      }
    });
  }

  function makeCharSpan(char, italic) {
    const span = document.createElement('span');
    span.className = 'kt-char' + (italic ? ' kt-italic' : '');
    span.setAttribute('aria-hidden', 'true');
    span.textContent = char === ' ' ? '\u00A0' : char;
    return span;
  }

  function init() {
    document.querySelectorAll('[data-kinetic]').forEach(function (el) {
      if (el.dataset.kineticReady) return;
      el.dataset.kineticReady = '1';
      el.classList.add('kt-text');
      splitIntoChars(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
