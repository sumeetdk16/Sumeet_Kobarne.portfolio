document.addEventListener("DOMContentLoaded", () => {
  const element = document.getElementById("typing-name");
  if (!element) return;

  const strings = JSON.parse(element.getAttribute("data-strings") || '["Sumeet Kobarne"]');
  const speed = parseInt(element.getAttribute("data-speed") || "80", 10);
  const deleteSpeed = parseInt(element.getAttribute("data-delete-speed") || "40", 10);
  const pause = parseInt(element.getAttribute("data-pause") || "2000", 10);
  
  let stringIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentString = strings[stringIndex];
    if (isDeleting) {
      element.textContent = currentString.substring(0, charIndex - 1);
      charIndex--;
    } else {
      element.textContent = currentString.substring(0, charIndex + 1);
      charIndex++;
    }

    let currentSpeed = speed;

    if (!isDeleting && charIndex === currentString.length) {
      if (strings.length > 1) {
        currentSpeed = pause;
        isDeleting = true;
      } else {
        // Only one string, finish typing and keep the blinking cursor
        return;
      }
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      stringIndex = (stringIndex + 1) % strings.length;
      currentSpeed = 500; // Pause before typing the next string
    } else if (isDeleting) {
      currentSpeed = deleteSpeed;
    }

    setTimeout(type, currentSpeed);
  }

  // Initial delay before starting the animation
  setTimeout(type, 500);
});
