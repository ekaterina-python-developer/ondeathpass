# On Death Pass — сайт-визитка

## Структура
- `index.html` — главная страница (одностраничник)
- `style.css` — стили
- `script.js` — рендер новостей из `news.json` и галереи
- `news.json` — данные новостей (правит либо разработчик руками, либо CMS)
- `admin/` — Decap CMS (админка для новостей без кода): откройте `/admin/`
- `admin/config.yml` — настройки CMS (репозиторий уже указан)
- `images/` — картинки сайта (`hero-placeholder.png`, `gallery/`, `news/`)

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

4. **Decap CMS (админка новостей).**
   - В `admin/config.yml` уже указан репозиторий `ekaterina-python-developer/ondeathpass`.
   - Настройте авторизацию (Netlify Identity / OAuth-прокси или Cloudflare Worker).
   - После этого `/admin` на сайте станет рабочей панелью редактирования новостей.

5. **Хостинг.**
   - Запушьте всё в GitHub.
   - Подключите GitHub Pages, Cloudflare Pages или Netlify — любой бесплатный вариант из обсуждения.
