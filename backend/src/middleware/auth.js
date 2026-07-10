import jwt from 'jsonwebtoken'
import { pool } from '../utils/db.js'

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from database
    const result = await pool.query(
      'SELECT id, spotify_id, display_name, email, avatar_url, top_artists, top_genres, audio_features FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' })
    }

    req.user = result.rows[0]
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
      'SELECT id, display_name, avatar_url FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return next(new Error('User not found'))
    }

    socket.userId = result.rows[0].id
    socket.user = result.rows[0]
    next()
  } catch (error) {
    console.error('Socket auth error:', error)
    next(new Error('Invalid token'))
  }
}
