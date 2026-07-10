import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { pool } from '../utils/db.js'
import { mockSessions, mockSessionDetails } from '../utils/mockData.js'

const router = express.Router()

// Generate a random session code
function generateSessionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create a new session
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, genre_focus } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Session name is required' })
    }

    const sessionCode = generateSessionCode()

    // Create session
    const sessionResult = await pool.query(
      `INSERT INTO jam_sessions (host_id, session_code, name, genre_focus)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, sessionCode, name.trim(), genre_focus || null]
    )

    const session = sessionResult.rows[0]

    // Add host as participant
    await pool.query(
      `INSERT INTO session_participants (session_id, user_id, is_host)
       VALUES ($1, $2, true)`,
      [session.id, req.user.id]
    )

    res.status(201).json({
      id: session.id,
      session_code: session.session_code,
      name: session.name,
      genre_focus: session.genre_focus,
      created_at: session.created_at,
    })
  } catch (error) {
    console.error('Create session error:', error)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

// Get session by code
router.get('/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params

    // Try to get session from database
    const sessionResult = await pool.query(
      `SELECT js.*, u.display_name as host_name, u.avatar_url as host_avatar
       FROM jam_sessions js
       JOIN users u ON js.host_id = u.id
       WHERE js.session_code = $1`,
      [code]
    )

    if (sessionResult.rows.length > 0) {
      const session = sessionResult.rows[0]

      // Get participants
      const participantsResult = await pool.query(
        `SELECT sp.*, u.display_name, u.avatar_url
         FROM session_participants sp
         JOIN users u ON sp.user_id = u.id
         WHERE sp.session_id = $1`,
        [session.id]
      )

      return res.json({
        session: {
          id: session.id,
          session_code: session.session_code,
          name: session.name,
          genre_focus: session.genre_focus,
          host_id: session.host_id,
          host_name: session.host_name,
          host_avatar: session.host_avatar,
          current_track_id: session.current_track_id,
          queue: session.queue || [],
          created_at: session.created_at,
        },
        participants: participantsResult.rows.map(p => ({
          id: p.user_id,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          is_host: p.is_host,
          joined_at: p.joined_at,
        })),
      })
    }

    // If not found in database, check mock sessions
    const mockSession = mockSessions.find(s => s.session_code === code)
    if (mockSession) {
      return res.json(mockSessionDetails)
    }

    return res.status(404).json({ error: 'Session not found' })
  } catch (error) {
    console.error('Get session error:', error)
    res.status(500).json({ error: 'Failed to get session' })
  }
})

// Join a session
router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { sessionCode } = req.body

    if (!sessionCode) {
      return res.status(400).json({ error: 'Session code is required' })
    }

    // Get session
    const sessionResult = await pool.query(
      'SELECT * FROM jam_sessions WHERE session_code = $1 AND is_active = true',
      [sessionCode]
    )

    if (sessionResult.rows.length === 0) {
      // Check if it's a mock session
      const mockSession = mockSessions.find(s => s.session_code === sessionCode)
      if (mockSession) {
        return res.json({
          message: 'Joined session successfully (mock session)',
          session_code: sessionCode,
        })
      }
      return res.status(404).json({ error: 'Session not found or inactive' })
    }

    const session = sessionResult.rows[0]

    // Check if session is full
    const participantCount = await pool.query(
      'SELECT COUNT(*) FROM session_participants WHERE session_id = $1',
      [session.id]
    )

    if (parseInt(participantCount.rows[0].count) >= session.max_participants) {
      return res.status(400).json({ error: 'Session is full' })
    }

    // Check if user is already in the session
    const existingParticipant = await pool.query(
      'SELECT * FROM session_participants WHERE session_id = $1 AND user_id = $2',
      [session.id, req.user.id]
    )

    if (existingParticipant.rows.length > 0) {
      return res.status(400).json({ error: 'Already in this session' })
    }

    // Add user to session
    await pool.query(
      'INSERT INTO session_participants (session_id, user_id) VALUES ($1, $2)',
      [session.id, req.user.id]
    )

    res.json({
      message: 'Joined session successfully',
      session_code: session.session_code,
    })
  } catch (error) {
    console.error('Join session error:', error)
    res.status(500).json({ error: 'Failed to join session' })
  }
})

// Leave a session
router.post('/leave', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' })
    }

    // Remove user from session
    await pool.query(
      'DELETE FROM session_participants WHERE session_id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    )

    // Check if session is now empty
    const participantCount = await pool.query(
      'SELECT COUNT(*) FROM session_participants WHERE session_id = $1',
      [sessionId]
    )

    if (parseInt(participantCount.rows[0].count) === 0) {
      // Deactivate empty sessions
      await pool.query(
        'UPDATE jam_sessions SET is_active = false WHERE id = $1',
        [sessionId]
      )
    }

    res.json({ message: 'Left session successfully' })
  } catch (error) {
    console.error('Leave session error:', error)
    res.status(500).json({ error: 'Failed to leave session' })
  }
})

// Get active sessions
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get sessions from database
    const result = await pool.query(
      `SELECT js.*, 
              u.display_name as host_name,
              (SELECT COUNT(*) FROM session_participants sp WHERE sp.session_id = js.id) as participant_count
       FROM jam_sessions js
       JOIN users u ON js.host_id = u.id
       WHERE js.is_active = true
       ORDER BY js.created_at DESC
       LIMIT 20`
    )

    // Combine with mock sessions
    const allSessions = [...result.rows, ...mockSessions]

    res.json(allSessions)
  } catch (error) {
    console.error('Get sessions error:', error)
    // Return mock sessions on error
    res.json(mockSessions)
  }
})

export default router
