<template>
  <section class="simulcast">
    <div class="container">
      <div class="section-header">
        <div>
          <h2 class="section-title">
            <span class="accent-bar"></span>
            Расписание онгоингов
          </h2>
          <p class="section-subtitle">{{ currentDay }}</p>
        </div>
        <router-link to="/schedule" class="view-all">
          Полное расписание
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </router-link>
      </div>
      
      <div class="simulcast-grid">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
        </div>
        
        <router-link 
          v-for="show in shows" 
          :key="show.anime_id"
          :to="`/anime/${show.anime_url}`"
          class="simulcast-card glass"
        >
          <div class="card-thumbnail">
            <img 
              v-if="getPosterUrl(show.poster)" 
              :src="'https:' + getPosterUrl(show.poster)" 
              :alt="show.title"
              class="thumbnail-image"
            />
            <div v-else class="thumbnail-placeholder"></div>
            <button 
              class="bookmark-btn glass-dark"
              :class="{ active: isBookmarked(show.anime_id) }"
              @click.prevent="handleToggleBookmark(show)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" :fill="isBookmarked(show.anime_id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>
          <div class="card-info">
            <h3 class="show-title">{{ show.title }}</h3>
            <p class="show-description">{{ truncateText(show.description) }}</p>
            <div class="show-meta">
              <span class="badge glass-dark">{{ show.ep_title ? `Эп. ${show.ep_title}` : 'Новая серия' }}</span>
              <div v-if="show.dubs && show.dubs.length > 0" class="dubs-list">
                <span v-for="(dub, index) in show.dubs" :key="index" class="dub-badge glass-dark">{{ dub }}</span>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
    
    <AuthModal 
      :isOpen="showAuthModal" 
      @close="closeAuthModal"
      @success="handleAuthSuccess"
    />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../services/api.js'
import { useBookmarks } from '../composables/useBookmarks'
import { useAuth } from '../composables/useAuth'
import AuthModal from './AuthModal.vue'

const { isBookmarked, toggleBookmark, showAuthModal, closeAuthModal, reloadBookmarks } = useBookmarks()
const { isLoggedIn } = useAuth()

const handleToggleBookmark = async (anime) => {
  await toggleBookmark(anime)
}

const handleAuthSuccess = () => {
  closeAuthModal()
  reloadBookmarks()
}

const shows = ref([])
const loading = ref(true)
const currentDay = ref('')

// Получаем текущий день недели на русском
const getDayOfWeek = () => {
  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
  const dayIndex = new Date().getDay()
  // getDay() возвращает 0 для воскресенья, 1 для понедельника и т.д.
  // Преобразуем: 0->6, 1->0, 2->1, ..., 6->5
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1
  return days[adjustedIndex]
}

onMounted(async () => {
  try {
    currentDay.value = getDayOfWeek()
    const feedData = await api.getFeed()
    
    // Используем new_videos для расписания онгоингов (новые серии)
    if (feedData.new_videos && feedData.new_videos.length > 0) {
      // Группируем по anime_id и собираем озвучки
      const groupedShows = new Map()
      
      for (const show of feedData.new_videos) {
        if (!groupedShows.has(show.anime_id)) {
          const dubTitle = (show.dub_title || show.player_title || '').replace(/^Озвучка\s+/i, '')
          groupedShows.set(show.anime_id, {
            ...show,
            dubs: dubTitle ? [dubTitle] : []
          })
        } else {
          const existing = groupedShows.get(show.anime_id)
          const dubTitle = (show.dub_title || show.player_title || '').replace(/^Озвучка\s+/i, '')
          if (dubTitle && !existing.dubs.includes(dubTitle)) {
            existing.dubs.push(dubTitle)
          }
        }
      }
      
      shows.value = Array.from(groupedShows.values()).slice(0, 6)
    }
  } catch (error) {
    console.error('Failed to load ongoings:', error)
  } finally {
    loading.value = false
  }
})

const truncateText = (text, maxLength = 100) => {
  if (!text) return 'Смотрите новые серии каждую неделю'
  const clean = text.replace(/\n/g, ' ').trim()
  return clean.length > maxLength ? clean.substring(0, maxLength) + '...' : clean
}

const getPosterUrl = (poster) => {
  if (!poster) return ''
  return poster.fullsize || poster.huge || poster.big || poster.medium || ''
}
</script>

<style scoped>
.simulcast {
  padding: 60px 0;
  width: 100%;
  overflow-x: hidden;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.accent-bar {
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border-radius: 2px;
}

.section-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.view-all {
  color: #ff6b35;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: gap 0.3s;
}

.view-all:hover {
  gap: 10px;
}

.simulcast-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.simulcast-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.simulcast-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.08);
}

.card-thumbnail {
  flex-shrink: 0;
  width: 120px;
  height: 90px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  position: relative;
}

.card-thumbnail .bookmark-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.card-thumbnail .bookmark-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  transform: scale(1.1);
}

.card-thumbnail .bookmark-btn.active {
  color: #ff6b35;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ff6b35;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.show-title {
  font-size: 16px;
  font-weight: 600;
}

.show-description {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.show-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.episode-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.dubs-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.dub-badge {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .simulcast-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .view-all {
    align-self: flex-start;
  }
  
  .card-thumbnail {
    width: 100px;
    height: 75px;
  }
  
  .show-title {
    font-size: 14px;
  }
  
  .show-description {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .simulcast {
    padding: 30px 0;
  }
  
  .container {
    padding: 0 8px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .accent-bar {
    height: 18px;
    width: 3px;
  }
  
  .section-subtitle {
    font-size: 12px;
  }
  
  .view-all {
    font-size: 12px;
  }
  
  .simulcast-card {
    padding: 10px;
    gap: 10px;
    border-radius: 12px;
  }
  
  .card-thumbnail {
    width: 80px;
    height: 60px;
    border-radius: 8px;
  }
  
  .show-title {
    font-size: 12px;
  }
  
  .show-description {
    font-size: 11px;
  }
  
  .badge {
    font-size: 9px;
    padding: 3px 6px;
  }
  
  .dub-badge {
    font-size: 8px;
    padding: 2px 4px;
  }
}

</style>
