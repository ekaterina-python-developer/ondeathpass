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

  // Interface clock (внутренние страницы с #system-clock; на главной часов нет).
  const clock = document.getElementById('system-clock');
  if (clock) {
    const updateClock = () => {
      clock.textContent = new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(new Date());
    };
    updateClock();
    window.setInterval(updateClock, 1000);
  }

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

  // На время скролла ставим флаг — CSS ставит animation-play-state: paused
  // у тяжёлых анимаций (дрифт hero), чтобы не дёргать GPU.
  let scrollingTimer = 0;
  window.addEventListener('scroll', () => {
    root.classList.add('is-scrolling');
    window.clearTimeout(scrollingTimer);
    scrollingTimer = window.setTimeout(() => {
      root.classList.remove('is-scrolling');
    }, 140);
  }, { passive: true });

  // Subtle HUD parallax, not page movement.
  // Только мышь: на тачскрине pointermove во время скролла дёргает кадр.
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('[data-parallax-root]').forEach((area) => {
    const layers = area.querySelectorAll('[data-parallax-layer]');
    if (!layers.length || reducedMotion || !canHover.matches) return;

    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    area.addEventListener('pointermove', (event) => {
      const rect = area.getBoundingClientRect();
      nextX = (event.clientX - rect.left) / rect.width - 0.5;
      nextY = (event.clientY - rect.top) / rect.height - 0.5;

      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        layers.forEach((layer) => {
          const depth = Number(layer.dataset.parallaxLayer || 10);
          layer.style.setProperty('--parallax-x', `${nextX * depth}px`);
          layer.style.setProperty('--parallax-y', `${nextY * depth}px`);
        });
      });
    });

    area.addEventListener('pointerleave', () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      layers.forEach((layer) => {
        layer.style.setProperty('--parallax-x', '0px');
        layer.style.setProperty('--parallax-y', '0px');
      });
    });
  });

  // Короткий глитч заголовка через случайные промежутки.
  const title = document.querySelector('.hero__title');
  if (title && !reducedMotion) {
    const triggerGlitch = () => {
      title.classList.add('is-glitching');
      window.setTimeout(() => title.classList.remove('is-glitching'), 420);
      // Раньше: 4.8–10 с. Теперь чаще: 2–4.5 с.
      window.setTimeout(triggerGlitch, 2000 + Math.random() * 2500);
    };
    window.setTimeout(triggerGlitch, 1400);
  }

  // CSS can use this for fine progressive enhancement.
  root.classList.add('interface-ready');

  // Тонкий индикатор скролла на правом краю сайдбара.
  // На мобиле рельса скрыта — не вешаем scroll-listener зря.
  const isCompactNav = window.matchMedia('(max-width: 900px)');

  document.querySelectorAll('.sidebar').forEach((sidebar) => {
    if (sidebar.querySelector('.sidebar__rail')) return;

    const rail = document.createElement('span');
    rail.className = 'sidebar__rail is-idle';
    rail.setAttribute('aria-hidden', 'true');
    rail.innerHTML = '<span class="sidebar__rail-thumb"></span>';
    sidebar.appendChild(rail);

    let ticking = false;
    const updateRail = () => {
      if (isCompactNav.matches) return;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 8) {
        rail.classList.add('is-idle');
        root.style.setProperty('--sidebar-scroll', '0');
        return;
      }
      rail.classList.remove('is-idle');
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      root.style.setProperty('--sidebar-scroll', String(progress));
    };

    const onScroll = () => {
      if (ticking || isCompactNav.matches) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateRail();
        ticking = false;
      });
    };

    updateRail();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateRail);
  });

})();

// Фоновая музыка: пробуем autoplay при загрузке; если браузер
// заблокировал звук — включаем после первого клика/клавиши.
// Трек берётся из audio/track.json или из файла с привычным именем.
(() => {
  const music = document.querySelector('#background-music');
  const soundButtons = Array.from(document.querySelectorAll('[data-sound-toggle]'));
  if (!music || !soundButtons.length) return;

  const STORAGE_KEY = 'death-pass-sound';
  const POSITION_KEY = 'death-pass-sound-time';
  const TRACK_KEY = 'death-pass-sound-track';
  const targetVolume = 0.08;
  let fadeTimer = null;
  let soundEnabled = localStorage.getItem(STORAGE_KEY) === 'on';
  // Пользователь сам выключил SOUND — не включаем автоматически.
  const userMuted = localStorage.getItem(STORAGE_KEY) === 'off';
  let toggling = false;
  let trackReady = null; // Promise: какой файл сейчас назначен плееру
  let unlockBound = false;

  music.volume = 0;
  music.loop = true;
  music.preload = 'auto';

  // Проверка: «файл на месте?» (как постучать в дверь и узнать, дома ли кто).
  const fileExists = async (url) => {
    try {
      const head = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
      if (head.ok) return true;
    } catch {
      // Некоторые хостинги не любят HEAD — тогда пробуем кусочек файла.
    }

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-1' },
        cache: 'no-cache'
      });
      return res.ok || res.status === 206;
    } catch {
      return false;
    }
  };

  const normalizeAudioPath = (value) => {
    if (!value || typeof value !== 'string') return null;
    const cleaned = value.trim().replace(/^\/+/, '');
    if (!cleaned || cleaned.includes('..')) return null;
    return cleaned.startsWith('audio/') ? cleaned : `audio/${cleaned}`;
  };

  // 1) читаем audio/track.json  2) иначе ищем файлы с обычными именами
  const resolveTrackSrc = async () => {
    try {
      const res = await fetch('audio/track.json', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        const fromConfig = normalizeAudioPath(data.file || data.src || data.track);
        if (fromConfig && await fileExists(fromConfig)) return fromConfig;
      }
    } catch {
      // Конфига нет — не страшно, пойдём по запасным именам.
    }

    const fallbacks = [
      'audio/death-pass-ambient.mp3',
      'audio/bgm.mp3',
      'audio/bgm.ogg',
      'audio/ambient.mp3',
      'audio/ambient.ogg',
      'audio/music.mp3'
    ];

    for (const src of fallbacks) {
      if (await fileExists(src)) return src;
    }

    return null;
  };

  const ensureTrackLoaded = () => {
    if (!trackReady) {
      trackReady = (async () => {
        const src = await resolveTrackSrc();
        if (!src) {
          throw new Error(
            'Трек не найден. Положи файл в audio/ и укажи имя в audio/track.json, либо назови файл bgm.mp3'
          );
        }

        // Если сменился трек — старую «закладку» по времени выбрасываем.
        const previous = sessionStorage.getItem(TRACK_KEY);
        if (previous && previous !== src) {
          sessionStorage.removeItem(POSITION_KEY);
        }
        sessionStorage.setItem(TRACK_KEY, src);

        if (music.getAttribute('src') !== src) {
          music.setAttribute('src', src);
          music.load();
        }

        return src;
      })();
    }
    return trackReady;
  };

  const updateButton = (isPlaying) => {
    soundButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(isPlaying));
      button.classList.toggle('is-playing', isPlaying);
      button.setAttribute(
        'aria-label',
        isPlaying ? 'Выключить фоновую музыку' : 'Включить фоновую музыку'
      );

      const desktopValue = button.querySelector('.sound-toggle__value');
      const desktopStatus = button.querySelector('.sound-toggle__status');
      const toplineState = button.querySelector('.sound-toggle__state');
      const mobileState = button.querySelector(
        '.topline__sound-state, .mobile-sound-toggle__state'
      );

      if (desktopValue) {
        desktopValue.textContent = isPlaying ? 'ЗВУК // ВКЛ' : 'ЗВУК // ВЫКЛ';
      }
      if (desktopStatus) {
        desktopStatus.textContent = isPlaying ? 'АУДИОКАНАЛ АКТИВЕН' : 'АУДИОКАНАЛ';
      }
      if (toplineState) {
        toplineState.textContent = isPlaying ? 'ВКЛ' : 'ВЫКЛ';
      }
      if (mobileState) {
        mobileState.textContent = isPlaying ? 'ON' : 'OFF';
      }
    });
  };

  const fadeTo = (target, duration = 600, onComplete) => {
    window.clearInterval(fadeTimer);
    const startVolume = music.volume;
    const difference = target - startVolume;
    const steps = 30;
    let currentStep = 0;

    fadeTimer = window.setInterval(() => {
      currentStep += 1;
      music.volume = Math.max(0, Math.min(1, startVolume + difference * (currentStep / steps)));
      if (currentStep >= steps) {
        window.clearInterval(fadeTimer);
        music.volume = target;
        onComplete?.();
      }
    }, duration / steps);
  };

  // Запоминаем, на какой секунде трек был — как закладка в книге.
  const persistPosition = () => {
    if (!soundEnabled || !Number.isFinite(music.currentTime)) return;
    sessionStorage.setItem(POSITION_KEY, String(music.currentTime));
  };

  const restorePosition = () => {
    const saved = Number.parseFloat(sessionStorage.getItem(POSITION_KEY) || '');
    if (!Number.isFinite(saved) || saved <= 0) return;

    try {
      if (Number.isFinite(music.duration) && saved < music.duration) {
        music.currentTime = saved;
      }
    } catch {
      // Браузер ещё не готов перемотать — просто начнём сначала.
    }
  };

  const waitForCanPlay = () =>
    new Promise((resolve, reject) => {
      if (music.error) {
        reject(music.error);
        return;
      }
      if (music.readyState >= 2) {
        resolve();
        return;
      }

      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(music.error || new Error('Не удалось загрузить трек'));
      };
      const cleanup = () => {
        music.removeEventListener('canplay', onReady);
        music.removeEventListener('error', onError);
      };

      music.addEventListener('canplay', onReady, { once: true });
      music.addEventListener('error', onError, { once: true });
    });

  const enableSound = async ({ restore = true, fadeMs = 2200 } = {}) => {
    if (toggling) return false;
    toggling = true;

    try {
      await ensureTrackLoaded();
      await waitForCanPlay();
      await music.play();
      if (restore) restorePosition();

      soundEnabled = true;
      localStorage.setItem(STORAGE_KEY, 'on');
      updateButton(true);
      fadeTo(targetVolume, fadeMs);
      return true;
    } catch (error) {
      soundEnabled = false;
      updateButton(false);
      trackReady = null;
      console.warn('Не удалось включить музыку:', error);
      return false;
    } finally {
      toggling = false;
    }
  };

  const removeUnlockListeners = () => {
    if (!unlockBound) return;
    document.removeEventListener('pointerdown', unlockMusic);
    document.removeEventListener('keydown', unlockMusic);
    unlockBound = false;
  };

  // Браузер часто блокирует звук, пока посетитель сам не кликнет
  // или не нажмёт клавишу (как «снять замок» с колонок).
  const unlockMusic = async (event) => {
    // Кнопку SOUND не трогаем — у неё свой обработчик.
    if (event?.target?.closest?.('[data-sound-toggle]')) return;

    const started = await enableSound({ restore: soundEnabled });
    if (started) removeUnlockListeners();
  };

  const bindUnlockListeners = () => {
    if (unlockBound || userMuted) return;
    document.addEventListener('pointerdown', unlockMusic);
    document.addEventListener('keydown', unlockMusic);
    unlockBound = true;
  };

  const disableSound = () => {
    if (toggling) return;
    soundEnabled = false;
    localStorage.setItem(STORAGE_KEY, 'off');
    sessionStorage.removeItem(POSITION_KEY);
    removeUnlockListeners();
    updateButton(false);
    fadeTo(0, 500, () => {
      music.pause();
    });
  };

  soundButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation();

      // Включено и реально играет — выключаем. Иначе пробуем включить.
      if (soundEnabled && !music.paused) {
        disableSound();
        return;
      }

      const started = await enableSound();
      if (started) removeUnlockListeners();
    });
  });

  // Перед уходом на другую страницу сохраняем позицию трека.
  window.addEventListener('pagehide', persistPosition);
  window.setInterval(persistPosition, 2000);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      persistPosition();
      if (!music.paused) music.pause();
      return;
    }

    if (!soundEnabled) return;

    ensureTrackLoaded()
      .then(() => music.play())
      .then(() => {
        updateButton(true);
        if (music.volume < targetVolume) fadeTo(targetVolume, 2200);
      })
      .catch(() => {
        updateButton(false);
      });
  });

  updateButton(false);

  // Пользователь раньше выключил звук — ждём только кнопку SOUND.
  if (userMuted) return;

  // После загрузки страницы пробуем включить музыку сами.
  // Если браузер запретил — ждём первое действие посетителя.
  window.addEventListener('load', async () => {
    const started = await enableSound({ restore: soundEnabled });
    if (!started) bindUnlockListeners();
  });
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
  // Ищем текст только внутри .hero__brief — иначе querySelector цепляет
  // сами слайды (у них тоже есть data-scene-*), и текст справа не обновляется.
  const brief = slider.querySelector('.hero__brief');
  const sceneCode = brief?.querySelector('[data-scene-code]');
  const sceneTitle = brief?.querySelector('[data-scene-title]');
  const sceneCopy = brief?.querySelector('[data-scene-copy]');
  const stamp = slider.querySelector('[data-hero-stamp]');
  const art = slider.querySelector('.hero__art');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AUTOPLAY_DELAY = 8000;

  if (slides.length < 2) return;

  let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
  let timer = 0;
  let userPaused = reducedMotion;
  let pointerPaused = false;
  let focusPaused = false;
  let touchStartX = null;
  // Пока курсор уже лежит на hero при загрузке — не считаем это «наведением».
  let hoverArmed = false;
  // Клик мышью фокусирует кнопку; из-за этого не должны глушить автопрокрутку.
  let pointerDrivenFocus = false;

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
      if (stamp) stamp.textContent = slide.dataset.stamp || '';
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
    if (nextIndex === index) {
      // Тот же слайд (старт или повторный клик по вкладке) — только синхронизация.
      updateBrief(slides[index]);
      if (counter) counter.textContent = `${format(index + 1)} / ${format(slides.length)}`;
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
    if (icon) icon.textContent = userPaused ? '▶' : '■';
  };

  prev?.addEventListener('click', () => setSlide(index - 1));
  next?.addEventListener('click', () => setSlide(index + 1));

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setSlide(Number(tab.dataset.heroTo)));
  });

  pause?.addEventListener('click', () => {
    userPaused = !userPaused;
    updatePauseButton();
    // После клика «▶» фокус остаётся на кнопке — не блокируем возобновление.
    if (!userPaused) focusPaused = false;
    scheduleNext();
  });

  // Пауза только над картинкой/контролами, не над текстом справа.
  const hoverRoot = art || slider;

  hoverRoot.addEventListener('pointerenter', () => {
    if (!hoverArmed) return;
    pointerPaused = true;
    stopTimer();
  });

  hoverRoot.addEventListener('pointerleave', () => {
    hoverArmed = true;
    pointerPaused = false;
    scheduleNext();
  });

  // Если курсор уже над art при загрузке — через мгновение разрешаем паузу по наведению,
  // но автопрокрутку при этом не стопаем, пока пользователь не уйдёт и не вернётся.
  window.setTimeout(() => {
    hoverArmed = true;
  }, 1200);

  slider.addEventListener('pointerdown', (event) => {
    pointerDrivenFocus = true;
    if (event.pointerType === 'mouse') return;
    touchStartX = event.clientX;
  });

  slider.addEventListener('focusin', () => {
    if (pointerDrivenFocus) {
      pointerDrivenFocus = false;
      return;
    }
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
