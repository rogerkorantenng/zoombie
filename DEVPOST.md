# Zombie Battle

**An arcade zombie shooter that gives you a reason to come back to Reddit every single day.**

---

## Inspiration

You know that feeling when you open Wordle in the morning? That little ritual — one puzzle, one shot, come back tomorrow?

We wanted that, but with **zombies and explosions**.

The arcade classics we grew up on — Streets of Rage, Metal Slug, House of the Dead — were incredible, but they were one-and-done. You beat them and moved on. We thought: *what if the zombies came back every day with a new trick up their rotting sleeves?*

That's Zombie Battle. A game built around a single question: **"What's today's challenge?"**

---

## What It Does

Open Zombie Battle on any Reddit post and the first thing you see isn't a play button. It's today's challenge, staring you down:

> *"Kill 30 zombies with the Rifle"*

And underneath, a countdown timer ticking toward midnight. A leaderboard of everyone who's already beaten it. Your streak, daring you not to break it.

You tap START and you're in.

### The Daily Loop

Here's what makes it tick:

1. **Open the game** — Today's challenge is the hero of the screen. Big, bold, unmissable.
2. **Hit START** — First time? A quick tutorial shows you the ropes. Veterans go straight in.
3. **Play with a target** — A live progress bar sits at the top of the screen the entire time. *"17 / 30 rifle kills."* You can feel it building.
4. **Nail it** — The instant you hit the target, the game freezes. Confetti moment. Your score, your kills, your combo — all laid out. Reward points banked.
5. **Check the board** — How'd you do compared to everyone else today? The daily leaderboard tells you.
6. **Come back tomorrow** — Your streak is now 2 days. Then 3. Then 7. Don't. Break. The. Streak.

There are **15+ challenge types** that rotate daily. Some days you're sniping. Some days you're speedrunning. Some days you're trying to survive without taking a single hit. You never know what's coming, and that's the point.

### The Arsenal

Nine weapons, and they all feel *different*:

| Weapon | The Vibe |
|--------|----------|
| Pistol | Old reliable. Infinite ammo. Never lets you down. |
| Shotgun | Five pellets of pure crowd control. *Ka-chunk.* |
| Rifle | Clean, accurate, deadly. The professional's choice. |
| SMG | Hold the trigger and pray. 600 rounds of chaos. |
| Flamethrower | 1000 units of fuel and zero remorse. |
| Sniper | Punches through multiple zombies in a single shot. *Chef's kiss.* |
| Rocket Launcher | The screen shakes. Everything dies. You might too if you're too close. |
| Laser Gun | Pew pew pew. The future is now. |
| Minigun | Fires every 40 milliseconds. That's 25 bullets per second. Good luck, zombies. |

Your loadout carries between levels. Switch to the Rifle on Level 1, and you're still holding it on Level 3. Your ammo, your weapon — it's all yours until you run dry.

### The Enemies

It's not just zombies. The infection got creative:

- **Zombie Dogs** — They're fast. They lunge. You'll panic the first time one closes the gap.
- **Zombie Crows** — They dive-bomb from above. Yes, you'll die to one and feel embarrassed.
- **Zombie Rats** — Individually? Harmless. In a swarm of twenty? Terrifying.

And then there are the **bosses**. Big, mean, and they take a LOT of bullets.

### The Feel

We spent an unreasonable amount of time on game feel:

- **Screen shake** when you fire the Rocket Launcher or Shotgun
- **Combo multipliers** — chain kills to hit 3x score. The counter grows, the text pulses, and you start playing recklessly to keep it alive
- **Damage numbers** pop off enemies so you know exactly how much hurt you're dealing
- **Dodge roll** — tap Shift and you're invincible for a split second. Time it right against a boss lunge and you'll feel like a god
- **Muzzle flash, knockback, death particles** — every kill is a tiny celebration

---

## How We Built It

**Zero sprites. Zero images. Zero external assets.**

Every single thing you see on screen — every zombie, every bullet, every explosion, every muzzle flash, every UI element — is drawn with JavaScript and the Canvas API. The soldier's helmet has an orange stripe. The shotgun has a wooden pump grip with texture lines. The flamethrower has a fuel tank on the player's back with a pressure gauge. All code.

**The stack:**
- **Platform:** Reddit Devvit with WebView
- **Backend:** TypeScript — handles saves, leaderboards, daily challenges, streak tracking
- **Frontend:** Pure HTML5 Canvas — no game engine, no libraries, no dependencies
- **Storage:** Redis via Devvit — scores, progress, daily leaderboards, challenge completions

### How It Talks

```
Player kills zombie → Game tracks kill → Challenge progress updates
                                              ↓
                                    Progress bar fills on screen
                                              ↓
                              Target hit? → Game pauses → Results overlay
                                              ↓
                              Score → Devvit message bridge → TypeScript backend
                                              ↓
                              Redis sorted set (keyed by today's date)
                                              ↓
                              Daily leaderboard updates for all players
```

Every kill fires an event. Every event updates the challenge tracker. When you hit the target, the game state machine shifts from `playing` to `paused`, builds a results payload, and fires it through the Devvit message bridge to the TypeScript backend. Your score lands in a date-keyed Redis sorted set. Tomorrow, that set is gone and a fresh one takes its place.

---

## Challenges We Ran Into

**"Why did my rifle challenge stop counting on Level 2?"**

This one was sneaky. Every time a player advanced to the next level, we created a brand new Player object — which reset their weapon selection back to Pistol. So a player grinding toward "30 rifle kills" would advance to Level 2, start shooting with what they thought was still the Rifle... but it was the Pistol. Kills were being tracked, just under the wrong weapon. The fix: preserve the player across levels instead of recreating them. Weapons, ammo, and selection now carry over.

**"I completed the challenge but my score isn't on the board?"**

The original flow: complete the challenge mid-game, see a small "CHALLENGE COMPLETE!" notification, keep playing, eventually quit... and realize your score was never submitted. The quit-to-menu function didn't know you'd finished a challenge. We redesigned it completely — now the game pauses the instant you hit the target, shows a full celebration overlay, and submits your score immediately.

**"I can't tap the START button"**

On mobile in Reddit's WebView, a streak notification ("2 Day Streak!") was rendering on top of the start button. Classic z-index problem, except fixing z-index wasn't enough — the whole menu was overflowing vertically on small screens. We converted the streak to a non-interactive toast that slides in from the right and auto-dismisses, then rebuilt the menu layout to be top-aligned and scrollable.

---

## What We're Proud Of

**It's all code.** No sprite sheets, no image files, no CDN calls. If you view-source the game, you'll find procedurally drawn soldiers with knee pads, combat boots, and tactical vests. Zombies with exposed bones and glowing eyes. Shotguns with wooden pump grips and double barrels. All rendered frame-by-frame on a `<canvas>` element.

**The daily system actually creates habit loops.** This isn't a feature we bolted on at the end. The daily challenge is the first thing you see. It's the biggest button. It's what the game is *about*. Streaks, countdowns, daily leaderboards, shareable results — every piece is designed to make you think "I should check in tomorrow."

**It feels like a real game.** Responsive movement with smooth acceleration. Nine weapons that each feel distinct. Dodge rolls with i-frames. Boss fights. Five complete levels. Combo systems. This isn't a prototype or a proof of concept. It's a game we actually enjoy playing, and we think you will too.

---

## What's Next

- **Multiplayer Co-op** — Survive with other Redditors in real-time
- **Weekly Boss Rush** — Special weekend events with unique rewards
- **Community Levels** — Player-created content shared across subreddits
- **Seasonal Themes** — Halloween zombie skins, holiday weapons
- **More Challenge Types** — Speedruns, accuracy trials, boss-only gauntlets, pacifist runs (good luck)

---

## Play It Now

**App:** https://developers.reddit.com/apps/zombie-battle

**Controls:**
| Input | Action |
|-------|--------|
| WASD / Arrows | Move |
| Left Click / Space | Shoot |
| Right Click / X | Melee attack |
| G / Q | Throw grenade |
| Shift | Dodge roll |
| 1-9 | Switch weapons |

---

## The Team

Built with too much coffee and not enough sleep for the **Reddit Daily Games Hackathon 2026**.

---

*The zombies are waiting. What's your excuse?*
