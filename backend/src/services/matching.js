import { pool } from '../utils/db.js'

class MatchingService {
  // Calculate similarity score between two users
  calculateSimilarity(user1, user2) {
    if (!user1.audio_features || !user2.audio_features) {
      return 0
    }

    const weights = {
      danceability: 0.2,
      energy: 0.25,
      valence: 0.2,
      acousticness: 0.15,
      instrumentalness: 0.1,
      tempo: 0.1,
    }

    let score = 0
    for (const [feature, weight] of Object.entries(weights)) {
      const val1 = user1.audio_features[feature] || 0
      const val2 = user2.audio_features[feature] || 0
      const diff = Math.abs(val1 - val2)
      score += (1 - diff) * weight
    }

    return score
  }

  // Calculate genre overlap using Jaccard index
  calculateGenreOverlap(genres1, genres2) {
    if (!genres1 || !genres2 || genres1.length === 0 || genres2.length === 0) {
      return 0
    }

    const set1 = new Set(genres1)
    const set2 = new Set(genres2)
    
    const intersection = [...set1].filter((x) => set2.has(x))
    const union = new Set([...set1, ...set2])

    return intersection.length / union.size
  }

  // Find matches for a user
  async findMatches(userId, limit = 10) {
    // Get current user
    const currentUser = await pool.query(
      'SELECT id, audio_features, top_genres FROM users WHERE id = $1',
      [userId]
    )

    if (currentUser.rows.length === 0 || !currentUser.rows[0].audio_features) {
      return []
    }

    const user = currentUser.rows[0]

    // Get all other users with audio features
    const otherUsers = await pool.query(
      'SELECT id, display_name, avatar_url, audio_features, top_genres FROM users WHERE id != $1 AND audio_features IS NOT NULL',
      [userId]
    )

    // Calculate similarity scores
    const matches = otherUsers.rows.map((other) => {
      const audioSimilarity = this.calculateSimilarity(user, other)
      const genreOverlap = this.calculateGenreOverlap(user.top_genres, other.top_genres)
      
      // Combined score (70% audio features, 30% genre overlap)
      const matchScore = (audioSimilarity * 0.7 + genreOverlap * 0.3) * 100

      // Find shared genres
      const sharedGenres = user.top_genres.filter((g) => other.top_genres.includes(g))

      return {
        id: other.id,
        display_name: other.display_name,
        avatar_url: other.avatar_url,
        match_score: Math.round(matchScore),
        shared_genres: sharedGenres,
        audio_similarity: audioSimilarity,
        genre_overlap: genreOverlap,
      }
    })

    // Sort by match score and return top matches
    matches.sort((a, b) => b.match_score - a.match_score)
    return matches.slice(0, limit)
  }
}

export default new MatchingService()
