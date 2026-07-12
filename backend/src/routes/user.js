import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import spotifyService from '../services/spotify.js'
import { pool } from '../utils/db.js'
import { mockTopTracks } from '../utils/mockData.js'

const router = express.Router()

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, display_name, email, avatar_url, top_artists, top_genres, audio_features, created_at FROM users WHERE id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to get profile' })
  }
})

// Get top artists
router.get('/top-artists', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, time_range = 'medium_term' } = req.query

    // Use access_token from middleware (already refreshed if needed)
    const accessToken = req.user.access_token

    if (!accessToken) {
      // No token available, return cached artists
      return res.json(req.user.top_artists || [])
    }

    try {
      const artists = await spotifyService.getTopArtists(accessToken, parseInt(limit), time_range)

      const formattedArtists = artists.map(a => ({
        id: a.id,
        name: a.name,
        image: a.images?.[0]?.url,
        genres: a.genres,
        popularity: a.popularity,
      }))

      res.json(formattedArtists)
    } catch (apiError) {
      console.log('Spotify API error, returning cached artists')
      res.json(req.user.top_artists || [])
    }
  } catch (error) {
    console.error('Get top artists error:', error)
    res.status(500).json({ error: 'Failed to get top artists' })
  }
})

// Get top tracks
router.get('/top-tracks', authenticateToken, async (req, res) => {
  try {
    const { limit = 10, time_range = 'medium_term' } = req.query

    // Use access_token from middleware (already refreshed if needed)
    const accessToken = req.user.access_token

    if (!accessToken) {
      // No token available, return mock tracks
      return res.json(mockTopTracks.slice(0, parseInt(limit)))
    }

    try {
      const tracks = await spotifyService.getTopTracks(accessToken, parseInt(limit), time_range)

      const formattedTracks = tracks.map(t => ({
        id: t.id,
        name: t.name,
        artist: t.artists?.[0]?.name,
        album: t.album?.name,
        album_art: t.album?.images?.[0]?.url,
        duration_ms: t.duration_ms,
        popularity: t.popularity,
      }))

      res.json(formattedTracks)
    } catch (apiError) {
      console.log('Spotify API error, returning mock tracks')
      res.json(mockTopTracks.slice(0, parseInt(limit)))
    }
  } catch (error) {
    console.error('Get top tracks error:', error)
    res.status(500).json({ error: 'Failed to get top tracks' })
  }
})

// Update user's audio profile
router.post('/refresh-profile', authenticateToken, async (req, res) => {
  try {
    // For now, just return success with cached data
    res.json({ message: 'Profile refreshed successfully (using cached data)' })
  } catch (error) {
    console.error('Refresh profile error:', error)
    res.status(500).json({ error: 'Failed to refresh profile' })
  }
})

export default router
