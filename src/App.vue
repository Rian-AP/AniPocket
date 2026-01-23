<template>
  <div class="app">
    <Navbar />
    <router-view />
    <AuthModal 
      :isOpen="showAuthModal" 
      @close="closeAuthModal"
      @success="handleAuthSuccess"
    />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import AuthModal from './components/AuthModal.vue'
import { useBookmarks } from './composables/useBookmarks'

const { showAuthModal, closeAuthModal, reloadBookmarks } = useBookmarks()

const handleAuthSuccess = () => {
  closeAuthModal()
  reloadBookmarks()
}
</script>

<style scoped>
.app {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
}
</style>
