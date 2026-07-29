# On Death Pass — сайт-визитка

Cyber/HUD-дизайн: загрузочный экран, сетка, анимации и кинематографический слайдер в шапке.

## Структура
- `index.html` — главная страница (hero-слайдер из 3 сцен)
- `about.html` — страница «О игре» с аккордеоном
- `plans.html` — страница «Планы» (состояние разработки, роадмап)
- `contacts.html` — страница «Контакты»
- `style.css` — cyber/HUD-стили (все страницы + слайдер)
- `script.js` — галерея, новости, меню, аккордеоны
- `interface.js` — boot-экран, часы, reveal, параллакс, glitch, hero-слайдер
- `news.json` — данные новостей (правит либо разработчик руками, либо CMS)
- `admin/` — Decap CMS (админка для новостей без кода): откройте `/admin/`
- `admin/config.yml` — настройки CMS (репозиторий уже указан)
- `images/` — картинки сайта (`hero-placeholder.png`, `hero/`, `gallery/`, `news/`, `contacts/`, `social/`)
- `netlify.toml` — настройки деплоя Netlify

## Что нужно доделать перед публикацией

1. **Картинки.** Кладите в:
   - `images/hero/hero-city.png` — слайд «Катастрофа»
   - `images/hero/hero-agents.png` — слайд «Миссия»
   - `images/hero/hero-choice.png` — слайд «Выбор»
   - пока этих файлов нет, слайдер сам подставит `images/hero-placeholder.png`
   - `images/gallery/screen-1.png` … — скриншоты (список в `GALLERY` в `script.js`)
   - `images/news/` — картинки к новостям
   - `images/contacts/avatar-markiz.jpg` и `avatar-anskill.jpg` — аватарки YouTube на странице контактов

2. **Ссылки.**
   - В `index.html` замените `downloads/death-pass-demo.zip` на реальную ссылку на демо (или загруженный файл).
   - Ссылки Boosty / Telegram / почта / YouTube уже проставлены на страницах; проверьте, что они актуальны.

3. **GoatCounter.**
   - Зарегистрируйтесь на goatcounter.com, получите код сайта.
   - В HTML-страницах замените `deathpass.goatcounter.com` на ваш реальный поддомен.

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
