// Level data and management
class LevelManager {
  constructor() {
    this.levels = this.initLevels();
    this.currentLevel = 1;
  }

  initLevels() {
    return {
      // Level 1: City Streets (Tutorial) - Easy, learn the ropes
      // Difficulty multiplier: 1.0x
      1: {
        name: 'City Streets',
        description: 'The outbreak begins. Learn to survive.',
        width: 2500,
        theme: 'city',
        groundColor: '#3d3d4a',  // Dark asphalt
        buildingColor: '#222233',
        skyColor: '#0d0d1a',     // Dark night sky
        fogColor: 'rgba(30, 30, 50, 0.3)',
        fogDensity: 0.3,
        atmosphere: {
          dustParticles: true,
          lightRays: false,
          rain: false,
          fireGlow: false
        },
        ambientLight: 0.7,
        music: 'level1',
        difficultyMultiplier: 1.0, // Base stats
        waves: [
          {
            zombies: [
              { type: 'walker', count: 2, spawnDelay: 2000 },
              { type: 'zombie_rat', count: 2, spawnDelay: 1500 },
            ],
          },
          {
            zombies: [
              { type: 'walker', count: 2, spawnDelay: 1800 },
              { type: 'zombie_rat', count: 3, spawnDelay: 1200 },
              { type: 'zombie_dog', count: 1, spawnDelay: 2500 },
            ],
          },
          {
            zombies: [
              { type: 'walker', count: 2, spawnDelay: 1500 },
              { type: 'runner', count: 1, spawnDelay: 2500 },
              { type: 'zombie_crow', count: 2, spawnDelay: 2000 },
            ],
          },
          {
            zombies: [
              { type: 'walker', count: 2, spawnDelay: 1500 },
              { type: 'runner', count: 2, spawnDelay: 2000 },
              { type: 'zombie_rat', count: 2, spawnDelay: 1200 },
            ],
          },
          {
            zombies: [
              { type: 'walker', count: 2, spawnDelay: 1500 },
              { type: 'runner', count: 1, spawnDelay: 2000 },
              { type: 'brute', count: 1, spawnDelay: 3000 },
              { type: 'zombie_rat', count: 3, spawnDelay: 1000 },
            ],
          },
        ],
        powerups: ['health', 'ammo'],
      },

      // Level 2: Shopping Mall - Zombies get tougher
      // Difficulty multiplier: 1.3x health, 1.2x damage
      2: {
        name: 'Shopping Mall',
        description: 'The undead love a good sale.',
        width: 3000,
        theme: 'suburbs',
        groundColor: '#4a4540',  // Worn tile floor
        buildingColor: '#333322',
        skyColor: '#151510',     // Dim interior lighting
        fogColor: 'rgba(40, 35, 30, 0.4)',
        fogDensity: 0.4,
        atmosphere: {
          dustParticles: true,
          lightRays: true,
          rain: false,
          fireGlow: true
        },
        ambientLight: 0.6,
        music: 'level2',
        difficultyMultiplier: 1.3,
        waves: [
          {
            zombies: [
              { type: 'walker', count: 2, spawnDelay: 1800 },
              { type: 'runner', count: 1, spawnDelay: 2500 },
            ],
          },
          {
            zombies: [
              { type: 'walker', count: 2, spawnDelay: 1500 },
              { type: 'spitter', count: 1, spawnDelay: 3000 },
            ],
          },
          {
            zombies: [
              { type: 'runner', count: 2, spawnDelay: 2000 },
              { type: 'spitter', count: 1, spawnDelay: 2500 },
              { type: 'zombie_rat', count: 4, spawnDelay: 1000 },
            ],
          },
          {
            zombies: [
              { type: 'walker', count: 2, spawnDelay: 1500 },
              { type: 'brute', count: 1, spawnDelay: 3500 },
              { type: 'zombie_dog', count: 1, spawnDelay: 2000 },
            ],
          },
          {
            zombies: [
              { type: 'runner', count: 2, spawnDelay: 1800 },
              { type: 'brute', count: 1, spawnDelay: 3000 },
              { type: 'exploder', count: 1, spawnDelay: 4000 },
              { type: 'zombie_dog', count: 2, spawnDelay: 1500 },
            ],
          },
        ],
        powerups: ['health', 'ammo', 'speed'],
      },

      // Level 3: Hospital - Significantly tougher
      // Difficulty multiplier: 1.6x health, 1.4x damage
      3: {
        name: 'Hospital',
        description: 'Where the nightmare got worse.',
        width: 3500,
        theme: 'industrial',
        groundColor: '#3a4540',  // Hospital floor (greenish tile)
        buildingColor: '#223322',
        skyColor: '#081008',     // Dark with green tint
        fogColor: 'rgba(20, 40, 20, 0.5)',
        fogDensity: 0.5,
        atmosphere: {
          dustParticles: true,
          lightRays: false,
          rain: true,
          fireGlow: false
        },
        ambientLight: 0.5,
        music: 'level3',
        difficultyMultiplier: 1.6,
        waves: [
          {
            zombies: [
              { type: 'walker', count: 2, spawnDelay: 1500 },
              { type: 'spitter', count: 1, spawnDelay: 2500 },
            ],
          },
          {
            zombies: [
              { type: 'runner', count: 2, spawnDelay: 1800 },
              { type: 'exploder', count: 1, spawnDelay: 3000 },
            ],
          },
          {
            zombies: [
              { type: 'brute', count: 1, spawnDelay: 2500 },
              { type: 'spitter', count: 2, spawnDelay: 2000 },
              { type: 'zombie_crow', count: 2, spawnDelay: 1800 },
            ],
          },
          {
            zombies: [
              { type: 'runner', count: 2, spawnDelay: 1500 },
              { type: 'brute', count: 1, spawnDelay: 3000 },
              { type: 'exploder', count: 1, spawnDelay: 3500 },
              { type: 'zombie_dog', count: 2, spawnDelay: 1200 },
            ],
          },
          {
            zombies: [
              { type: 'boss', count: 1, spawnDelay: 0 },
              { type: 'zombie_crow', count: 3, spawnDelay: 2000 },
            ],
          },
        ],
        powerups: ['health', 'ammo', 'damage', 'shield'],
      },

      // Level 4: Military Base - Very tough zombies
      // Difficulty multiplier: 2.0x health, 1.6x damage
      4: {
        name: 'Military Base',
        description: 'Even the army fell. Find weapons.',
        width: 4000,
        theme: 'highway',
        groundColor: '#454535',  // Dusty concrete/dirt
        buildingColor: '#2a2a1a',
        skyColor: '#12120a',     // Smoky sky
        fogColor: 'rgba(50, 40, 20, 0.4)',
        fogDensity: 0.35,
        atmosphere: {
          dustParticles: true,
          lightRays: true,
          rain: false,
          fireGlow: true
        },
        ambientLight: 0.55,
        music: 'level4',
        difficultyMultiplier: 2.0,
        waves: [
          {
            zombies: [
              { type: 'walker', count: 2, spawnDelay: 1500 },
              { type: 'runner', count: 2, spawnDelay: 1800 },
            ],
          },
          {
            zombies: [
              { type: 'brute', count: 1, spawnDelay: 2500 },
              { type: 'spitter', count: 2, spawnDelay: 2000 },
            ],
          },
          {
            zombies: [
              { type: 'runner', count: 2, spawnDelay: 1500 },
              { type: 'exploder', count: 2, spawnDelay: 2500 },
              { type: 'zombie_dog', count: 2, spawnDelay: 1200 },
            ],
          },
          {
            zombies: [
              { type: 'brute', count: 2, spawnDelay: 2500 },
              { type: 'spitter', count: 1, spawnDelay: 2000 },
              { type: 'zombie_crow', count: 3, spawnDelay: 1500 },
              { type: 'zombie_rat', count: 5, spawnDelay: 800 },
            ],
          },
          {
            zombies: [
              { type: 'walker', count: 2, spawnDelay: 1500 },
              { type: 'brute', count: 1, spawnDelay: 3000 },
              { type: 'spitter', count: 1, spawnDelay: 2500 },
              { type: 'exploder', count: 1, spawnDelay: 3500 },
              { type: 'zombie_dog', count: 3, spawnDelay: 1000 },
            ],
          },
        ],
        powerups: ['health', 'ammo', 'damage', 'shield', 'life'],
      },

      // Level 5: Final Stand - Maximum difficulty
      // Difficulty multiplier: 2.5x health, 2.0x damage
      5: {
        name: 'Final Stand',
        description: 'Humanity\'s last hope. Survive!',
        width: 5000,
        theme: 'downtown',
        groundColor: '#352525',  // Ash-covered streets
        buildingColor: '#1a0a0a',
        skyColor: '#080404',     // Burning red-black sky
        fogColor: 'rgba(60, 20, 20, 0.6)',
        fogDensity: 0.6,
        atmosphere: {
          dustParticles: true,
          lightRays: true,
          rain: true,
          fireGlow: true
        },
        ambientLight: 0.4,
        music: 'boss',
        difficultyMultiplier: 2.5,
        waves: [
          {
            zombies: [
              { type: 'walker', count: 3, spawnDelay: 1500 },
              { type: 'runner', count: 2, spawnDelay: 1800 },
              { type: 'zombie_dog', count: 3, spawnDelay: 1000 },
              { type: 'zombie_rat', count: 6, spawnDelay: 600 },
            ],
          },
          {
            zombies: [
              { type: 'brute', count: 2, spawnDelay: 2500 },
              { type: 'exploder', count: 1, spawnDelay: 3000 },
              { type: 'zombie_crow', count: 4, spawnDelay: 1200 },
            ],
          },
          {
            zombies: [
              { type: 'boss', count: 1, spawnDelay: 0 },
              { type: 'zombie_dog', count: 2, spawnDelay: 2500 },
            ],
          },
          {
            zombies: [
              { type: 'spitter', count: 2, spawnDelay: 2000 },
              { type: 'runner', count: 2, spawnDelay: 1500 },
              { type: 'brute', count: 1, spawnDelay: 3000 },
              { type: 'zombie_crow', count: 5, spawnDelay: 1000 },
              { type: 'zombie_rat', count: 8, spawnDelay: 500 },
            ],
          },
          {
            zombies: [
              { type: 'boss', count: 1, spawnDelay: 0 },
              { type: 'spitter', count: 1, spawnDelay: 4000 },
              { type: 'zombie_dog', count: 4, spawnDelay: 1500 },
              { type: 'zombie_crow', count: 3, spawnDelay: 2000 },
            ],
          },
        ],
        powerups: ['health', 'ammo', 'damage', 'shield', 'life'],
      },
    };
  }

  getLevel(num) {
    return this.levels[num] || this.levels[1];
  }

  getLevelName(num) {
    const level = this.getLevel(num);
    return level.name;
  }

  getLevelDescription(num) {
    const level = this.getLevel(num);
    return level.description;
  }

  getTotalLevels() {
    return Object.keys(this.levels).length;
  }

  getWaveCount(levelNum) {
    const level = this.getLevel(levelNum);
    return level.waves.length;
  }

  isLastLevel(levelNum) {
    return levelNum >= this.getTotalLevels();
  }
}

// Powerup types configuration
const PowerupTypes = {
  health: {
    name: 'Health Pack',
    color: '#ff4444',
    icon: '+',
    effect: (player, game) => {
      player.health = Math.min(player.maxHealth, player.health + 50);
    },
    description: 'Restore 50 HP',
  },
  ammo: {
    name: 'Ammo Crate',
    color: '#ffaa00',
    icon: 'A',
    effect: (player, game) => {
      player.weapons.forEach((w) => {
        if (!w.infinite) {
          w.ammo = Math.min(w.maxAmmo, w.ammo + Math.floor(w.maxAmmo * 0.5));
        }
      });
    },
    description: 'Restore 50% ammo for all weapons',
  },
  speed: {
    name: 'Speed Boost',
    color: '#44ff44',
    icon: 'S',
    duration: 10000,
    effect: (player, game) => {
      player.speedBoost = 1.5;
      setTimeout(() => {
        player.speedBoost = 1;
      }, 10000);
    },
    description: '50% speed boost for 10 seconds',
  },
  damage: {
    name: 'Damage Boost',
    color: '#ff44ff',
    icon: 'D',
    duration: 10000,
    effect: (player, game) => {
      player.damageBoost = 2;
      setTimeout(() => {
        player.damageBoost = 1;
      }, 10000);
    },
    description: 'Double damage for 10 seconds',
  },
  shield: {
    name: 'Shield',
    color: '#4444ff',
    icon: 'O',
    duration: 5000,
    effect: (player, game) => {
      player.shieldActive = true;
      player.shieldTimer = 5000;
    },
    description: 'Invincibility for 5 seconds',
  },
  life: {
    name: 'Extra Life',
    color: '#ff66ff',
    icon: '❤',
    effect: (player, game) => {
      game.lives = Math.min(5, game.lives + 1);
    },
    description: 'Gain an extra life',
  },
  grenade: {
    name: 'Grenades',
    color: '#ff8800',
    icon: 'G',
    effect: (player, game) => {
      player.grenades = Math.min(player.maxGrenades, player.grenades + 2);
    },
    description: 'Gain 2 grenades',
  },
};

// Export
window.LevelManager = LevelManager;
window.PowerupTypes = PowerupTypes;
