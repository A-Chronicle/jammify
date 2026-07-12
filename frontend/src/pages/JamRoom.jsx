import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useSessionStore } from '../store/sessionStore'
import { sessionAPI, playbackAPI } from '../api/client'
import { connectSocket, joinSession, leaveSession, sendMessage, addToQueue, playTrack, pauseTrack, resumeTrack, skipTrack, endSession, sendHeartbeat } from '../api/socket'
import {
  ArrowLeft, Send, Users, Music, Disc3, LogOut,
  Play, Pause, SkipForward, SkipBack, Plus, Search, X, Power
} from 'lucide-react'

export default function JamRoom() {
  const { sessionCode } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuthStore()
  const {
    currentSession, participants, queue, chatMessages,
    currentTrack, isPlaying, isConnected, sessionEnded, hostChanged,
    setCurrentSession, setParticipants, setCurrentTrack, setIsPlaying
  } = useSessionStore()

  const [message, setMessage] = useState('')
  const [trackSearch, setTrackSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)

  const isHost = currentSession?.host_id === user?.id

  useEffect(() => {
    loadSession()
    connectSocket(token)
    joinSession(sessionCode)
    fetchCurrentPlayback()

    // Poll playback state every 10 seconds
    const playbackInterval = setInterval(fetchCurrentPlayback, 10000)
    // Send heartbeat every 2 minutes
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat(sessionCode)
      sessionAPI.heartbeat?.(currentSession?.id).catch(() => {})
    }, 120000)

    return () => {
      clearInterval(playbackInterval)
      clearInterval(heartbeatInterval)
      leaveSession(sessionCode)
    }
  }, [sessionCode, token])

  // Handle session ended
  useEffect(() => {
    if (sessionEnded) {
      alert(`Session ended by ${sessionEnded}`)
      navigate('/dashboard')
    }
  }, [sessionEnded, navigate])

  // Handle host changed
  useEffect(() => {
    if (hostChanged) {
      // Could show a toast notification here
      console.log('Host changed to:', hostChanged.display_name)
    }
  }, [hostChanged])

  const loadSession = async () => {
    try {
      const response = await sessionAPI.getSession(sessionCode)
      setCurrentSession(response.data.session)
      setParticipants(response.data.participants)
    } catch (error) {
      console.error('Failed to load session:', error)
      navigate('/dashboard')
    }
  }

  const fetchCurrentPlayback = async () => {
    try {
      const response = await playbackAPI.getCurrent()
      if (response.data.track) {
        setCurrentTrack(response.data.track)
        setIsPlaying(response.data.is_playing)
      } else {
        setCurrentTrack(null)
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Failed to fetch playback:', error)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    sendMessage(sessionCode, message)
    setMessage('')
  }

  const handleTrackSearch = async () => {
    if (!trackSearch.trim()) return
    setIsSearching(true)
    try {
      const response = await playbackAPI.search(trackSearch, 10)
      setSearchResults(response.data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToQueue = (track) => {
    addToQueue(sessionCode, track)
    setShowSearch(false)
    setTrackSearch('')
    setSearchResults([])
  }

  const handlePlayTrack = (track) => {
    playTrack(sessionCode, track)
    setCurrentTrack(track)
    setIsPlaying(true)
  }

  const handleTogglePlayPause = async () => {
    if (isPlaying) {
      pauseTrack(sessionCode)
      setIsPlaying(false)
      try { await playbackAPI.pause() } catch (e) { console.error(e) }
    } else {
      resumeTrack(sessionCode)
      setIsPlaying(true)
      try { await playbackAPI.resume() } catch (e) { console.error(e) }
    }
  }

  const handleSkipNext = async () => {
    skipTrack(sessionCode)
    try { await playbackAPI.next() } catch (e) { console.error(e) }
    setTimeout(fetchCurrentPlayback, 1000)
  }

  const handleSkipPrevious = async () => {
    try { await playbackAPI.previous() } catch (e) { console.error(e) }
    setTimeout(fetchCurrentPlayback, 1000)
  }

  const handleEndSession = async () => {
    if (!isHost) return
    try {
      await sessionAPI.endSession(currentSession.id)
      endSession(sessionCode)
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to end session:', error)
    }
  }

  const handleLeaveSession = () => {
    leaveSession(sessionCode)
    navigate('/dashboard')
  }

  const formatDuration = (ms) => {
    if (!ms) return '0:00'
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin">
          <Disc3 className="w-12 h-12 text-spotify-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLeaveSession}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{currentSession.name}</h1>
              <p className="text-sm text-gray-400">
                Session Code: <span className="text-spotify-400 font-mono">{sessionCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-5 h-5" />
              <span>{participants.length} listeners</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isHost && (
              <button
                onClick={() => setShowEndConfirm(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
              >
                <Power className="w-4 h-4" />
                End Session
              </button>
            )}
            <button
              onClick={handleLeaveSession}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Now Playing */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-sm text-gray-400">
                  {isPlaying ? 'Now Playing' : 'Paused'}
                </span>
              </div>

              {currentTrack ? (
                <div className="flex items-center gap-6">
                  <img
                    src={currentTrack.album_art}
                    alt={currentTrack.name}
                    className="w-32 h-32 rounded-xl object-cover shadow-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-white mb-1 truncate">{currentTrack.name}</h2>
                    <p className="text-gray-400 truncate">{currentTrack.artist}</p>
                    <p className="text-sm text-gray-500 mt-2 truncate">{currentTrack.album}</p>
                    {currentTrack.duration_ms && (
                      <p className="text-xs text-gray-500 mt-1">{formatDuration(currentTrack.duration_ms)}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No track playing</p>
                  <p className="text-sm text-gray-500 mt-2">Add something to the queue!</p>
                </div>
              )}

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-6 mt-8">
                <button
                  onClick={handleSkipPrevious}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <SkipBack className="w-8 h-8" />
                </button>
                <button
                  onClick={handleTogglePlayPause}
                  className="w-16 h-16 bg-spotify-500 rounded-full flex items-center justify-center hover:bg-spotify-400 transition-all hover:scale-105 shadow-lg shadow-spotify-500/30"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
                <button
                  onClick={handleSkipNext}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <SkipForward className="w-8 h-8" />
                </button>
              </div>
            </div>

            {/* Queue */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Queue</h3>
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex items-center gap-2 text-spotify-400 hover:text-spotify-300 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Track</span>
                </button>
              </div>

              {queue.length === 0 ? (
                <div className="text-center py-8">
                  <Music className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Queue is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((track, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                      <img
                        src={track.album_art}
                        alt={track.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{track.name}</p>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>
                      <button
                        onClick={() => handlePlayTrack(track)}
                        className="text-spotify-400 hover:text-spotify-300 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Listeners</h3>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3">
                    <img
                      src={participant.avatar_url}
                      alt={participant.display_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{participant.display_name}</p>
                      <p className="text-xs text-gray-400">
                        {participant.is_host ? 'Host' : 'Listener'}
                      </p>
                    </div>
                    {participant.id === user?.id && (
                      <span className="text-xs text-spotify-400">(You)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col h-96">
              <h3 className="text-lg font-semibold text-white mb-4">Chat</h3>

              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`${msg.user_id === user?.id ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-[80%] ${
                      msg.user_id === user?.id
                        ? 'bg-spotify-500 text-white'
                        : 'bg-white/10 text-white'
                    } rounded-2xl px-4 py-2`}>
                      {msg.user_id !== user?.id && (
                        <p className="text-xs text-spotify-400 mb-1">{msg.user_name}</p>
                      )}
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-spotify-500"
                />
                <button
                  type="submit"
                  className="w-10 h-10 bg-spotify-500 rounded-full flex items-center justify-center hover:bg-spotify-400 transition-colors"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Track Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Add to Queue</h3>
              <button onClick={() => { setShowSearch(false); setSearchResults([]) }} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={trackSearch}
                onChange={(e) => setTrackSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrackSearch()}
                placeholder="Search for a track..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-spotify-500"
                autoFocus
              />
              <button
                onClick={handleTrackSearch}
                disabled={isSearching}
                className="px-6 py-3 bg-spotify-500 text-white font-semibold rounded-xl hover:bg-spotify-400 transition-colors disabled:opacity-50"
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => handleAddToQueue(track)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <img
                      src={track.album_art}
                      alt={track.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{track.name}</p>
                      <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                    </div>
                    <p className="text-xs text-gray-500">{formatDuration(track.duration_ms)}</p>
                  </div>
                ))}
              </div>
            )}

            {trackSearch && searchResults.length === 0 && !isSearching && (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No results found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* End Session Confirm Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Power className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">End Session?</h3>
            <p className="text-gray-400 mb-6">
              This will end the session for all {participants.length} listeners. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEndSession}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
