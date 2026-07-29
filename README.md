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
- `admin/` — Decap CMS (админка для новостей без кода): откройте `/admin/`
- `admin/config.yml` — настройки CMS (репозиторий уже указан)
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
