import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

const user = ref(null)
const session = ref(null)

// Загрузка сессии при инициализации
const loadSession = async () => {
  const { data: { session: currentSession } } = await supabase.auth.getSession()
  if (currentSession) {
    session.value = currentSession
    user.value = currentSession.user
  }
}

// Подписка на изменения авторизации
supabase.auth.onAuthStateChange((event, currentSession) => {
  session.value = currentSession
  user.value = currentSession?.user || null
})

// Инициализация
loadSession()

export function useAuth() {
  const isLoggedIn = computed(() => !!user.value)
  
  // Computed свойства для удобного доступа к данным пользователя
  const userProfile = computed(() => {
    if (!user.value) return null
    
    return {
      id: user.value.id,
      email: user.value.email,
      username: user.value.user_metadata?.full_name || user.value.user_metadata?.name || user.value.email?.split('@')[0],
      avatar: user.value.user_metadata?.avatar_url || user.value.user_metadata?.picture,
      givenName: user.value.user_metadata?.given_name,
      familyName: user.value.user_metadata?.family_name
    }
  })

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Google login error:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      user.value = null
      session.value = null
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    user: userProfile,
    session,
    isLoggedIn,
    loginWithGoogle,
    logout
  }
}
