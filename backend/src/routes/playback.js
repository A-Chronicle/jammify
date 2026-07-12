import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import spotifyService from '../services/spotify.js'

const router = express.Router()

// Get current playback state
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const accessToken = req.user.access_token

    if (!accessToken) {
      return res.json({ is_playing: false, track: null })
    }

    const playback = await spotifyService.getCurrentPlayback(accessToken)

    if (!playback || !playback.item) {
      return res.json({ is_playing: false, track: null })
    }

    res.json({
      is_playing: playback.is_playing,
      progress_ms: playback.progress_ms,
      track: {
        id: playback.item.id,
        name: playback.item.name,
        artist: playback.item.artists?.[0]?.name || 'Unknown',
        album: playback.item.album?.name || 'Unknown',
        album_art: playback.item.album?.images?.[0]?.url || null,
        duration_ms: playback.item.duration_ms,
        uri: playback.item.uri,
      },
      device: playback.device ? {
        id: playback.device.id,
        name: playback.device.name,
        type: playback.device.type,
      } : null,
    })
  } catch (error) {
    if (error.response?.status === 204 || error.response?.status === 404) {
      // No active device or nothing playing
      return res.json({ is_playing: false, track: null })
    }
    console.error('Get playback error:', error.message)
    res.status(500).json({ error: 'Failed to get playback state' })
  }
})

// Search tracks
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' })
    }

    const accessToken = req.user.access_token

    if (!accessToken) {
      return res.status(400).json({ error: 'Spotify access token not available' })
    }

    const tracks = await spotifyService.searchTracks(accessToken, q, parseInt(limit))

    const formattedTracks = tracks.map(t => ({
      id: t.id,
      name: t.name,
      artist: t.artists?.[0]?.name || 'Unknown',
      album: t.album?.name || 'Unknown',
      album_art: t.album?.images?.[0]?.url || null,
      duration_ms: t.duration_ms,
      uri: t.uri,
      popularity: t.popularity,
    }))

    res.json(formattedTracks)
  } catch (error) {
    console.error('Search tracks error:', error.message)
    res.status(500).json({ error: 'Failed to search tracks' })
  }
})

// Play a track
router.put('/play', authenticateToken, async (req, res) => {
  try {
    const { trackUri, deviceId } = req.body
    const accessToken = req.user.access_token

    if (!accessToken) {
      return res.status(400).json({ error: 'Spotify access token not available' })
    }

    await spotifyService.playTrack(accessToken, trackUri, deviceId)
    res.json({ message: 'Playing track' })
  } catch (error) {
    console.error('Play track error:', error.message)
    res.status(500).json({ error: 'Failed to play track' })
  }
})

// Pause playback
router.put('/pause', authenticateToken, async (req, res) => {
  try {
    const { deviceId } = req.body
    const accessToken = req.user.access_token

    if (!accessToken) {
      return res.status(400).json({ error: 'Spotify access token not available' })
    }

    await spotifyService.pausePlayback(accessToken, deviceId)
    res.json({ message: 'Paused playback' })
  } catch (error) {
    console.error('Pause error:', error.message)
    res.status(500).json({ error: 'Failed to pause' })
  }
})

// Resume playback
router.put('/resume', authenticateToken, async (req, res) => {
  try {
    const { deviceId } = req.body
    const accessToken = req.user.access_token

    if (!accessToken) {
      return res.status(400).json({ error: 'Spotify access token not available' })
    }

    await spotifyService.resumePlayback(accessToken, deviceId)
    res.json({ message: 'Resumed playback' })
  } catch (error) {
    console.error('Resume error:', error.message)
    res.status(500).json({ error: 'Failed to resume' })
  }
})

// Skip to next
router.post('/next', authenticateToken, async (req, res) => {
  try {
    const { deviceId } = req.body
    const accessToken = req.user.access_token

    if (!accessToken) {
      return res.status(400).json({ error: 'Spotify access token not available' })
    }

    await spotifyService.skipToNext(accessToken, deviceId)
    res.json({ message: 'Skipped to next' })
  } catch (error) {
    console.error('Skip next error:', error.message)
    res.status(500).json({ error: 'Failed to skip' })
  }
})

// Skip to previous
router.post('/previous', authenticateToken, async (req, res) => {
  try {
    const { deviceId } = req.body
    const accessToken = req.user.access_token

    if (!accessToken) {
      return res.status(400).json({ error: 'Spotify access token not available' })
    }

    await spotifyService.skipToPrevious(accessToken, deviceId)
    res.json({ message: 'Skipped to previous' })
  } catch (error) {
    console.error('Skip previous error:', error.message)
    res.status(500).json({ error: 'Failed to skip' })
  }
})

export default router
