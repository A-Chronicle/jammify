import express from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../utils/db.js'
import spotifyService from '../services/spotify.js'
import { mockUser } from '../utils/mockData.js'

const router = express.Router()

router.get('/spotify', (req, res) => {
  const authUrl = spotifyService.getAuthUrl()
  res.redirect(authUrl)
})

router.get('/callback', async (req, res) => {
  const { code, error } = req.query
  console.log('Callback received, code:', code ? 'present' : 'missing', 'error:', error)

  if (error) {
    console.log('Spotify returned error:', error)
    return res.redirect(`${process.env.FRONTEND_URL}?error=${error}`)
  }

  if (!code) {
    console.log('No code provided')
    return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`)
  }

  let tokens
  try {
    tokens = await spotifyService.exchangeCode(code)
    console.log('Token exchange successful')
  } catch (err) {
    console.log('Token exchange failed:', err.response?.data || err.message)
    return res.redirect(`${process.env.FRONTEND_URL}?error=token_exchange_failed`)
  }

  const { access_token, refresh_token, expires_in } = tokens

  let spotifyUser, topArtists, genres, audioFeatures

  try {
    spotifyUser = await spotifyService.getUserProfile(access_token)
    console.log('Got Spotify profile:', spotifyUser.display_name)
    topArtists = await spotifyService.getTopArtists(access_token, 10)
    genres = await spotifyService.getUserGenres(access_token)
    audioFeatures = await spotifyService.calculateUserAudioProfile(access_token)
  } catch (err) {
    console.log('Spotify API failed, using mock data:', err.response?.status)
    spotifyUser = {
      id: 'mock_' + Date.now(),
      display_name: mockUser.display_name,
      email: mockUser.email,
      images: [{ url: mockUser.avatar_url }],
    }
    topArtists = mockUser.top_artists
    genres = mockUser.top_genres
    audioFeatures = mockUser.audio_features
  }

  try {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE spotify_id = $1',
      [spotifyUser.id]
    )

    let userId

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id
      await pool.query(
        `UPDATE users SET display_name=$1, email=$2, avatar_url=$3, access_token=$4, refresh_token=$5, token_expires_at=$6, top_artists=$7, top_genres=$8, audio_features=$9, updated_at=CURRENT_TIMESTAMP WHERE id=$10`,
        [
          spotifyUser.display_name,
          spotifyUser.email,
          spotifyUser.images?.[0]?.url || mockUser.avatar_url,
          access_token,
          refresh_token,
          new Date(Date.now() + expires_in * 1000),
          JSON.stringify(topArtists.map(a => ({
            id: a.id, name: a.name,
            image: a.images?.[0]?.url || a.image,
            genres: a.genres, popularity: a.popularity,
          }))),
          JSON.stringify(genres),
          JSON.stringify(audioFeatures),
          userId,
        ]
      )
      console.log('Updated user:', userId)
    } else {
      const result = await pool.query(
        `INSERT INTO users (spotify_id, display_name, email, avatar_url, access_token, refresh_token, token_expires_at, top_artists, top_genres, audio_features) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [
          spotifyUser.id,
          spotifyUser.display_name,
          spotifyUser.email,
          spotifyUser.images?.[0]?.url || mockUser.avatar_url,
          access_token,
          refresh_token,
          new Date(Date.now() + expires_in * 1000),
          JSON.stringify(topArtists.map(a => ({
            id: a.id, name: a.name,
            image: a.images?.[0]?.url || a.image,
            genres: a.genres, popularity: a.popularity,
          }))),
          JSON.stringify(genres),
          JSON.stringify(audioFeatures),
        ]
      )
      userId = result.rows[0].id
      console.log('Created user:', userId)
    }

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
    console.log('JWT created, redirecting to dashboard')

    res.redirect(`${process.env.FRONTEND_URL}/callback?token=${token}`)
  } catch (err) {
    console.log('Database error:', err.message)
    return res.redirect(`${process.env.FRONTEND_URL}?error=db_error`)
  }
})

router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ error: 'Token required' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const result = await pool.query(
      'SELECT id, display_name, email, avatar_url, top_artists, top_genres, audio_features FROM users WHERE id = $1',
      [decoded.userId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    res.json(result.rows[0])
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
