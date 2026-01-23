<template>
  <div class="catalog">
    <div class="container">
      <h1 class="page-title">Каталог аниме</h1>
      
      <div class="catalog-grid">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
        </div>
        
        <router-link 
          v-for="anime in animeList" 
          :key="anime.anime_id"
          :to="`/anime/${anime.anime_url}`"
          class="anime-card glass"
        >
          <div class="card-image">
            <img 
              v-if="anime.poster" 
              :src="'https:' + (anime.poster.fullsize || anime.poster.huge || anime.poster.big)" 
              :alt="anime.title"
            />
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ anime.title }}</h3>
            <div class="card-meta">
              <span v-if="anime.rating?.average" class="rating">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                {{ anime.rating.average.toFixed(1) }}
              </span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../services/api.js'

const animeList = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await api.getAnime({ limit: 24 })
    animeList.value = response.data
  } catch (error) {
    console.error('Failed to load catalog:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.catalog {
  padding: 120px 0 60px;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 40px;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.loading {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding: 60px 0;
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

.anime-card {
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.anime-card:hover {
  transform: translateY(-8px);
}

.card-image {
  width: 100%;
  height: 320px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.anime-card:hover .card-image img {
  transform: scale(1.05);
}

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.card-meta {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ffa500;
  font-weight: 600;
}

@media (max-width: 768px) {
  .catalog-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
  
  .card-image {
    height: 220px;
  }
  
  .page-title {
    font-size: 28px;
  }
}
</style>
