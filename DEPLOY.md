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
   - `https://твой-домен.com`
   - `https://brxomwakhrnsmvpotdjv.supabase.co/auth/v1/callback`

### 3. Supabase Setup

В Supabase Dashboard добавь production URL:
1. Открой https://supabase.com/dashboard
2. Выбери проект
3. Authentication → URL Configuration
4. Добавь Site URL: `https://твой-домен.com`
5. Добавь Redirect URLs: `https://твой-домен.com/**`

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
