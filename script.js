// --- Галерея: список скриншотов для миниатюр ---
// Замените пути на реальные экспортированные картинки из PSD.
const GALLERY = [
  "images/gallery/screen-1.png",
  "images/gallery/screen-2.png"
];

function renderGallery() {
  const thumbsEl = document.getElementById("gallery-thumbs");
  const mainImg = document.getElementById("gallery-main-img");
  if (!thumbsEl || !mainImg) return;

  thumbsEl.innerHTML = GALLERY.map(
    (src) => `<img src="${src}" alt="Скриншот геймплея" loading="lazy">`
  ).join("");

  thumbsEl.querySelectorAll("img").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      mainImg.src = thumb.src;
    });
  });
}

// --- Новости: подгружаются из news.json, который правит Decap CMS ---
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function previewText(text, max = 140) {
  const clean = String(text ?? "").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

function initNewsModal(items) {
  const dialog = document.getElementById("news-modal");
  const content = document.getElementById("news-modal-content");
  if (!dialog || !content) return;

  const closeModal = () => {
    if (dialog.open) dialog.close();
    document.body.classList.remove("is-news-modal-open");
  };

  const openModal = (index) => {
    const item = items[index];
    if (!item) return;

    const isFresh = index === 0;
    dialog.classList.toggle("news-modal--fresh", isFresh);

    content.innerHTML = `
      ${item.image ? `<img class="news-modal__image" src="${escapeHtml(item.image)}" alt="">` : ""}
      <span class="news-modal__date">${escapeHtml(formatDate(item.date))}</span>
      <h3 class="news-modal__title" id="news-modal-title">${escapeHtml(item.title)}</h3>
      <p class="news-modal__body">${escapeHtml(item.body || "")}</p>
    `;

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("is-news-modal-open");
  };

  document.querySelectorAll("[data-news-index]").forEach((el) => {
    el.addEventListener("click", () => {
      const index = Number(el.dataset.newsIndex);
      if (Number.isNaN(index)) return;
      openModal(index);
    });

    el.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const index = Number(el.dataset.newsIndex);
      if (Number.isNaN(index)) return;
      openModal(index);
    });
  });

  dialog.querySelectorAll("[data-news-close]").forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeModal();
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeModal();
  });
}

async function renderNews() {
  const mainEl = document.getElementById("news-main");
  const listEl = document.getElementById("news-list");
  if (!mainEl || !listEl) return;

  try {
    const res = await fetch("news.json");
    if (!res.ok) throw new Error("news.json not found");
    const data = await res.json();
    const items = data.items || [];

    // сортировка от новых к старым
    items.sort((a, b) => new Date(b.date) - new Date(a.date));

    const [latest, ...rest] = items;

    if (latest) {
      mainEl.classList.add("news__main--clickable");
      mainEl.dataset.newsIndex = "0";
      mainEl.setAttribute("role", "button");
      mainEl.setAttribute("tabindex", "0");
      mainEl.setAttribute("aria-label", `Открыть новость: ${latest.title}`);
      mainEl.innerHTML = `
        ${latest.image ? `<img src="${escapeHtml(latest.image)}" alt="">` : ""}
        <span class="news-card__date">${escapeHtml(formatDate(latest.date))}</span>
        <h3>${escapeHtml(latest.title)}</h3>
        <p>${escapeHtml(previewText(latest.body || "", 160))}</p>
        <span class="news__open-hint">Открыть передачу →</span>
      `;
    }

    listEl.innerHTML = rest
      .map(
        (item, i) => `
        <div
          class="news-card news-card--clickable"
          data-news-index="${i + 1}"
          role="button"
          tabindex="0"
          aria-label="Открыть новость: ${escapeHtml(item.title)}"
        >
          ${item.image ? `<img src="${escapeHtml(item.image)}" alt="">` : ""}
          <div>
            <span class="news-card__date">${escapeHtml(formatDate(item.date))}</span>
            <h3>${escapeHtml(item.title)}</h3>
          </div>
        </div>`
      )
      .join("");

    initNewsModal(items);
  } catch (err) {
    mainEl.innerHTML = "<p>Новости скоро появятся.</p>";
    console.error(err);
  }
}

// --- Меню: горизонтальная строка, пока помещается; бургер — как только перестаёт помещаться ---
function initNav() {
  const sidebar = document.querySelector(".sidebar");
  const panel = document.getElementById("mobile-nav");
  const burger = document.getElementById("burger");
  const bar = burger ? burger.closest(".sidebar__bar") : null;
  if (!sidebar || !panel) return;

  function checkFit() {
    // Если экран шире desktop-порога, компактный режим не нужен —
    // сайдбар и так вертикальный слева.
    if (window.innerWidth > 900) {
      sidebar.classList.remove("nav-compact");
      panel.classList.remove("is-open");
      return;
    }

    // Временно снимаем компактный режим, чтобы измерить,
    // помещается ли строка в одну линию без переносов.
    const wasCompact = sidebar.classList.contains("nav-compact");
    sidebar.classList.remove("nav-compact");

    const fits = panel.scrollWidth <= panel.clientWidth + 1;

    if (!fits) {
      sidebar.classList.add("nav-compact");
    } else if (wasCompact) {
      panel.classList.remove("is-open");
    }
  }

  checkFit();
  window.addEventListener("resize", checkFit);

  if (burger) {
    burger.addEventListener("click", () => {
      const isOpen = panel.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
      if (bar) bar.setAttribute("data-open", String(isOpen));
    });

    panel.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        panel.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        if (bar) bar.setAttribute("data-open", "false");
      });
    });
  }
}

// --- Аккордеон «О игре»: одновременно открыт только один блок ---
function initAccordion() {
  const root = document.querySelector("[data-accordion]");
  if (!root) return;

  root.querySelectorAll("details.accordion__item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      root.querySelectorAll("details.accordion__item").forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
}

// --- Аккордеон «Планы»: кнопки открывают/закрывают блоки ---
function initPlansAccordion() {
  const root = document.getElementById("plans-accordion");
  if (!root) return;

  root.querySelectorAll(".accordion-header").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".accordion-item");
      if (!item) return;
      const willOpen = !item.classList.contains("is-open");

      root.querySelectorAll(".accordion-item").forEach((other) => {
        other.classList.remove("is-open");
        const header = other.querySelector(".accordion-header");
        if (header) header.setAttribute("aria-expanded", "false");
      });

      if (willOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
initNav();
initAccordion();
initPlansAccordion();
renderGallery();
renderNews();
