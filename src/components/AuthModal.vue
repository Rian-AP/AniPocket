<template>
  <div v-if="isOpen" class="overlay" @click="close">
    <div class="modal" @click.stop>
      <button class="close" @click="close">×</button>
      
      <h2>Вход в аккаунт</h2>
      <p>Войдите с помощью Google аккаунта</p>
      
      <div v-if="error" class="error">{{ error }}</div>
      
      <button class="google-btn" @click="login" :disabled="loading">
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg>
        {{ loading ? 'Загрузка...' : 'Войти через Google' }}
      </button>
      
      <p class="terms">Продолжая, вы соглашаетесь с условиями использования и политикой конфиденциальности</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['close', 'success'])
const { loginWithGoogle } = useAuth()
const error = ref('')
const loading = ref(false)

const login = async () => {
  if (loading.value) return
  loading.value = true
  error.value = ''
  
  try {
    const result = await loginWithGoogle()
    if (result.success) {
      // Supabase сам сделает редирект на Google
      // После возврата пользователь будет авторизован
    } else {
      error.value = result.error || 'Ошибка входа'
      loading.value = false
    }
  } catch (e) {
    error.value = 'Произошла ошибка'
    loading.value = false
  }
}

const close = () => {
  emit('close')
  error.value = ''
  loading.value = false
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  background: rgba(26, 35, 50, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 40px;
  max-width: 420px;
  width: 90%;
  position: relative;
  text-align: center;
}

.close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #fff;
}

p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin-bottom: 28px;
}

.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ff6b6b;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 13px;
}

.google-btn {
  width: 100%;
  background: #fff;
  color: #1f1f1f;
  border: none;
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.google-btn:hover:not(:disabled) {
  background: #f5f5f5;
  transform: translateY(-1px);
}

.google-btn:active:not(:disabled) {
  transform: translateY(0);
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.terms {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  line-height: 1.4;
}

@media (max-width: 480px) {
  .modal {
    padding: 32px 24px;
  }
  
  h2 {
    font-size: 20px;
  }
}
</style>
