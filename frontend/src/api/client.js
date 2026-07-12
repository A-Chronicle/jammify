import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jammify_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jammify_token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  getSpotifyLoginUrl: () => `${API_URL}/auth/spotify`,
  handleCallback: (code) => api.get(`/auth/callback?code=${code}`),
  getMe: () => api.get('/auth/me'),
}

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  getTopArtists: (limit = 10, timeRange = 'medium_term') => 
    api.get(`/user/top-artists?limit=${limit}&time_range=${timeRange}`),
  getTopTracks: (limit = 10, timeRange = 'medium_term') => 
    api.get(`/user/top-tracks?limit=${limit}&time_range=${timeRange}`),
}

// Session API
export const sessionAPI = {
  createSession: (data) => api.post('/session/create', data),
  getSession: (code) => api.get(`/session/${code}`),
  joinSession: (sessionCode) => api.post('/session/join', { sessionCode }),
  leaveSession: (sessionId) => api.post('/session/leave', { sessionId }),
  getActiveSessions: () => api.get('/session/active'),
}

// Queue API
export const queueAPI = {
  addToQueue: (sessionId, trackId) => 
    api.post('/session/queue/add', { sessionId, trackId }),
  removeFromQueue: (sessionId, trackIndex) => 
    api.post('/session/queue/remove', { sessionId, trackIndex }),
}

// Match API
export const matchAPI = {
  getMatches: (limit = 5) => api.get(`/matches?limit=${limit}`),
}

// Playback API
export const playbackAPI = {
  getCurrent: () => api.get('/playback/current'),
  search: (query, limit = 10) => api.get(`/playback/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  play: (trackUri, deviceId = null) => api.put('/playback/play', { trackUri, deviceId }),
  pause: (deviceId = null) => api.put('/playback/pause', { deviceId }),
  resume: (deviceId = null) => api.put('/playback/resume', { deviceId }),
  next: (deviceId = null) => api.post('/playback/next', { deviceId }),
  previous: (deviceId = null) => api.post('/playback/previous', { deviceId }),
}

export default api
