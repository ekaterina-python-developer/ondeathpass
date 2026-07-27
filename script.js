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
      mainEl.innerHTML = `
        ${latest.image ? `<img src="${latest.image}" alt="">` : ""}
        <span class="news-card__date">${formatDate(latest.date)}</span>
        <strong>${latest.title}</strong>
        <p>${latest.body || ""}</p>
      `;
    }

    listEl.innerHTML = rest
      .map(
        (item) => `
        <div class="news-card">
          ${item.image ? `<img src="${item.image}" alt="">` : ""}
          <div>
            <span class="news-card__date">${formatDate(item.date)}</span>
            ${item.title}
          </div>
        </div>`
      )
      .join("");
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

document.getElementById("year").textContent = new Date().getFullYear();
initNav();
renderGallery();
renderNews();
