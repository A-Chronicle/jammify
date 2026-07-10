# Jammify - Project Plan

## Overview
Jammify is a web app that connects users for real-time Spotify jamming sessions based on similar music taste. Users log in with Spotify, get matched with compatible listeners, and join synchronized listening rooms.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite + Tailwind)   │
│  • Auth Page (Spotify OAuth)                           │
│  • Dashboard (Find matches, active sessions)           │
│  • Jam Room (Real-time chat + synchronized playback)   │
│  • Profile (Top artists, listening history)            │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API + WebSocket
                        ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js + Express)             │
│  10 Stateless Endpoints:                               │
│  • POST /auth/spotify - OAuth login                    │
│  • GET /auth/callback - OAuth callback                 │
│  • GET /user/profile - Get user profile                │
│  • GET /user/top-artists - Fetch top artists           │
│  • POST /session/create - Create jam session           │
│  • GET /session/:id - Get session details              │
│  • POST /session/join - Join a session                 │
│  • POST /session/leave - Leave session                 │
│  • GET /matches - Find similar users                   │
│  • POST /session/queue - Add/remove from queue         │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Spotify    │ │  PostgreSQL  │ │    Redis     │
│   OAuth +    │ │  (Users,     │ │  (Sessions,  │
│   Web API    │ │  Sessions)   │ │  Cache)      │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | UI framework |
| Styling | Tailwind CSS + Radix UI | Clean, accessible design |
| State | Zustand | Lightweight state management |
| Backend | Node.js + Express | REST API server |
| Real-time | Socket.io | WebSocket for live sync |
| Database | PostgreSQL | Persistent user/session data |
| Cache | Redis | Session state, rate limiting |
| Auth | Spotify OAuth 2.0 | Login + music data access |
| API | Spotify Web API | Top artists, playback control |
| Deploy | Vercel (FE) + Railway (BE) | Free hosting |

## Database Schema

### users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  spotify_id VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  email VARCHAR(255),
  avatar_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  top_artists JSONB, -- cached top artists
  top_genres JSONB, -- cached genres
  audio_features JSONB, -- avg listening profile
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### jam_sessions
```sql
CREATE TABLE jam_sessions (
  id SERIAL PRIMARY KEY,
  host_id INTEGER REFERENCES users(id),
  session_code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255),
  genre_focus VARCHAR(100),
  max_participants INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  current_track_id VARCHAR(255),
  queue JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### session_participants
```sql
CREATE TABLE session_participants (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES jam_sessions(id),
  user_id INTEGER REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_host BOOLEAN DEFAULT false
);
```

## Matching Algorithm

### Spotify Audio Features
Spotify provides audio features for tracks:
- `danceability` (0-1)
- `energy` (0-1)
- `valence` (0-1, musical positiveness)
- `acousticness` (0-1)
- `instrumentalness` (0-1)
- `tempo` (BPM)

### Similarity Score
```javascript
function calculateSimilarity(user1Features, user2Features) {
  const weights = {
    danceability: 0.2,
    energy: 0.25,
    valence: 0.2,
    acousticness: 0.15,
    instrumentalness: 0.1,
    tempo: 0.1
  };
  
  let score = 0;
  for (const [feature, weight] of Object.entries(weights)) {
    const diff = Math.abs(user1Features[feature] - user2Features[feature]);
    score += (1 - diff) * weight;
  }
  return score; // 0-1, higher = more similar
}
```

### Genre Matching
```javascript
function genreOverlapScore(genres1, genres2) {
  const set1 = new Set(genres1);
  const set2 = new Set(genres2);
  const intersection = [...set1].filter(x => set2.has(x));
  const union = new Set([...set1, ...set2]);
  return intersection.length / union.size; // Jaccard index
}
```

## Frontend Pages

### 1. Landing Page
- Hero section with "Join a Jam Session"
- Login with Spotify button
- How it works section

### 2. Dashboard
- Active jam sessions list
- "Find Matches" button
- User's top artists display
- Quick join by session code

### 3. Jam Room
- Now playing track with album art
- Participant avatars
- Real-time chat
- Queue management (add/remove tracks)
- Leave session button

### 4. Profile
- Top 5 artists with images
- Listening statistics
- Session history

## Backend Endpoints

### Auth
```
POST /auth/spotify
  → Redirects to Spotify OAuth

GET /auth/callback?code=xxx
  → Exchanges code for tokens
  → Creates/updates user
  → Returns JWT session token
```

### User
```
GET /user/profile
  → Headers: Authorization: Bearer <token>
  → Returns user profile + cached top artists

GET /user/top-artists?limit=10&time_range=medium_term
  → Fetches fresh top artists from Spotify
  → Updates cache
```

### Sessions
```
POST /session/create
  → Body: { name, genre_focus }
  → Creates session, returns session_code

GET /session/:code
  → Returns session details + participants

POST /session/join
  → Body: { session_code }
  → Adds user to session

POST /session/leave
  → Body: { session_id }
  → Removes user from session
```

### Matching
```
GET /matches?limit=5
  → Returns top similar users
  → Based on audio features + genre overlap
```

### Queue
```
POST /session/queue/add
  → Body: { session_id, track_id }
  → Adds track to queue (host only)

POST /session/queue/remove
  → Body: { session_id, track_index }
  → Removes track from queue
```

## Real-time Events (Socket.io)

### Client → Server
- `join-session(sessionCode)` - Join a jam room
- `leave-session(sessionCode)` - Leave a jam room
- `chat-message(sessionCode, message)` - Send chat
- `add-to-queue(sessionCode, track)` - Add track
- `play-track(sessionCode, trackId)` - Sync playback

### Server → Client
- `session-update(sessionData)` - Session state changed
- `new-message(message)` - New chat message
- `queue-updated(queue)` - Queue changed
- `participant-joined(user)` - User joined
- `participant-left(user)` - User left

## Spotify Integration Flow

### OAuth Flow
```
1. User clicks "Login with Spotify"
2. Redirect to: https://accounts.spotify.com/authorize
   → client_id
   → response_type=code
   → redirect_uri
   → scope=user-read-playback-state user-modify-playback-state
         user-top-read user-read-recently-played
3. User approves → redirects back with code
4. Backend exchanges code for access_token + refresh_token
5. Backend fetches user profile + top artists
6. Store in PostgreSQL, return JWT to frontend
```

### Fetching Top Artists
```
GET https://api.spotify.com/v1/me/top/artists
  → Headers: Authorization: Bearer <access_token>
  → Query: limit=10, time_range=medium_term
  → Returns: artist data with genres
```

### Audio Features
```
GET https://api.spotify.com/v1/audio-features/{id}
  → Returns: danceability, energy, valence, etc.
  → Average across user's top tracks for profile
```

## Project Structure

```
jammify/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── JamRoom/
│   │   │   └── Profile/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── api/
│   │   └── utils/
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── user.js
│   │   │   ├── session.js
│   │   │   └── matches.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── services/
│   │   │   ├── spotify.js
│   │   │   └── matching.js
│   │   ├── models/
│   │   └── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── database/
│   └── schema.sql
│
└── README.md
```

## Environment Variables

### Backend (.env)
```
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx
SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/callback
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5432/jammify
REDIS_URL=redis://localhost:6379
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

## Implementation Order

### Phase 1: Foundation
1. Setup project structure
2. Configure Vite + Tailwind
3. Setup Express server
4. Create PostgreSQL schema
5. Connect to Redis

### Phase 2: Auth
1. Implement Spotify OAuth flow
2. Create JWT authentication
3. Build auth middleware
4. Test login/logout

### Phase 3: Core Features
1. User profile endpoint
2. Top artists fetching
3. Matching algorithm
4. Session CRUD

### Phase 4: Real-time
1. Socket.io setup
2. Session room functionality
3. Chat system
4. Queue management

### Phase 5: Frontend
1. Landing page
2. Dashboard
3. Jam room UI
4. Profile page

## Spotify API Scopes Required

```
user-read-playback-state
user-modify-playback-state
user-top-read
user-read-recently-played
playlist-modify-public
playlist-modify-private
```

## Cost Estimate (Free Tier)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Vercel | 100GB bandwidth | Frontend hosting |
| Railway | $5 credit/month | Backend hosting |
| Supabase | 500MB database | PostgreSQL |
| Redis Cloud | 30MB | Session cache |
| Spotify API | Free | No cost for API |

**Total: $0/month for MVP**
