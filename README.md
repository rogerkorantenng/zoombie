# Zombie Apocalypse - Reddit Devvit Game

A side-scrolling zombie shooter game built for Reddit's Devvit platform, inspired by Streets of Rage/Bare Knuckle.

## Game Features

### Combat System
- **Ranged Weapons**: Pistol (unlimited), Shotgun, Rifle, SMG, Flamethrower
- **Melee Attacks**: Close combat for emergencies
- **Special Attack**: Screen-clearing bomb (limited use)

### Zombie Types
| Type | Description |
|------|-------------|
| Walker | Slow, basic zombie |
| Runner | Fast, low health |
| Brute | Tank-like, high health |
| Spitter | Ranged acid attack |
| Exploder | Explodes on death |
| Boss | End-of-level boss |

### Power-ups
- Health Pack - Restore HP
- Ammo Crate - Refill ammo
- Speed Boost - Temporary speed increase
- Damage Boost - Double damage
- Shield - Temporary invincibility
- Extra Life

### Levels
1. **City Streets** - Tutorial level
2. **Shopping Mall** - Introduces new enemies
3. **Hospital** - First boss fight
4. **Military Base** - Advanced enemies
5. **Final Stand** - Boss rush finale

## Controls

| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move & Jump |
| Z / Left Click | Shoot |
| X / Right Click | Melee |
| C | Special Attack (Bomb) |
| 1-5 | Switch Weapons |
| P / Escape | Pause |

## Reddit Integration

- **Leaderboards**: Global high scores
- **Daily Challenges**: New challenge every day
- **Stats Tracking**: Kills, deaths, accuracy, levels completed
- **Progress Saving**: Game progress persists

## Development

### Prerequisites
- Node.js 20+
- Devvit CLI (`npm install -g devvit`)

### Installation
```bash
npm install
```

### Local Testing
```bash
npx devvit playtest
```

### Upload to Reddit
```bash
npx devvit upload
```

## Project Structure

```
├── src/                    # Backend (TypeScript/Devvit)
│   ├── main.tsx           # App registration & menu
│   ├── components/
│   │   └── GamePost.tsx   # WebView + message handlers
│   ├── handlers/
│   │   ├── gameState.ts   # Save/load game progress
│   │   ├── leaderboard.ts # High scores & rankings
│   │   └── dailyChallenge.ts # Daily challenge system
│   └── types/
│       └── index.ts       # TypeScript interfaces
│
├── webroot/               # Frontend (HTML5/JS)
│   ├── index.html        # Game UI
│   ├── game.js           # Main game engine
│   ├── player.js         # Player class
│   ├── zombie.js         # Zombie AI classes
│   ├── weapons.js        # Weapon system
│   ├── levels.js         # Level data & progression
│   ├── collision.js      # Collision detection
│   ├── renderer.js       # Canvas rendering
│   ├── app.js            # UI & Devvit bridge
│   └── styles.css        # Game styling
│
├── package.json
├── devvit.yaml
└── tsconfig.json
```

## Tech Stack

- **Platform**: Reddit Devvit
- **Backend**: TypeScript
- **Frontend**: HTML5 Canvas + JavaScript
- **Storage**: Redis (Devvit)
- **Graphics**: 2D Canvas API

## License

BSD-3-Clause
