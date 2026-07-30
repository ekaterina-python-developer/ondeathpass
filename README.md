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
- `audio/` — фоновая музыка сайта
- `audio/track.json` — какое имя файла сейчас играет
- `admin/` — Sveltia CMS (админка новостей без кода): откройте `/admin/`
- `admin/config.yml` — настройки CMS и адрес Cloudflare OAuth Worker
- `images/` — картинки сайта (`hero-placeholder.png`, `hero/`, `gallery/`, `news/`, `contacts/`, `social/`)
- `netlify.toml` — настройки деплоя Netlify

## Фоновая музыка

На сайте есть кнопка **SOUND // OFF** в боковом меню. Музыка включается только по этой кнопке (браузеры не дают запускать звук сами — как наушники, которые молчат, пока ты сам не нажмёшь play).

Плеер **не привязан** к одному жёсткому имени файла. Можно положить любой трек в папку `audio/`.

### Как сменить трек

**Способ 1 (удобный):**
1. Положи файл в папку `audio/` (например `my-cool-track.mp3`).
2. Открой `audio/track.json` и напиши имя файла:

```json
{
  "file": "my-cool-track.mp3"
}
```

3. Сохрани, обнови сайт — готово.

**Способ 2 (ещё проще):**  
Положи трек в `audio/` под одним из имён:
- `bgm.mp3`
- `ambient.mp3`
- `music.mp3`

Тогда `track.json` можно не трогать — плеер сам найдёт такой файл.

Поддерживаются обычные форматы вроде `.mp3`, `.ogg`, `.wav`, `.m4a`.

> Браузер сам не видит список файлов в папке. Поэтому нужно либо указать имя в `track.json`, либо назвать файл одним из запасных имён выше.

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

4. **Хостинг: Cloudflare Pages.**
   1. Зарегистрируйтесь на https://dash.cloudflare.com и откройте **Workers & Pages**.
   2. Нажмите **Create application → Pages → Connect to Git** и выберите репозиторий `ondeathpass`.
   3. Production branch: `main`; Build command оставьте пустым; Build output directory укажите `.`.
   4. Нажмите **Save and Deploy**. После этого Cloudflare будет обновлять сайт после каждого изменения в `main`.

5. **Админка Sveltia CMS + вход через GitHub.**
   1. Разверните официальный Worker: https://github.com/sveltia/sveltia-cms-auth (кнопка **Deploy to Cloudflare Workers**).
   2. Создайте GitHub OAuth App: https://github.com/settings/applications/new. В поле callback URL укажите `<URL_ВАШЕГО_WORKER>/callback`.
   3. В Cloudflare Worker → **Settings → Variables and Secrets** добавьте зашифрованные переменные `GITHUB_CLIENT_ID` и `GITHUB_CLIENT_SECRET` из OAuth App.
   4. В `admin/config.yml` замените `https://REPLACE_WITH_CLOUDFLARE_WORKER_URL.workers.dev` на URL Worker.
   5. Откройте `https://ВАШ-САЙТ.pages.dev/admin/`, нажмите вход через GitHub и разрешите доступ к репозиторию.

> Не публикуйте `GITHUB_CLIENT_SECRET` в GitHub, `config.yml` или в сообщениях. Он хранится только в Secrets Cloudflare Worker.
