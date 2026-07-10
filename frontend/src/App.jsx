import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import JamRoom from './pages/JamRoom'
import Profile from './pages/Profile'
import Callback from './pages/Callback'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  const token = localStorage.getItem('jammify_token')
  
  if (isAuthenticated) return children
  if (token) return children // Trust the token, fetch will validate
  return <Navigate to="/" replace />
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream-100 bg-noise">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/callback" element={<Callback />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jam/:sessionCode" 
            element={
              <ProtectedRoute>
                <JamRoom />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
