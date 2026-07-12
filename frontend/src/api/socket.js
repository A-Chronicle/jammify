import { io } from 'socket.io-client'
import { useSessionStore } from '../store/sessionStore'

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000'

let socket = null

export const connectSocket = (token) => {
  if (socket?.connected) return socket

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id)
    useSessionStore.getState().setConnected(true)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
    useSessionStore.getState().setConnected(false)
  })

  socket.on('session-update', (sessionData) => {
    useSessionStore.getState().setCurrentSession(sessionData)
  })

  socket.on('participant-joined', (participant) => {
    useSessionStore.getState().addParticipant(participant)
  })

  socket.on('participant-left', (userId) => {
    useSessionStore.getState().removeParticipant(userId)
  })

  socket.on('queue-updated', (track) => {
    useSessionStore.getState().addToQueue(track)
  })

  socket.on('queue-removed', (trackIndex) => {
    useSessionStore.getState().removeFromQueue(trackIndex)
  })

  socket.on('new-message', (message) => {
    useSessionStore.getState().addMessage(message)
  })

  socket.on('playback-update', (playbackData) => {
    useSessionStore.getState().setPlaybackUpdate(playbackData)
  })

  socket.on('playback-sync', (playbackState) => {
    useSessionStore.getState().syncPlayback(playbackState)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
    useSessionStore.getState().clearSession()
  }
}

export const joinSession = (sessionCode) => {
  socket?.emit('join-session', sessionCode)
}

export const leaveSession = (sessionCode) => {
  socket?.emit('leave-session', sessionCode)
  useSessionStore.getState().clearSession()
}

export const sendMessage = (sessionCode, message) => {
  socket?.emit('chat-message', { sessionCode, message })
}

export const addToQueue = (sessionCode, track) => {
  socket?.emit('add-to-queue', { sessionCode, track })
}

export const removeFromQueue = (sessionCode, trackIndex) => {
  socket?.emit('remove-from-queue', { sessionCode, trackIndex })
}

export const playTrack = (sessionCode, track) => {
  socket?.emit('play-track', { sessionCode, track })
}

export const pauseTrack = (sessionCode) => {
  socket?.emit('pause-track', { sessionCode })
}

export const resumeTrack = (sessionCode) => {
  socket?.emit('resume-track', { sessionCode })
}

export const skipTrack = (sessionCode) => {
  socket?.emit('skip-track', { sessionCode })
}

export const syncPlayback = (sessionCode, playbackState) => {
  socket?.emit('sync-playback', { sessionCode, playbackState })
}

export const getSocket = () => socket
