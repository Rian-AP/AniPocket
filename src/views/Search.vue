<template>
  <div class="search-page">
    <div class="container">
      <h1 class="page-title">Поиск аниме</h1>
      
      <div class="search-box-large glass">
        <svg class="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input 
          v-model="searchQuery"
          @input="handleSearch"
          type="text" 
          placeholder="Введите название аниме..."
          class="search-input"
        />
      </div>
      
      <div v-if="isSearching" class="loading">
        <div class="spinner"></div>
      </div>
      
      <div v-else-if="searchResults.length > 0" class="results-grid">
        <router-link 
          v-for="anime in searchResults" 
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
      
      <div v-else-if="searchQuery.length >= 3" class="no-results">
        <p>Ничего не найдено</p>
      </div>
      
      <div v-else class="search-hint">
        <p>Введите минимум 3 символа для поиска</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../services/api.js'

const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
let searchTimeout = null

const handleSearch = () => {
  clearTimeout(searchTimeout)
  
  if (searchQuery.value.length < 3) {
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  
  searchTimeout = setTimeout(async () => {
    try {
      const response = await api.searchAnime(searchQuery.value)
      searchResults.value = response.data || []
    } catch (error) {
      console.error('Search failed:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 400)
}
</script>

<style scoped>
.search-page {
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
  margin-bottom: 32px;
}

.search-box-large {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-radius: 16px;
  margin-bottom: 40px;
}

.search-icon {
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.search-input {
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 18px;
  width: 100%;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.loading {
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

.results-grid {
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

.no-results, .search-hint {
  text-align: center;
  padding: 60px 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }
  
  .search-box-large {
    padding: 12px 16px;
  }
  
  .search-input {
    font-size: 16px;
  }
  
  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
  
  .card-image {
    height: 220px;
  }
}
</style>
