# 🎵 Jammify

Find your jam. Connect with music lovers who share your taste and join real-time jam sessions on Spotify.

## Features

- **Spotify OAuth Login** - Connect with your Spotify account
- **Smart Matching** - Find users with similar music taste
- **Real-time Jam Sessions** - Listen together with synchronized playback
- **Live Chat** - Talk with your jam session participants
- **Queue Management** - Add and vote on tracks to play

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Radix UI
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Cache**: Redis
- **Real-time**: Socket.io
- **Auth**: Spotify OAuth 2.0

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (optional, for caching)
- Spotify Developer Account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jammify.git
   cd jammify
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your Spotify credentials and database URL
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

4. **Setup Database**
   ```bash
   # Create PostgreSQL database
   createdb jammify
   
   # Run schema
   cd backend
   npm run db:setup
   ```

5. **Get Spotify Credentials**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Add `http://localhost:3000/auth/callback` to Redirect URIs
   - Copy Client ID and Client Secret to `.env`

6. **Run the App**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

7. **Open** http://localhost:5173

## Environment Variables

### Backend (.env)

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/callback
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://user:pass@localhost:5432/jammify
REDIS_URL=redis://localhost:6379
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

## Project Structure

```
jammify/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── api/
│   │   └── styles/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   ├── server.js
│   └── package.json
│
└── database/
    └── schema.sql
```

## API Endpoints

### Auth
- `GET /auth/spotify` - Redirect to Spotify login
- `GET /auth/callback` - Handle OAuth callback

### User
- `GET /user/profile` - Get user profile
- `GET /user/top-artists` - Get top artists
- `GET /user/top-tracks` - Get top tracks

### Sessions
- `POST /session/create` - Create new session
- `GET /session/:code` - Get session details
- `POST /session/join` - Join a session
- `POST /session/leave` - Leave a session
- `GET /session/active` - Get active sessions

### Matching
- `GET /matches` - Get suggested matches

## Socket.io Events

### Client → Server
- `join-session(sessionCode)` - Join a jam room
- `leave-session(sessionCode)` - Leave a jam room
- `chat-message(sessionCode, message)` - Send chat message
- `add-to-queue(sessionCode, track)` - Add track to queue
- `play-track(sessionCode, trackId)` - Sync playback

### Server → Client
- `session-update(sessionData)` - Session state changed
- `new-message(message)` - New chat message
- `queue-updated(queue)` - Queue changed
- `participant-joined(user)` - User joined
- `participant-left(userId)` - User left

## License

MIT
