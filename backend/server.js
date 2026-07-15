import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

import authRoutes from './src/routes/auth.js'
import userRoutes from './src/routes/user.js'
import sessionRoutes from './src/routes/session.js'
import matchRoutes from './src/routes/matches.js'
import playbackRoutes from './src/routes/playback.js'
import { authenticateSocket } from './src/middleware/auth.js'
import { pool } from './src/utils/db.js'

dotenv.config()

const app = express()
const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/session', sessionRoutes)
app.use('/matches', matchRoutes)
app.use('/playback', playbackRoutes)

// ── Active Sessions State ──────────────────────────────────────────
// Each entry: {
//   participants: Map<userId, { display_name, avatar_url, joinedAt }>,
//   playback: { track, isPlaying, progressMs, updatedAt },
//   hostId: number,
//   hostSocketId: string,
// }
const activeSessions = new Map()

function getSessionState(sessionCode) {
  if (!activeSessions.has(sessionCode)) {
    activeSessions.set(sessionCode, {
      participants: new Map(),
      playback: { track: null, isPlaying: false, progressMs: 0, updatedAt: null },
      hostId: null,
      hostSocketId: null,
    })
  }
  return activeSessions.get(sessionCode)
}

async function getDbSessionId(sessionCode) {
  try {
    const result = await pool.query(
      'SELECT id FROM jam_sessions WHERE session_code = $1',
      [sessionCode]
    )
    return result.rows.length > 0 ? result.rows[0].id : null
  } catch {
    return null
  }
}

async function getDbHostId(sessionCode) {
  try {
    const result = await pool.query(
      'SELECT host_id FROM jam_sessions WHERE session_code = $1',
      [sessionCode]
    )
    return result.rows.length > 0 ? result.rows[0].host_id : null
  } catch {
    return null
  }
}

// ── Socket.IO ──────────────────────────────────────────────────────
io.use(authenticateSocket)

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId)

  // ── Join Session ───────────────────────────────────────────────
  socket.on('join-session', async (sessionCode) => {
    try {
      socket.join(sessionCode)
      const state = getSessionState(sessionCode)

      // Track participant
      state.participants.set(socket.userId, {
        display_name: socket.user.display_name,
        avatar_url: socket.user.avatar_url,
        joinedAt: Date.now(),
      })

      // Determine host (first joiner, or from DB)
      if (!state.hostId) {
        const dbHostId = await getDbHostId(sessionCode)
        state.hostId = dbHostId || socket.userId
        state.hostSocketId = socket.id
      }

      // Notify others
      socket.to(sessionCode).emit('participant-joined', {
        id: socket.userId,
        display_name: socket.user.display_name,
        avatar_url: socket.user.avatar_url,
      })

      // Send full state to the joining user
      const participantList = Array.from(state.participants.entries()).map(([id, info]) => ({
        id,
        display_name: info.display_name,
        avatar_url: info.avatar_url,
        is_host: id === state.hostId,
      }))

      socket.emit('session-update', {
        participants: participantList,
        sessionCode,
        hostId: state.hostId,
      })

      // Send current playback state
      socket.emit('host-playback-state', state.playback)

      // Load and send chat history from DB
      const sessionId = await getDbSessionId(sessionCode)
      if (sessionId) {
        try {
          const chatResult = await pool.query(
            `SELECT cm.*, u.display_name as user_name, u.avatar_url
             FROM chat_messages cm
             JOIN users u ON cm.user_id = u.id
             WHERE cm.session_id = $1
             ORDER BY cm.created_at DESC
             LIMIT 55`,
            [sessionId]
          )
          const messages = chatResult.rows.reverse().map(m => ({
            id: m.id,
            user_id: m.user_id,
            user_name: m.user_name,
            avatar_url: m.avatar_url,
            message: m.message,
            timestamp: m.created_at,
          }))
          socket.emit('chat-history', messages)
        } catch (err) {
          console.error('Failed to load chat history:', err.message)
        }

        // Load and send queue from DB
        try {
          const queueResult = await pool.query(
            'SELECT queue FROM jam_sessions WHERE id = $1',
            [sessionId]
          )
          if (queueResult.rows.length > 0) {
            socket.emit('queue-sync', queueResult.rows[0].queue || [])
          }
        } catch (err) {
          console.error('Failed to load queue:', err.message)
        }
      }

      // Update last_active_at
      if (sessionId) {
        pool.query(
          'UPDATE jam_sessions SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1',
          [sessionId]
        ).catch(() => {})
      }

      console.log(`User ${socket.userId} joined session ${sessionCode} (host: ${state.hostId})`)
    } catch (error) {
      console.error('Error joining session:', error)
      socket.emit('error', { message: 'Failed to join session' })
    }
  })

  // ── Leave Session ──────────────────────────────────────────────
  socket.on('leave-session', (sessionCode) => {
    socket.leave(sessionCode)
    const state = activeSessions.get(sessionCode)
    if (!state) return

    state.participants.delete(socket.userId)
    socket.to(sessionCode).emit('participant-left', socket.userId)

    // If empty, clean up
    if (state.participants.size === 0) {
      activeSessions.delete(sessionCode)
      console.log(`Session ${sessionCode} cleaned up (empty)`)
      return
    }

    // If the host left, transfer to the earliest joiner
    if (state.hostId === socket.userId) {
      const sorted = Array.from(state.participants.entries())
        .sort((a, b) => a[1].joinedAt - b[1].joinedAt)
      const [newHostId, newHostInfo] = sorted[0]
      state.hostId = newHostId

      // Update DB
      getDbSessionId(sessionCode).then(sessionId => {
        if (sessionId) {
          pool.query('UPDATE jam_sessions SET host_id = $1 WHERE id = $2', [newHostId, sessionId]).catch(() => {})
          pool.query('UPDATE session_participants SET is_host = false WHERE session_id = $1', [sessionId]).catch(() => {})
          pool.query('UPDATE session_participants SET is_host = true WHERE session_id = $1 AND user_id = $2', [sessionId, newHostId]).catch(() => {})
        }
      })

      io.to(sessionCode).emit('host-changed', {
        id: newHostId,
        display_name: newHostInfo.display_name,
      })
      console.log(`Host transferred in ${sessionCode} to ${newHostId}`)
    }

    console.log(`User ${socket.userId} left session ${sessionCode}`)
  })

  // ── Chat Message (persist + broadcast) ─────────────────────────
  socket.on('chat-message', async ({ sessionCode, message }) => {
    if (!message || !message.trim()) return

    const sessionId = await getDbSessionId(sessionCode)
    let messageId = Date.now()
    let avatarUrl = socket.user.avatar_url

    if (sessionId) {
      try {
        const result = await pool.query(
          'INSERT INTO chat_messages (session_id, user_id, message) VALUES ($1, $2, $3) RETURNING id, created_at',
          [sessionId, socket.userId, message.trim()]
        )
        messageId = result.rows[0].id
      } catch (err) {
        console.error('Failed to persist chat message:', err.message)
      }
    }

    const messageData = {
      id: messageId,
      user_id: socket.userId,
      user_name: socket.user.display_name,
      avatar_url: avatarUrl,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    }

    io.to(sessionCode).emit('new-message', messageData)
  })

  // ── Queue: Add Track (persist + broadcast) ─────────────────────
  socket.on('add-to-queue', async ({ sessionCode, track }) => {
    const sessionId = await getDbSessionId(sessionCode)
    let updatedQueue = []

    if (sessionId) {
      try {
        const result = await pool.query('SELECT queue FROM jam_sessions WHERE id = $1', [sessionId])
        const currentQueue = result.rows[0]?.queue || []
        updatedQueue = [...currentQueue, { ...track, addedBy: socket.user.display_name, addedAt: Date.now() }]
        await pool.query('UPDATE jam_sessions SET queue = $1 WHERE id = $2', [JSON.stringify(updatedQueue), sessionId])
      } catch (err) {
        console.error('Failed to persist queue add:', err.message)
      }
    }

    io.to(sessionCode).emit('queue-sync', updatedQueue)
  })

  // ── Queue: Remove Track (persist + broadcast) ──────────────────
  socket.on('remove-from-queue', async ({ sessionCode, trackIndex }) => {
    const sessionId = await getDbSessionId(sessionCode)
    let updatedQueue = []

    if (sessionId) {
      try {
        const result = await pool.query('SELECT queue FROM jam_sessions WHERE id = $1', [sessionId])
        const currentQueue = result.rows[0]?.queue || []
        updatedQueue = currentQueue.filter((_, i) => i !== trackIndex)
        await pool.query('UPDATE jam_sessions SET queue = $1 WHERE id = $2', [JSON.stringify(updatedQueue), sessionId])
      } catch (err) {
        console.error('Failed to persist queue remove:', err.message)
      }
    }

    io.to(sessionCode).emit('queue-sync', updatedQueue)
  })

  // ── Playback: Play Track (broadcast to all) ────────────────────
  socket.on('play-track', ({ sessionCode, track }) => {
    const state = activeSessions.get(sessionCode)
    if (state) {
      state.playback = {
        track,
        isPlaying: true,
        progressMs: 0,
        updatedAt: Date.now(),
      }
    }

    io.to(sessionCode).emit('playback-update', {
      type: 'play',
      track,
      startedBy: {
        id: socket.userId,
        display_name: socket.user.display_name,
      },
    })
  })

  // ── Playback: Pause (broadcast to all) ─────────────────────────
  socket.on('pause-track', ({ sessionCode }) => {
    const state = activeSessions.get(sessionCode)
    if (state) {
      state.playback.isPlaying = false
      state.playback.updatedAt = Date.now()
    }

    io.to(sessionCode).emit('playback-update', {
      type: 'pause',
      pausedBy: {
        id: socket.userId,
        display_name: socket.user.display_name,
      },
    })
  })

  // ── Playback: Resume (broadcast to all) ────────────────────────
  socket.on('resume-track', ({ sessionCode }) => {
    const state = activeSessions.get(sessionCode)
    if (state) {
      state.playback.isPlaying = true
      state.playback.updatedAt = Date.now()
    }

    io.to(sessionCode).emit('playback-update', {
      type: 'resume',
      resumedBy: {
        id: socket.userId,
        display_name: socket.user.display_name,
      },
    })
  })

  // ── Playback: Skip (broadcast to all) ──────────────────────────
  socket.on('skip-track', ({ sessionCode, nextTrack }) => {
    const state = activeSessions.get(sessionCode)
    if (state) {
      state.playback.track = nextTrack || null
      state.playback.isPlaying = !!nextTrack
      state.playback.progressMs = 0
      state.playback.updatedAt = Date.now()
    }

    io.to(sessionCode).emit('playback-update', {
      type: 'skip',
      track: nextTrack || null,
      skippedBy: {
        id: socket.userId,
        display_name: socket.user.display_name,
      },
    })
  })

  // ── Playback: Sync (host pushes state) ─────────────────────────
  socket.on('sync-playback', ({ sessionCode, playbackState }) => {
    const state = activeSessions.get(sessionCode)
    if (state) {
      state.playback = { ...state.playback, ...playbackState, updatedAt: Date.now() }
    }
    socket.to(sessionCode).emit('host-playback-state', playbackState)
  })

  // ── Session: End ───────────────────────────────────────────────
  socket.on('end-session', async ({ sessionCode }) => {
    io.to(sessionCode).emit('session-ended', {
      endedBy: socket.user.display_name,
    })

    const sessionId = await getDbSessionId(sessionCode)
    if (sessionId) {
      try {
        await pool.query('DELETE FROM session_participants WHERE session_id = $1', [sessionId])
        await pool.query('UPDATE jam_sessions SET is_active = false WHERE id = $1', [sessionId])
      } catch (err) {
        console.error('Failed to end session in DB:', err.message)
      }
    }

    activeSessions.delete(sessionCode)
  })

  // ── Heartbeat ──────────────────────────────────────────────────
  socket.on('heartbeat', async ({ sessionCode }) => {
    const sessionId = await getDbSessionId(sessionCode)
    if (sessionId) {
      pool.query(
        'UPDATE jam_sessions SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1 AND is_active = true',
        [sessionId]
      ).catch(() => {})
    }
  })

  // ── Disconnect ─────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId)

    activeSessions.forEach((state, sessionCode) => {
      if (state.participants.has(socket.userId)) {
        state.participants.delete(socket.userId)
        socket.to(sessionCode).emit('participant-left', socket.userId)

        if (state.participants.size === 0) {
          activeSessions.delete(sessionCode)
          console.log(`Session ${sessionCode} cleaned up (empty)`)
          return
        }

        // Transfer host if needed
        if (state.hostId === socket.userId) {
          const sorted = Array.from(state.participants.entries())
            .sort((a, b) => a[1].joinedAt - b[1].joinedAt)
          const [newHostId, newHostInfo] = sorted[0]
          state.hostId = newHostId

          getDbSessionId(sessionCode).then(sessionId => {
            if (sessionId) {
              pool.query('UPDATE jam_sessions SET host_id = $1 WHERE id = $2', [newHostId, sessionId]).catch(() => {})
            }
          })

          io.to(sessionCode).emit('host-changed', {
            id: newHostId,
            display_name: newHostInfo.display_name,
          })
        }
      }
    })
  })
})

// ── Error Handling ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`Jammify server running on port ${PORT}`)
  console.log(`  Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
})

export { app, server, io }
