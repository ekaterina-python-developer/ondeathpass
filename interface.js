(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Boot overlay: decorative and intentionally brief.
  const boot = document.querySelector('.boot-screen');
  if (boot) {
    window.addEventListener('load', () => {
      window.setTimeout(() => boot.classList.add('is-hidden'), reducedMotion ? 0 : 1050);
    }, { once: true });
  }

  // Interface clock.
  const clock = document.getElementById('system-clock');
  const updateClock = () => {
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date());
  };
  updateClock();
  window.setInterval(updateClock, 1000);

  // Scroll reveals; content remains visible when motion is reduced.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Subtle HUD parallax, not page movement.
  document.querySelectorAll('[data-parallax-root]').forEach((area) => {
    const layers = area.querySelectorAll('[data-parallax-layer]');
    if (!layers.length || reducedMotion) return;

    area.addEventListener('pointermove', (event) => {
      const rect = area.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      layers.forEach((layer) => {
        const depth = Number(layer.dataset.parallaxLayer || 10);
        layer.style.setProperty('--parallax-x', `${x * depth}px`);
        layer.style.setProperty('--parallax-y', `${y * depth}px`);
      });
    });

    area.addEventListener('pointerleave', () => {
      layers.forEach((layer) => {
        layer.style.setProperty('--parallax-x', '0px');
        layer.style.setProperty('--parallax-y', '0px');
      });
    });
  });

  // Adds a short signal disturbance at irregular intervals.
  const title = document.querySelector('.hero__title');
  if (title && !reducedMotion) {
    const triggerGlitch = () => {
      title.classList.add('is-glitching');
      window.setTimeout(() => title.classList.remove('is-glitching'), 420);
      window.setTimeout(triggerGlitch, 4800 + Math.random() * 5200);
    };
    window.setTimeout(triggerGlitch, 3200);
  }

  // CSS can use this for fine progressive enhancement.
  root.classList.add('interface-ready');
})();
