import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { matchAPI, sessionAPI, authAPI } from '../api/client'
import { Disc3, Users, Music, Plus, LogOut, User, Zap, Radio, Headphones } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()
  const [matches, setMatches] = useState([])
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [sessionGenre, setSessionGenre] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Fetch user if not in store
      if (!user) {
        try {
          const userRes = await authAPI.getMe()
          setUser(userRes.data)
        } catch {
          navigate('/')
          return
        }
      }

      const [matchesRes, sessionsRes] = await Promise.allSettled([
        matchAPI.getMatches(5),
        sessionAPI.getActiveSessions()
      ])

      if (matchesRes.status === 'fulfilled') setMatches(matchesRes.value.data)
      if (sessionsRes.status === 'fulfilled') setSessions(sessionsRes.value.data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSession = async () => {
    if (!sessionName.trim()) return
    try {
      const response = await sessionAPI.createSession({
        name: sessionName,
        genre_focus: sessionGenre || undefined
      })
      setShowCreateModal(false)
      navigate(`/jam/${response.data.session_code}`)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Disc3 className="w-12 h-12 text-spotify-500" />
          </div>
          <p className="text-gray-500">Loading Jammify...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Disc3 className="w-8 h-8 text-spotify-500 animate-vinyl-spin" />
            <span className="text-xl font-bold text-gray-900">Jammify</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 btn-ghost"
            >
              <User className="w-5 h-5" />
              <span className="hidden md:inline">{user?.display_name || 'Profile'}</span>
            </button>
            <button onClick={handleLogout} className="btn-ghost text-gray-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-8 py-12">
        {/* Welcome */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.display_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-600 text-lg">
            Ready to find your jam? Here's what's happening.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="glass-card p-6 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-spotify-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Create Session</h3>
                  <p className="text-sm text-gray-500">Start a new jam room</p>
                </div>
              </button>
              
              <button className="glass-card p-6 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Quick Match</h3>
                  <p className="text-sm text-gray-500">Find someone to jam with</p>
                </div>
              </button>
            </div>

            {/* Active Sessions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Sessions</h2>
              
              {sessions.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Radio className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No active sessions right now</p>
                  <p className="text-sm text-gray-400 mt-2">Be the first to start one!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.slice(0, 5).map((session, i) => (
                    <div key={session.id || i} className="session-card flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-spotify-400 to-spotify-600 rounded-xl flex items-center justify-center">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{session.name}</h3>
                          <p className="text-sm text-gray-500">
                            {session.participant_count || 0} listeners &bull; {session.genre_focus || 'All genres'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="status-dot" />
                          <span className="text-sm text-gray-600">Live</span>
                        </div>
                        <button 
                          onClick={() => navigate(`/jam/${session.session_code}`)}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Your Top Artists */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Top Artists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {(user?.top_artists || []).slice(0, 5).map((artist, i) => (
                  <div key={artist.id || i} className="glass-card p-4 text-center hover:-translate-y-1 transition-all duration-300">
                    <img 
                      src={artist.image} 
                      alt={artist.name}
                      className="w-full aspect-square object-cover rounded-xl mb-3"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150/1DB954/FFFFFF?text=Music' }}
                    />
                    <p className="font-medium text-gray-900 text-sm truncate">{artist.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Matches */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-spotify-100 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-spotify-500" />
                </div>
                <h3 className="font-semibold text-gray-900">Suggested Matches</h3>
              </div>
              
              {matches.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No matches yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <div key={match.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <img 
                        src={match.avatar_url} 
                        alt={match.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/48/1DB954/FFFFFF?text=U' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{match.display_name}</p>
                        <p className="text-xs text-gray-500">
                          {match.match_score}% match
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Jam Session</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Name</label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g., Rock Revival"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Genre Focus</label>
                <select
                  value={sessionGenre}
                  onChange={(e) => setSessionGenre(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Genres</option>
                  <option value="rock">Rock</option>
                  <option value="pop">Pop</option>
                  <option value="hip-hop">Hip-Hop</option>
                  <option value="jazz">Jazz</option>
                  <option value="electronic">Electronic</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button 
                onClick={handleCreateSession}
                className="btn-primary flex-1"
                disabled={!sessionName.trim()}
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
