# Zombie Battle

**A fast-paced arcade zombie shooter with daily challenges, built natively for Reddit.**

---

## Inspiration

Remember the thrill of arcade classics like Streets of Rage and Metal Slug? We wanted to bring that nostalgic, pick-up-and-play action directly to Reddit—where millions of players are already hanging out.

But we didn't just want another shooter. We wanted something that gives players a reason to come back *every single day*. That's where our **Daily Challenge System** comes in: fresh objectives, streak bonuses, and community competition that keeps the experience exciting long after the first playthrough.

---

## What It Does

**Zombie Battle** drops players into a zombie apocalypse with one mission: survive. Fight through 5 increasingly difficult levels, blast zombies with 9 unique weapons, and compete on global leaderboards—all without leaving Reddit.

### The Daily Loop

Every day at midnight UTC, players receive a new challenge:

> *"Kill 50 zombies with the Shotgun"*
> *"Reach a 20-kill combo"*
> *"Complete Level 2 without taking damage"*

Complete challenges to earn bonus points. Play consecutive days to build your **streak multiplier**. Miss a day? Your streak resets. It's simple, addictive, and keeps the community engaged.

### Combat That Feels Great

We obsessed over making combat satisfying:

- **Screen shake** on heavy weapons
- **Combo multipliers** (up to 3x) for chaining kills
- **Damage numbers** flying off enemies
- **Explosive rockets** with area damage
- **Piercing sniper rounds** that tear through multiple zombies

### 9 Weapons, Each With Personality

| Weapon | What Makes It Special |
|--------|----------------------|
| Pistol | Reliable. Infinite ammo. Your trusty sidearm. |
| Shotgun | Devastating spread. Perfect for crowds. |
| Rifle | Accurate and powerful. The all-rounder. |
| SMG | Bullet hose. Spray and pray. |
| Flamethrower | Watch them burn. |
| Sniper | One shot, multiple kills. Pierces enemies. |
| Rocket Launcher | Boom. Area damage. Screen shake. |
| Laser Gun | Pew pew. Sci-fi goodness. |
| Minigun | 40ms fire rate. Pure chaos. |

### Not Just Zombies—Zombie *Animals*

The infection spread to the animal kingdom:

- **Zombie Dogs** — Fast and vicious. They lunge.
- **Zombie Crows** — Death from above. Dive-bomb attacks.
- **Zombie Rats** — They swarm. Lots of them.

---

## How We Built It

**Platform:** Reddit Devvit with WebView
**Backend:** TypeScript handling saves, leaderboards, and daily challenges
**Frontend:** Pure HTML5 Canvas—no game engine, no external assets
**Storage:** Redis via Devvit for persistent data

Every zombie, every weapon, every explosion is drawn procedurally with Canvas API. No sprites. No image files. Just code.

### Architecture Highlights

```
Reddit Post → Devvit WebView → Canvas Game
                  ↓
            Message Bridge
                  ↓
         TypeScript Backend
                  ↓
         Redis (Saves, Scores, Challenges)
```

The game communicates with Devvit through a message-passing system. When you complete a level, your score is sent to the backend, validated, and stored in Redis. Leaderboards update in real-time across all players.

---

## Challenges We Overcame

**The Wave Skip Bug**
Our wave completion check ran every frame. Kill all zombies, and the game would skip from Wave 1 directly to "Level Complete!" We added a flag-based system to ensure waves progress correctly.

**Tiny Enemies**
Zombie rats were 25x15 pixels. Players couldn't hit them. We scaled them up to 45x28 and reduced their erratic movement. Now they're challenging but fair.

**9 Weapons, 1 UI**
How do you let players know what each weapon does before selecting it? We added hover tooltips showing damage, fire rate, ammo, and special properties. Plus a "EQUIPPED" notification when switching.

---

## What We're Proud Of

**Zero External Assets**
Every graphic—zombies, weapons, explosions, UI—is procedurally generated. The entire game is code.

**The Daily System Actually Works**
15+ challenge types. Streak tracking. It creates genuine "I need to play today" moments.

**It Feels Like a Real Game**
Responsive controls. Satisfying combat. 5 complete levels. Boss fights. This isn't a tech demo—it's a game you'd actually want to play.

---

## What's Next

- **Multiplayer Co-op** — Survive together with other Redditors
- **Weekly Events** — Special weekend boss rushes
- **Community Levels** — Let players create and share content
- **Seasonal Content** — Halloween zombies, holiday themes

---

## Play It Now

**App:** https://developers.reddit.com/apps/zombie-battle

**Controls:**
- WASD / Arrow Keys — Move
- Left Click / Z — Shoot
- Right Click / X — Melee
- G / Q — Throw Grenade
- 1-9 — Switch Weapons
- Space / Shift — Dodge Roll

---

## The Team

Built with caffeine and determination for the **Reddit Daily Games Hackathon 2026**.

---

*Fight. Survive. Return tomorrow.*
