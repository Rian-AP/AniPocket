<template>
  <div class="bookmarks-page">
    <div class="page-header">
      <h1>
        <span class="accent-bar"></span>
        Закладки
      </h1>
    </div>

    <div v-if="!isLoggedIn" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      <h2>Войдите в аккаунт</h2>
      <p>Чтобы сохранять закладки, необходимо войти через Google</p>
    </div>

    <div v-else-if="bookmarks.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      <h2>Закладок пока нет</h2>
      <p>Добавляйте аниме в закладки, чтобы быстро находить их позже</p>
    </div>

    <div v-else class="bookmarks-grid">
      <router-link
        v-for="anime in bookmarks"
        :key="anime.anime_id"
        :to="`/anime/${anime.anime_url}`"
        class="anime-card"
      >
        <div class="card-poster">
          <img
            v-if="anime.poster"
            :src="'https:' + (anime.poster.medium || anime.poster.big || anime.poster.fullsize)"
            :alt="anime.title"
            loading="lazy"
          />
          <div v-else class="poster-placeholder"></div>
          
          <button 
            class="bookmark-btn active"
            @click.prevent="handleRemoveBookmark(anime.anime_id)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
        
        <div class="card-info">
          <h3 class="card-title">{{ anime.title }}</h3>
          <div class="card-meta">
            <span v-if="anime.year">{{ anime.year }}</span>
            <span v-if="anime.year && anime.type?.name" class="dot">•</span>
            <span v-if="anime.type?.name">{{ anime.type.name }}</span>
            <span v-if="anime.rating?.average" class="dot">•</span>
            <span v-if="anime.rating?.average" class="rating">
              ⭐ {{ anime.rating.average.toFixed(1) }}
            </span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useBookmarks } from '../composables/useBookmarks'
import { useAuth } from '../composables/useAuth'

const { bookmarks, removeBookmark } = useBookmarks()
const { isLoggedIn } = useAuth()

const handleRemoveBookmark = (animeId) => {
  removeBookmark(animeId)
}

const getAnimeWord = (count) => {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'аниме'
  }
  
  if (lastDigit === 1) {
    return 'аниме'
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'аниме'
  }
  
  return 'аниме'
}
</script>

<style scoped>
.bookmarks-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 100px 24px 60px;
}

.page-header {
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.accent-bar {
  width: 4px;
  height: 36px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border-radius: 2px;
}

.page-header p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-state svg {
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 24px;
}

.empty-state h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  max-width: 400px;
}

.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.anime-card {
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  display: block;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(60px);
  -webkit-backdrop-filter: blur(60px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.anime-card:hover {
  transform: translateY(-8px) scale(1.05);
  z-index: 10;
}

.card-poster {
  position: relative;
  width: 100%;
  padding-bottom: 140%;
  overflow: hidden;
  margin-bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
}

.card-poster img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.anime-card:hover .card-poster img {
  transform: scale(1.05);
}

.poster-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bookmark-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 20;
  opacity: 0;
  transform: scale(0.8);
}

.anime-card:hover .bookmark-btn {
  opacity: 1;
  transform: scale(1);
}

.bookmark-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  color: #ff6b35;
}

.bookmark-btn.active {
  color: #ff6b35;
}

.card-info {
  padding: 16px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.card-meta {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  white-space: nowrap;
}

.dot {
  opacity: 0.5;
}

.rating {
  color: #ffa500;
  font-weight: 600;
}

@media (max-width: 768px) {
  .bookmarks-page {
    padding: 80px 16px 40px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .bookmarks-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .card-title {
    font-size: 14px;
  }

  .card-meta {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .bookmarks-page {
    padding: 70px 12px 30px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .accent-bar {
    height: 24px;
    width: 3px;
  }

  .bookmarks-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .card-title {
    font-size: 12px;
  }

  .card-meta {
    font-size: 11px;
  }

  .bookmark-btn {
    width: 28px;
    height: 28px;
    top: 8px;
    left: 8px;
  }

  .bookmark-btn svg {
    width: 16px;
    height: 16px;
  }
}
</style>
