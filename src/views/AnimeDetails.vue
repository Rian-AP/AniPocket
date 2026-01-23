<template>
  <div class="anime-details">
    <div class="container">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="anime" class="details-content">
        <div class="anime-header glass">
          <div class="anime-poster">
            <img 
              v-if="anime.poster" 
              :src="'https:' + (anime.poster.fullsize || anime.poster.mega || anime.poster.huge)" 
              :alt="anime.title"
            />
            <button 
              class="bookmark-btn glass-dark"
              :class="{ active: isBookmarked(anime.anime_id) }"
              @click="handleToggleBookmark"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" :fill="isBookmarked(anime.anime_id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
          </div>
          
          <div class="anime-info">
            <h1 class="anime-title">{{ anime.title }}</h1>
            
            <div class="anime-meta">
              <span v-if="anime.rating?.average" class="rating">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {{ anime.rating.average.toFixed(2) }}
              </span>
              <span v-if="anime.year" class="meta-badge">{{ anime.year }}</span>
              <span v-if="anime.type?.name" class="meta-badge">{{ anime.type.name }}</span>
              <span v-if="anime.anime_status?.title" class="meta-badge status-badge" :class="'status-' + (anime.anime_status.class || 'default')">
                {{ anime.anime_status.title }}
              </span>
            </div>
            
            <div v-if="anime.genres && anime.genres.length > 0" class="anime-genres">
              <span v-for="genre in anime.genres" :key="genre.id" class="genre-tag glass-dark">
                {{ genre.title }}
              </span>
            </div>
            
            <div v-if="anime.episodes" class="anime-episodes">
              <span v-if="anime.episodes.aired">Вышло серий: {{ anime.episodes.aired }}</span>
              <span v-if="anime.episodes.count"> / {{ anime.episodes.count }}</span>
            </div>
            
            <p v-if="anime.description" class="anime-description">{{ anime.description }}</p>
            
            <div v-if="anime.studios && anime.studios.length > 0" class="anime-studios">
              <strong>Студия:</strong> {{ anime.studios.map(s => s.title).join(', ') }}
            </div>
            
            <div v-if="anime.original" class="anime-original">
              <strong>Источник:</strong> {{ anime.original }}
            </div>
          </div>
        </div>
        
        <!-- Viewing Order -->
        <div v-if="anime.viewing_order && anime.viewing_order.length > 1" class="viewing-order">
          <h2 class="section-title">
            <span class="accent-bar"></span>
            Порядок просмотра
          </h2>
          <div class="order-grid" ref="orderGrid">
            <router-link 
              v-for="item in anime.viewing_order" 
              :key="item.anime_id"
              :to="`/anime/${item.anime_url}`"
              class="order-card glass"
              :class="{ active: item.anime_id === anime.anime_id }"
              :ref="item.anime_id === anime.anime_id ? 'activeCard' : null"
            >
              <div class="order-image">
                <img 
                  v-if="item.poster" 
                  :src="'https:' + (item.poster.fullsize || item.poster.huge || item.poster.big)" 
                  :alt="item.title"
                />
              </div>
              <div class="order-content">
                <h3 class="order-title">{{ item.title }}</h3>
                <div class="order-badge-bottom">{{ item.data.text }}</div>
                <div class="order-meta">
                  <span class="order-year">{{ item.year }}</span>
                  <div v-if="item.rating" class="order-rating">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    {{ item.rating.toFixed(1) }}
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
        
        <!-- Video Player -->
        <div v-if="allVideos.length > 0" class="video-section">
          <!-- Selectors -->
          <div class="video-controls glass">
            <!-- Серия -->
            <div class="control-group">
              <label class="control-label">Серия</label>
              <div class="custom-select" :class="{ open: isEpisodeOpen }">
                <div class="select-trigger" @click="toggleEpisode">
                  <span>{{ selectedEpisode ? `Серия ${selectedEpisode}` : 'Выберите серию' }}</span>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="select-dropdown glass-dark" v-show="isEpisodeOpen">
                  <div 
                    v-for="episode in episodeNumbers" 
                    :key="episode"
                    class="select-option"
                    :class="{ active: selectedEpisode === episode }"
                    @click="selectEpisode(episode)"
                  >
                    Серия {{ episode }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Озвучка -->
            <div class="control-group">
              <label class="control-label">Озвучка</label>
              <div class="custom-select" :class="{ open: isDubOpen, disabled: !selectedEpisode }">
                <div class="select-trigger" @click="toggleDub">
                  <span>{{ selectedDub ? selectedDub.replace('Озвучка ', '') : 'Выберите озвучку' }}</span>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="select-dropdown glass-dark" v-show="isDubOpen && selectedEpisode">
                  <div 
                    v-for="dub in dubOptions" 
                    :key="dub"
                    class="select-option"
                    :class="{ active: selectedDub === dub }"
                    @click="selectDub(dub)"
                  >
                    {{ dub.replace('Озвучка ', '') }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Плеер -->
            <div class="control-group">
              <label class="control-label">Плеер</label>
              <div class="custom-select" :class="{ open: isPlayerOpen, disabled: !selectedDub }">
                <div class="select-trigger" @click="togglePlayer">
                  <span>{{ selectedPlayer ? selectedPlayer.replace('Плеер ', '') : 'Выберите плеер' }}</span>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="select-dropdown glass-dark" v-show="isPlayerOpen && selectedDub">
                  <div 
                    v-for="player in playerOptions" 
                    :key="player"
                    class="select-option"
                    :class="{ active: selectedPlayer === player }"
                    @click="selectPlayer(player)"
                  >
                    {{ player.replace('Плеер ', '') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="video-player glass">
            <div class="player-wrapper">
              <iframe 
                v-if="selectedVideo"
                :src="'https:' + selectedVideo.iframe_url"
                frameborder="0"
                allowfullscreen
                allow="autoplay; fullscreen; picture-in-picture"
              ></iframe>
              <div v-else class="player-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <p>Выберите серию, озвучку и плеер</p>
              </div>
            </div>
          </div>
          
          <!-- Episode Navigation -->
          <div v-if="selectedVideo" class="episode-navigation">
            <button 
              class="nav-btn prev-btn glass-dark"
              :disabled="!hasPreviousEpisode"
              @click="goToPreviousEpisode"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span>Предыдущая серия</span>
            </button>
            
            <button 
              class="nav-btn next-btn glass-dark"
              :disabled="!hasNextEpisode"
              @click="goToNextEpisode"
            >
              <span>Следующая серия</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="error">
        <p>Аниме не найдено</p>
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
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/api.js'
import { useBookmarks } from '../composables/useBookmarks'
import { useAuth } from '../composables/useAuth'
import AuthModal from '../components/AuthModal.vue'

const route = useRoute()
const anime = ref(null)
const loading = ref(true)
const allVideos = ref([])
const selectedVideo = ref(null)
const selectedEpisode = ref(null)
const selectedDub = ref(null)
const selectedPlayer = ref(null)

// Bookmarks
const { isBookmarked, toggleBookmark, showAuthModal, closeAuthModal, reloadBookmarks } = useBookmarks()
const { isLoggedIn } = useAuth()

const handleToggleBookmark = async () => {
  if (anime.value) {
    await toggleBookmark(anime.value)
  }
}

const handleAuthSuccess = () => {
  closeAuthModal()
  reloadBookmarks()
}

// Refs для элементов
const orderGrid = ref(null)
const activeCard = ref(null)

// Состояния для открытия дропдаунов
const isEpisodeOpen = ref(false)
const isDubOpen = ref(false)
const isPlayerOpen = ref(false)

// Сохранение позиции скролла
let savedScrollPosition = 0

const saveScrollPosition = () => {
  savedScrollPosition = window.scrollY
}

const restoreScrollPosition = () => {
  if (savedScrollPosition > 0) {
    window.scrollTo(0, savedScrollPosition)
  }
}

// Computed для уникальных серий
const episodeNumbers = computed(() => {
  const episodes = new Set()
  allVideos.value.forEach(video => {
    episodes.add(video.number)
  })
  return Array.from(episodes).sort((a, b) => parseInt(a) - parseInt(b))
})

// Computed для озвучек (фильтруется по выбранной серии)
const dubOptions = computed(() => {
  if (!selectedEpisode.value) return []
  
  // Собираем озвучки с подсчетом плееров
  const dubsMap = new Map()
  allVideos.value
    .filter(v => v.number === selectedEpisode.value)
    .forEach(video => {
      const dubName = video.data?.dubbing || 'Неизвестно'
      if (!dubsMap.has(dubName)) {
        dubsMap.set(dubName, new Set())
      }
      const playerName = video.data?.player || 'Неизвестно'
      dubsMap.get(dubName).add(playerName)
    })
  
  // Сортируем: AniLibria первая, затем по количеству плееров
  return Array.from(dubsMap.entries())
    .sort((a, b) => {
      const aIsAniLibria = a[0].toLowerCase().includes('anilibria')
      const bIsAniLibria = b[0].toLowerCase().includes('anilibria')
      
      // AniLibria всегда первая
      if (aIsAniLibria && !bIsAniLibria) return -1
      if (!aIsAniLibria && bIsAniLibria) return 1
      
      // Остальные по количеству плееров
      return b[1].size - a[1].size
    })
    .map(entry => entry[0])
})

// Computed для плееров (фильтруется по серии и озвучке)
const playerOptions = computed(() => {
  if (!selectedEpisode.value || !selectedDub.value) return []
  const players = new Set()
  allVideos.value
    .filter(v => 
      v.number === selectedEpisode.value &&
      (v.data?.dubbing || 'Неизвестно') === selectedDub.value
    )
    .forEach(video => {
      const playerName = video.data?.player || 'Неизвестно'
      players.add(playerName)
    })
  
  // Сортируем с приоритетом: Alloha, Kodik, остальные
  return Array.from(players).sort((a, b) => {
    const aLower = a.toLowerCase()
    const bLower = b.toLowerCase()
    
    const aIsAlloha = aLower.includes('alloha')
    const bIsAlloha = bLower.includes('alloha')
    const aIsKodik = aLower.includes('kodik')
    const bIsKodik = bLower.includes('kodik')
    
    // Alloha всегда первый
    if (aIsAlloha && !bIsAlloha) return -1
    if (!aIsAlloha && bIsAlloha) return 1
    
    // Kodik второй
    if (aIsKodik && !bIsKodik) return -1
    if (!aIsKodik && bIsKodik) return 1
    
    // Остальные по алфавиту
    return a.localeCompare(b)
  })
})

const loadAnime = async () => {
  loading.value = true
  try {
    const animeUrl = route.params.id
    anime.value = await api.getAnimeDetails(animeUrl)
    
    // Загружаем видео
    if (anime.value?.anime_id) {
      allVideos.value = await api.getAnimeVideos(anime.value.anime_id)
      
      // Автоматически выбираем первую серию
      if (allVideos.value.length > 0 && episodeNumbers.value.length > 0) {
        selectedEpisode.value = episodeNumbers.value[0]
      }
    }
    
    // Прокручиваем к активной карточке в порядке просмотра
    await nextTick()
    scrollToActiveCard()
  } catch (error) {
    console.error('Failed to load anime:', error)
    anime.value = null
  } finally {
    loading.value = false
  }
}

// Функция для прокрутки к активной карточке
const scrollToActiveCard = () => {
  setTimeout(() => {
    if (activeCard.value && orderGrid.value) {
      const card = Array.isArray(activeCard.value) ? activeCard.value[0] : activeCard.value
      const cardElement = card?.$el || card
      
      if (cardElement) {
        const rect = cardElement.getBoundingClientRect()
        const isVisible = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
        )
        
        // Прокручиваем только если карточка не видна полностью
        if (!isVisible) {
          cardElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center', 
            inline: 'center' 
          })
        }
      }
    }
  }, 300) // Задержка для загрузки контента
}

// Функции для открытия/закрытия с закрытием других
const toggleEpisode = () => {
  isEpisodeOpen.value = !isEpisodeOpen.value
  if (isEpisodeOpen.value) {
    isDubOpen.value = false
    isPlayerOpen.value = false
  }
}

const toggleDub = () => {
  if (!selectedEpisode.value) return
  isDubOpen.value = !isDubOpen.value
  if (isDubOpen.value) {
    isEpisodeOpen.value = false
    isPlayerOpen.value = false
  }
}

const togglePlayer = () => {
  if (!selectedDub.value) return
  isPlayerOpen.value = !isPlayerOpen.value
  if (isPlayerOpen.value) {
    isEpisodeOpen.value = false
    isDubOpen.value = false
  }
}

// Функции для выбора
const selectEpisode = (episode) => {
  selectedEpisode.value = episode
  isEpisodeOpen.value = false
}

// Навигация по сериям
const goToPreviousEpisode = () => {
  const currentIndex = episodeNumbers.value.indexOf(selectedEpisode.value)
  if (currentIndex > 0) {
    selectedEpisode.value = episodeNumbers.value[currentIndex - 1]
  }
}

const goToNextEpisode = () => {
  const currentIndex = episodeNumbers.value.indexOf(selectedEpisode.value)
  if (currentIndex < episodeNumbers.value.length - 1) {
    selectedEpisode.value = episodeNumbers.value[currentIndex + 1]
  }
}

const hasPreviousEpisode = computed(() => {
  const currentIndex = episodeNumbers.value.indexOf(selectedEpisode.value)
  return currentIndex > 0
})

const hasNextEpisode = computed(() => {
  const currentIndex = episodeNumbers.value.indexOf(selectedEpisode.value)
  return currentIndex < episodeNumbers.value.length - 1
})

const selectDub = (dub) => {
  selectedDub.value = dub
  isDubOpen.value = false
}

const selectPlayer = (player) => {
  selectedPlayer.value = player
  isPlayerOpen.value = false
}

// Закрытие дропдаунов при клике вне
const closeDropdowns = (e) => {
  if (!e.target.closest('.custom-select')) {
    isDubOpen.value = false
    isPlayerOpen.value = false
    isEpisodeOpen.value = false
  }
}

// Watchers для автоматического выбора с сохранением
watch(selectedEpisode, (newEpisode) => {
  if (newEpisode && dubOptions.value.length > 0) {
    // Пытаемся сохранить текущую озвучку
    const currentDubExists = dubOptions.value.includes(selectedDub.value)
    if (!currentDubExists) {
      selectedDub.value = dubOptions.value[0]
    } else {
      // Если озвучка та же, обновляем видео
      updateSelectedVideo()
    }
  } else {
    selectedDub.value = null
    selectedPlayer.value = null
    selectedVideo.value = null
  }
})

watch(selectedDub, (newDub) => {
  if (newDub && playerOptions.value.length > 0) {
    // Пытаемся сохранить текущий плеер
    const currentPlayerExists = playerOptions.value.includes(selectedPlayer.value)
    if (!currentPlayerExists) {
      selectedPlayer.value = playerOptions.value[0]
    } else {
      // Если плеер тот же, обновляем видео
      updateSelectedVideo()
    }
  } else {
    selectedPlayer.value = null
    selectedVideo.value = null
  }
})

watch(selectedPlayer, (newPlayer) => {
  if (newPlayer) {
    updateSelectedVideo()
  }
})

// Функция для обновления выбранного видео
const updateSelectedVideo = () => {
  if (selectedEpisode.value && selectedDub.value && selectedPlayer.value) {
    const video = allVideos.value.find(v => 
      v.number === selectedEpisode.value &&
      (v.data?.dubbing || 'Неизвестно') === selectedDub.value &&
      (v.data?.player || 'Неизвестно') === selectedPlayer.value
    )
    if (video) {
      selectedVideo.value = video
    }
  }
}

onMounted(() => {
  loadAnime()
  document.addEventListener('click', closeDropdowns)
  
  // Сохраняем позицию при изменении ориентации или fullscreen
  document.addEventListener('fullscreenchange', saveScrollPosition)
  document.addEventListener('webkitfullscreenchange', saveScrollPosition)
  window.addEventListener('orientationchange', saveScrollPosition)
  window.addEventListener('resize', () => {
    // Восстанавливаем позицию после изменения размера
    setTimeout(restoreScrollPosition, 100)
  })
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
  document.removeEventListener('fullscreenchange', saveScrollPosition)
  document.removeEventListener('webkitfullscreenchange', saveScrollPosition)
  window.removeEventListener('orientationchange', saveScrollPosition)
})

onMounted(() => {
  loadAnime()
})

// Следим за изменением параметра роута
watch(() => route.params.id, () => {
  loadAnime()
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<style scoped>
.anime-details {
  padding: 120px 0 60px;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.loading, .error {
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

.video-section {
  margin-bottom: 60px;
}

.video-controls {
  padding: 24px;
  border-radius: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  overflow: visible;
  position: relative;
  z-index: 10;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.control-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 6px;
}

.control-label::before {
  content: '';
  width: 3px;
  height: 14px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border-radius: 2px;
}

.custom-select {
  position: relative;
  user-select: none;
}

.custom-select.open {
  z-index: 100;
}

.custom-select.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.select-trigger {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.select-trigger:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.custom-select.open .select-trigger {
  border-color: #ff6b35;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.1);
}

.select-trigger svg {
  flex-shrink: 0;
  transition: transform 0.3s ease;
  color: rgba(255, 255, 255, 0.6);
}

.custom-select.open .select-trigger svg {
  transform: rotate(180deg);
  color: #ff6b35;
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 12px;
  padding: 8px;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.select-dropdown::-webkit-scrollbar {
  width: 6px;
}

.select-dropdown::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.select-dropdown::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.select-dropdown::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.select-option {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.select-option:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateX(4px);
}

.select-option.active {
  background: rgba(255, 107, 53, 0.2);
  color: #ff6b35;
  font-weight: 600;
}

.select-option.active:hover {
  background: rgba(255, 107, 53, 0.3);
}

.video-player {
  padding: 0;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  /* Предотвращаем скачки на мобильных */
  -webkit-overflow-scrolling: touch;
}

.player-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  background: #000;
  /* Фиксируем позицию для мобильных */
  contain: layout style paint;
}

.player-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.player-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.3);
}

.player-placeholder svg {
  opacity: 0.3;
}

.player-placeholder p {
  font-size: 14px;
}

.episode-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #fff;
  flex: 1;
}

.prev-btn {
  justify-content: center;
}

.next-btn {
  justify-content: center;
}

.nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.1);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn svg {
  flex-shrink: 0;
}

.anime-header {
  display: flex;
  gap: 40px;
  padding: 40px;
  border-radius: 24px;
  margin-bottom: 60px;
}

.anime-poster {
  flex-shrink: 0;
  width: 300px;
  height: 450px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.anime-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bookmark-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  z-index: 20;
  transition: all 0.3s ease;
}

.bookmark-btn:hover {
  color: #ff6b35;
  background: rgba(255, 255, 255, 0.15);
}

.anime-info {
  flex: 1;
}

.anime-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
}

.anime-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  flex-wrap: wrap;
  align-items: center;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ffa500;
  font-weight: 600;
  padding: 6px 12px;
  background: rgba(255, 165, 0, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 165, 0, 0.3);
}

.meta-badge {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.meta-badge:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.status-badge {
  font-weight: 600;
}

.status-badge.status-ongoing,
.status-badge.status-anons {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.3);
  color: #4caf50;
}

.status-badge.status-released {
  background: rgba(33, 150, 243, 0.1);
  border-color: rgba(33, 150, 243, 0.3);
  color: #2196f3;
}

.anime-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.genre-tag {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

.anime-episodes {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
}

.anime-description {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;
}

.anime-studios, .anime-original {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.anime-studios strong, .anime-original strong {
  color: rgba(255, 255, 255, 0.9);
}

.viewing-order {
  margin-bottom: 60px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.accent-bar {
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border-radius: 2px;
}

.order-grid {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 20px 10px 30px 10px;
  margin: 0 -10px;
}

.order-grid::-webkit-scrollbar {
  height: 6px;
  margin: 0 10px;
}

.order-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  margin: 0 10px;
}

.order-grid::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.order-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.order-card {
  min-width: 180px;
  max-width: 180px;
  border-radius: 16px;
  overflow: visible;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.order-card:hover {
  transform: translateY(-8px) scale(1.05);
  z-index: 10;
}

.order-card.active {
  box-shadow: 0 0 0 3px #ff6b35;
}

.order-card > * {
  border-radius: 16px;
  overflow: hidden;
}

.order-image {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.order-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.order-card:hover .order-image img {
  transform: scale(1.05);
}

.order-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  z-index: 20;
  text-transform: uppercase;
  background: rgba(255, 107, 53, 0.9);
  color: #fff;
  display: none;
}

.order-badge-bottom {
  font-size: 11px;
  color: #ff6b35;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.order-content {
  padding: 12px;
}

.order-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
  min-height: 36px;
}

.order-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.order-year {
  color: rgba(255, 255, 255, 0.6);
}

.order-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ffa500;
  font-weight: 600;
}

@media (max-width: 768px) {
  .anime-details {
    padding: 80px 0 40px;
  }
  
  .container {
    padding: 0 16px;
  }
  
  .video-section {
    margin-bottom: 24px;
  }
  
  .video-controls {
    padding: 16px;
    border-radius: 16px;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .control-label {
    font-size: 12px;
  }
  
  .select-trigger {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .select-dropdown {
    max-height: 250px;
  }
  
  .select-option {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .video-player {
    border-radius: 16px;
  }
  
  .episode-navigation {
    flex-direction: row;
    gap: 12px;
    margin-top: 16px;
  }
  
  .nav-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
  
  .nav-btn span {
    display: none;
  }
  
  .nav-btn svg {
    margin: 0;
  }
  
  .anime-header {
    flex-direction: column;
    padding: 24px;
  }
  
  .anime-poster {
    width: 100%;
    max-width: 100%;
    height: auto;
    aspect-ratio: 2/3;
    margin: 0;
  }
  
  .anime-title {
    font-size: 24px;
  }
  
  .order-grid {
    padding: 12px 4px 20px 4px;
    margin: 0 -4px;
    gap: 10px;
  }
  
  .order-card {
    min-width: 140px;
    max-width: 140px;
  }
  
  .order-image {
    height: 200px;
  }
  
  .order-title {
    font-size: 12px;
    min-height: 31px;
  }
  
  .order-content {
    padding: 10px;
  }
  
  .order-meta {
    font-size: 11px;
  }
}
</style>
