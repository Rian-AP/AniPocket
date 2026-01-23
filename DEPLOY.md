# Деплой AniPocket

## Подготовка к деплою

### 1. Environment Variables

Создай `.env` файл (уже создан локально, но НЕ коммитится в git):

```env
VITE_SUPABASE_URL=https://brxomwakhrnsmvpotdjv.supabase.co
VITE_SUPABASE_ANON_KEY=твой_ключ
```

### 2. Google OAuth Setup

Добавь production URL в Google Cloud Console:
1. Открой https://console.cloud.google.com/
2. Выбери свой проект
3. APIs & Services → Credentials
4. Найди свой OAuth 2.0 Client ID
5. Добавь в "Authorized redirect URIs":
   - `https://твой-домен.onrender.com`
   - `https://brxomwakhrnsmvpotdjv.supabase.co/auth/v1/callback`

### 3. Supabase Setup

В Supabase Dashboard добавь production URL:
1. Открой https://supabase.com/dashboard
2. Выбери проект
3. Authentication → URL Configuration
4. Добавь Site URL: `https://твой-домен.onrender.com`
5. Добавь Redirect URLs: `https://твой-домен.onrender.com/**`

## Деплой на Render.com

### Шаг 1: Подготовка

1. Залей код на GitHub (если еще не залит)
2. Зарегистрируйся на https://render.com

### Шаг 2: Создание Static Site

1. Dashboard → New → Static Site
2. Подключи GitHub репозиторий
3. Настройки:
   - **Name**: `anipocket` (или любое имя)
   - **Branch**: `main` (или твоя ветка)
   - **Root Directory**: `liquid-stream` (если проект в подпапке)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `liquid-stream/dist` (или просто `dist` если Root Directory указан)

### Шаг 3: Environment Variables

В настройках Static Site добавь:
- **Key**: `VITE_SUPABASE_URL`
  **Value**: `https://brxomwakhrnsmvpotdjv.supabase.co`
  
- **Key**: `VITE_SUPABASE_ANON_KEY`
  **Value**: твой ключ из .env

### Шаг 4: Deploy

1. Нажми "Create Static Site"
2. Render автоматически запустит build
3. После деплоя получишь URL типа `https://anipocket.onrender.com`

### Шаг 5: Настройка Custom Domain (опционально)

1. Settings → Custom Domain
2. Добавь свой домен
3. Настрой DNS записи как указано в Render

## Деплой на Vercel

### Быстрый деплой

```bash
npm install -g vercel
vercel
```

### Environment Variables в Vercel

1. Открой проект в Vercel Dashboard
2. Settings → Environment Variables
3. Добавь:
   - `VITE_SUPABASE_URL` = `https://brxomwakhrnsmvpotdjv.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = твой ключ

### Build Settings

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Деплой на Netlify

### Быстрый деплой

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Environment Variables в Netlify

1. Site settings → Build & deploy → Environment
2. Добавь те же переменные что и для Vercel

### Build Settings

- Build command: `npm run build`
- Publish directory: `dist`

## Локальный build

```bash
npm run build
```

Результат в папке `dist/` - можно загрузить на любой статический хостинг.

## После деплоя

1. ✅ Проверь что сайт открывается
2. ✅ Проверь авторизацию через Google
3. ✅ Проверь что закладки сохраняются
4. ✅ Проверь PWA установку (должна появиться кнопка "Установить")
5. ✅ Проверь что Service Worker работает (DevTools → Application)
6. ✅ Обнови Google OAuth redirect URIs с production URL
7. ✅ Обнови Supabase Site URL с production URL

## Troubleshooting

### Google OAuth не работает
- Проверь что добавил production URL в Google Console
- Проверь что redirect_uri совпадает

### Закладки не сохраняются
- Проверь environment variables
- Проверь что Supabase RLS policies настроены (см. supabase-schema.sql)

### PWA не устанавливается
- Проверь что все иконки загружаются (DevTools → Network)
- Проверь manifest.json (DevTools → Application → Manifest)
- HTTPS обязателен для PWA!

### Render.com специфичные проблемы

**Build fails:**
- Проверь что Root Directory правильно указан
- Проверь что Build Command включает `npm install`

**Environment variables не работают:**
- Render требует rebuild после добавления env vars
- Manual Deploy → Clear build cache & deploy

**404 на роутах:**
Создай файл `liquid-stream/public/_redirects`:
```
/*    /index.html   200
```
Это нужно для Vue Router в SPA режиме.
