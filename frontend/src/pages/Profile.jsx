import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { userAPI } from '../api/client'
import { Disc3, ArrowLeft, Music, Headphones, BarChart3 } from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [topArtists, setTopArtists] = useState([])
  const [topTracks, setTopTracks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('medium_term')

  useEffect(() => {
    loadProfileData()
  }, [timeRange])

  const loadProfileData = async () => {
    try {
      const [artistsRes, tracksRes] = await Promise.all([
        userAPI.getTopArtists(10, timeRange),
        userAPI.getTopTracks(10, timeRange)
      ])
      setTopArtists(artistsRes.data)
      setTopTracks(tracksRes.data)
    } catch (error) {
      console.error('Failed to load profile data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Disc3 className="w-12 h-12 text-spotify-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-8 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Your Profile</h1>
        </div>
      </header>

      <main className="container mx-auto px-8 py-12">
        {/* Profile Card */}
        <div className="glass-card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img 
              src={user?.avatar_url} 
              alt={user?.display_name}
              className="w-32 h-32 rounded-full object-cover border-4 border-spotify-500"
            />
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{user?.display_name}</h2>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Headphones className="w-5 h-5" />
                  <span>{topArtists.length} Top Artists</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Music className="w-5 h-5" />
                  <span>{topTracks.length} Top Tracks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {[
            { value: 'short_term', label: 'Last 4 Weeks' },
            { value: 'medium_term', label: 'Last 6 Months' },
            { value: 'long_term', label: 'All Time' },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                timeRange === range.value
                  ? 'bg-spotify-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Artists */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-spotify-500" />
              Top Artists
            </h3>
            <div className="space-y-4">
              {topArtists.map((artist, i) => (
                <div key={artist.id} className="glass-card p-4 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300">
                  <span className="text-2xl font-bold text-gray-300 w-8">{i + 1}</span>
                  <img 
                    src={artist.image} 
                    alt={artist.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{artist.name}</p>
                    <p className="text-sm text-gray-500">
                      {artist.genres?.slice(0, 2).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Popularity</p>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-spotify-500 rounded-full"
                        style={{ width: `${artist.popularity}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tracks */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Music className="w-6 h-6 text-spotify-500" />
              Top Tracks
            </h3>
            <div className="space-y-4">
              {topTracks.map((track, i) => (
                <div key={track.id} className="glass-card p-4 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300">
                  <span className="text-2xl font-bold text-gray-300 w-8">{i + 1}</span>
                  <img 
                    src={track.album_art} 
                    alt={track.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{track.name}</p>
                    <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {(track.duration_ms / 1000 / 60).toFixed(2)} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
