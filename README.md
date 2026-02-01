# Zombie Battle - Reddit Devvit Game

A side-scrolling zombie shooter game built for Reddit's Devvit platform, featuring daily challenges, achievements, and competitive leaderboards.

## Game Features

### Combat System
- **9 Ranged Weapons**: Pistol, Shotgun, Rifle, SMG, Flamethrower, Sniper, Rocket Launcher, Laser Gun, Minigun
- **Special Weapon Effects**: Piercing bullets, explosions, laser beams, fire damage
- **Melee Attacks**: Close combat for emergencies
- **Grenades**: Throwable explosives with area damage (Press G or Q)
- **Combo System**: Chain kills for score multipliers up to 3x

### Zombie Types
| Type | Description |
|------|-------------|
| Walker | Slow, shambling basic zombie |
| Runner | Fast, erratic movement |
| Brute | Tank-like, charges at player |
| Spitter | Ranged acid attack |
| Exploder | Explodes on death |
| Boss | End-of-level boss with special attacks |
| **Zombie Dog** | Fast, lunging animal |
| **Zombie Crow** | Flying dive-bomb attacks |
| **Zombie Rat** | Quick swarm attacks |

### Power-ups
- Health Pack - Restore 50 HP
- Ammo Crate - Refill 50% ammo for all weapons
- Speed Boost - 50% speed for 10 seconds
- Damage Boost - Double damage for 10 seconds
- Shield - Invincibility for 5 seconds
- Extra Life - Gain an extra life
- Grenades - Gain 2 grenades

### Levels (5 Levels, 5 Waves Each)
1. **City Streets** - Tutorial level, introduces basic zombies
2. **Shopping Mall** - Adds spitters and animal zombies
3. **Hospital** - First boss fight, zombie crows
4. **Military Base** - All enemy types
5. **Final Stand** - Boss rush finale with massive swarms

### Daily Challenge System
- New challenge every day at midnight UTC
- 15+ unique challenge types
- Daily streak bonuses for consecutive play
- Challenge types include:
  - Kill targets
  - Speed runs
  - No-damage runs
  - Combo challenges
  - Boss hunting
  - Weapon-specific kills

### Achievements (15 Total)
- Combat: First Blood, Zombie Slayer, Zombie Hunter, Zombie Legend
- Combos: Combo Master, Mega Combo
- Weapons: Pistol Pro, Shotgun Surgeon, Rifle Expert, Melee Maniac
- Progression: First Victory, Halfway There, Survivor, Flawless, Dedicated

## Controls

| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move (8-directional) |
| Z / Left Click | Shoot |
| X / Right Click | Melee |
| Shift / Space | Dodge Roll |
| G / Q | Throw Grenade |
| 1-9 | Switch Weapons |
| P / Escape | Pause |

## Reddit Integration

- **Global Leaderboards**: Compete for high scores
- **Daily Challenges**: Fresh content every day
- **Stats Tracking**: Kills, deaths, accuracy, combos, levels completed
- **Progress Saving**: Game progress persists via Redis
- **Achievements**: Unlock and track achievements

## Development

### Prerequisites
- Node.js 20+
- Devvit CLI

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
│   │   ├── gameState.ts   # Save/load, achievements, streaks
│   │   ├── leaderboard.ts # High scores & rankings
│   │   └── dailyChallenge.ts # Daily challenge system
│   └── types/
│       └── index.ts       # TypeScript interfaces
│
├── webroot/               # Frontend (HTML5/JS)
│   ├── index.html        # Game UI
│   ├── game.js           # Main game engine
│   ├── player.js         # Player class & weapons
│   ├── zombie.js         # Zombie AI & rendering
│   ├── levels.js         # Level data & power-ups
│   ├── app.js            # UI & Devvit bridge
│   └── styles.css        # Game styling
│
├── package.json
├── devvit.yaml
├── DEVPOST.md            # Hackathon submission
└── README.md
```

## Tech Stack

- **Platform**: Reddit Devvit
- **Backend**: TypeScript
- **Frontend**: HTML5 Canvas + JavaScript
- **Storage**: Redis (Devvit)
- **Graphics**: Procedural 2D Canvas rendering (no external assets)

## Hackathon Submission

This game was built for the **Reddit Daily Games Hackathon 2026**.

- **App Listing**: https://developers.reddit.com/apps/zombie-battle
- **Recurring Content**: Daily challenges with 15+ unique types

## License

BSD-3-Clause
