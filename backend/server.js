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

dotenv.config()

const app = express()
const server = createServer(app)

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/session', sessionRoutes)
app.use('/matches', matchRoutes)
app.use('/playback', playbackRoutes)

// Socket.IO connection handling
const activeSessions = new Map()

io.use(authenticateSocket)

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId)

  socket.on('join-session', async (sessionCode) => {
    try {
      // Join the Socket.IO room
      socket.join(sessionCode)
      
      // Track the user in the session
      if (!activeSessions.has(sessionCode)) {
        activeSessions.set(sessionCode, new Set())
      }
      activeSessions.get(sessionCode).add(socket.userId)

      // Notify others in the session
      socket.to(sessionCode).emit('participant-joined', {
        id: socket.userId,
        display_name: socket.user.display_name,
        avatar_url: socket.user.avatar_url,
      })

      // Send current session state to the joining user
      const participants = Array.from(activeSessions.get(sessionCode))
      socket.emit('session-update', {
        participants,
        sessionCode,
      })

      console.log(`User ${socket.userId} joined session ${sessionCode}`)
    } catch (error) {
      console.error('Error joining session:', error)
      socket.emit('error', { message: 'Failed to join session' })
    }
  })

  socket.on('leave-session', (sessionCode) => {
    socket.leave(sessionCode)
    
    if (activeSessions.has(sessionCode)) {
      activeSessions.get(sessionCode).delete(socket.userId)
      
      // If session is empty, remove it
      if (activeSessions.get(sessionCode).size === 0) {
        activeSessions.delete(sessionCode)
      }
    }

    // Notify others
    socket.to(sessionCode).emit('participant-left', socket.userId)
    
    console.log(`User ${socket.userId} left session ${sessionCode}`)
  })

  socket.on('chat-message', ({ sessionCode, message }) => {
    const messageData = {
      id: Date.now(),
      user_id: socket.userId,
      user_name: socket.user.display_name,
      message,
      timestamp: new Date().toISOString(),
    }

    // Broadcast to all users in the session (including sender)
    io.to(sessionCode).emit('new-message', messageData)
  })

  socket.on('add-to-queue', ({ sessionCode, track }) => {
    io.to(sessionCode).emit('queue-updated', track)
  })

  socket.on('remove-from-queue', ({ sessionCode, trackIndex }) => {
    io.to(sessionCode).emit('queue-removed', trackIndex)
  })

  socket.on('play-track', ({ sessionCode, track }) => {
    // Broadcast playback to all users in the session
    io.to(sessionCode).emit('playback-update', {
      type: 'play',
      track,
      startedBy: {
        id: socket.userId,
        display_name: socket.user.display_name,
      },
    })
  })

  socket.on('pause-track', ({ sessionCode }) => {
    io.to(sessionCode).emit('playback-update', {
      type: 'pause',
      pausedBy: {
        id: socket.userId,
        display_name: socket.user.display_name,
      },
    })
  })

  socket.on('resume-track', ({ sessionCode }) => {
    io.to(sessionCode).emit('playback-update', {
      type: 'resume',
      resumedBy: {
        id: socket.userId,
        display_name: socket.user.display_name,
      },
    })
  })

  socket.on('skip-track', ({ sessionCode }) => {
    io.to(sessionCode).emit('playback-update', {
      type: 'skip',
      skippedBy: {
        id: socket.userId,
        display_name: socket.user.display_name,
      },
    })
  })

  socket.on('sync-playback', ({ sessionCode, playbackState }) => {
    // Host broadcasts their playback state to all participants
    socket.to(sessionCode).emit('playback-sync', playbackState)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId)
    
    // Clean up from all sessions
    activeSessions.forEach((users, sessionCode) => {
      if (users.has(socket.userId)) {
        users.delete(socket.userId)
        socket.to(sessionCode).emit('participant-left', socket.userId)
        
        if (users.size === 0) {
          activeSessions.delete(sessionCode)
        }
      }
    })
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`🎵 Jammify server running on port ${PORT}`)
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
})

export { app, server, io }
