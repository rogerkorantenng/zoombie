# Zombie Battle

**An arcade zombie shooter with daily challenges, built for Reddit's Devvit platform.**

Every day at midnight UTC, a new challenge drops. Kill 30 zombies with the Rifle. Survive without taking damage. Hit a 20-kill combo. Complete it, climb the daily leaderboard, build your streak, come back tomorrow.

**App:** https://developers.reddit.com/apps/zombie-battle

---

## The Game

You're a soldier. Zombies are everywhere. You have nine weapons and a dodge roll. Good luck.

### Daily Challenge System

The daily challenge is the main event — it's the first thing you see when you open the game.

- **15+ challenge types** rotating daily (weapon kills, combos, no-damage, speedruns, boss hunts)
- **Live progress HUD** — a bar at the top of the screen tracks your goal in real-time
- **Instant completion** — hit the target and the game pauses with a results overlay
- **Daily leaderboard** — separate from the all-time board, resets every midnight UTC
- **Streak tracking** — consecutive days played, with a toast notification on login
- **Countdown timer** — shows when the next challenge drops
- **First-time tutorial** — walks new players through controls before their first challenge

### Weapons

| Weapon | Damage | Fire Rate | Ammo | Special |
|--------|--------|-----------|------|---------|
| Pistol | 15 | 300ms | Infinite | — |
| Shotgun | 10x5 | 800ms | 150 | Spread shot |
| Rifle | 25 | 150ms | 300 | Accurate |
| SMG | 8 | 80ms | 600 | Fast fire |
| Flamethrower | 5x3 | 50ms | 1000 | Burn effect |
| Sniper | 80 | 1200ms | 75 | Pierces enemies |
| Rocket Launcher | 100 | 1500ms | 50 | Explosion AoE |
| Laser Gun | 35 | 200ms | 250 | Laser beam |
| Minigun | 12 | 40ms | 1500 | Screen shake |

Weapons and ammo persist across levels — your loadout carries over when you advance.

### Enemies

| Type | Behavior |
|------|----------|
| Walker | Slow, basic zombie |
| Runner | Fast, erratic movement |
| Brute | Tanky, charges at you |
| Spitter | Ranged acid attack |
| Exploder | Explodes on death — keep your distance |
| Boss | End-of-level, lots of HP, special attacks |
| Zombie Dog | Fast lunging animal |
| Zombie Crow | Dive-bombs from above |
| Zombie Rat | Swarms in groups |

### Levels

1. **City Streets** — Walkers and runners. Ease in.
2. **Shopping Mall** — Spitters and animal zombies join the party.
3. **Hospital** — First boss. Zombie crows. Things get real.
4. **Military Base** — Everything at once.
5. **Final Stand** — Boss rush. Massive swarms. Survive this and you've won.

### Power-ups

Dropped by dead zombies: Health (+30 HP), Ammo (50% refill), Speed Boost (10s), Damage Boost (2x for 10s), Shield (5s invincibility), Extra Life, Grenades (+2).

### Combat Features

- Combo multipliers up to 3x for chaining kills
- Dodge roll with invincibility frames (Shift)
- Grenades with area damage (G/Q)
- Melee attack for emergencies (X/Right Click)
- Screen shake on heavy weapons
- Damage numbers on hit

---

## Controls

| Input | Action |
|-------|--------|
| WASD / Arrow Keys | Move (8-directional) |
| Left Click / Space | Shoot |
| Right Click / X | Melee attack |
| G / Q | Throw grenade |
| Shift | Dodge roll |
| 1-9 | Switch weapons |
| P / Escape | Pause |

---

## Architecture

```
webroot/               Frontend (HTML5 Canvas + JS)
├── index.html         Game UI and overlays
├── app.js             App controller, Devvit bridge, challenge tracking
├── game.js            Game engine, physics, rendering, challenge HUD
├── player.js          Player class, weapons, combat
├── zombie.js          Zombie AI, types, rendering
├── levels.js          Level data, waves, power-ups
├── weapons.js         Weapon definitions
├── collision.js       Collision detection
├── renderer.js        Rendering utilities
├── sprites.js         Procedural sprite generation
└── styles.css         UI styling

src/                   Backend (TypeScript/Devvit)
├── main.tsx           App registration, menu actions
├── components/
│   └── GamePost.tsx   WebView component, message handler
├── handlers/
│   ├── gameState.ts   Save/load, achievements, streaks
│   ├── leaderboard.ts All-time + daily leaderboard (Redis sorted sets)
│   └── dailyChallenge.ts  Challenge rotation, progress, winners
└── types/
    └── index.ts       Message types, interfaces
```

### How it works

The game runs in a Devvit WebView. The frontend (Canvas game) communicates with the backend (TypeScript) through a message-passing bridge. Challenge progress is tracked in real-time during gameplay — every kill updates the tracker, and when the target is hit, the game pauses and fires the score through the bridge to Redis.

**Storage (Redis via Devvit):**
- `zombie_leaderboard` — all-time high scores (sorted set)
- `zombie_daily_leaderboard:YYYY-MM-DD` — daily scores (sorted set, date-keyed)
- `zombie_daily_challenge:YYYY-MM-DD:progress:{userId}` — per-user challenge progress
- `zombie_daily_winners:YYYY-MM-DD` — users who completed today's challenge
- `zombie_game_state:{userId}` — saves, stats, achievements
- `zombie_streak:{userId}` — streak tracking

---

## Development

### Prerequisites
- Node.js 20+
- [Devvit CLI](https://developers.reddit.com/docs/get-started/installation)

### Install
```bash
npm install
```

### Playtest
```bash
npx devvit playtest
```

### Upload
```bash
npx devvit upload
```

### Type check
```bash
npx tsc --noEmit
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Platform | Reddit Devvit |
| Backend | TypeScript |
| Frontend | HTML5 Canvas + vanilla JS |
| Storage | Redis (Devvit) |
| Graphics | 100% procedural — zero external assets |

---

Built for the **Reddit Daily Games Hackathon 2026**.
