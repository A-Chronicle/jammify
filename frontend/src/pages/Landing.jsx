import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Disc3, Users, Radio, Zap } from 'lucide-react'

function Particles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const particles = []

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.4
        this.speedY = (Math.random() - 0.5) * 0.4
        this.opacity = Math.random() * 0.4 + 0.1
        this.hue = [140, 280, 340, 50][Math.floor(Math.random() * 4)]
        this.pulse = Math.random() * Math.PI * 2
        this.pulseSpeed = Math.random() * 0.02 + 0.01
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.pulse += this.pulseSpeed
        this.opacity = 0.15 + Math.sin(this.pulse) * 0.15
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset()
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity * 0.15})`
        ctx.fill()
      }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle())

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}

export default function Landing() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/spotify`
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f]">
      {/* Background layers */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900/20 via-[#0a0a0f] to-green-900/20 animate-pulse" style={{ animationDuration: '8s' }} />
      <Particles />

      {/* Turntables */}
      <div className="absolute top-[12%] left-[5%] w-48 h-48 bg-[#111] rounded-xl border-2 border-white/[0.08] shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center z-[1] animate-float-album opacity-[0.12] rotate-[-8deg]" style={{ '--rot': '-8deg' }}>
        <div className="w-3/4 h-3/4 rounded-full bg-[radial-gradient(circle_at_center,#1DB954_18%,transparent_19%),radial-gradient(circle_at_center,#1a1a1a_30%,transparent_31%),repeating-conic-gradient(from_0deg,rgba(40,40,40,0.9)_0deg_6deg,rgba(22,22,22,0.9)_6deg_12deg)] border-2 border-white/10 animate-vinyl-spin relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-[15%] rounded-full border border-white/[0.04] shadow-[inset_0_0_0_4px_rgba(255,255,255,0.02),inset_0_0_0_8px_rgba(255,255,255,0.03),inset_0_0_0_12px_rgba(255,255,255,0.02)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22%] h-[22%] rounded-full bg-gradient-to-br from-[#1DB954] to-[#16a34a] shadow-[0_0_8px_rgba(29,185,84,0.5)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%] rounded-full bg-black" />
          </div>
        </div>
      </div>
      <div className="absolute top-[55%] right-[6%] w-40 h-40 bg-[#111] rounded-xl border-2 border-white/[0.08] shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center z-[1] animate-float-album opacity-[0.1] rotate-[5deg]" style={{ '--rot': '5deg', animationDelay: '2s', animationDuration: '7s' }}>
        <div className="w-3/4 h-3/4 rounded-full bg-[radial-gradient(circle_at_center,#1DB954_18%,transparent_19%),radial-gradient(circle_at_center,#1a1a1a_30%,transparent_31%),repeating-conic-gradient(from_0deg,rgba(40,40,40,0.9)_0deg_6deg,rgba(22,22,22,0.9)_6deg_12deg)] border-2 border-white/10 animate-vinyl-spin relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" style={{ animationDuration: '5s' }}>
          <div className="absolute inset-[15%] rounded-full border border-white/[0.04] shadow-[inset_0_0_0_4px_rgba(255,255,255,0.02),inset_0_0_0_8px_rgba(255,255,255,0.03)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22%] h-[22%] rounded-full bg-gradient-to-br from-[#1DB954] to-[#16a34a] shadow-[0_0_8px_rgba(29,185,84,0.5)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%] rounded-full bg-black" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-[12%] left-[28%] w-32 h-32 bg-[#111] rounded-xl border-2 border-white/[0.08] shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center z-[1] animate-float-album opacity-[0.08] rotate-[-3deg]" style={{ '--rot': '-3deg', animationDelay: '4s', animationDuration: '9s' }}>
        <div className="w-3/4 h-3/4 rounded-full bg-[radial-gradient(circle_at_center,#1DB954_18%,transparent_19%),radial-gradient(circle_at_center,#1a1a1a_30%,transparent_31%),repeating-conic-gradient(from_0deg,rgba(40,40,40,0.9)_0deg_6deg,rgba(22,22,22,0.9)_6deg_12deg)] border-2 border-white/10 animate-vinyl-spin relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" style={{ animationDuration: '3.5s' }}>
          <div className="absolute inset-[15%] rounded-full border border-white/[0.04] shadow-[inset_0_0_0_4px_rgba(255,255,255,0.02),inset_0_0_0_8px_rgba(255,255,255,0.03)]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22%] h-[22%] rounded-full bg-gradient-to-br from-[#1DB954] to-[#16a34a] shadow-[0_0_8px_rgba(29,185,84,0.5)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%] rounded-full bg-black" />
          </div>
        </div>
      </div>

      {/* Glow rings */}
      <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full z-[1] pointer-events-none bg-[radial-gradient(circle,rgba(29,185,84,0.08)_0%,transparent_70%)] animate-ring-breathe" />
      <div className="absolute top-[50%] right-[5%] w-[350px] h-[350px] rounded-full z-[1] pointer-events-none bg-[radial-gradient(circle,rgba(150,50,255,0.06)_0%,transparent_70%)] animate-ring-breathe" style={{ animationDelay: '2s', animationDuration: '7s' }} />
      <div className="absolute bottom-[5%] left-[25%] w-[300px] h-[300px] rounded-full z-[1] pointer-events-none bg-[radial-gradient(circle,rgba(255,50,100,0.06)_0%,transparent_70%)] animate-ring-breathe" style={{ animationDelay: '4s', animationDuration: '8s' }} />

      {/* Spotlights */}
      <div className="absolute top-0 left-[15%] w-1 h-[70vh] bg-gradient-to-b from-pink-500/30 to-transparent origin-top animate-spotlight-sway opacity-40 z-[1]" style={{ '--rot': '-15deg', transform: 'rotate(-15deg)' }} />
      <div className="absolute top-0 left-1/2 w-1 h-[60vh] bg-gradient-to-b from-green-500/25 to-transparent origin-top animate-spotlight-sway opacity-40 z-[1]" style={{ '--rot': '0deg', animationDelay: '2s' }} />
      <div className="absolute top-0 right-[15%] w-1 h-[70vh] bg-gradient-to-b from-purple-500/30 to-transparent origin-top animate-spotlight-sway opacity-40 z-[1]" style={{ '--rot': '15deg', transform: 'rotate(15deg)', animationDelay: '4s' }} />

      {/* EQ bars */}
      <div className="absolute top-[10%] left-[5%] flex gap-1 items-end opacity-[0.15] z-[1]">
        {[8,15,10,20,12].map((h, i) => (
          <div key={i} className="w-1.5 bg-gradient-to-t from-[#1DB954] to-[#1ed760] rounded-full animate-equalizer" style={{ height: `${h}px`, animationDuration: `${0.5 + i * 0.1}s` }} />
        ))}
      </div>
      <div className="absolute bottom-[15%] right-[6%] flex gap-1 items-end opacity-[0.15] z-[1]">
        {[10,18,8,22].map((h, i) => (
          <div key={i} className="w-1.5 bg-gradient-to-t from-[#1DB954] to-[#1ed760] rounded-full animate-equalizer" style={{ height: `${h}px`, animationDuration: `${0.6 + i * 0.1}s`, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>

      {/* Music notes */}
      <span className="absolute top-[20%] left-[20%] text-4xl opacity-[0.12] z-[1] animate-note-float">&#9835;</span>
      <span className="absolute top-[70%] left-[60%] text-3xl opacity-[0.12] z-[1] animate-note-float" style={{ animationDelay: '2s' }}>&#9834;</span>
      <span className="absolute top-[30%] right-[20%] text-5xl opacity-[0.12] z-[1] animate-note-float" style={{ animationDelay: '4s' }}>&#9833;</span>
      <span className="absolute bottom-[30%] left-[40%] text-2xl opacity-[0.12] z-[1] animate-note-float" style={{ animationDelay: '1s' }}>&#9839;</span>

      {/* Floating album covers */}
      <div className="absolute top-[8%] right-[15%] w-[140px] h-[140px] rounded-lg overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-2 border-white/[0.08] z-[1] animate-float-album opacity-25 rotate-[-8deg]" style={{ '--rot': '-8deg' }}>
        <img src="/albums/abbey-road.jpg" alt="Abbey Road" className="w-full h-full object-cover" />
      </div>
      <div className="absolute top-[60%] left-[8%] w-[120px] h-[120px] rounded-lg overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-2 border-white/[0.08] z-[1] animate-float-album opacity-20 rotate-[6deg]" style={{ '--rot': '6deg', animationDelay: '2s' }}>
        <img src="/albums/dark-side.jpg" alt="Dark Side of the Moon" className="w-full h-full object-cover" />
      </div>
      <div className="absolute bottom-[22%] right-[8%] w-[100px] h-[100px] rounded-lg overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-2 border-white/[0.08] z-[1] animate-float-album opacity-[0.18] rotate-[-4deg]" style={{ '--rot': '-4deg', animationDelay: '4s' }}>
        <img src="/albums/midnights.jpg" alt="Midnights" className="w-full h-full object-cover" />
      </div>
      <div className="absolute top-[35%] left-[4%] w-[110px] h-[110px] rounded-lg overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-2 border-white/[0.08] z-[1] animate-float-album opacity-[0.15] rotate-[10deg]" style={{ '--rot': '10deg', animationDelay: '1s' }}>
        <img src="/albums/ok-computer.jpg" alt="OK Computer" className="w-full h-full object-cover" />
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-green-500/10 to-transparent z-[1]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-6 backdrop-blur-xl bg-white/[0.03] border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Disc3 className="w-9 h-9 text-[#1DB954] animate-vinyl-spin" />
            <span className="text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Jammify</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-white/60 hover:text-white font-semibold text-sm transition-colors">Features</a>
            <a href="#how" className="text-white/60 hover:text-white font-semibold text-sm transition-colors">How it Works</a>
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-black font-extrabold px-6 py-2.5 rounded-full hover:shadow-[0_0_30px_rgba(29,185,84,0.4)] transition-all hover:-translate-y-0.5">
                Dashboard
              </button>
            ) : (
              <button onClick={handleLogin} className="bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-black font-extrabold px-6 py-2.5 rounded-full hover:shadow-[0_0_30px_rgba(29,185,84,0.4)] transition-all hover:-translate-y-0.5">
                Login with Spotify
              </button>
            )}
          </div>
        </nav>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/25 text-[#1DB954] text-sm font-bold mb-8">
            <span className="w-2 h-2 bg-[#1DB954] rounded-full animate-pulse" />
            12 people jamming right now
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white mb-6 leading-[1.05]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <span className="block">Step Into</span>
            <span className="block bg-gradient-to-r from-[#1DB954] via-[#1ed760] via-[#69f0ae] to-[#1DB954] bg-[length:200%_200%] animate-[gradShift_4s_ease-in-out_infinite] bg-clip-text text-transparent" style={{ animation: 'gradShift 4s ease-in-out infinite' }}>The Jam.</span>
          </h1>

          <p className="text-xl text-white/55 max-w-lg mx-auto mb-10 leading-relaxed">
            Real-time Spotify sessions with people who vibe to your music. Walk into the party, find your crowd, press play.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button onClick={handleLogin} className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] text-black font-extrabold text-lg shadow-[0_0_30px_rgba(29,185,84,0.35),0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_50px_rgba(29,185,84,0.5),0_8px_25px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 hover:scale-[1.03] transition-all">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
              Enter the Jam
            </button>
            <button className="inline-flex items-center gap-3 px-10 py-5 rounded-full border-2 border-white/20 text-white font-bold text-lg hover:border-white/50 hover:bg-white/5 hover:-translate-y-0.5 transition-all">
              Listen First
            </button>
          </div>
        </main>

        {/* Features */}
        <section id="features" className="relative z-10 px-8 py-24">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 text-center hover:-translate-y-2 transition-all duration-300 hover:border-[#1DB954]/30">
                <div className="w-16 h-16 bg-[#1DB954]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-[#1DB954]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Smart Matching</h3>
                <p className="text-white/50">Our algorithm analyzes your music taste to connect you with compatible listeners</p>
              </div>
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 text-center hover:-translate-y-2 transition-all duration-300 hover:border-[#1DB954]/30">
                <div className="w-16 h-16 bg-[#1DB954]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Radio className="w-8 h-8 text-[#1DB954]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-time Sessions</h3>
                <p className="text-white/50">Join live jam sessions and listen to music together with synchronized playback</p>
              </div>
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 text-center hover:-translate-y-2 transition-all duration-300 hover:border-[#1DB954]/30">
                <div className="w-16 h-16 bg-[#1DB954]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-[#1DB954]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Instant Discovery</h3>
                <p className="text-white/50">Discover new artists and genres through shared sessions with music enthusiasts</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how" className="relative z-10 px-8 py-24">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-12" style={{ fontFamily: "'Outfit', sans-serif" }}>How it Works</h2>
            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { step: '1', title: 'Connect Spotify', desc: 'Login with your Spotify account' },
                { step: '2', title: 'Find Matches', desc: 'We find users with similar taste' },
                { step: '3', title: 'Join Session', desc: 'Enter a jam room with your match' },
                { step: '4', title: 'Jam Together', desc: 'Listen and chat in real-time' },
              ].map((item, i) => (
                <div key={i} className="relative text-center">
                  <div className="w-12 h-12 bg-[#1DB954] text-black rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{item.step}</div>
                  <h4 className="font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-white/50">{item.desc}</p>
                  {i < 3 && <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-white/10 -translate-x-1/2" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/[0.06] py-10 backdrop-blur-xl bg-black/30">
          <div className="container mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-[#1DB954]" />
              <span className="text-lg font-bold text-white">Jammify</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Privacy</a>
              <a href="#" className="text-white/40 hover:text-white text-sm transition-colors">Terms</a>
              <a href="#" className="text-white/40 hover:text-[#1DB954] text-sm transition-colors">GitHub</a>
            </div>
            <p className="text-white/40 text-sm">Built with Spotify API</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
