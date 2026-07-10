import { create } from 'zustand'

export const useSessionStore = create((set, get) => ({
  currentSession: null,
  sessions: [],
  participants: [],
  queue: [],
  chatMessages: [],
  isConnected: false,
  
  setCurrentSession: (session) => set({ currentSession: session }),
  setSessions: (sessions) => set({ sessions }),
  setParticipants: (participants) => set({ participants }),
  setQueue: (queue) => set({ queue }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  setConnected: (isConnected) => set({ isConnected }),
  
  addParticipant: (participant) => set((state) => ({
    participants: [...state.participants, participant]
  })),
  
  removeParticipant: (userId) => set((state) => ({
    participants: state.participants.filter(p => p.id !== userId)
  })),
  
  addToQueue: (track) => set((state) => ({
    queue: [...state.queue, track]
  })),
  
  removeFromQueue: (trackIndex) => set((state) => ({
    queue: state.queue.filter((_, i) => i !== trackIndex)
  })),
  
  addMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message]
  })),
  
  clearSession: () => set({
    currentSession: null,
    participants: [],
    queue: [],
    chatMessages: [],
    isConnected: false,
  }),
}))
