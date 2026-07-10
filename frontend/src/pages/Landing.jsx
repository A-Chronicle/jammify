import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Music, Users, Zap, Headphones, Radio, Disc3 } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [isHovered, setIsHovered] = useState(false)

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/spotify`
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-spotify-50 via-cream-100 to-cream-50" />
      
      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 animate-float opacity-20">
        <Music className="w-32 h-32 text-spotify-300" />
      </div>
      <div className="absolute bottom-1/4 right-1/4 animate-float opacity-20 animate-delay-300">
        <Headphones className="w-24 h-24 text-spotify-400" />
      </div>
      <div className="absolute top-1/3 right-1/3 animate-note opacity-30">
        <span className="text-6xl">♪</span>
      </div>
      <div className="absolute bottom-1/3 left-1/3 animate-note opacity-30 animate-delay-500">
        <span className="text-5xl">♫</span>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <Disc3 className="w-8 h-8 text-spotify-500 animate-vinyl-spin" />
          <span className="text-2xl font-bold text-gray-900">Jammify</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Features
          </button>
          <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
            About
          </button>
          {isAuthenticated ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Dashboard
            </button>
          ) : (
            <button 
              onClick={handleLogin}
              className="btn-primary"
            >
              Login with Spotify
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-8 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your{' '}
            <span className="text-gradient">Jam</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with music lovers who share your taste. Join real-time jam sessions on Spotify and discover new artists together.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleLogin}
              className="btn-primary text-lg px-8 py-4 flex items-center gap-3"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Start Jamming
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="glass-card p-8 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-spotify-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-spotify-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Matching</h3>
            <p className="text-gray-600">
              Our algorithm analyzes your music taste to connect you with compatible listeners
            </p>
          </div>
          
          <div className="glass-card p-8 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-spotify-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Radio className="w-8 h-8 text-spotify-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Sessions</h3>
            <p className="text-gray-600">
              Join live jam sessions and listen to music together with synchronized playback
            </p>
          </div>
          
          <div className="glass-card p-8 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-spotify-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-spotify-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Discovery</h3>
            <p className="text-gray-600">
              Discover new artists and genres through shared sessions with music enthusiasts
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            How it Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Connect Spotify', desc: 'Login with your Spotify account' },
              { step: '2', title: 'Find Matches', desc: 'We find users with similar taste' },
              { step: '3', title: 'Join Session', desc: 'Enter a jam room with your match' },
              { step: '4', title: 'Jam Together', desc: 'Listen and chat in real-time' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="w-12 h-12 bg-spotify-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-spotify-200 -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Disc3 className="w-6 h-6 text-spotify-500" />
              <span className="text-xl font-bold">Jammify</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-gray-400 text-sm">
              Built with Spotify API
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
