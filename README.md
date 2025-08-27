# 3D Snakes & Ladders (Three.js)

A browser-based 3D Snakes & Ladders built with Three.js and CDNs. No build tools required. Includes basic single/local play, stubbed online hooks, optional Firebase Auth + Firestore leaderboard, and PWA support for offline play.

## Features
- 3D board with lighting and orbit controls
- Snakes and ladders mapping, dice roll, tweened piece movement
- Single/local multiplayer turns (hot-seat)
- Leaderboard with Firebase (fallback to localStorage when offline)
- Socket.io client stub (ready for server integration)
- PWA: manifest + service worker (offline core assets)

## Quick Start (local / Codespaces)
```bash
cd 3d-snakes-ladders
python3 -m http.server 5173 --bind 0.0.0.0
```
Open the forwarded URL (or http://127.0.0.1:5173 locally). Click “Single Player” then “Roll Dice”.

## Firebase (optional)
1) Enable Auth and Firestore in Firebase Console. 2) Paste your config in the browser console:
```js
initFirebase({
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
});
```
Click Login (anonymous). Wins will be recorded to Firestore collection `leaderboard`.

## Online (Socket.io stub)
Client code initializes `window.net` if Socket.io connects. You can wire a Node server later to handle rooms/turn sync.

## PWA
- Files: `manifest.json`, `service-worker.js`.
- To force refresh after changes, bump `CACHE_NAME` in `service-worker.js` or unregister via DevTools > Application > Service Workers.

## Deployment (GitHub Pages)
This repo includes a GitHub Actions workflow to deploy on pushes to `main`.
- Settings → Pages → Source: GitHub Actions
- After a successful run, your site is available at:
  `https://<your-username>.github.io/<repo>/`

## Project Structure
```
3d-snakes-ladders/
  app.js              # Game logic, scene, movement, Firebase/socket stubs
  index.html          # Canvas + HUD overlays, library CDNs
  styles.css          # UI overlays and layout
  manifest.json       # PWA manifest
  service-worker.js   # Offline caching of core files
```

## Roadmap
- Board model + textures, audio cues
- AI bots (easy/hard)
- Real-time online mode with rooms and reconnection
- Mobile polish and accessibility

## License
MIT