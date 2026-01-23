<template>
  <div class="schedule-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">
          <span class="accent-bar"></span>
          Расписание онгоингов
        </h1>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <div v-else class="schedule-content">
        <div v-for="(dayData, dayName) in scheduleByDay" :key="dayName" class="day-section">
          <div class="day-header">
            <div class="day-info">
              <h2 class="day-title">{{ dayName }}</h2>
              <span class="day-date">{{ formatDate(dayData.date) }}</span>
            </div>
          </div>

          <div class="anime-grid">
            <router-link 
              v-for="anime in dayData.items" 
              :key="anime.anime_id"
              :to="`/anime/${anime.anime_url}`"
              class="anime-card glass"
            >
              <div class="card-poster">
                <img 
                  v-if="getPosterUrl(anime.poster)" 
                  :src="'https:' + getPosterUrl(anime.poster)" 
                  :alt="anime.title"
                  class="poster-image"
                />
                <div v-else class="poster-placeholder"></div>
                <button 
                  class="bookmark-btn glass-dark"
                  :class="{ active: isBookmarked(anime.anime_id) }"
                  @click.prevent="handleToggleBookmark(anime)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" :fill="isBookmarked(anime.anime_id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                </button>
                <div class="card-overlay">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              <div class="card-content">
                <h3 class="anime-title">{{ anime.title }}</h3>
                <p v-if="anime.ep_title" class="episode-info">{{ anime.ep_title }}</p>
                <div v-if="anime.dubs && anime.dubs.length > 0" class="dubs-container">
                  <span v-for="(dub, index) in anime.dubs.slice(0, 3)" :key="index" class="dub-tag glass-dark">
                    {{ dub }}
                  </span>
                  <span v-if="anime.dubs.length > 3" class="dub-tag glass-dark">+{{ anime.dubs.length - 3 }}</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <div v-if="Object.keys(scheduleByDay).length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p>Расписание пока не загружено</p>
        </div>
      </div>
    </div>
    
    <AuthModal 
      :isOpen="showAuthModal" 
      @close="closeAuthModal"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../services/api.js'
import { useBookmarks } from '../composables/useBookmarks'
import { useAuth } from '../composables/useAuth'
import AuthModal from '../components/AuthModal.vue'

const { isBookmarked, toggleBookmark, showAuthModal, closeAuthModal, reloadBookmarks } = useBookmarks()
const { isLoggedIn } = useAuth()

const handleToggleBookmark = async (anime) => {
  await toggleBookmark(anime)
}

const handleAuthSuccess = () => {
  closeAuthModal()
  reloadBookmarks()
}

const loading = ref(true)
const scheduleData = ref([])

const daysOrder = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

const scheduleByDay = computed(() => {
  const grouped = {}
  
  for (const anime of scheduleData.value) {
    const day = anime.day || 'Понедельник'
    if (!grouped[day]) {
      grouped[day] = {
        items: [],
        date: anime.date // Сохраняем timestamp для отображения даты
      }
    }
    grouped[day].items.push(anime)
  }
  
  // Сортируем по дням недели
  const sorted = {}
  for (const day of daysOrder) {
    if (grouped[day]) {
      sorted[day] = grouped[day]
    }
  }
  
  // Добавляем остальные дни
  for (const day in grouped) {
    if (!daysOrder.includes(day)) {
      sorted[day] = grouped[day]
    }
  }
  
  return sorted
})

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  try {
    const date = new Date(timestamp * 1000)
    const day = date.getDate()
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    const month = months[date.getMonth()]
    return `${day} ${month}`
  } catch {
    return ''
  }
}

onMounted(async () => {
  try {
    const feedData = await api.getFeed()
    
    if (feedData.new_videos && feedData.new_videos.length > 0) {
      // Группируем по anime_id и собираем озвучки
      const groupedAnime = new Map()
      
      for (const item of feedData.new_videos) {
        if (!groupedAnime.has(item.anime_id)) {
          const dubTitle = (item.dub_title || item.player_title || '').replace(/^Озвучка\s+/i, '')
          const day = getDayFromTimestamp(item.date)
          
          groupedAnime.set(item.anime_id, {
            ...item,
            dubs: dubTitle ? [dubTitle] : [],
            day: day
          })
        } else {
          const existing = groupedAnime.get(item.anime_id)
          const dubTitle = (item.dub_title || item.player_title || '').replace(/^Озвучка\s+/i, '')
          if (dubTitle && !existing.dubs.includes(dubTitle)) {
            existing.dubs.push(dubTitle)
          }
        }
      }
      
      scheduleData.value = Array.from(groupedAnime.values())
    }
  } catch (error) {
    console.error('Failed to load schedule:', error)
  } finally {
    loading.value = false
  }
})

const getDayFromTimestamp = (timestamp) => {
  if (!timestamp) return 'Понедельник'
  try {
    const date = new Date(timestamp * 1000) // timestamp в секундах
    const dayIndex = date.getDay() // 0 = Воскресенье, 1 = Понедельник, ...
    // Преобразуем: 0->6, 1->0, 2->1, ..., 6->5
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1
    return daysOrder[adjustedIndex]
  } catch {
    return 'Понедельник'
  }
}

const getPosterUrl = (poster) => {
  if (!poster) return ''
  return poster.fullsize || poster.huge || poster.big || poster.medium || ''
}

const pluralizeAnime = (count) => {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
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
.schedule-page {
  min-height: 100vh;
  padding: 120px 0 60px;
  width: 100%;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

.page-header {
  margin-bottom: 48px;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.accent-bar {
  width: 6px;
  height: 36px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border-radius: 3px;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  margin-left: 22px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ff6b35;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.schedule-content {
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.day-section {
  width: 100%;
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.day-info {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.day-title {
  font-size: 24px;
  font-weight: 700;
  color: #ff6b35;
}

.day-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
}

.anime-count {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.anime-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.anime-card {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
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
  aspect-ratio: 2/3;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.card-poster .bookmark-btn {
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

.anime-card:hover .card-poster .bookmark-btn {
  opacity: 1;
  transform: scale(1);
}

.card-poster .bookmark-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  color: #ff6b35;
}

.card-poster .bookmark-btn.active {
  color: #ff6b35;
}

.poster-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.anime-card:hover .poster-image {
  transform: scale(1.05);
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.3) 0%, rgba(247, 147, 30, 0.3) 100%);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #fff;
}

.anime-card:hover .card-overlay {
  opacity: 1;
}

.card-content {
  padding: 16px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.anime-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.episode-info {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.dubs-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dub-tag {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  color: rgba(255, 255, 255, 0.4);
}

.empty-state svg {
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
}

@media (max-width: 968px) {
  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .accent-bar {
    height: 28px;
  }
  
  .day-title {
    font-size: 20px;
  }
  
  .day-date {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .schedule-page {
    padding: 80px 0 40px;
  }
  
  .container {
    padding: 0 8px;
  }
  
  .page-header {
    margin-bottom: 32px;
  }
  
  .page-title {
    font-size: 22px;
    gap: 12px;
  }
  
  .accent-bar {
    width: 4px;
    height: 22px;
  }
  
  .page-subtitle {
    font-size: 13px;
    margin-left: 16px;
  }
  
  .schedule-content {
    gap: 32px;
  }
  
  .day-header {
    margin-bottom: 16px;
    gap: 12px;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .day-info {
    gap: 8px;
  }
  
  .day-title {
    font-size: 18px;
  }
  
  .day-date {
    font-size: 11px;
  }
  
  .anime-count {
    font-size: 12px;
  }
  
  .anime-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }
  
  .card-content {
    padding: 12px;
  }
  
  .anime-title {
    font-size: 13px;
    min-height: 36px;
  }
  
  .episode-info {
    font-size: 11px;
  }
  
  .dub-tag {
    font-size: 9px;
    padding: 3px 6px;
  }
}
</style>
