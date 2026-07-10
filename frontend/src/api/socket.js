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

  socket.on('queue-updated', (queue) => {
    useSessionStore.getState().setQueue(queue)
  })

  socket.on('new-message', (message) => {
    useSessionStore.getState().addMessage(message)
  })

  socket.on('playback-update', (playbackData) => {
    // Handle playback sync
    console.log('Playback update:', playbackData)
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

export const playTrack = (sessionCode, trackId) => {
  socket?.emit('play-track', { sessionCode, trackId })
}

export const getSocket = () => socket
