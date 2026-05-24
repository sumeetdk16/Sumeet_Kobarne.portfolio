/* ═══════════════════════════════════════════
   PORTFOLIO INTERACTIONS
   1. Scroll progress bar
   2. Stat counter animation
   3. Skill tag ripple on click
   4. Hero floating particles
   5. Section entrance stagger
   ═══════════════════════════════════════════ */

/* ── 1. SCROLL PROGRESS BAR ─────────────── */
(function () {
  const bar = document.createElement('div');
  bar.id = 'scroll-bar';
  bar.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'height:2px',
    'width:0%', 'z-index:9998', 'pointer-events:none',
    'background:linear-gradient(90deg,#fb923c,#facc15,#f472b6)',
    'transition:width 0.1s linear',
    'box-shadow:0 0 8px rgba(251,146,60,0.6)',
  ].join(';');
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
  }, { passive: true });
})();

/* ── 2. STAT COUNTER ANIMATION ──────────── */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function animateCount(el) {
    const raw    = el.textContent.trim();
    const match  = raw.match(/^(\d+)(\D*)$/);
    if (!match) return;

    const target = parseInt(match[1], 10);
    const suffix = match[2] || '';
    const duration = 1400;
    const start    = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const statNums = e.target.querySelectorAll('.stat-n');
      statNums.forEach(animateCount);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stats').forEach(el => obs.observe(el));
})();

/* ── 3. SKILL TAG RIPPLE ─────────────────── */
(function () {
  document.querySelectorAll('.skill').forEach(skill => {
    skill.style.position = 'relative';
    skill.style.overflow = 'hidden';

    skill.addEventListener('click', function (e) {
      const rect   = this.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const ripple = document.createElement('span');

      ripple.style.cssText = [
        'position:absolute',
        `left:${x}px`, `top:${y}px`,
        'width:0', 'height:0',
        'border-radius:50%',
        'background:rgba(251,146,60,0.35)',
        'transform:translate(-50%,-50%)',
        'pointer-events:none',
        'animation:skill-ripple 0.55s ease-out forwards',
      ].join(';');

      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();

/* ── 4. HERO FLOATING PARTICLES ─────────── */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = [
    'position:absolute', 'inset:0',
    'width:100%', 'height:100%',
    'pointer-events:none', 'z-index:2',
    'opacity:0.55',
  ].join(';');
  hero.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, dpr;
  function resize() {
    dpr = window.devicePixelRatio || 1;
    W   = hero.offsetWidth;
    H   = hero.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#fb923c', '#facc15', '#f472b6', '#a78bfa'];
  const COUNT  = 28;

  const mouse = { x: W / 2, y: H / 2 };
  window.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  const particles = Array.from({ length: COUNT }, () => ({
    x:    Math.random() * 1200,
    y:    Math.random() * 700,
    r:    Math.random() * 2.5 + 0.8,
    vx:   (Math.random() - 0.5) * 0.35,
    vy:   (Math.random() - 0.5) * 0.35,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: Math.random() * 0.5 + 0.2,
    pulse: Math.random() * Math.PI * 2,
  }));

  function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);

    const t = performance.now() * 0.001;

    particles.forEach(p => {
      // Gentle mouse attraction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        p.vx += (dx / dist) * 0.012;
        p.vy += (dy / dist) * 0.012;
      }

      // Dampen velocity
      p.vx *= 0.98;
      p.vy *= 0.98;

      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      // Pulsing alpha
      const alpha = p.alpha * (0.7 + 0.3 * Math.sin(t * 1.5 + p.pulse));

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = p.r * 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw faint connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.save();
          ctx.globalAlpha = (1 - dist / 90) * 0.12;
          ctx.strokeStyle = particles[i].color;
          ctx.lineWidth   = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  draw();

  // Pause when hero is not visible
  const heroObs = new IntersectionObserver(entries => {
    canvas.style.display = entries[0].isIntersecting ? 'block' : 'none';
  }, { threshold: 0 });
  heroObs.observe(hero);
})();

/* ── 5. SECTION ENTRANCE STAGGER ────────── */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Stagger children of xp-list, skills, plat-grid on entrance
  const staggerTargets = [
    { selector: '.xp-list',   child: '.xp-item',   delay: 80  },
    { selector: '.skills',    child: '.skill',      delay: 40  },
    { selector: '.plat-grid', child: '.plat',       delay: 60  },
    { selector: '.proj-grid-new', child: '.r',      delay: 80  },
  ];

  staggerTargets.forEach(({ selector, child, delay }) => {
    document.querySelectorAll(selector).forEach(container => {
      const children = container.querySelectorAll(child);
      children.forEach((el, i) => {
        el.style.transitionDelay = `${i * delay}ms`;
      });

      const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        children.forEach(el => el.classList.add('in'));
        obs.unobserve(container);
      }, { threshold: 0.1 });

      obs.observe(container);
    });
  });
})();
