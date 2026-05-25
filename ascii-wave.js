/**
 * ASCII Wave Effect
 * Retro-style text-based animation using ASCII characters
 * Inspired by Lightswind UI component
 */
(function () {
  function initAsciiWave() {
    const container = document.getElementById('ascii-wave-container');
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    // ASCII characters for wave effect (from dense to sparse)
    const ASCII_CHARS = '@%#*+=-:. ';
    
    let width, height, cols, rows;
    let time = 0;
    const CHAR_SIZE = 10;
    const COLOR = '#fb923c'; // Orange color matching your theme
    const SPEED = 1;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      
      width = rect.width;
      height = rect.height;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      ctx.scale(dpr, dpr);
      ctx.font = `${CHAR_SIZE}px monospace`;
      ctx.textBaseline = 'top';
      
      cols = Math.floor(width / CHAR_SIZE);
      rows = Math.floor(height / CHAR_SIZE);
    }

    function draw() {
      // Clear with black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = COLOR;
      
      // Draw ASCII wave pattern
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Create wave pattern using sine waves
          const wave1 = Math.sin((x * 0.1) + (time * 0.02 * SPEED));
          const wave2 = Math.sin((y * 0.1) + (time * 0.03 * SPEED));
          const wave3 = Math.sin((x * 0.05 + y * 0.05) + (time * 0.01 * SPEED));
          
          // Combine waves
          const combined = (wave1 + wave2 + wave3) / 3;
          
          // Map wave value to ASCII character index
          const charIndex = Math.floor(((combined + 1) / 2) * (ASCII_CHARS.length - 1));
          const char = ASCII_CHARS[charIndex];
          
          // Add some vertical wave motion
          const yOffset = Math.sin((x * 0.2) + (time * 0.02 * SPEED)) * 5;
          
          // Calculate opacity based on wave intensity
          const opacity = 0.3 + (Math.abs(combined) * 0.7);
          ctx.globalAlpha = opacity;
          
          ctx.fillText(char, x * CHAR_SIZE, (y * CHAR_SIZE) + yOffset);
        }
      }
      
      ctx.globalAlpha = 1;
      time++;
      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAsciiWave);
  } else {
    initAsciiWave();
  }
})();
