<template>
  <section class="top-picks">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">
          <span class="accent-bar"></span>
          Новое на сайте
        </h2>
        <div class="nav-arrows">
          <button class="arrow-btn glass-dark" @click="scrollLeft">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <button class="arrow-btn glass-dark" @click="scrollRight">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="cards-container" ref="cardsContainer">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
        </div>
        
        <router-link 
          v-for="anime in collections" 
          :key="anime.anime_id"
          :to="`/anime/${anime.anime_url}`"
          class="anime-card glass"
          @mouseenter="handleMouseEnter(anime.anime_id)"
          @mouseleave="handleMouseLeave(anime.anime_id)"
        >
          <div class="card-image">
            <img 
              v-if="getPosterUrl(anime.poster)" 
              :src="'https:' + getPosterUrl(anime.poster)" 
              :alt="anime.title"
              class="image-placeholder"
            />
            <div v-else class="image-placeholder no-image"></div>
            <button 
              class="bookmark-btn glass-dark"
              :class="{ active: isBookmarked(anime.anime_id) }"
              @click.prevent="handleToggleBookmark(anime)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" :fill="isBookmarked(anime.anime_id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <div class="quality-badge glass-dark" v-if="anime.type?.shortname">
              {{ 
                anime.type.shortname === 'п/ф' ? 'Фильм' : 
                anime.type.shortname === 'ТВ' ? 'ТВ сериал' : 
                anime.type.shortname
              }}
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ anime.title }}</h3>
            <div class="card-meta">
              <span class="genre" v-if="anime.year">{{ anime.year }}</span>
              <div class="rating" v-if="anime.rating?.average">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {{ anime.rating.average.toFixed(1) }}
              </div>
              <span v-else class="new-badge">NEW</span>
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

const cardsContainer = ref(null)
const hoveredCard = ref(null)
const collections = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const feedData = await api.getFeed()
    // Используем new (новые аниме) для "Новое на сайте"
    if (feedData.new && feedData.new.length > 0) {
      // Объединяем дубликаты по anime_id
      const uniqueAnime = []
      const seenIds = new Set()
      
      for (const anime of feedData.new) {
        if (!seenIds.has(anime.anime_id)) {
          seenIds.add(anime.anime_id)
          uniqueAnime.push(anime)
        }
      }
      
      collections.value = uniqueAnime
    }
  } catch (error) {
    console.error('Failed to load collections:', error)
  } finally {
    loading.value = false
  }
})

const scrollLeft = () => {
  if (cardsContainer.value) {
    const card = cardsContainer.value.querySelector('.anime-card')
    if (card) {
      const cardWidth = card.offsetWidth
      const gap = 20 // gap между карточками
      cardsContainer.value.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' })
    }
  }
}

const scrollRight = () => {
  if (cardsContainer.value) {
    const card = cardsContainer.value.querySelector('.anime-card')
    if (card) {
      const cardWidth = card.offsetWidth
      const gap = 20 // gap между карточками
      cardsContainer.value.scrollBy({ left: cardWidth + gap, behavior: 'smooth' })
    }
  }
}

const handleMouseEnter = (id) => {
  hoveredCard.value = id
}

const handleMouseLeave = (id) => {
  hoveredCard.value = null
}

const getGenreText = (genres) => {
  if (!genres || genres.length === 0) return 'Anime'
  return genres.slice(0, 2).map(g => g.title).join(' • ')
}

const getScheduleInfo = (episodes) => {
  if (!episodes) return 'Онгоинг'
  if (episodes.next_date) {
    const date = new Date(episodes.next_date * 1000)
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    return `${days[date.getDay()]}, ${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}`
  }
  return episodes.aired ? `${episodes.aired} эп.` : 'Онгоинг'
}

const getPosterUrl = (poster) => {
  if (!poster) return ''
  return poster.fullsize || poster.huge || poster.big || poster.medium || ''
}
</script>

<style scoped>
.top-picks {
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
  align-items: center;
  margin-bottom: 32px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.accent-bar {
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border-radius: 2px;
}

.nav-arrows {
  display: flex;
  gap: 12px;
}

.arrow-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: all 0.3s ease;
}

.arrow-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.cards-container {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 20px 10px 30px 10px;
  margin: 0 -10px;
}

.cards-container::-webkit-scrollbar {
  height: 6px;
  margin: 0 10px;
}

.cards-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  margin: 0 10px;
}

.cards-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.cards-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .nav-arrows {
    flex-shrink: 0;
  }
  
  .arrow-btn {
    width: 36px;
    height: 36px;
  }
  
  .anime-card {
    min-width: 180px;
  }
  
  .card-image {
    height: 260px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .card-meta {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .top-picks {
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
  
  .nav-arrows {
    display: none;
  }
  
  .cards-container {
    padding: 12px 4px 20px 4px;
    margin: 0 -4px;
    gap: 10px;
  }
  
  .anime-card {
    min-width: 140px;
  }
  
  .card-image {
    height: 200px;
  }
  
  .card-content {
    padding: 10px;
  }
  
  .card-title {
    font-size: 12px;
  }
  
  .card-meta {
    font-size: 11px;
  }
  
  .quality-badge {
    font-size: 9px;
    padding: 3px 6px;
    top: 8px;
    right: 8px;
  }
  
  .bookmark-btn {
    width: 28px;
    height: 28px;
    top: 8px;
    left: 8px;
  }
}


.anime-card {
  min-width: 220px;
  border-radius: 16px;
  overflow: visible;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  display: block;
}

.anime-card:hover {
  transform: translateY(-8px) scale(1.05);
  z-index: 10;
}

.anime-card > * {
  border-radius: 16px;
  overflow: hidden;
}

.card-image {
  position: relative;
  width: 100%;
  height: 320px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-placeholder.no-image {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.anime-card:hover .image-placeholder {
  transform: scale(1.05);
}

.quality-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  z-index: 20;
}

.bookmark-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  z-index: 20;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.anime-card:hover .bookmark-btn {
  opacity: 1;
  transform: scale(1);
}

.bookmark-btn:hover {
  color: #ff6b35;
  background: rgba(255, 255, 255, 0.15);
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 100%;
  height: 400px;
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

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.genre {
  color: rgba(255, 255, 255, 0.6);
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ffa500;
  font-weight: 600;
}

.new-badge {
  color: #ff6b35;
  font-weight: 700;
  font-size: 11px;
  padding: 2px 6px;
  background: rgba(255, 107, 53, 0.2);
  border-radius: 4px;
}
</style>
