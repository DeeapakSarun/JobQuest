# Job Quest: Corporate Tower Edition

A challenging 2D platformer game built with React and TypeScript that satirizes the modern job search experience. Navigate through 25 increasingly difficult levels of corporate challenges, avoiding rejection emails and bureaucratic obstacles while climbing the corporate tower.

## 🎮 Live Demo

**Play the game:** [https://verdant-platypus-7f210b.netlify.app](https://verdant-platypus-7f210b.netlify.app)

## 🎯 Game Overview

Job Quest puts you in the shoes of a job seeker navigating the treacherous corporate landscape. Each level represents a different floor of the corporate tower, with unique challenges and obstacles that mirror real-world job hunting frustrations.

### Features

- **25 Unique Levels**: Each with distinct mechanics and challenges
- **Progressive Difficulty**: From simple platforming to complex obstacle courses
- **Satirical Theme**: Rejection emails, corporate buzzwords, and bureaucratic nightmares
- **Smooth Gameplay**: 60 FPS canvas-based rendering with pixel-perfect collision detection
- **Audio System**: Procedurally generated sound effects and background music
- **Save System**: Continue your progress from where you left off
- **Responsive Design**: Optimized for different screen sizes

### Level Themes

- **Vanishing Opportunities** - Platforms that disappear when you step on them
- **Backwards Thinking** - Reversed controls challenge
- **Upside Down World** - Gravity-defying mechanics
- **Mirage Markets** - Fake job postings that vanish
- **Chaos Theory** - Randomly moving platforms
- **Digital Pursuit** - Fast-moving email obstacles
- **Portal Nexus** - Teleportation mechanics
- **Final Boss Chamber** - Ultimate corporate challenge

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd job-quest-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎮 How to Play

### Controls

- **Arrow Keys (← →)**: Move left and right
- **Up Arrow (↑) or Spacebar**: Jump
- **Escape**: Quit to main menu

### Objective

Navigate through each level to reach the building entrance (goal). Avoid obstacles like rejection emails, corporate traps, and bureaucratic barriers. Each level has unique mechanics that challenge different aspects of platforming skills.

### Game Mechanics

- **Collision Detection**: Pixel-perfect collision system
- **Physics**: Realistic gravity and momentum
- **Animation**: Smooth character animations with sprite-based rendering
- **Particle Effects**: Visual feedback for interactions
- **Progressive Difficulty**: Each level introduces new challenges

## 🛠️ Technical Architecture

### Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Canvas Rendering**: HTML5 Canvas API
- **Audio**: Web Audio API with procedural sound generation

### Project Structure

```
src/
├── components/           # React components
│   ├── GameCanvas.tsx   # Main game rendering component
│   ├── GameUI.tsx       # Game interface and HUD
│   ├── JobQuestGame.tsx # Main game controller
│   └── MenuScreen.tsx   # Main menu and navigation
├── types/               # TypeScript type definitions
│   └── game.ts         # Game-related interfaces
├── utils/              # Utility classes and functions
│   ├── AudioManager.ts # Audio system management
│   └── GameEngine.ts   # Core game logic and physics
├── assets/             # Game assets (sprites, images)
└── styles/             # CSS and styling files
```

### Key Components

#### GameEngine
The core game engine handles:
- Physics simulation and collision detection
- Level generation and obstacle management
- Player movement and animation
- Rendering pipeline optimization

#### AudioManager
Manages all audio functionality:
- Procedural sound effect generation
- Background music system
- Volume and mute controls
- Web Audio API integration

#### Game State Management
- React hooks for state management
- Local storage for save game functionality
- Context-based game state sharing

## 🎨 Game Design

### Visual Style
- **Pixel Art Aesthetic**: Retro-inspired 2D graphics
- **Corporate Theme**: Office-inspired color palette and imagery
- **Smooth Animations**: 60 FPS character and obstacle animations
- **Particle Effects**: Visual feedback for interactions

### Audio Design
- **Procedural Generation**: All sounds generated using Web Audio API
- **Thematic Music**: Corporate-inspired background themes
- **Interactive Feedback**: Audio cues for all player actions

### Level Design Philosophy
Each level is designed around a specific mechanic or challenge:
- **Learning Curve**: Gradual introduction of new concepts
- **Skill Building**: Progressive difficulty that builds on previous levels
- **Thematic Consistency**: Each level reflects real job search frustrations
- **Replayability**: Multiple paths and strategies for completion

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality

- **TypeScript**: Full type safety throughout the codebase
- **ESLint**: Code linting with React and TypeScript rules
- **Modular Architecture**: Clean separation of concerns
- **Performance Optimized**: Efficient rendering and memory management

### Browser Compatibility

- Modern browsers with ES2020 support
- Canvas API support required
- Web Audio API support for sound (graceful degradation)

## 🎯 Game Mechanics Deep Dive

### Physics System
- **Gravity**: Realistic falling mechanics
- **Collision Detection**: AABB (Axis-Aligned Bounding Box) collision system
- **Movement**: Smooth acceleration and deceleration
- **Jump Mechanics**: Variable jump height based on input duration

### Level Progression
- **Checkpoint System**: Save progress at each level
- **Difficulty Scaling**: Each level introduces new challenges
- **Completion Tracking**: Statistics for interviews and rejections
- **Unlock System**: Sequential level unlocking

### Obstacle Types
- **Static Obstacles**: Walls, barriers, and platforms
- **Dynamic Obstacles**: Moving platforms and enemies
- **Interactive Elements**: Teleporters, switches, and triggers
- **Environmental Hazards**: Lasers, bombs, and traps

## 🏆 Achievements & Statistics

The game tracks various statistics:
- **Interviews Completed**: Successfully reached goals
- **Rejections Received**: Times hit by obstacles
- **Levels Completed**: Progress through the corporate tower
- **Completion Time**: Speed run potential

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting
- Add comments for complex game logic
- Test new features thoroughly

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Developer

**Deepak Sarun Y**
- LinkedIn: [deepaksaruny](https://www.linkedin.com/in/deepaksaruny/)
- GitHub: [DeeapakSarun](https://github.com/DeeapakSarun)
- DevPost: [DeeapakSarun](https://devpost.com/DeeapakSarun)

## 🙏 Acknowledgments

- Inspired by the universal experience of job searching
- Built with modern web technologies for optimal performance
- Designed to bring humor to the often frustrating job hunt process

---

*Made with ❤️ for job seekers everywhere*

## 🐛 Known Issues

- Audio may not work on some mobile browsers due to autoplay restrictions
- Performance may vary on older devices due to canvas rendering requirements

## 🔮 Future Enhancements

- Mobile touch controls
- Additional level packs
- Multiplayer competitive mode
- Level editor for custom challenges
- Achievement system with unlockable content