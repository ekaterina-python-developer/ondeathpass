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

// ---------------------------------------------------------------------------
// CINEMATIC HERO SLIDER
// ---------------------------------------------------------------------------
(() => {
  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  const tabs = Array.from(slider.querySelectorAll('[data-hero-to]'));
  const prev = slider.querySelector('[data-hero-prev]');
  const next = slider.querySelector('[data-hero-next]');
  const pause = slider.querySelector('[data-hero-pause]');
  const counter = slider.querySelector('[data-hero-counter]');
  const brief = slider.querySelector('.hero__brief');
  const sceneCode = slider.querySelector('[data-scene-code]');
  const sceneTitle = slider.querySelector('[data-scene-title]');
  const sceneCopy = slider.querySelector('[data-scene-copy]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AUTOPLAY_DELAY = 8000;

  if (slides.length < 2) return;

  let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
  let timer = 0;
  let userPaused = reducedMotion;
  let pointerPaused = false;
  let focusPaused = false;
  let touchStartX = null;

  const format = (number) => String(number).padStart(2, '0');

  const canAutoplay = () => (
    !reducedMotion &&
    !userPaused &&
    !pointerPaused &&
    !focusPaused &&
    !document.hidden
  );

  const stopTimer = () => {
    window.clearTimeout(timer);
    timer = 0;
    slider.classList.remove('is-autoplaying');
  };

  const restartProgress = () => {
    slider.classList.remove('is-autoplaying');
    // Force a reflow so the progress animation starts from zero.
    void slider.offsetWidth;
    if (canAutoplay()) slider.classList.add('is-autoplaying');
  };

  const scheduleNext = () => {
    stopTimer();
    if (!canAutoplay()) return;
    restartProgress();
    timer = window.setTimeout(() => setSlide(index + 1, false), AUTOPLAY_DELAY);
  };

  const updateBrief = (slide) => {
    const apply = () => {
      if (sceneCode) sceneCode.textContent = slide.dataset.sceneCode || '';
      if (sceneTitle) sceneTitle.textContent = slide.dataset.sceneTitle || '';
      if (sceneCopy) sceneCopy.textContent = slide.dataset.sceneCopy || '';
      brief?.classList.remove('is-changing');
    };

    if (reducedMotion || !brief) {
      apply();
      return;
    }

    brief.classList.add('is-changing');
    window.setTimeout(apply, 180);
  };

  const setSlide = (requestedIndex, userInitiated = true) => {
    const nextIndex = (requestedIndex + slides.length) % slides.length;
    if (nextIndex === index && userInitiated) {
      scheduleNext();
      return;
    }

    const current = slides[index];
    const incoming = slides[nextIndex];

    current.classList.remove('is-active');
    current.setAttribute('aria-hidden', 'true');
    incoming.classList.add('is-active');
    incoming.setAttribute('aria-hidden', 'false');

    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === nextIndex;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    index = nextIndex;
    slider.style.setProperty('--target-x', incoming.dataset.targetX || '50%');
    slider.style.setProperty('--target-y', incoming.dataset.targetY || '50%');
    if (counter) counter.textContent = `${format(index + 1)} / ${format(slides.length)}`;

    updateBrief(incoming);

    slider.classList.remove('is-switching');
    void slider.offsetWidth;
    slider.classList.add('is-switching');
    window.setTimeout(() => slider.classList.remove('is-switching'), 480);

    scheduleNext();
  };

  const updatePauseButton = () => {
    if (!pause) return;
    pause.setAttribute('aria-pressed', String(userPaused));
    pause.setAttribute(
      'aria-label',
      userPaused ? 'Возобновить автоматическую смену' : 'Остановить автоматическую смену'
    );
    const icon = pause.querySelector('span');
    if (icon) icon.textContent = userPaused ? '▶' : 'Ⅱ';
  };

  prev?.addEventListener('click', () => setSlide(index - 1));
  next?.addEventListener('click', () => setSlide(index + 1));

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setSlide(Number(tab.dataset.heroTo)));
  });

  pause?.addEventListener('click', () => {
    userPaused = !userPaused;
    updatePauseButton();
    scheduleNext();
  });

  slider.addEventListener('pointerenter', () => {
    pointerPaused = true;
    stopTimer();
  });

  slider.addEventListener('pointerleave', () => {
    pointerPaused = false;
    scheduleNext();
  });

  slider.addEventListener('focusin', () => {
    focusPaused = true;
    stopTimer();
  });

  slider.addEventListener('focusout', (event) => {
    if (slider.contains(event.relatedTarget)) return;
    focusPaused = false;
    scheduleNext();
  });

  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setSlide(index - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setSlide(index + 1);
    }
  });

  slider.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    touchStartX = event.clientX;
  });

  slider.addEventListener('pointerup', (event) => {
    if (touchStartX === null || event.pointerType === 'mouse') return;
    const distance = event.clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) < 45) return;
    setSlide(index + (distance < 0 ? 1 : -1));
  });

  slider.addEventListener('pointercancel', () => {
    touchStartX = null;
  });

  document.addEventListener('visibilitychange', scheduleNext);

  // Sync UI with the initially active slide.
  setSlide(index, false);
  updatePauseButton();
})();
