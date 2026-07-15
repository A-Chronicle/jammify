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
    const store = useSessionStore.getState()
    store.setCurrentSession(sessionData)
    store.setParticipants(sessionData.participants)
    if (sessionData.hostId) store.setHostId(sessionData.hostId)
  })

  socket.on('participant-joined', (participant) => {
    useSessionStore.getState().addParticipant(participant)
  })

  socket.on('participant-left', (userId) => {
    useSessionStore.getState().removeParticipant(userId)
  })

  // ── Queue: full sync from server (replaces local state) ──────
  socket.on('queue-sync', (queue) => {
    useSessionStore.getState().setQueue(queue)
  })

  // ── Chat: history loaded on join ─────────────────────────────
  socket.on('chat-history', (messages) => {
    useSessionStore.getState().setChatMessages(messages)
  })

  socket.on('new-message', (message) => {
    useSessionStore.getState().addMessage(message)
  })

  // ── Playback: every user executes on their own Spotify ──────
  socket.on('playback-update', (playbackData) => {
    const store = useSessionStore.getState()

    // Update local UI state
    if (playbackData.type === 'play' || playbackData.type === 'skip') {
      store.setCurrentTrack(playbackData.track)
      store.setIsPlaying(true)
    } else if (playbackData.type === 'pause') {
      store.setIsPlaying(false)
    } else if (playbackData.type === 'resume') {
      store.setIsPlaying(true)
    }
  })

  // ── Host playback state (for new joiners) ────────────────────
  socket.on('host-playback-state', (playbackState) => {
    const store = useSessionStore.getState()
    if (playbackState.track) {
      store.setCurrentTrack(playbackState.track)
    }
    store.setIsPlaying(playbackState.isPlaying)
  })

  socket.on('session-ended', ({ endedBy }) => {
    useSessionStore.getState().setSessionEnded(endedBy)
  })

  socket.on('host-changed', (newHost) => {
    useSessionStore.getState().setHostChanged(newHost)
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

export const skipTrack = (sessionCode, nextTrack) => {
  socket?.emit('skip-track', { sessionCode, nextTrack })
}

export const endSession = (sessionCode) => {
  socket?.emit('end-session', { sessionCode })
}

export const sendHeartbeat = (sessionCode) => {
  socket?.emit('heartbeat', { sessionCode })
}

export const getSocket = () => socket
