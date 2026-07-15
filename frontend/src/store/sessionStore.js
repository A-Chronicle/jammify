import { create } from 'zustand'

export const useSessionStore = create((set, get) => ({
  currentSession: null,
  sessions: [],
  participants: [],
  queue: [],
  chatMessages: [],
  isConnected: false,
  currentTrack: null,
  isPlaying: false,
  hostId: null,
  sessionEnded: null,
  hostChanged: null,

  setCurrentSession: (session) => set({ currentSession: session }),
  setSessions: (sessions) => set({ sessions }),
  setParticipants: (participants) => set({ participants }),
  setConnected: (isConnected) => set({ isConnected }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setHostId: (hostId) => set({ hostId }),

  setQueue: (queue) => set({ queue }),
  setChatMessages: (messages) => set({ chatMessages: messages }),

  addParticipant: (participant) => set((state) => ({
    participants: [...state.participants, participant]
  })),

  removeParticipant: (userId) => set((state) => ({
    participants: state.participants.filter(p => p.id !== userId)
  })),

  addMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message]
  })),

  setPlaybackUpdate: (playbackData) => set({ playbackData }),

  syncPlayback: (playbackState) => set({
    currentTrack: playbackState.track,
    isPlaying: playbackState.isPlaying,
  }),

  setSessionEnded: (endedBy) => set({ sessionEnded: endedBy }),

  setHostChanged: (newHost) => set((state) => ({
    hostChanged: newHost,
    hostId: newHost.id,
    participants: state.participants.map(p => ({
      ...p,
      is_host: p.id === newHost.id,
    })),
  })),

  clearSession: () => set({
    currentSession: null,
    participants: [],
    queue: [],
    chatMessages: [],
    isConnected: false,
    currentTrack: null,
    isPlaying: false,
    hostId: null,
    playbackData: null,
    sessionEnded: null,
    hostChanged: null,
  }),
}))
