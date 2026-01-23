<template>
  <section class="hero">
    <div class="hero-container">
      <div class="carousel-wrapper">
        <div class="hero-card glass" v-if="carouselItems.length > 0">
          <!-- Click areas for navigation -->
          <div v-if="carouselItems.length > 1" class="click-area left" @click="prevSlide">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </div>
          <div v-if="carouselItems.length > 1" class="click-area right" @click="nextSlide">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
          
          <div class="hero-content">
            <span class="badge glass-dark">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {{ currentAnime.rating?.average?.toFixed(1) || '4.5' }}
            </span>
            
            <h1 class="hero-title">{{ currentAnime.title }}</h1>
            
            <div class="hero-description">
              <p :class="{ expanded: isExpanded }">
                {{ currentAnime.description || 'Смотрите последние серии и фильмы аниме.' }}
              </p>
              <button 
                v-if="currentAnime.description && currentAnime.description.length > 200" 
                class="expand-btn"
                @click="isExpanded = !isExpanded"
              >
                {{ isExpanded ? 'Свернуть' : 'Развернуть' }}
              </button>
            </div>
            
            <div class="hero-actions">
              <router-link 
                :to="`/anime/${currentAnime.anime_url}`" 
                class="btn-primary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Смотреть
              </router-link>
              <button 
                class="btn-secondary glass-dark"
                :class="{ active: isBookmarked(currentAnime.anime_id) }"
                @click="handleToggleBookmark"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" :fill="isBookmarked(currentAnime.anime_id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                {{ isBookmarked(currentAnime.anime_id) ? 'В закладках' : 'В закладки' }}
              </button>
            </div>
          </div>
          
          <div class="hero-image">
            <img 
              v-if="currentAnime.poster" 
              :src="'https:' + (currentAnime.poster.fullsize || currentAnime.poster.mega || currentAnime.poster.huge)" 
              :alt="currentAnime.title"
              class="hero-poster"
            />
            <div v-else class="image-placeholder"></div>
          </div>
        </div>
        
        <div v-else class="hero-card glass loading-card">
          <div class="spinner"></div>
        </div>

        <!-- Carousel Indicators -->
        <div v-if="carouselItems.length > 1" class="carousel-indicators" ref="indicatorsContainer">
          <button 
            v-for="(item, index) in carouselItems" 
            :key="index"
            :class="['indicator', { active: index === currentIndex }]"
            @click="goToSlide(index)"
          ></button>
        </div>
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { api } from '../services/api.js'
import { useBookmarks } from '../composables/useBookmarks'
import { useAuth } from '../composables/useAuth'
import AuthModal from './AuthModal.vue'

const { isBookmarked, toggleBookmark, showAuthModal, closeAuthModal, reloadBookmarks } = useBookmarks()
const { isLoggedIn } = useAuth()

const handleToggleBookmark = async () => {
  if (currentAnime.value) {
    await toggleBookmark(currentAnime.value)
    // Принудительно обновляем компонент
    await nextTick()
  }
}

const handleAuthSuccess = () => {
  closeAuthModal()
  reloadBookmarks()
}

const carouselItems = ref([])
const currentIndex = ref(0)
const isExpanded = ref(false)
const indicatorsContainer = ref(null)

const currentAnime = computed(() => {
  return carouselItems.value[currentIndex.value] || {}
})

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % carouselItems.value.length
  isExpanded.value = false
}

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + carouselItems.value.length) % carouselItems.value.length
  isExpanded.value = false
}

const goToSlide = (index) => {
  currentIndex.value = index
  isExpanded.value = false
}

const scrollToActiveIndicator = () => {
  nextTick(() => {
    if (!indicatorsContainer.value) return
    
    const container = indicatorsContainer.value
    const activeIndicator = container.querySelector('.indicator.active')
    
    if (activeIndicator) {
      const containerWidth = container.offsetWidth
      const indicatorLeft = activeIndicator.offsetLeft
      const indicatorWidth = activeIndicator.offsetWidth
      
      const scrollPosition = indicatorLeft - (containerWidth / 2) + (indicatorWidth / 2)
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    }
  })
}

watch(currentIndex, () => {
  scrollToActiveIndicator()
})

onMounted(async () => {
  try {
    const feedData = await api.getFeed()
    // Используем top_carousel для hero
    if (feedData.top_carousel && feedData.top_carousel.items && feedData.top_carousel.items.length > 0) {
      carouselItems.value = feedData.top_carousel.items // Все аниме из top_carousel
      scrollToActiveIndicator()
    }
  } catch (error) {
    console.error('Failed to load featured anime:', error)
  }
})

onUnmounted(() => {
})
</script>

<style scoped>
.hero {
  padding: 120px 0 60px;
  width: 100%;
  overflow-x: hidden;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.hero-card {
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  height: 480px;
  position: relative;
  transition: opacity 0.5s ease;
}

.carousel-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 24px;
  pointer-events: none;
  z-index: 10;
}

.click-area {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  cursor: pointer;
  z-index: 150;
  display: flex;
  align-items: center;
  transition: opacity 0.3s ease;
}

.click-area svg {
  opacity: 0.2;
  transition: opacity 0.3s ease;
}

.click-area:hover svg {
  opacity: 0.6;
}

.click-area.left {
  left: 0;
  justify-content: flex-start;
  padding-left: 12px;
}

.click-area.right {
  right: 0;
  justify-content: flex-end;
  padding-right: 12px;
}

.carousel-indicators {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
  max-width: 160px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 24px;
  mask-image: linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.carousel-indicators::-webkit-scrollbar {
  display: none;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  flex-shrink: 0;
}

.indicator.active {
  width: 24px;
  border-radius: 4px;
  background: #ff6b35;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.5);
}

.hero-content {
  flex: 1;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 100;
  overflow: hidden;
  position: relative;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  width: fit-content;
  color: #ffa500;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  margin: 24px 0;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 115px;
}

.hero-description {
  max-width: 480px;
  margin-bottom: 32px;
}

.hero-description p {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  max-height: 4.8em;
  overflow: hidden;
  transition: max-height 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

.hero-description p.expanded {
  max-height: none;
  display: block;
  -webkit-line-clamp: unset;
}

.expand-btn {
  background: none;
  border: none;
  color: #ff6b35;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0 0 0;
  transition: color 0.2s;
}

.expand-btn:hover {
  color: #f7931e;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: #fff;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
  text-decoration: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255, 107, 53, 0.5);
}

.btn-secondary {
  color: #fff;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
}

.btn-secondary.active {
  color: #ff6b35;
}

.hero-image {
  flex: 1;
  position: relative;
  min-width: 400px;
  overflow: hidden;
}

.hero-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 200px;
  background: linear-gradient(to right, 
    rgba(17, 24, 39, 1) 0%, 
    rgba(17, 24, 39, 0.7) 50%,
    transparent 100%);
  z-index: 1;
  pointer-events: none;
}

.hero-poster {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0 24px 24px 0;
}

.image-placeholder {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(247, 147, 30, 0.2) 100%);
  border-radius: 0 24px 24px 0;
}

.loading-card {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 480px;
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

@media (max-width: 968px) {
  .hero-card {
    flex-direction: column;
    height: auto;
  }
  
  .hero-content {
    padding: 32px 24px;
  }
  
  .hero-image {
    min-width: auto;
    min-height: 300px;
    order: -1;
  }
  
  .hero-title {
    font-size: 32px;
    max-height: 77px;
  }
  
  .hero-description {
    max-width: 100%;
  }
  
  .hero-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .carousel-indicators {
    bottom: 12px;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 80px 0 40px;
  }
  
  .hero-container {
    padding: 0 8px;
  }
  
  .hero-card {
    border-radius: 16px;
  }
  
  .hero-content {
    padding: 20px 12px;
  }
  
  .hero-title {
    font-size: 22px;
    margin: 12px 0;
    max-height: 53px;
  }
  
  .badge {
    font-size: 11px;
    padding: 4px 8px;
  }
  
  .hero-description {
    margin-bottom: 20px;
  }
  
  .hero-description p {
    font-size: 13px;
    line-height: 1.5;
  }
  
  .hero-image {
    min-height: 220px;
  }
  
  .hero-actions {
    gap: 10px;
  }
  
  .btn-primary, .btn-secondary {
    padding: 10px 16px;
    font-size: 13px;
  }
  
  .carousel-controls {
    padding: 0 8px;
  }
  
  .carousel-indicators {
    display: none;
  }
  
  .click-area {
    width: 40%;
  }
}

</style>
