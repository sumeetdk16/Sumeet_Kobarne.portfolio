/**
 * Aceternity-style Typewriter Effect
 * Types out characters one by one inside #typewriter-root.
 * The parent h1.about-h.shiny-text provides the orange gradient.
 */
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("typewriter-root");
  if (!root) return;

  const fullText   = "Hello! I'm Sumeet Kobarne.";
  const CHAR_DELAY  = 65;   // ms per character
  const START_DELAY = 400;  // ms before typing begins

  // ── Build DOM ─────────────────────────────────────────────────
  const textNode = document.createElement("span");
  textNode.className = "tw-text";
  root.appendChild(textNode);

  const cursor = document.createElement("span");
  cursor.className = "tw-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.textContent = "|";
  root.appendChild(cursor);

  // ── Type characters ───────────────────────────────────────────
  let index = 0;

  function typeNext() {
    if (index >= fullText.length) return; // done
    textNode.textContent = fullText.substring(0, index + 1);
    index++;
    setTimeout(typeNext, CHAR_DELAY);
  }

  setTimeout(typeNext, START_DELAY);
});
