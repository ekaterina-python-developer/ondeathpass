# On Death Pass — сайт-визитка

## Структура
- `index.html` — главная страница
- `about.html` — страница «О игре» с аккордеоном
- `style.css` — стили
- `script.js` — галерея, новости, меню, аккордеон
- `news.json` — данные новостей (правит либо разработчик руками, либо CMS)
- `admin/` — Decap CMS (админка для новостей без кода): откройте `/admin/`
- `admin/config.yml` — настройки CMS (репозиторий уже указан)
- `images/` — картинки сайта (`hero-placeholder.png`, `gallery/`, `news/`)
- `netlify.toml` — настройки деплоя Netlify

## Что нужно доделать перед публикацией

1. **Картинки.** Кладите в:
   - `images/hero-placeholder.png` — арт в шапке
   - `images/gallery/screen-1.png` … — скриншоты (список в `GALLERY` в `script.js`)
   - `images/news/` — картинки к новостям

2. **Ссылки.**
   - В `index.html` замените `downloads/death-pass-demo.zip` на реальную ссылку на демо (или загруженный файл).
   - Замените `https://boosty.to/your-page` на реальную ссылку доната.
   - Замените ссылки в `.social__icon` (Boosty/Telegram/почта/YouTube) на настоящие.

3. **GoatCounter.**
   - Зарегистрируйтесь на goatcounter.com, получите код сайта.
   - В `index.html` замените `deathpass.goatcounter.com` на ваш реальный поддомен.

4. **Хостинг: Netlify** (нужен для админки).
   1. Зайти на https://app.netlify.com → Sign up with GitHub.
   2. Add new site → Import an existing project → `ondeathpass`.
   3. Build settings: Publish directory = `.` (или подтянется из `netlify.toml`).
   4. Deploy.

5. **Админка Decap + Netlify Identity.**
   1. Site configuration → Identity → Enable Identity.
   2. Registration: Invite only.
   3. Services → Git Gateway → Enable.
   4. Identity → Invite users → пригласить email редактора.
   5. Открыть `https://ВАШ-САЙТ.netlify.app/admin/` → принять инвайт → войти.
