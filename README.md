# 🎲 3D Snakes & Ladders

A modern, web-compatible 3D implementation of the classic Snakes and Ladders board game built with Three.js.

![Game Preview](./assets/preview.png)

## ✨ Features

- **3D Board**: Fully 3D rendered game board with realistic lighting and shadows
- **Smooth Animations**: Fluid player movement and camera controls using Tween.js
- **Multiple Game Modes**: Single player, local multiplayer, and online multiplayer (planned)
- **Responsive Design**: Works on desktop and mobile devices
- **PWA Support**: Installable as a progressive web app
- **Modern Architecture**: Modular, maintainable codebase with ES6 modules
- **Error Handling**: Robust error handling with user-friendly messages

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Modern web browser with WebGL support

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 3d-snakes-ladders
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Alternative: Simple HTTP Server

If you prefer not to use Vite:

```bash
npm run serve
```

Then open `http://localhost:3000`

## 🎮 How to Play

1. **Choose Game Mode**: Select Single Player, Local Multiplayer, or Online Match
2. **Roll Dice**: Click the "Roll Dice" button or press Spacebar
3. **Move Pieces**: Watch your piece move along the 3D board
4. **Navigate Snakes & Ladders**: Get boosted by ladders or slide down snakes
5. **Win Condition**: First player to reach square 100 wins!

### Controls

- **Mouse**: Orbit camera around the board
- **Spacebar**: Roll dice
- **Enter**: End turn
- **Escape**: Return to main menu

## 🏗️ Project Structure

```
3d-snakes-ladders/
├── src/
│   ├── core/           # Core game engine
│   │   ├── Game.js     # Main game orchestrator
│   │   └── SceneManager.js # Three.js scene management
│   ├── game/           # Game-specific logic
│   │   ├── GameState.js # Game state and rules
│   │   ├── Board.js    # 3D board generation
│   │   └── PlayerManager.js # Player pieces and movement
│   ├── ui/             # User interface
│   │   ├── UIManager.js # UI state management
│   │   └── InputManager.js # Input handling
│   ├── utils/          # Utilities
│   │   └── ErrorHandler.js # Error handling system
│   ├── main.js         # Application entry point
│   └── styles.css      # Global styles
├── public/             # Static assets
├── index.html          # Main HTML file
├── package.json        # Dependencies and scripts
├── vite.config.js      # Build configuration
└── README.md           # This file
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run serve` - Start simple HTTP server

### Architecture Overview

The game follows a modular architecture with clear separation of concerns:

- **Core Layer**: Game engine and Three.js scene management
- **Game Layer**: Game-specific logic, rules, and state
- **UI Layer**: User interface and input handling
- **Utils Layer**: Shared utilities and error handling

### Key Classes

- `Game`: Main orchestrator managing game lifecycle
- `SceneManager`: Three.js scene, camera, and rendering
- `GameState`: Game rules, state, and statistics
- `Board`: 3D board generation and path finding
- `PlayerManager`: Player pieces, animations, and movement
- `UIManager`: UI state and user interactions
- `InputManager`: Keyboard, mouse, and touch input
- `ErrorHandler`: Global error handling and user feedback

## 🎨 Customization

### Board Configuration

Edit `src/game/Board.js` to customize:
- Board size and layout
- Snake and ladder positions
- Visual materials and colors

### Game Rules

Modify `src/game/GameState.js` to change:
- Win conditions
- Movement rules
- Special square behaviors

### UI Styling

Update `src/styles.css` for:
- Color schemes
- Layout adjustments
- Responsive breakpoints

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Requires WebGL support for 3D rendering.

## 📱 Progressive Web App

The game includes PWA features:
- Installable on mobile devices
- Offline-capable (with limitations)
- Responsive design for all screen sizes

## 🐛 Troubleshooting

### Common Issues

**Game doesn't load:**
- Check browser console for errors
- Ensure WebGL is enabled
- Try refreshing the page

**Poor performance:**
- Reduce browser window size
- Close other tabs/applications
- Update graphics drivers

**Buttons not working:**
- Check browser console for JavaScript errors
- Ensure all dependencies loaded properly
- Try refreshing the page

### Development Tips

- Use browser dev tools for debugging
- Check the console for detailed error messages
- The game includes comprehensive error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Three.js](https://threejs.org/)
- Animations powered by [Tween.js](https://github.com/tweenjs/tween.js)
- Inspired by the classic Snakes and Ladders board game

---

**Enjoy playing 3D Snakes & Ladders!** 🎉