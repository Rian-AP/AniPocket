-- Создание таблицы закладок
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  anime_id TEXT NOT NULL,
  anime_url TEXT NOT NULL,
  title TEXT NOT NULL,
  poster JSONB,
  year TEXT,
  type TEXT,
  rating TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, anime_id)
);

-- Включаем Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свои закладки
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Политика: пользователи могут добавлять свои закладки
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут удалять свои закладки
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Создаем индекс для быстрого поиска
CREATE INDEX bookmarks_user_id_idx ON bookmarks(user_id);
CREATE INDEX bookmarks_anime_id_idx ON bookmarks(anime_id);
