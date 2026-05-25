/**
 * Typewriter Effect — improved
 *
 * 1. #typewriter-root  (about page) — single-shot with natural rhythm
 * 2. #typing-name      (home hero)  — cycles strings, cursor pauses while typing
 */

/* ── About page: single-shot typewriter ─────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('typewriter-root');
  if (root) {
    const fullText    = "Hello! I'm Sumeet Kobarne.";
    const BASE_DELAY  = 62;
    const START_DELAY = 500;

    const textNode = document.createElement('span');
    textNode.className = 'tw-text';
    root.appendChild(textNode);

    const cursor = document.createElement('span');
    cursor.className = 'tw-cursor tw-typing'; // no blink while typing
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = '|';
    root.appendChild(cursor);

    let index = 0;

    function naturalDelay(char) {
      // Longer pause after sentence-ending punctuation and at spaces between words
      if (char === '.' || char === '!' || char === '?') return BASE_DELAY + 180;
      if (char === ',') return BASE_DELAY + 80;
      if (char === ' ')  return BASE_DELAY + Math.random() * 30;
      // Slight jitter for each character (natural typing rhythm)
      return BASE_DELAY + (Math.random() * 40 - 20);
    }

    function typeNext() {
      if (index >= fullText.length) {
        // Done — let cursor resume blinking
        cursor.classList.remove('tw-typing');
        return;
      }
      textNode.textContent = fullText.substring(0, index + 1);
      const delay = naturalDelay(fullText[index]);
      index++;
      setTimeout(typeNext, delay);
    }

    setTimeout(typeNext, START_DELAY);
  }

  /* ── Home hero: cycling typewriter ──────────────────────────── */
  const nameEl = document.getElementById('typing-name');
  if (nameEl) {
    let strings = ['Sumeet Kobarne', 'Sumeet.kobarne'];
    try {
      const parsed = JSON.parse(nameEl.dataset.strings || '[]');
      if (Array.isArray(parsed) && parsed.length) strings = parsed;
    } catch (e) {}

    const BASE_TYPE   = parseInt(nameEl.dataset.speed, 10) || 78;
    const BASE_DELETE = Math.round(BASE_TYPE * 0.48); // deleting is faster
    const PAUSE_TYPED   = 1900; // hold after fully typed
    const PAUSE_DELETED = 380;  // pause before typing next string

    nameEl.textContent = '';

    // Find or create the cursor sibling
    let cursor = nameEl.parentElement
      ? nameEl.parentElement.querySelector('.typing-cursor')
      : null;

    let strIndex  = 0;
    let charIndex = 0;
    let isDeleting = false;

    function jitter(base) {
      // ±25% natural variance
      return Math.max(20, base + (Math.random() * base * 0.5 - base * 0.25));
    }

    function charDelay(ch, deleting) {
      if (deleting) return jitter(BASE_DELETE);
      // Slight extra pause after spaces (word boundary feel)
      if (ch === ' ') return jitter(BASE_TYPE) + 30;
      return jitter(BASE_TYPE);
    }

    function setCursorTyping(active) {
      if (!cursor) return;
      if (active) cursor.classList.add('tw-typing');
      else        cursor.classList.remove('tw-typing');
    }

    function tick() {
      const current = strings[strIndex];

      if (!isDeleting) {
        nameEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        setCursorTyping(true);

        if (charIndex === current.length) {
          isDeleting = true;
          setCursorTyping(false); // blink during the hold
          setTimeout(tick, PAUSE_TYPED);
          return;
        }
        setTimeout(tick, charDelay(current[charIndex - 1], false));
      } else {
        nameEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        setCursorTyping(true);

        if (charIndex === 0) {
          isDeleting = false;
          strIndex = (strIndex + 1) % strings.length;
          setCursorTyping(false);
          setTimeout(tick, PAUSE_DELETED);
          return;
        }
        setTimeout(tick, charDelay(current[charIndex], true));
      }
    }

    setTimeout(tick, 700);
  }
});
