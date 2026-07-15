import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { pool } from '../utils/db.js'

const router = express.Router()

function generateSessionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// ── Get active sessions (MUST be before /:code) ──────────────────
router.get('/', authenticateToken, async (req, res) => {
  try {
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
    res.json(result.rows)
  } catch (error) {
    console.error('Get sessions error:', error)
    res.status(500).json({ error: 'Failed to get sessions' })
  }
})

// ── Create a new session ──────────────────────────────────────────
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { name, genre_focus } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Session name is required' })
    }

    const sessionCode = generateSessionCode()

    const sessionResult = await pool.query(
      `INSERT INTO jam_sessions (host_id, session_code, name, genre_focus)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, sessionCode, name.trim(), genre_focus || null]
    )

    const session = sessionResult.rows[0]

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

// ── Get session by code ───────────────────────────────────────────
router.get('/:code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.params

    const sessionResult = await pool.query(
      `SELECT js.*, u.display_name as host_name, u.avatar_url as host_avatar
       FROM jam_sessions js
       JOIN users u ON js.host_id = u.id
       WHERE js.session_code = $1`,
      [code]
    )

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const session = sessionResult.rows[0]

    const participantsResult = await pool.query(
      `SELECT sp.*, u.display_name, u.avatar_url
       FROM session_participants sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.session_id = $1
       ORDER BY sp.joined_at ASC`,
      [session.id]
    )

    res.json({
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
        last_active_at: session.last_active_at,
      },
      participants: participantsResult.rows.map(p => ({
        id: p.user_id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        is_host: p.is_host,
        joined_at: p.joined_at,
      })),
    })
  } catch (error) {
    console.error('Get session error:', error)
    res.status(500).json({ error: 'Failed to get session' })
  }
})

// ── Join a session ────────────────────────────────────────────────
router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { sessionCode } = req.body

    if (!sessionCode) {
      return res.status(400).json({ error: 'Session code is required' })
    }

    const sessionResult = await pool.query(
      'SELECT * FROM jam_sessions WHERE session_code = $1 AND is_active = true',
      [sessionCode]
    )

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or inactive' })
    }

    const session = sessionResult.rows[0]

    const participantCount = await pool.query(
      'SELECT COUNT(*) FROM session_participants WHERE session_id = $1',
      [session.id]
    )

    if (parseInt(participantCount.rows[0].count) >= session.max_participants) {
      return res.status(400).json({ error: 'Session is full' })
    }

    const existingParticipant = await pool.query(
      'SELECT * FROM session_participants WHERE session_id = $1 AND user_id = $2',
      [session.id, req.user.id]
    )

    if (existingParticipant.rows.length > 0) {
      return res.status(400).json({ error: 'Already in this session' })
    }

    await pool.query(
      'INSERT INTO session_participants (session_id, user_id) VALUES ($1, $2)',
      [session.id, req.user.id]
    )

    await pool.query(
      'UPDATE jam_sessions SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1',
      [session.id]
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

// ── Leave a session (with host transfer) ──────────────────────────
router.post('/leave', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' })
    }

    const sessionResult = await pool.query(
      'SELECT host_id FROM jam_sessions WHERE id = $1',
      [sessionId]
    )

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' })
    }

    const isHost = sessionResult.rows[0].host_id === req.user.id

    await pool.query(
      'DELETE FROM session_participants WHERE session_id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    )

    const participantCount = await pool.query(
      'SELECT COUNT(*) FROM session_participants WHERE session_id = $1',
      [sessionId]
    )

    const remaining = parseInt(participantCount.rows[0].count)

    if (remaining === 0) {
      await pool.query(
        'UPDATE jam_sessions SET is_active = false WHERE id = $1',
        [sessionId]
      )
    } else if (isHost) {
      const nextHost = await pool.query(
        `SELECT user_id FROM session_participants
         WHERE session_id = $1
         ORDER BY joined_at ASC
         LIMIT 1`,
        [sessionId]
      )

      if (nextHost.rows.length > 0) {
        const newHostId = nextHost.rows[0].user_id

        await pool.query(
          'UPDATE jam_sessions SET host_id = $1 WHERE id = $2',
          [newHostId, sessionId]
        )
        await pool.query(
          'UPDATE session_participants SET is_host = false WHERE session_id = $1',
          [sessionId]
        )
        await pool.query(
          'UPDATE session_participants SET is_host = true WHERE session_id = $1 AND user_id = $2',
          [sessionId, newHostId]
        )

        const newHostUser = await pool.query(
          'SELECT id, display_name FROM users WHERE id = $1',
          [newHostId]
        )

        return res.json({
          message: 'Left session, host transferred',
          newHost: newHostUser.rows[0] || null,
        })
      }
    }

    res.json({ message: 'Left session successfully' })
  } catch (error) {
    console.error('Leave session error:', error)
    res.status(500).json({ error: 'Failed to leave session' })
  }
})

// ── End session (host only) ───────────────────────────────────────
router.post('/end', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' })
    }

    const sessionResult = await pool.query(
      'SELECT host_id FROM jam_sessions WHERE id = $1',
      [sessionId]
    )

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' })
    }

    if (sessionResult.rows[0].host_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the host can end the session' })
    }

    await pool.query(
      'DELETE FROM session_participants WHERE session_id = $1',
      [sessionId]
    )

    await pool.query(
      'UPDATE jam_sessions SET is_active = false WHERE id = $1',
      [sessionId]
    )

    res.json({ message: 'Session ended' })
  } catch (error) {
    console.error('End session error:', error)
    res.status(500).json({ error: 'Failed to end session' })
  }
})

// ── Heartbeat ─────────────────────────────────────────────────────
router.post('/heartbeat', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' })
    }

    await pool.query(
      'UPDATE jam_sessions SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1 AND is_active = true',
      [sessionId]
    )

    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update heartbeat' })
  }
})

// ── Cleanup stale sessions ────────────────────────────────────────
router.post('/cleanup', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE jam_sessions SET is_active = false
       WHERE is_active = true
       AND last_active_at < NOW() - INTERVAL '30 minutes'
       RETURNING id, session_code`
    )

    for (const session of result.rows) {
      await pool.query(
        'DELETE FROM session_participants WHERE session_id = $1',
        [session.id]
      )
    }

    res.json({
      ended: result.rows.map(s => s.session_code),
      count: result.rowCount,
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    res.status(500).json({ error: 'Failed to cleanup sessions' })
  }
})

export default router
