import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { matchAPI, sessionAPI, authAPI } from '../api/client'
import {
  Disc3, Users, Music, Plus, LogOut, User, Zap, Radio,
  Headphones, Clock, TrendingUp, Flame, Moon, Sun, Sparkles,
  ChevronRight, Play, Star, Activity
} from 'lucide-react'

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('jammify_theme') || 'light' }
    catch { return 'light' }
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    try { localStorage.setItem('jammify_theme', theme) } catch {}
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  return { theme, toggleTheme }
}

const MOODS = [
  { label: 'Chill Vibes', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))', border: 'rgba(99,102,241,0.3)', icon: Moon },
  { label: 'High Energy', gradient: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(239,68,68,0.15))', border: 'rgba(249,115,22,0.3)', icon: Flame },
  { label: 'Focus Mode', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(20,184,166,0.15))', border: 'rgba(16,185,129,0.3)', icon: Sparkles },
  { label: 'Late Night Jazz', gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))', border: 'rgba(99,102,241,0.3)', icon: Star },
]

const FRIEND_ACTIVITY = [
  { name: 'Ava', track: 'Blinding Lights', artist: 'The Weeknd', time: '2m', avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Marcus', track: 'Bohemian Rhapsody', artist: 'Queen', time: '5m', avatar: 'https://i.pravatar.cc/150?img=3' },
  { name: 'Luna', track: 'Levitating', artist: 'Dua Lipa', time: '8m', avatar: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Kai', track: 'Stairway to Heaven', artist: 'Led Zeppelin', time: '12m', avatar: 'https://i.pravatar.cc/150?img=7' },
  { name: 'Zara', track: 'Watermelon Sugar', artist: 'Harry Styles', time: '15m', avatar: 'https://i.pravatar.cc/150?img=9' },
]

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-card)',
}

function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const inc = end / (duration / 16)
    const t = setInterval(() => {
      start += inc
      if (start >= end) { setCount(end); clearInterval(t) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(t)
  }, [end, duration])
  return <span>{count}{suffix}</span>
}

function EQBars() {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[8, 14, 6, 18, 10, 16, 8, 12].map((h, i) => (
        <div key={i} className="w-[3px] bg-gradient-to-t from-spotify-500 to-spotify-300 rounded-full animate-equalizer"
          style={{ height: `${h}px`, animationDuration: `${0.6 + i * 0.08}s`, animationDelay: `${i * 0.05}s` }} />
      ))}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function HeroHeader({ user }) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-8 md:p-10"
      style={{
        background: `linear-gradient(135deg, var(--hero-from), var(--hero-via), var(--hero-to))`,
        border: '1px solid var(--border-card)',
      }}>
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-spotify-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/8 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>
      <div className="absolute top-6 right-8 opacity-30"><EQBars /></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-spotify-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold tracking-wider uppercase text-spotify-500">Online</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight" style={{ color: 'var(--text-primary)' }}>
          {getGreeting()}, <span className="bg-gradient-to-r from-spotify-500 via-spotify-400 to-emerald-400 bg-clip-text text-transparent">{user?.display_name?.split(' ')[0] || 'there'}</span>
        </h1>
        <p className="text-lg max-w-md" style={{ color: 'var(--text-secondary)' }}>
          Ready to find your next jam? Dive into live sessions or discover new music soulmates.
        </p>
      </div>
    </div>
  )
}

function StatsRow({ sessions, matches }) {
  const stats = [
    { label: 'Active Jams', value: sessions.length, icon: Radio, color: '#1DB954', bg: 'rgba(29,185,84,0.1)' },
    { label: 'Matches Found', value: matches.length, icon: Users, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
    { label: 'Listening Hours', value: 47, suffix: 'h', icon: Clock, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Top Genre', value: 'Indie', icon: Music, color: '#f97316', bg: 'rgba(249,115,22,0.1)', isText: true },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-card p-5 flex items-center gap-4 group hover:scale-[1.02] transition-all duration-300">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: stat.bg }}>
            <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
          </div>
          <div>
            <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              {stat.isText ? stat.value : <AnimatedCounter end={stat.value} suffix={stat.suffix || ''} />}
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MoodCards() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <Sparkles className="w-5 h-5 text-spotify-500" /> Browse by Mood
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MOODS.map((mood) => (
          <button key={mood.label} className="rounded-2xl p-5 text-left hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300 group"
            style={{ background: mood.gradient, border: `1px solid ${mood.border}` }}>
            <mood.icon className="w-6 h-6 mb-3 transition-colors" style={{ color: 'var(--text-secondary)' }} />
            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{mood.label}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>12 sessions</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function SessionCard({ session, navigate }) {
  const gradients = [
    'linear-gradient(135deg, rgba(29,185,84,0.25), rgba(16,185,129,0.25))',
    'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(236,72,153,0.25))',
    'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(6,182,212,0.25))',
    'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(239,68,68,0.25))',
  ]
  const g = gradients[session.name?.charCodeAt(0) % gradients.length || 0]
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 group hover:scale-[1.02]"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity" style={{ background: g }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: g }}>
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{session.name}</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{session.genre_focus || 'All genres'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-spotify-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-spotify-500">Live</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {[...Array(Math.min(session.participant_count || 1, 4))].map((_, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500" style={{ borderColor: 'var(--bg-primary)', zIndex: 4 - i }}>
                <User className="w-3 h-3 text-white/60" />
              </div>
            ))}
          </div>
          <button onClick={() => navigate(`/jam/${session.session_code}`)}
            className="flex items-center gap-1.5 bg-spotify-500 hover:bg-spotify-400 text-black text-xs font-bold px-4 py-2 rounded-full transition-all hover:shadow-[0_0_20px_rgba(29,185,84,0.4)] hover:-translate-y-0.5">
            <Play className="w-3 h-3" /> Join
          </button>
        </div>
      </div>
    </div>
  )
}

function FriendActivity() {
  return (
    <div className="p-5 rounded-2xl glass-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Activity className="w-4 h-4 text-spotify-500" /> Friend Activity
        </h3>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Live</span>
      </div>
      <div className="space-y-3">
        {FRIEND_ACTIVITY.map((f, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer hover:scale-[1.01]"
            style={{ '--hover-bg': 'var(--hover-bg)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div className="relative">
              <img src={f.avatar} alt={f.name} className="w-9 h-9 rounded-full object-cover" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-spotify-500 rounded-full border-2" style={{ borderColor: 'var(--bg-secondary)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{f.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{f.track} — {f.artist}</p>
            </div>
            <span className="text-[10px] shrink-0" style={{ color: 'var(--text-faint)' }}>{f.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickActions({ setShowCreateModal }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button onClick={() => setShowCreateModal(true)}
        className="relative overflow-hidden flex items-center gap-4 p-5 rounded-2xl border border-spotify-500/20 hover:border-spotify-500/40 hover:-translate-y-0.5 transition-all duration-300 group"
        style={{ background: 'linear-gradient(135deg, rgba(29,185,84,0.08), rgba(16,185,129,0.04))' }}>
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-spotify-500/10 rounded-full blur-[40px] group-hover:bg-spotify-500/20 transition-colors" />
        <div className="relative w-11 h-11 bg-spotify-500 rounded-xl flex items-center justify-center shadow-spotify group-hover:scale-110 transition-transform">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <div className="relative text-left">
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Create Session</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Start a new jam room</p>
        </div>
        <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-all" style={{ color: 'var(--text-faint)' }} />
      </button>
      <button className="relative overflow-hidden flex items-center gap-4 p-5 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 hover:-translate-y-0.5 transition-all duration-300 group"
        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.04))' }}>
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-[40px] group-hover:bg-purple-500/20 transition-colors" />
        <div className="relative w-11 h-11 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <div className="relative text-left">
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Quick Match</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Find someone to jam with</p>
        </div>
        <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-all" style={{ color: 'var(--text-faint)' }} />
      </button>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, setUser, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const [matches, setMatches] = useState([])
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [sessionGenre, setSessionGenre] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      if (!user) {
        try { const r = await authAPI.getMe(); setUser(r.data) }
        catch { navigate('/'); return }
      }
      const [m, s] = await Promise.allSettled([matchAPI.getMatches(5), sessionAPI.getActiveSessions()])
      if (m.status === 'fulfilled') setMatches(m.value.data)
      if (s.status === 'fulfilled') setSessions(s.value.data)
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  const handleCreateSession = async () => {
    if (!sessionName.trim()) return
    try {
      const r = await sessionAPI.createSession({ name: sessionName, genre_focus: sessionGenre || undefined })
      setShowCreateModal(false)
      navigate(`/jam/${r.data.session_code}`)
    } catch (e) { console.error(e) }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin mb-4"><Disc3 className="w-12 h-12 text-spotify-500" /></div>
          <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Loading Jammify...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300"
        style={{ background: 'var(--nav-bg)', borderColor: 'var(--border-card)' }}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Disc3 className="w-8 h-8 text-spotify-500 animate-vinyl-spin" />
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Jammify</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme}
              className="p-2.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ background: 'var(--hover-bg)', borderColor: 'var(--border-primary)' }}
              aria-label="Toggle theme">
              {theme === 'dark'
                ? <Sun className="w-5 h-5 text-yellow-400" />
                : <Moon className="w-5 h-5 text-blue-500" />
              }
            </button>
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 p-2.5 rounded-xl transition-all hover:scale-105 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spotify-500/30 to-purple-500/30 flex items-center justify-center" style={{ border: '1px solid var(--avatar-border)' }}>
                <User className="w-4 h-4" style={{ color: 'var(--icon-primary)' }} />
              </div>
              <span className="text-sm font-semibold hidden md:inline transition-colors" style={{ color: 'var(--text-secondary)' }}>
                {user?.display_name || 'Profile'}
              </span>
            </button>
            <button onClick={() => { logout(); navigate('/') }}
              className="p-2.5 rounded-xl transition-all hover:scale-105"
              style={{ color: 'var(--text-muted)' }}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 space-y-8 max-w-6xl">
        <HeroHeader user={user} />
        <StatsRow sessions={sessions} matches={matches} />
        <QuickActions setShowCreateModal={setShowCreateModal} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Radio className="w-5 h-5 text-spotify-500" /> Active Sessions
                </h2>
                <button className="text-sm font-medium transition-colors flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {sessions.length === 0 ? (
                <div className="p-10 text-center rounded-2xl" style={{ background: 'var(--empty-bg)', border: '1px solid var(--empty-border)' }}>
                  <Radio className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
                  <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No active sessions</p>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-faint)' }}>Be the first to start one!</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {sessions.slice(0, 4).map((s, i) => <SessionCard key={s.id || i} session={s} navigate={navigate} />)}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <TrendingUp className="w-5 h-5 text-spotify-500" /> Your Top Artists
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {(user?.top_artists || []).slice(0, 5).map((a, i) => (
                  <div key={a.id || i} className="group relative overflow-hidden rounded-2xl p-4 text-center transition-all duration-300 cursor-pointer hover:scale-[1.03]"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-spotify-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <img src={a.image} alt={a.name} className="w-full aspect-square object-cover rounded-xl mb-3 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150/1DB954/FFFFFF?text=♪' }} />
                      <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{a.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <MoodCards />
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl glass-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Zap className="w-4 h-4 text-spotify-500" /> Suggested Matches
                </h3>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{matches.length} found</span>
              </div>
              {matches.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No matches yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {matches.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer hover:scale-[1.01]"
                      style={{ '--hover-bg': 'var(--hover-bg)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <img src={m.avatar_url} alt={m.display_name} className="w-10 h-10 rounded-full object-cover" style={{ border: '2px solid var(--avatar-border)' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/40/1DB954/FFFFFF?text=U' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{m.display_name}</p>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1 rounded-full overflow-hidden max-w-[60px]" style={{ background: 'var(--progress-bg)' }}>
                            <div className="h-full rounded-full bg-spotify-500" style={{ width: `${m.match_score}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-spotify-500">{m.match_score}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <FriendActivity />
          </div>
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowCreateModal(false)}>
          <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl" style={{ background: 'var(--modal-bg)', border: '1px solid var(--modal-border)' }}
            onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>Create Jam Session</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Session Name</label>
                <input type="text" value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="e.g., Rock Revival" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Genre Focus</label>
                <select value={sessionGenre} onChange={e => setSessionGenre(e.target.value)} className="input-field appearance-none">
                  <option value="">All Genres</option>
                  <option value="rock">Rock</option>
                  <option value="pop">Pop</option>
                  <option value="hip-hop">Hip-Hop</option>
                  <option value="jazz">Jazz</option>
                  <option value="electronic">Electronic</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-xl border font-semibold transition-all"
                style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={handleCreateSession} disabled={!sessionName.trim()}
                className="flex-1 py-3 rounded-xl bg-spotify-500 text-black font-bold hover:bg-spotify-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_20px_rgba(29,185,84,0.3)]">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
