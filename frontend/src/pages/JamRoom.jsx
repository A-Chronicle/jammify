import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useSessionStore } from '../store/sessionStore'
import { sessionAPI } from '../api/client'
import { connectSocket, joinSession, leaveSession, sendMessage, addToQueue } from '../api/socket'
import { 
  ArrowLeft, Send, Users, Music, Disc3, LogOut, 
  Play, Pause, SkipForward, SkipBack, Plus 
} from 'lucide-react'

export default function JamRoom() {
  const { sessionCode } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuthStore()
  const { 
    currentSession, participants, queue, chatMessages, 
    setCurrentSession, setParticipants 
  } = useSessionStore()
  
  const [message, setMessage] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [trackSearch, setTrackSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    loadSession()
    connectSocket(token)
    joinSession(sessionCode)

    return () => {
      leaveSession(sessionCode)
    }
  }, [sessionCode, token])

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

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    
    sendMessage(sessionCode, message)
    setMessage('')
  }

  const handleTrackSearch = async () => {
    // Search Spotify tracks
    // This would call your backend endpoint
    console.log('Searching for:', trackSearch)
  }

  const handleAddToQueue = (track) => {
    addToQueue(sessionCode, track)
    setShowSearch(false)
    setTrackSearch('')
  }

  const handleLeaveSession = () => {
    leaveSession(sessionCode)
    navigate('/dashboard')
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    // Send play/pause command via socket
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
            <button 
              onClick={handleLeaveSession}
              className="btn-ghost text-gray-400 hover:text-white"
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
            <div className="glass-card-dark p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="status-dot" />
                <span className="text-sm text-gray-400">Now Playing</span>
              </div>
              
              {currentTrack ? (
                <div className="flex items-center gap-6">
                  <img 
                    src={currentTrack.album_art} 
                    alt={currentTrack.name}
                    className="w-32 h-32 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">{currentTrack.name}</h2>
                    <p className="text-gray-400">{currentTrack.artist}</p>
                    <p className="text-sm text-gray-500 mt-2">{currentTrack.album}</p>
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
                <button className="text-gray-400 hover:text-white transition-colors">
                  <SkipBack className="w-8 h-8" />
                </button>
                <button 
                  onClick={togglePlayPause}
                  className="w-16 h-16 bg-spotify-500 rounded-full flex items-center justify-center hover:bg-spotify-400 transition-colors hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <SkipForward className="w-8 h-8" />
                </button>
              </div>
            </div>

            {/* Queue */}
            <div className="glass-card-dark p-6">
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
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <img 
                        src={track.album_art} 
                        alt={track.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{track.name}</p>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>
                      <button className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
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
            <div className="glass-card-dark p-6">
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
                        {participant.id === currentSession.host_id ? 'Host' : 'Listener'}
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
            <div className="glass-card-dark p-6 flex flex-col h-96">
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
          <div className="glass-card-dark w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add to Queue</h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={trackSearch}
                onChange={(e) => setTrackSearch(e.target.value)}
                placeholder="Search for a track..."
                className="input-field bg-white/10 border-white/20 text-white"
                autoFocus
              />
              <button 
                onClick={handleTrackSearch}
                className="btn-primary"
              >
                Search
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
                  </div>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => setShowSearch(false)}
              className="w-full mt-4 btn-ghost text-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
