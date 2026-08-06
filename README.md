# On Death Pass — сайт-визитка

Статический сайт (HTML + CSS + JS). Хостинг: **Netlify**. Админка новостей: **Sveltia CMS**. Аналитика: **GoatCounter**.

---

## Структура папок

| Путь | Зачем |
|------|--------|
| `index.html` | Главная |
| `about.html` / `plans.html` / `contacts.html` | Внутренние страницы |
| `style.css` | Стили |
| `script.js` | Галерея, новости, меню |
| `interface.js` | Музыка, слайдер, анимации |
| `news.json` | Список новостей (правит админка или руками) |
| `audio/` | Фоновая музыка |
| `audio/track.json` | Какой файл сейчас играет |
| `images/hero/` | Картинки слайдера на главной |
| `images/gallery/` | Скриншоты галереи |
| `images/news/` | Картинки к новостям |
| `images/contacts/` | Аватарки на странице контактов |
| `images/social/` | Иконки соцсетей |
| `downloads/` | Файл демо-игры для скачивания |
| `admin/` | Админка новостей (`/admin/`) |
| `netlify.toml` | Настройки деплоя Netlify |

---

## Как сменить музыку

Кнопка звука на сайте включает музыку только после нажатия (браузер сам звук не стартует — как наушники: молчат, пока не нажмёшь play).

### Способ 1 — удобный

1. Положи файл в папку `audio/` (например `my-track.mp3`).
2. Открой `audio/track.json` и напиши имя файла:

```json
{
  "file": "my-track.mp3"
}
```

3. Сохрани, закоммить, задеплой (или обнови локально) — готово.

Сейчас в `track.json` указано: `death-pass-ambient.mp3`.

### Способ 2 — запасные имена

Положи трек в `audio/` под одним из имён (тогда `track.json` можно не трогать):

- `death-pass-ambient.mp3`
- `bgm.mp3` / `bgm.ogg`
- `ambient.mp3` / `ambient.ogg`
- `music.mp3`

Форматы: `.mp3`, `.ogg`, `.wav`, `.m4a`.

> Браузер не видит список файлов в папке сам. Нужно либо имя в `track.json`, либо одно из запасных имён выше.

---

## Как сменить картинки

### Слайдер на главной (`images/hero/`)

Файлы уже подключены в `index.html`:

| Файл | Слайд |
|------|--------|
| `images/hero/катастрофа.png` | «Катастрофа уже произошла» |
| `images/hero/миссия.png` | «Проникнуть на объект» |
| `images/hero/выбор.png` | «Выбрать, кому выжить» |

Просто **замени файл с тем же именем** — или поменяй `src` у `<img class="hero-slide__img">` в `index.html`.

Если файл не найдётся, сайт покажет запасную: `images/hero-placeholder.png`.

### Галерея скриншотов (`images/gallery/`)

1. Положи PNG/JPG в `images/gallery/` (например `05-new.png`).
2. Открой `script.js` и отредактируй список `GALLERY` в начале файла:

```js
const GALLERY = [
  {
    src: "images/gallery/01-shore.png",
    alt: "Описание картинки для слабовидящих"
  },
  // добавь ещё объекты сюда
];
```

Порядок в списке = порядок миниатюр. Первая картинка показывается крупно.

### Новости

Картинки клади в `images/news/`.  
Путь пишется в `news.json` или выбирается в админке (`/admin/`).

### Контакты — аватарки

Положи файлы:

- `images/contacts/avatar-markiz.jpg`
- `images/contacts/avatar-anskill.jpg`

Пока файлов нет, аватарки просто скрываются (сайт не ломается).

### Иконки соцсетей

`images/social/boosty.png`, `telegram.png`, `youtube.png`, `mail.png`.

### Демо для скачивания

Ссылка на главной: `downloads/death-pass-demo.zip`.  
Положи zip с таким именем в `downloads/` **или** поменяй `href` у кнопки скачивания в `index.html`.

---

## Хостинг Netlify

Сайт уже настроен через `netlify.toml` (сборка не нужна — это просто файлы).

1. Зарегистрируйся на [app.netlify.com](https://app.netlify.com).
2. **Add new site → Import an existing project** → выбери GitHub-репозиторий `ondeathpass`.
3. Branch: `main`. Build command можно оставить пустым / как в `netlify.toml`. Publish directory: `.` (корень).
4. Deploy. После каждого push в `main` сайт обновится сам.

Свой домен: Site configuration → Domain management.

---

## Аналитика (GoatCounter)

Сейчас на всех страницах стоит счётчик:

`https://deathpass.goatcounter.com/count`

1. Зарегистрируйся на [goatcounter.com](https://www.goatcounter.com) (это счётчик посещений без кук — как блокнот: кто зашёл, без слежки как у рекламы).
2. Создай сайт и получи свой поддомен (например `mysite.goatcounter.com`).
3. В `index.html`, `about.html`, `plans.html`, `contacts.html` замени `deathpass.goatcounter.com` на свой, если нужен другой аккаунт.

Клики по важным кнопкам уже помечены атрибутами `data-goatcounter-click` (скачать демо, соцсети, почта).

---

## Админка новостей (`/admin/`)

Это **Sveltia CMS**: форма в браузере, которая сохраняет новости в `news.json` через GitHub (без ручного редактирования JSON).

### Что уже есть

- страница `/admin/`
- конфиг `admin/config.yml` (коллекция «Новости»)
- картинки новостей сохраняются в `images/news/`

### Что нужно сделать на Netlify (один раз)

Sveltia **не** использует Netlify Identity. Вход — через **GitHub OAuth**, который даёт сам Netlify.

1. На GitHub создай OAuth App:  
   [github.com/settings/applications/new](https://github.com/settings/applications/new)
   - Application name: например `On Death Pass CMS`
   - Homepage URL: адрес сайта на Netlify (`https://ВАШ-САЙТ.netlify.app`)
   - Authorization callback URL:  
     `https://api.netlify.com/auth/done`
2. Скопируй **Client ID** и **Client Secret**.
3. В Netlify: **Site configuration → Access & security → OAuth** (или **Visitor access → OAuth**)  
   → Install provider → GitHub → вставь Client ID и Secret.
4. Открой `https://ВАШ-САЙТ.netlify.app/admin/` и войди через GitHub.
5. Редактируй новости → Save — CMS сделает коммит в репозиторий, Netlify задеплоит сайт.

> Client Secret храни только в настройках Netlify, **не** клади его в GitHub и не пиши в чат.

### Если сайт не на Netlify

Тогда нужен отдельный OAuth Worker ([sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)) и строка `base_url` в `admin/config.yml` (см. комментарий в файле).

---

## Чеклист перед публикацией

- [ ] Музыка в `audio/` + правильное имя в `audio/track.json`
- [ ] Картинки hero / gallery на месте
- [ ] Zip демо в `downloads/` или другая ссылка в `index.html`
- [ ] Аватарки контактов (по желанию)
- [ ] Сайт подключён к Netlify
- [ ] GitHub OAuth для админки настроен
- [ ] GoatCounter работает (свой или текущий `deathpass`)
- [ ] Ссылки Boosty / Telegram / YouTube / почта проверены

---

## Локальный просмотр

Открой файлы через простой локальный сервер (из папки проекта), иначе музыка/`news.json` могут не загрузиться из‑за правил браузера:

```bash
npx --yes serve .
```

Потом открой адрес из терминала (обычно `http://localhost:3000`).
мяумяу=_