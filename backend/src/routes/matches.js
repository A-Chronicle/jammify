import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import matchingService from '../services/matching.js'

const router = express.Router()

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 5 } = req.query

    const matches = await matchingService.findMatches(
      req.user.id,
      parseInt(limit)
    )

    res.json(matches)
  } catch (error) {
    console.error('Get matches error:', error)
    res.json([])
  }
})

export default router
