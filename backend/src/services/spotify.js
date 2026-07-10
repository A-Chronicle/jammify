import axios from 'axios'
import { pool } from '../utils/db.js'

const SPOTIFY_API = 'https://api.spotify.com/v1'

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI
  }

  // Get authorization URL
  getAuthUrl() {
    const scopes = [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-top-read',
      'user-read-recently-played',
      'playlist-modify-public',
      'playlist-modify-private',
    ].join(' ')

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes,
      show_dialog: 'true',
    })

    return `https://accounts.spotify.com/authorize?${params.toString()}`
  }

  // Exchange authorization code for tokens
  async exchangeCode(code) {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${this.clientId}:${this.clientSecret}`
          ).toString('base64')}`,
        },
      }
    )

    return response.data
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${this.clientId}:${this.clientSecret}`
          ).toString('base64')}`,
        },
      }
    )

    return response.data
  }

  // Get user profile
  async getUserProfile(accessToken) {
    const response = await axios.get(`${SPOTIFY_API}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response.data
  }

  // Get top artists
  async getTopArtists(accessToken, limit = 10, timeRange = 'medium_term') {
    const response = await axios.get(`${SPOTIFY_API}/me/top/artists`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit, time_range: timeRange },
    })
    return response.data.items
  }

  // Get top tracks
  async getTopTracks(accessToken, limit = 10, timeRange = 'medium_term') {
    const response = await axios.get(`${SPOTIFY_API}/me/top/tracks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit, time_range: timeRange },
    })
    return response.data.items
  }

  // Get audio features for a track
  async getAudioFeatures(accessToken, trackId) {
    const response = await axios.get(`${SPOTIFY_API}/audio-features/${trackId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    return response.data
  }

  // Get audio features for multiple tracks
  async getMultipleAudioFeatures(accessToken, trackIds) {
    const response = await axios.get(`${SPOTIFY_API}/audio-features`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { ids: trackIds.join(',') },
    })
    return response.data.audio_features
  }

  // Calculate average audio features for a user
  async calculateUserAudioProfile(accessToken) {
    const tracks = await this.getTopArtists(accessToken, 50)
    const trackIds = tracks.map((t) => t.id)
    
    if (trackIds.length === 0) {
      return null
    }

    const audioFeatures = await this.getMultipleAudioFeatures(accessToken, trackIds)
    const validFeatures = audioFeatures.filter((f) => f !== null)

    if (validFeatures.length === 0) {
      return null
    }

    // Calculate averages
    const features = ['danceability', 'energy', 'valence', 'acousticness', 'instrumentalness', 'tempo']
    const averages = {}

    for (const feature of features) {
      const values = validFeatures.map((f) => f[feature])
      averages[feature] = values.reduce((a, b) => a + b, 0) / values.length
    }

    // Normalize tempo to 0-1 range (assuming 60-200 BPM)
    averages.tempo = (averages.tempo - 60) / 140

    return averages
  }

  // Extract unique genres from top artists
  async getUserGenres(accessToken) {
    const artists = await this.getTopArtists(accessToken, 50)
    const genres = new Set()
    
    for (const artist of artists) {
      for (const genre of artist.genres) {
        genres.add(genre)
      }
    }

    return Array.from(genres)
  }
}

export default new SpotifyService()
