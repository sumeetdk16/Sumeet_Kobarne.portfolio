#!/bin/bash
set -e

# 1. Bundle shader.js with all its npm dependencies into a self-contained IIFE
npx vite build

# 2. Copy all static files into dist
cp index.html about.html projects.html style.css dist/
cp cursor-trail.js typewriter.js pixel-canvas.js dist/
cp magnet-lines.js variable-proximity.js interactions.js dist/
cp flipping-board.js footer-time.js draggable-footer.js dist/
cp resume.pdf dist/ 2>/dev/null || true
cp profile.jpg dist/ 2>/dev/null || true
cp -r fonts dist/ 2>/dev/null || true

# 3. Swap module shader import → bundled IIFE in all HTML files
# Use perl for cross-platform compatibility (works on both macOS and Linux/Vercel)
perl -i -pe 's|<script type="module" src="shader\.js"></script>|<script src="shader.bundle.iife.js"></script>|g' \
  dist/index.html dist/about.html dist/projects.html

# 4. typewriter.js doesn't need to be a module either
perl -i -pe 's|<script type="module" src="typewriter\.js"></script>|<script src="typewriter.js"></script>|g' \
  dist/index.html

echo "Build complete — dist/ is ready"
