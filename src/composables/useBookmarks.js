import { ref, computed, watch, triggerRef } from 'vue'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

const bookmarks = ref([])
const showAuthModal = ref(false)
const loading = ref(false)

export function useBookmarks() {
  const { isLoggedIn, user } = useAuth()

  // Загрузка закладок из Supabase
  const loadBookmarks = async () => {
    if (!user.value) {
      bookmarks.value = []
      return
    }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      bookmarks.value = data || []
    } catch (error) {
      console.error('Error loading bookmarks:', error)
      bookmarks.value = []
    } finally {
      loading.value = false
    }
  }

  // Проверка, есть ли аниме в закладках
  const isBookmarked = (animeId) => {
    // Приводим к строке для сравнения
    const animeIdStr = String(animeId)
    return bookmarks.value.some(b => String(b.anime_id) === animeIdStr)
  }

  // Добавление закладки
  const addBookmark = async (anime) => {
    if (!isLoggedIn.value) {
      showAuthModal.value = true
      return { success: false, needAuth: true }
    }

    if (isBookmarked(anime.anime_id)) {
      return { success: false, error: 'Уже в закладках' }
    }

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert([{
          user_id: user.value.id,
          anime_id: anime.anime_id,
          anime_url: anime.anime_url,
          title: anime.title,
          poster: anime.poster,
          year: anime.year,
          type: anime.type,
          rating: anime.rating
        }])
        .select()

      if (error) throw error
      
      // Принудительно обновляем массив
      bookmarks.value = [data[0], ...bookmarks.value]
      triggerRef(bookmarks)
      return { success: true }
    } catch (error) {
      console.error('Error adding bookmark:', error)
      return { success: false, error: error.message }
    }
  }

  // Удаление закладки
  const removeBookmark = async (animeId) => {
    if (!isLoggedIn.value) {
      showAuthModal.value = true
      return { success: false, needAuth: true }
    }

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.value.id)
        .eq('anime_id', String(animeId)) // Приводим к строке

      if (error) throw error

      // Принудительно обновляем массив - сравниваем как строки
      const animeIdStr = String(animeId)
      bookmarks.value = bookmarks.value.filter(b => String(b.anime_id) !== animeIdStr)
      triggerRef(bookmarks)

      return { success: true }
    } catch (error) {
      console.error('Error removing bookmark:', error)
      return { success: false, error: error.message }
    }
  }

  // Переключение закладки
  const toggleBookmark = async (anime) => {
    if (isBookmarked(anime.anime_id)) {
      return await removeBookmark(anime.anime_id)
    } else {
      return await addBookmark(anime)
    }
  }

  // Очистка всех закладок
  const clearBookmarks = async () => {
    if (!user.value) return

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.value.id)

      if (error) throw error
      bookmarks.value = []
    } catch (error) {
      console.error('Error clearing bookmarks:', error)
    }
  }

  // Перезагрузка закладок
  const reloadBookmarks = () => {
    loadBookmarks()
  }

  const openAuthModal = () => {
    showAuthModal.value = true
  }

  const closeAuthModal = () => {
    showAuthModal.value = false
  }

  // Загружаем закладки при изменении пользователя
  watch(user, (newUser) => {
    if (newUser) {
      loadBookmarks()
    } else {
      bookmarks.value = []
    }
  }, { immediate: true })

  return {
    bookmarks: computed(() => bookmarks.value),
    loading: computed(() => loading.value),
    showAuthModal: computed(() => showAuthModal.value),
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    clearBookmarks,
    reloadBookmarks,
    openAuthModal,
    closeAuthModal
  }
}
