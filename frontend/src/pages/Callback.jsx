import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api/client'
import { Disc3 } from 'lucide-react'

export default function Callback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      console.error('Auth error:', error)
      navigate('/')
      return
    }

    if (token) {
      // Token received from backend — fetch user profile
      localStorage.setItem('jammify_token', token)
      fetchUser(token)
    } else {
      navigate('/')
    }
  }, [searchParams])

  const fetchUser = async (token) => {
    try {
      const response = await authAPI.getMe()
      login(response.data, token)
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to fetch user:', error)
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <Disc3 className="w-12 h-12 text-spotify-500" />
        </div>
        <p className="text-gray-600">Connecting with Spotify...</p>
      </div>
    </div>
  )
}
