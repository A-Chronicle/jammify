# Jammify Design System



## Color Palette

### Primary Colors (Spotify-Inspired)
```css
:root {
  /* Spotify Green (Primary) */
  --green-50: #f0fdf4;
  --green-100: #dcfce7;
  --green-200: #bbf7d0;
  --green-300: #86efac;
  --green-400: #4ade80;
  --green-500: #1DB954; /* Spotify Green */
  --green-600: #16a34a;
  --green-700: #15803d;
  --green-800: #166534;
  --green-900: #14532d;

  /* Warm Background (from Echosphere) */
  --bg-primary: #F9F7F5; /* Off-white/cream */
  --bg-gradient: radial-gradient(circle, #E8F5E9, #F1F8E9, #FAFAFA);
  
  /* Accent Colors */
  --accent-orange: #FF4500; /* Warm accent for highlights */
  --accent-purple: #8B5CF6; /* For music notes/elements */
  --accent-blue: #3B82F6; /* For links/interactive */
  
  /* Text Colors */
  --text-primary: #1a1a1a;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
}
```

### Glassmorphism Effects
```css
/* Semi-transparent cards */
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

/* Dark glass variant */
.glass-card-dark {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
```

## Typography

### Font Family
```css
@import url("https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap");

:root {
  --font-sans: "Nunito", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

### Type Scale
```css
/* Display headings */
.text-display {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* Section headings */
.text-heading {
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

/* Body text */
.text-body {
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
}

/* Small text */
.text-small {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
}
```

## Animations

### Music-Themed Animations
```css
/* Vinyl record spin */
@keyframes vinyl-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-vinyl {
  animation: vinyl-spin 3s linear infinite;
}

/* Equalizer bars */
@keyframes equalizer {
  0%, 100% { height: 4px; }
  50% { height: 20px; }
}

.equalizer-bar {
  animation: equalizer 0.8s ease-in-out infinite;
}

.equalizer-bar:nth-child(2) { animation-delay: 0.1s; }
.equalizer-bar:nth-child(3) { animation-delay: 0.2s; }
.equalizer-bar:nth-child(4) { animation-delay: 0.3s; }

/* Float animation (from Echosphere) */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

/* Glow pulse (music themed) */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(29, 185, 84, 0.3); }
  50% { box-shadow: 0 0 40px rgba(29, 185, 84, 0.6); }
}

.animate-glow {
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Music note bounce */
@keyframes note-bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(-5deg); }
  75% { transform: translateY(-5px) rotate(5deg); }
}

.animate-note {
  animation: note-bounce 2s ease-in-out infinite;
}
```

## Component Patterns

### Buttons
```css
/* Primary button (Spotify green) */
.btn-primary {
  background: #1DB954;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px 0 rgba(29, 185, 84, 0.4);
}

.btn-primary:hover {
  background: #1ed760;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(29, 185, 84, 0.5);
}

/* Secondary button */
.btn-secondary {
  background: transparent;
  color: #1DB954;
  border: 2px solid #1DB954;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(29, 185, 84, 0.1);
}
```

### Cards
```css
/* Session card */
.session-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.session-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: rgba(29, 185, 84, 0.3);
}

/* User avatar */
.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid #1DB954;
  box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.2);
}
```

### Forms
```css
/* Input field */
.input-field {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: #1DB954;
  box-shadow: 0 0 0 3px rgba(29, 185, 84, 0.1);
}
```

## Layout Patterns

### Container
```css
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { padding: 0 1.5rem; }
}

@media (min-width: 1024px) {
  .container { padding: 0 2rem; }
}
```

### Grid System
```css
/* Responsive grid */
.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }

@media (min-width: 768px) {
  .md:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .lg:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .lg:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}
```

## Spacing System

### Padding & Margin
```css
/* Consistent spacing scale */
.spacing-xs { padding: 0.25rem; }   /* 4px */
.spacing-sm { padding: 0.5rem; }    /* 8px */
.spacing-md { padding: 1rem; }      /* 16px */
.spacing-lg { padding: 1.5rem; }    /* 24px */
.spacing-xl { padding: 2rem; }      /* 32px */
.spacing-2xl { padding: 3rem; }     /* 48px */
```

### Gap
```css
/* Flex/Grid gaps */
.gap-xs { gap: 0.25rem; }
.gap-sm { gap: 0.5rem; }
.gap-md { gap: 1rem; }
.gap-lg { gap: 1.5rem; }
.gap-xl { gap: 2rem; }
```

## Shadows

### Elevation System
```css
/* Shadow levels */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

/* Spotify glow shadow */
.shadow-spotify {
  box-shadow: 0 4px 14px 0 rgba(29, 185, 84, 0.4);
}
```

## Transitions

### Transition Classes
```css
/* Base transition */
.transition {
  transition-property: color, background-color, border-color, 
                      box-shadow, transform, opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Slow transition */
.transition-slow {
  transition-duration: 300ms;
}

/* Fast transition */
.transition-fast {
  transition-duration: 100ms;
}
```

## Responsive Design

### Breakpoints
```css
/* Mobile first approach */
/* Base: Mobile (0-639px) */
/* sm: Tablet (640px+) */
/* md: Small desktop (768px+) */
/* lg: Desktop (1024px+) */
/* xl: Large desktop (1280px+) */
```

## Accessibility

### Focus States
```css
/* Focus ring */
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(29, 185, 84, 0.5);
}

/* Skip to main content */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #1DB954;
  color: white;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

## Dark Mode Support

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #121212;
    --bg-secondary: #1e1e1e;
    --text-primary: #ffffff;
    --text-secondary: #b3b3b3;
  }

  .glass-card {
    background: rgba(30, 30, 30, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }
}
```

## Usage Examples

### Landing Page Hero
```html
<section class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
  <div class="absolute inset-0 bg-[url('/noise.svg')] opacity-5"></div>
  
  <div class="container text-center relative z-10">
    <h1 class="text-display text-gray-900 mb-6">
      Find Your <span class="text-[#1DB954]">Jam</span>
    </h1>
    <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
      Connect with music lovers who share your taste. Join real-time jam sessions on Spotify.
    </p>
    <button class="btn-primary text-lg">
      Start Jamming
    </button>
  </div>
  
  <!-- Floating music notes -->
  <div class="absolute top-1/4 left-1/4 animate-note text-4xl">♪</div>
  <div class="absolute top-1/3 right-1/4 animate-note text-3xl" style="animation-delay: 0.5s">♫</div>
</section>
```

### Session Card
```html
<div class="session-card">
  <div class="flex items-center gap-4 mb-4">
    <img src="/avatar.jpg" alt="Host" class="user-avatar" />
    <div>
      <h3 class="font-semibold text-gray-900">Rock Revival</h3>
      <p class="text-sm text-gray-500">Hosted by Alex</p>
    </div>
  </div>
  
  <div class="flex items-center gap-2 mb-4">
    <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
      Rock
    </span>
    <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
      3 listeners
    </span>
  </div>
  
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      <span class="text-sm text-gray-600">Now Playing</span>
    </div>
    <button class="btn-primary text-sm px-4 py-2">
      Join Session
    </button>
  </div>
</div>
```

This design system captures Echosphere's clean, modern aesthetic while adapting it for a music-focused application with Spotify's green color scheme and music-themed animations.
