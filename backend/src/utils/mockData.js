// Mock data for development without Spotify Premium

export const mockUser = {
  id: 1,
  spotify_id: 'mock_user_123',
  display_name: 'Music Lover',
  email: 'musiclover@example.com',
  avatar_url: 'https://i.pravatar.cc/300?img=12',
  top_artists: [
    { id: '1', name: 'The Weeknd', image: 'https://i.scdn.co/image/ab6761610000e5eb6a224073987b930f85e2b945', genres: ['pop', 'r&b'], popularity: 95 },
    { id: '2', name: 'Dua Lipa', image: 'https://i.scdn.co/image/ab6761610000e5eb19a6ac185730e722fb060135', genres: ['pop', 'dance'], popularity: 92 },
    { id: '3', name: 'Travis Scott', image: 'https://i.scdn.co/image/ab6761610000e5ebb3d78e5d3647587d01a84646', genres: ['hip-hop', 'rap'], popularity: 90 },
    { id: '4', name: 'Arctic Monkeys', image: 'https://i.scdn.co/image/ab6761610000e5eb40a3b1c7d8a4f0ec9a4d3ad5', genres: ['rock', 'indie'], popularity: 88 },
    { id: '5', name: 'Daft Punk', image: 'https://i.scdn.co/image/ab6761610000e5eb152f43b0fbae1a8b4f3b2c2d', genres: ['electronic', 'dance'], popularity: 85 },
    { id: '6', name: 'Kendrick Lamar', image: 'https://i.scdn.co/image/ab6761610000e5ebe44e5e0dc9a0e97e1b82c8f2', genres: ['hip-hop', 'rap'], popularity: 91 },
    { id: '7', name: 'Billie Eilish', image: 'https://i.scdn.co/image/ab6761610000e5ebd8b9980db67272cb4d2c3daf', genres: ['pop', 'electronic'], popularity: 93 },
    { id: '8', name: 'Radiohead', image: 'https://i.scdn.co/image/ab6761610000e5eb4293385d429e42456c00a474', genres: ['rock', 'alternative'], popularity: 82 },
    { id: '9', name: 'Tame Impala', image: 'https://i.scdn.co/image/ab6761610000e5eb9495e7e67a260797e2d06eb8', genres: ['psychedelic', 'rock'], popularity: 80 },
    { id: '10', name: 'SZA', image: 'https://i.scdn.co/image/ab6761610000e5ebb34a22e384450d19e2c40e63', genres: ['r&b', 'pop'], popularity: 89 },
  ],
  top_genres: ['pop', 'hip-hop', 'rock', 'electronic', 'r&b', 'dance', 'indie', 'rap', 'alternative', 'psychedelic'],
  audio_features: {
    danceability: 0.72,
    energy: 0.68,
    valence: 0.55,
    acousticness: 0.25,
    instrumentalness: 0.15,
    tempo: 0.65,
  },
};

export const mockTopTracks = [
  { id: '1', name: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', album_art: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', duration_ms: 200040, popularity: 95 },
  { id: '2', name: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', album_art: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946', duration_ms: 203064, popularity: 90 },
  { id: '3', name: 'SICKO MODE', artist: 'Travis Scott', album: 'Astroworld', album_art: 'https://i.scdn.co/image/ab67616d0000b273e494ab864157be9c5f906f57', duration_ms: 312820, popularity: 88 },
  { id: '4', name: 'Do I Wanna Know?', artist: 'Arctic Monkeys', album: 'AM', album_art: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb22', duration_ms: 272373, popularity: 85 },
  { id: '5', name: 'Get Lucky', artist: 'Daft Punk', album: 'Random Access Memories', album_art: 'https://i.scdn.co/image/ab67616d0000b2731790c25c51c6f48c329c8e68', duration_ms: 369333, popularity: 82 },
  { id: '6', name: 'HUMBLE.', artist: 'Kendrick Lamar', album: 'DAMN.', album_art: 'https://i.scdn.co/image/ab67616d0000b273db4c77871c155c3b89bc0c85', duration_ms: 177000, popularity: 87 },
  { id: '7', name: 'bad guy', artist: 'Billie Eilish', album: 'WHEN WE ALL FALL ASLEEP', album_art: 'https://i.scdn.co/image/ab67616d0000b27350a3147b4edd7701a876c6d5', duration_ms: 194088, popularity: 92 },
  { id: '8', name: 'Creep', artist: 'Radiohead', album: 'Pablo Honey', album_art: 'https://i.scdn.co/image/ab67616d0000b27371d62ea7ea8a5be92d3c1f62', duration_ms: 238840, popularity: 78 },
  { id: '9', name: 'The Less I Know The Better', artist: 'Tame Impala', album: 'Currents', album_art: 'https://i.scdn.co/image/ab67616d0000b2730e7d39a4a9a7d80604290c54', duration_ms: 217893, popularity: 80 },
  { id: '10', name: 'Kill Bill', artist: 'SZA', album: 'SOS', album_art: 'https://i.scdn.co/image/ab67616d0000b2730c471c36970b9406233842a5', duration_ms: 153806, popularity: 91 },
];

export const mockMatches = [
  { id: 2, display_name: 'Beat Queen', avatar_url: 'https://i.pravatar.cc/300?img=25', match_score: 94, shared_genres: ['pop', 'r&b', 'electronic'] },
  { id: 3, display_name: 'Vinyl Vibes', avatar_url: 'https://i.pravatar.cc/300?img=32', match_score: 89, shared_genres: ['rock', 'indie', 'alternative'] },
  { id: 4, display_name: 'Bass Head', avatar_url: 'https://i.pravatar.cc/300?img=15', match_score: 85, shared_genres: ['hip-hop', 'rap', 'electronic'] },
  { id: 5, display_name: 'Melody Maker', avatar_url: 'https://i.pravatar.cc/300?img=41', match_score: 82, shared_genres: ['pop', 'dance'] },
  { id: 6, display_name: 'Groove Master', avatar_url: 'https://i.pravatar.cc/300?img=53', match_score: 78, shared_genres: ['r&b', 'hip-hop'] },
];

export const mockSessions = [
  {
    id: 1,
    session_code: 'ROCK01',
    name: 'Rock Revival',
    genre_focus: 'rock',
    participant_count: 3,
    host_name: 'Alex',
    is_active: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    session_code: 'JAZZ02',
    name: 'Jazz Fusion',
    genre_focus: 'jazz',
    participant_count: 2,
    host_name: 'Maya',
    is_active: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 3,
    session_code: 'POP003',
    name: 'Pop Party',
    genre_focus: 'pop',
    participant_count: 5,
    host_name: 'Jordan',
    is_active: true,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

export const mockSessionDetails = {
  session: {
    id: 1,
    session_code: 'ROCK01',
    name: 'Rock Revival',
    genre_focus: 'rock',
    host_id: 1,
    host_name: 'Music Lover',
    host_avatar: 'https://i.pravatar.cc/300?img=12',
    current_track_id: '4',
    queue: [
      { id: '4', name: 'Do I Wanna Know?', artist: 'Arctic Monkeys', album_art: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb22' },
      { id: '8', name: 'Creep', artist: 'Radiohead', album_art: 'https://i.scdn.co/image/ab67616d0000b27371d62ea7ea8a5be92d3c1f62' },
      { id: '9', name: 'The Less I Know The Better', artist: 'Tame Impala', album_art: 'https://i.scdn.co/image/ab67616d0000b2730e7d39a4a9a7d80604290c54' },
    ],
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  participants: [
    { id: 1, display_name: 'Music Lover', avatar_url: 'https://i.pravatar.cc/300?img=12', is_host: true },
    { id: 2, display_name: 'Beat Queen', avatar_url: 'https://i.pravatar.cc/300?img=25', is_host: false },
    { id: 3, display_name: 'Vinyl Vibes', avatar_url: 'https://i.pravatar.cc/300?img=32', is_host: false },
  ],
};
