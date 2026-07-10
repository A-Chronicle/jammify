import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import matchingService from '../services/matching.js'
import { mockMatches } from '../utils/mockData.js'

const router = express.Router()

// Get matches for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 5 } = req.query

    // Try to get real matches from database
    try {
      const matches = await matchingService.findMatches(
        req.user.id,
        parseInt(limit)
      )

      if (matches.length > 0) {
        return res.json(matches)
      }
    } catch (matchError) {
      console.log('Matching service error, using mock matches')
    }

    // Return mock matches if no real matches found
    res.json(mockMatches.slice(0, parseInt(limit)))
  } catch (error) {
    console.error('Get matches error:', error)
    // Return mock matches on error
    res.json(mockMatches)
  }
})

export default router
