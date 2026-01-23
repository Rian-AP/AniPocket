const API_BASE = 'https://yummy-proxy.vercel.app/api'

export const api = {
  // Получить список аниме с фильтрами
  async getAnime(params = {}) {
    try {
      const queryParams = new URLSearchParams(params)
      const url = `${API_BASE}/anime${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch anime')
      const data = await response.json()
      return { data: data.response || [] }
    } catch (error) {
      console.error('API Error:', error)
      return { data: [] }
    }
  },

  // Получить случайное аниме
  async getRandomAnime() {
    try {
      // Генерируем случайный offset от 0 до 10000
      const randomOffset = Math.floor(Math.random() * 10000)
      const response = await fetch(`${API_BASE}/anime?limit=1&offset=${randomOffset}`)
      if (!response.ok) throw new Error('Failed to fetch random anime')
      const data = await response.json()
      return (data.response && data.response.length > 0) ? data.response[0] : null
    } catch (error) {
      console.error('API Error:', error)
      return null
    }
  },

  // Получить детали аниме по URL или ID
  async getAnimeDetails(animeUrl) {
    try {
      const response = await fetch(`${API_BASE}/anime/${animeUrl}`)
      if (!response.ok) throw new Error('Failed to fetch anime details')
      const data = await response.json()
      return data.response || null
    } catch (error) {
      console.error('API Error:', error)
      return null
    }
  },

  // Поиск аниме
  async searchAnime(query) {
    try {
      const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Failed to search anime')
      const data = await response.json()
      return { data: data.response || [] }
    } catch (error) {
      console.error('API Error:', error)
      return { data: [] }
    }
  },

  // Получить контент главной страницы
  async getFeed() {
    try {
      const response = await fetch(`${API_BASE}/feed`)
      if (!response.ok) throw new Error('Failed to fetch feed')
      const data = await response.json()
      return data.response || {}
    } catch (error) {
      console.error('API Error:', error)
      return {}
    }
  },

  // Получить расписание онгоингов
  async getSchedule() {
    try {
      const response = await fetch(`${API_BASE}/anime/schedule`)
      if (!response.ok) throw new Error('Failed to fetch schedule')
      const data = await response.json()
      return data.response || []
    } catch (error) {
      console.error('API Error:', error)
      return []
    }
  },

  // Получить список жанров
  async getGenres() {
    try {
      const response = await fetch(`${API_BASE}/anime/genres`)
      if (!response.ok) throw new Error('Failed to fetch genres')
      const data = await response.json()
      return data.response || []
    } catch (error) {
      console.error('API Error:', error)
      return []
    }
  },

  // Получить аниме по жанру
  async getAnimeByGenre(genreId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params)
      const url = `${API_BASE}/anime/genres/${genreId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch anime by genre')
      const data = await response.json()
      return { data: data.response || [] }
    } catch (error) {
      console.error('API Error:', error)
      return { data: [] }
    }
  },

  // Получить видео для аниме
  async getAnimeVideos(animeId) {
    try {
      const response = await fetch(`${API_BASE}/anime/${animeId}/videos`)
      if (!response.ok) throw new Error('Failed to fetch anime videos')
      const data = await response.json()
      return data.response || []
    } catch (error) {
      console.error('API Error:', error)
      return []
    }
  }
}
