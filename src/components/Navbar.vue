<template>
  <nav class="navbar glass">
    <div class="nav-container">
      <div class="nav-left">
        <router-link to="/" class="logo">
          <img src="/favicon.svg" alt="AniPocket" class="logo-icon" />
          <span class="logo-text">AniPocket</span>
        </router-link>
      </div>
      
      <div class="search-box glass-dark">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input 
          type="text" 
          placeholder="Поиск" 
          v-model="searchQuery"
          @input="handleSearch"
          @focus="searchQuery.length >= 3 && (showResults = true)"
        />
        <button 
          v-if="searchQuery" 
          class="clear-btn"
          @click="clearSearch"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <div class="nav-right">
        <router-link to="/bookmarks" class="icon-btn glass-dark">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </router-link>
        
        <button v-if="!isLoggedIn" class="login-btn glass-dark" @click="handleLogin">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>
            <path d="M3 12h12"/>
            <path d="M12 8l4 4-4 4"/>
          </svg>
        </button>
        
        <div v-else class="user-menu-wrapper">
          <button ref="avatarButton" class="avatar glass-dark" @click="toggleUserMenu">
            <img v-if="user?.avatar" :src="user.avatar" :alt="user.username" class="avatar-img" />
            <span v-else class="avatar-text">
              {{ user?.username?.charAt(0).toUpperCase() }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </nav>
  
  <!-- User menu outside navbar for proper backdrop-filter -->
  <Transition name="dropdown">
    <div v-if="showUserMenu" class="user-menu-dropdown" :style="userMenuStyle">
      <div class="user-menu glass">
        <div class="user-info">
          <div class="user-avatar">
            <img v-if="user?.avatar" :src="user.avatar" :alt="user.username" class="avatar-img" />
            <span v-else>{{ user?.username?.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="user-details">
            <div class="user-name">{{ user?.username }}</div>
            <div class="user-email">{{ user?.email }}</div>
          </div>
        </div>
        
        <div class="menu-divider"></div>
        
        <button class="menu-item" @click="handleLogout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Выйти</span>
        </button>
      </div>
    </div>
  </Transition>
  
  <!-- Search results outside navbar for proper backdrop-filter -->
  <div v-if="showResults" class="search-results-wrapper">
    <div class="search-results glass">
      <div v-if="isSearching" class="search-loading">
        <div class="spinner-small"></div>
        <span>Searching...</span>
      </div>
      
      <div v-else-if="searchResults.length === 0 && searchQuery.length >= 3" class="search-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <p>No results found for "{{ searchQuery }}"</p>
      </div>
      
      <div v-else-if="searchResults.length > 0" class="search-results-list">
        <router-link 
          v-for="anime in searchResults" 
          :key="anime.anime_id"
          :to="`/anime/${anime.anime_url}`"
          class="search-result-item"
          @click="clearSearch"
        >
          <img 
            v-if="anime.poster" 
            :src="'https:' + (anime.poster.medium || anime.poster.big || anime.poster.fullsize)" 
            :alt="anime.title"
            class="result-poster"
          />
          <div v-else class="result-poster-placeholder"></div>
          <div class="result-info">
            <div class="result-title">{{ anime.title }}</div>
            <div class="result-meta">
              <span>{{ anime.year || 'N/A' }}</span>
              <span class="dot">•</span>
              <span>{{ anime.type?.name || 'Anime' }}</span>
              <span v-if="anime.rating?.average" class="dot">•</span>
              <span v-if="anime.rating?.average" class="result-rating">
                ⭐ {{ anime.rating.average.toFixed(1) }}
              </span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { api } from '../services/api.js'
import { useAuth } from '../composables/useAuth'
import { useBookmarks } from '../composables/useBookmarks'

const { isLoggedIn, user, logout } = useAuth()
const { reloadBookmarks, showAuthModal, openAuthModal, closeAuthModal } = useBookmarks()

const searchQuery = ref('')
const searchResults = ref([])
const showResults = ref(false)
const isSearching = ref(false)
const showUserMenu = ref(false)
const avatarButton = ref(null)
const userMenuStyle = ref({})
let searchTimeout = null

const handleSearch = () => {
  clearTimeout(searchTimeout)
  
  if (searchQuery.value.length < 3) {
    searchResults.value = []
    showResults.value = false
    return
  }
  
  isSearching.value = true
  showResults.value = true
  
  searchTimeout = setTimeout(async () => {
    try {
      const response = await api.searchAnime(searchQuery.value)
      searchResults.value = (response.data || []).slice(0, 8)
    } catch (error) {
      console.error('Search failed:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }, 400)
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  showResults.value = false
}

const handleLogin = () => {
  openAuthModal()
}

const handleAuthSuccess = () => {
  closeAuthModal()
  reloadBookmarks()
}

const handleLogout = () => {
  logout()
  showUserMenu.value = false
  reloadBookmarks()
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  
  if (showUserMenu.value && avatarButton.value) {
    const rect = avatarButton.value.getBoundingClientRect()
    userMenuStyle.value = {
      position: 'fixed',
      top: `70px`,
      right: `${window.innerWidth - rect.right}px`
    }
  }
}

const handleClickOutside = (e) => {
  if (!e.target.closest('.search-box') && !e.target.closest('.search-results-wrapper')) {
    showResults.value = false
  }
  if (!e.target.closest('.user-menu-wrapper') && !e.target.closest('.user-menu-dropdown')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  clearTimeout(searchTimeout)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 12px 0;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 24px;
}

.nav-left {
  display: flex;
  align-items: center;
  justify-self: start;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 18px;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.3s ease;
}

.logo:hover {
  opacity: 0.8;
}

.logo-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.logo-text {
  display: inline;
}

@media (max-width: 768px) {
  .logo-text {
    display: none !important;
  }
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 24px;
  width: 100%;
  max-width: 600px;
  justify-self: center;
}

@media (min-width: 769px) {
  .search-box {
    min-width: 400px;
  }
}

.search-icon {
  color: rgba(255, 255, 255, 0.5);
  stroke-width: 2;
}

.search-box input {
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
  width: 100%;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.clear-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.clear-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-self: end;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
}

.icon-btn:hover {
  transform: scale(1.05);
  color: #fff;
}

.login-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: scale(1.05);
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
}

.user-menu-wrapper {
  position: relative;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  transition: transform 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  overflow: hidden;
  padding: 0;
}

.avatar:hover {
  transform: scale(1.05);
}

.avatar-text {
  user-select: none;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-menu-dropdown {
  z-index: 1001;
}

.user-menu {
  min-width: 230px;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 20px;
  flex-shrink: 0;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-email {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.search-results-wrapper {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 470px;
  z-index: 1001;
}

.search-results {
  width: 100%;
  max-height: 500px;
  overflow-y: auto;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.search-results::-webkit-scrollbar {
  display: none;
}

.search-results {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.search-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  color: rgba(255, 255, 255, 0.6);
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #ff6b35;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.search-empty svg {
  margin-bottom: 16px;
  opacity: 0.3;
}

.search-empty p {
  font-size: 14px;
  line-height: 1.5;
}

.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.search-result-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
  color: inherit;
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.result-poster {
  width: 50px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.result-poster-placeholder {
  width: 50px;
  height: 70px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  opacity: 0.5;
}

.result-rating {
  color: #ffa500;
  font-weight: 600;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

@media (max-width: 768px) {
  .navbar {
    padding: 16px 0;
  }
  
  .nav-container {
    padding: 0 16px;
    gap: 12px;
  }
  
  .logo {
    font-size: 18px;
    flex-shrink: 0;
  }
  
  .nav-links {
    display: none;
  }
  
  .search-box {
    min-width: 0;
    max-width: 200px;
    padding: 6px 12px;
    flex: 1;
  }
  
  .search-box input {
    font-size: 13px;
  }
  
  .nav-actions {
    gap: 8px;
    flex-shrink: 0;
  }
  
  .btn-login {
    padding: 8px 14px;
    font-size: 12px;
  }
  
  .btn-signup {
    padding: 8px 14px;
    font-size: 12px;
  }
  
  .search-results {
    width: calc(100% - 32px);
    max-width: none;
    left: 16px;
    transform: none;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 10px 0;
  }
  
  .nav-container {
    padding: 0 8px;
    gap: 8px;
  }
  
  .logo {
    font-size: 15px;
    flex-shrink: 0;
  }
  
  .logo-icon {
    width: 22px;
    height: 22px;
  }
  
  .search-box {
    min-width: 0;
    max-width: 120px;
    padding: 5px 8px;
    gap: 4px;
    flex: 1;
  }
  
  .search-box input {
    font-size: 11px;
  }
  
  .search-icon {
    width: 12px;
    height: 12px;
  }
  
  .clear-btn {
    padding: 2px;
  }
  
  .clear-btn svg {
    width: 12px;
    height: 12px;
  }
  
  .nav-actions {
    gap: 4px;
    flex-shrink: 0;
  }
  
  .btn-login, .btn-signup {
    padding: 5px 8px;
    font-size: 10px;
  }
  
  .search-results {
    width: calc(100% - 16px);
    max-width: none;
    left: 8px;
    transform: none;
    max-height: 70vh;
    top: 60px;
  }
  
  .result-item {
    padding: 10px;
    gap: 10px;
  }
  
  .result-poster {
    width: 50px;
    height: 75px;
  }
  
  .result-info {
    gap: 4px;
  }
  
  .result-title {
    font-size: 13px;
  }
  
  .result-meta {
    font-size: 11px;
  }
}
