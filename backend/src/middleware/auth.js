import jwt from 'jsonwebtoken'
import { pool } from '../utils/db.js'
import spotifyService from '../services/spotify.js'

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from database (including Spotify tokens)
    const result = await pool.query(
      'SELECT id, spotify_id, display_name, email, avatar_url, access_token, refresh_token, token_expires_at, top_artists, top_genres, audio_features FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }

    const user = result.rows[0]

    // Check if Spotify access token is expired and refresh it
    if (user.refresh_token && user.token_expires_at) {
      const tokenExpires = new Date(user.token_expires_at)
      const now = new Date()
      // Refresh if expired or expiring within 5 minutes
      if (tokenExpires <= new Date(now.getTime() + 5 * 60 * 1000)) {
        try {
          const tokens = await spotifyService.refreshToken(user.refresh_token)
          const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000)

          await pool.query(
            'UPDATE users SET access_token = $1, token_expires_at = $2 WHERE id = $3',
            [tokens.access_token, newExpiresAt, user.id]
          )

          user.access_token = tokens.access_token
          user.token_expires_at = newExpiresAt
          console.log('Refreshed Spotify token for user:', user.id)
        } catch (refreshError) {
          console.error('Token refresh failed for user:', user.id, refreshError.message)
          // Continue with existing token — routes will fall back to cached data
        }
      }
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error('Authentication required'))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const result = await pool.query(
      'SELECT id, display_name, avatar_url, access_token, refresh_token, token_expires_at FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return next(new Error('User not found'))
    }

    const user = result.rows[0]

    // Refresh Spotify token if expired
    if (user.refresh_token && user.token_expires_at) {
      const tokenExpires = new Date(user.token_expires_at)
      const now = new Date()
      if (tokenExpires <= new Date(now.getTime() + 5 * 60 * 1000)) {
        try {
          const tokens = await spotifyService.refreshToken(user.refresh_token)
          const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000)

          await pool.query(
            'UPDATE users SET access_token = $1, token_expires_at = $2 WHERE id = $3',
            [tokens.access_token, newExpiresAt, user.id]
          )

          user.access_token = tokens.access_token
          user.token_expires_at = newExpiresAt
        } catch (refreshError) {
          console.error('Socket token refresh failed for user:', user.id)
        }
      }
    }

    socket.userId = user.id
    socket.user = user
    next()
  } catch (error) {
    console.error('Socket auth error:', error)
    next(new Error('Invalid token'))
  }
}
