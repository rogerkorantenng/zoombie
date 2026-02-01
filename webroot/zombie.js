// Zombie enemy classes with detailed sprite rendering
class Zombie {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;

    // Set properties based on type
    const stats = Zombie.TYPES[type] || Zombie.TYPES.walker;
    this.width = stats.width;
    this.height = stats.height;
    this.health = stats.health;
    this.maxHealth = stats.health;
    this.speed = stats.speed;
    this.damage = stats.damage;
    this.scoreValue = stats.scoreValue;
    this.color = stats.color;
    this.skinColor = stats.skinColor;
    this.clothesColor = stats.clothesColor;
    this.attackCooldown = stats.attackCooldown;

    // State
    this.isDead = false;
    this.deathTimer = 1000;
    this.canAttack = true;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0; // Disabled for beat-em-up style
    this.onGround = true;
    this.facingRight = true;

    // Zombie-like movement properties
    this.wobbleOffset = Math.random() * Math.PI * 2;  // Random phase for wobble
    this.wobbleSpeed = 0.003 + Math.random() * 0.002; // Wobble frequency
    this.wobbleAmount = this.getWobbleAmount();        // How much zombie sways
    this.shuffleTimer = 0;                             // For shuffle/pause behavior
    this.shufflePause = false;                         // Is zombie pausing?
    this.shufflePauseDuration = 0;
    this.lurchTimer = 0;                               // For sudden lurches
    this.currentSpeedMod = 1;                          // Speed modifier for variation

    // Animation
    this.animFrame = 0;
    this.animTimer = 0;
    this.limbOffset = Math.random() * Math.PI;

    // AI
    this.aiState = 'chase';
    this.attackTimer = 0;
    this.specialTimer = 0;
    this.aggroRange = this.getAggroRange();  // How close before zombie reacts

    // Visual effects
    this.flashTimer = 0;
    this.bloodSplatters = [];

    // Reference to game
    this.game = null;
  }

  // Get wobble amount based on zombie type
  getWobbleAmount() {
    switch(this.type) {
      case 'walker': return 0.8;    // Heavy shamble
      case 'runner': return 0.3;    // Slight erratic
      case 'brute': return 0.4;     // Lumbering sway
      case 'spitter': return 0.5;   // Hunched wobble
      case 'exploder': return 1.2;  // Unstable stumble
      case 'boss': return 0.2;      // Menacing, controlled
      case 'zombie_dog': return 0.2;  // Low to ground, smooth
      case 'zombie_crow': return 0.1; // Flying, slight bob
      case 'zombie_rat': return 0.3;  // Quick scurrying
      default: return 0.5;
    }
  }

  // Get aggro/awareness range based on type
  getAggroRange() {
    switch(this.type) {
      case 'walker': return 400;    // Slow to notice
      case 'runner': return 600;    // Alert, fast reaction
      case 'brute': return 350;     // Focused, tunnel vision
      case 'spitter': return 500;   // Keeps distance
      case 'exploder': return 450;  // Rushes when close
      case 'boss': return 800;      // Always aware
      case 'zombie_dog': return 550; // Good senses
      case 'zombie_crow': return 700; // Can see from above
      case 'zombie_rat': return 300;  // Short range
      default: return 400;
    }
  }

  static TYPES = {
    walker: {
      width: 35,
      height: 55,
      health: 50,
      speed: 1.2,           // Slower base speed
      damage: 10,
      scoreValue: 100,
      color: '#558855',
      skinColor: '#7a9a6a',
      clothesColor: '#3d4d3d',
      attackCooldown: 1000,
      // Movement style: slow shamble with pauses
      shuffleChance: 0.02,  // Chance to pause each frame
      lurchChance: 0.005,   // Chance to suddenly lurch forward
    },
    runner: {
      width: 30,
      height: 50,
      health: 30,
      speed: 3.5,           // Fast but not instant
      damage: 8,
      scoreValue: 150,
      color: '#aa5555',
      skinColor: '#8b5a5a',
      clothesColor: '#4a2a2a',
      attackCooldown: 600,
      // Movement style: fast and erratic
      shuffleChance: 0.01,
      lurchChance: 0.03,    // Frequent sudden bursts
    },
    brute: {
      width: 60,
      height: 80,
      health: 200,
      speed: 0.6,           // Very slow but powerful
      damage: 25,
      scoreValue: 300,
      color: '#666644',
      skinColor: '#6b7b5b',
      clothesColor: '#2a2a1a',
      attackCooldown: 1500,
      // Movement style: heavy lumbering with charge
      shuffleChance: 0.03,  // Frequent pauses
      lurchChance: 0.01,    // Rare but devastating charge
    },
    spitter: {
      width: 35,
      height: 55,
      health: 40,
      speed: 1.0,           // Cautious movement
      damage: 15,
      scoreValue: 200,
      color: '#55aa55',
      skinColor: '#5a8a4a',
      clothesColor: '#2a4a2a',
      attackCooldown: 2000,
      ranged: true,
      // Movement style: keeps distance, careful
      shuffleChance: 0.015,
      lurchChance: 0.002,
    },
    exploder: {
      width: 40,
      height: 50,
      health: 60,
      speed: 2.0,           // Fast when rushing
      damage: 40,
      scoreValue: 250,
      color: '#aa6633',
      skinColor: '#9a6a4a',
      clothesColor: '#4a3a2a',
      attackCooldown: 0,
      explosive: true,
      // Movement style: unstable, stumbling rush
      shuffleChance: 0.025,
      lurchChance: 0.04,    // Very erratic
    },
    boss: {
      width: 100,
      height: 120,
      health: 1000,
      speed: 0.8,           // Slow but menacing
      damage: 35,
      scoreValue: 2000,
      color: '#440044',
      skinColor: '#5a3a5a',
      clothesColor: '#1a0a1a',
      attackCooldown: 800,
      isBoss: true,
      // Movement style: deliberate, intimidating
      shuffleChance: 0.005,
      lurchChance: 0.008,
    },
    // === ZOMBIE ANIMALS ===
    zombie_dog: {
      width: 50,
      height: 30,
      health: 35,
      speed: 4.0,           // Very fast
      damage: 12,
      scoreValue: 175,
      color: '#5a4a3a',
      skinColor: '#6a5a4a',
      clothesColor: '#3a2a1a',
      attackCooldown: 500,
      isAnimal: true,
      // Movement style: fast, erratic lunges
      shuffleChance: 0.005,
      lurchChance: 0.06,
    },
    zombie_crow: {
      width: 35,
      height: 25,
      health: 20,
      speed: 3.5,           // Fast flying
      damage: 8,
      scoreValue: 125,
      color: '#1a1a2a',
      skinColor: '#2a2a3a',
      clothesColor: '#0a0a1a',
      attackCooldown: 800,
      isAnimal: true,
      isFlying: true,
      // Movement style: swooping attacks
      shuffleChance: 0.01,
      lurchChance: 0.04,
    },
    zombie_rat: {
      width: 45,
      height: 28,
      health: 20,
      speed: 2.5,           // Quick scurrying (slower for easier targeting)
      damage: 6,
      scoreValue: 75,
      color: '#4a3a3a',
      skinColor: '#5a4a4a',
      clothesColor: '#2a1a1a',
      attackCooldown: 400,
      isAnimal: true,
      // Movement style: erratic scurrying
      shuffleChance: 0.015,
      lurchChance: 0.04,    // Less erratic movement
    },
  };

  update(deltaTime, player) {
    if (this.isDead) {
      this.deathTimer -= deltaTime;
      return;
    }

    const stats = Zombie.TYPES[this.type] || Zombie.TYPES.walker;

    // Update wobble (shambling effect)
    this.wobbleOffset += this.wobbleSpeed * deltaTime;

    // Handle shuffle pauses (zombie stops momentarily)
    if (this.shufflePause) {
      this.shufflePauseDuration -= deltaTime;
      if (this.shufflePauseDuration <= 0) {
        this.shufflePause = false;
      }
      // Zombie stands still during pause
      this.vx *= 0.5;
      this.vy *= 0.5;
    } else {
      // Random chance to pause (shambling behavior)
      if (Math.random() < (stats.shuffleChance || 0.01)) {
        this.shufflePause = true;
        this.shufflePauseDuration = 200 + Math.random() * 400; // 200-600ms pause
      }
    }

    // Handle sudden lurches (zombie bursts forward)
    if (this.lurchTimer > 0) {
      this.lurchTimer -= deltaTime;
      this.currentSpeedMod = 2.0; // Double speed during lurch
    } else {
      this.currentSpeedMod = 1.0;
      // Random chance to lurch
      if (Math.random() < (stats.lurchChance || 0.005)) {
        this.lurchTimer = 150 + Math.random() * 200; // 150-350ms lurch
      }
    }

    // AI behavior (includes vertical movement now)
    this.updateAI(deltaTime, player);

    // Apply wobble to movement (side-to-side shamble)
    const wobble = Math.sin(this.wobbleOffset) * this.wobbleAmount;

    // Apply movement with zombie characteristics
    if (!this.shufflePause) {
      this.x += this.vx * this.currentSpeedMod;
      this.y += this.vy * this.currentSpeedMod + wobble * 0.3; // Slight vertical wobble
    }

    // Vertical bounds (beat-em-up style playable area)
    if (this.game) {
      const minY = this.game.height - 250;
      const maxY = this.game.height - 70;
      this.y = Math.max(minY - this.height, Math.min(maxY - this.height, this.y));
    }

    // Animation
    this.animTimer += deltaTime;
    if (this.animTimer > 150) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }

    // Special attack timer
    if (this.specialTimer > 0) {
      this.specialTimer -= deltaTime;
    }
  }

  updateAI(deltaTime, player) {
    if (!player || player.isDead) {
      this.vx = 0;
      return;
    }

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    this.facingRight = dx > 0;

    // Type-specific AI
    switch (this.type) {
      case 'walker':
        this.chasePlayer(dx, dy, distance);
        break;

      case 'runner':
        this.runnerAI(dx, dy, distance, player);
        break;

      case 'brute':
        this.bruteAI(dx, dy, distance, player);
        break;

      case 'spitter':
        this.spitterAI(dx, dy, distance, player);
        break;

      case 'exploder':
        this.exploderAI(dx, dy, distance, player);
        break;

      case 'boss':
        this.bossAI(dx, dy, distance, player, deltaTime);
        break;

      case 'zombie_dog':
        this.zombieDogAI(dx, dy, distance, player);
        break;

      case 'zombie_crow':
        this.zombieCrowAI(dx, dy, distance, player);
        break;

      case 'zombie_rat':
        this.zombieRatAI(dx, dy, distance, player);
        break;

      default:
        this.chasePlayer(dx, dy, distance);
    }
  }

  runnerAI(dx, dy, distance, player) {
    // Runner: Fast, erratic, unpredictable movement
    if (distance > this.aggroRange) {
      // Restless pacing when player is far
      this.vx = Math.sin(this.wobbleOffset * 2) * this.speed * 0.6;
      this.vy = Math.cos(this.wobbleOffset * 3) * this.speed * 0.4;
      return;
    }

    // Erratic movement modifiers
    const erratic = Math.sin(this.wobbleOffset * 4) * 0.3;
    const jitter = (Math.random() - 0.5) * 0.8;

    if (distance > 40) {
      // Fast, zigzagging approach
      this.vx = (dx > 0 ? this.speed : -this.speed) * (1 + erratic) + jitter;

      // Vertical - erratic weaving
      if (Math.abs(dy) > 20) {
        this.vy = (dy > 0 ? this.speed * 0.7 : -this.speed * 0.7) + erratic * 2;
      } else {
        // Random direction changes
        this.vy = Math.sin(this.wobbleOffset * 5) * this.speed * 0.5;
      }

      // Occasional burst of speed
      if (this.lurchTimer > 0) {
        this.vx *= 1.5;
      }
    } else {
      // At player - frenetic attack
      this.vx = jitter * this.speed;
      this.vy = (Math.random() - 0.5) * this.speed;
    }
  }

  chasePlayer(dx, dy, distance) {
    // Only chase if player is within aggro range
    if (distance > this.aggroRange) {
      // Wander aimlessly when player is far
      this.vx = Math.sin(this.wobbleOffset * 0.5) * this.speed * 0.3;
      this.vy = Math.cos(this.wobbleOffset * 0.7) * this.speed * 0.2;
      return;
    }

    if (distance > 35) {
      // Shambling chase - not perfectly accurate
      const accuracy = 0.7 + Math.random() * 0.3; // 70-100% accurate tracking
      const jitter = (Math.random() - 0.5) * 0.5; // Random deviation

      // Horizontal chase with zombie inaccuracy
      this.vx = (dx > 0 ? this.speed : -this.speed) * accuracy + jitter;

      // Vertical chase (slower, less accurate)
      if (Math.abs(dy) > 15) {
        this.vy = (dy > 0 ? this.speed * 0.4 : -this.speed * 0.4) * accuracy;
      } else {
        this.vy *= 0.8; // Slow down vertical when close
      }
    } else {
      // Close to player - attack position
      this.vx *= 0.5;
      this.vy *= 0.5;
    }
  }

  bruteAI(dx, dy, distance, player) {
    // Brute: Heavy, slow, but charges when close
    if (distance > this.aggroRange) {
      // Slow wander
      this.vx = Math.sin(this.wobbleOffset * 0.3) * this.speed * 0.2;
      this.vy = 0;
      return;
    }

    // Vertical - brutes are slow to adjust vertically
    if (Math.abs(dy) > 20) {
      this.vy = dy > 0 ? this.speed * 0.3 : -this.speed * 0.3;
    } else {
      this.vy *= 0.7;
    }

    // Horizontal - charge behavior
    if (distance < 180 && distance > 60) {
      // CHARGE! Brute speeds up dramatically
      this.vx = dx > 0 ? this.speed * 3 : -this.speed * 3;
      this.lurchTimer = 100; // Visual feedback
    } else if (distance > 60) {
      // Slow lumbering approach
      this.vx = dx > 0 ? this.speed * 0.8 : -this.speed * 0.8;
    } else {
      // In attack range - slow down for swing
      this.vx *= 0.3;
    }
  }

  spitterAI(dx, dy, distance, player) {
    // Spitter: Keeps distance, cautious, ranged attacker
    if (distance > this.aggroRange) {
      // Idle swaying
      this.vx = Math.sin(this.wobbleOffset) * this.speed * 0.2;
      this.vy = Math.cos(this.wobbleOffset * 0.5) * this.speed * 0.1;
      return;
    }

    // Vertical positioning - tries to align with player
    if (Math.abs(dy) > 25) {
      this.vy = dy > 0 ? this.speed * 0.4 : -this.speed * 0.4;
    } else {
      this.vy *= 0.6;
    }

    // Horizontal - maintains optimal attack distance
    const optimalDistance = 220;
    if (distance < 140) {
      // Too close - back away nervously
      this.vx = dx > 0 ? -this.speed * 1.2 : this.speed * 1.2;
    } else if (distance > 280) {
      // Too far - approach cautiously
      this.vx = dx > 0 ? this.speed * 0.7 : -this.speed * 0.7;
    } else {
      // In attack range - stop and spit
      this.vx *= 0.5;
      if (this.canAttack && this.specialTimer <= 0) {
        this.shootAcid(player);
        this.specialTimer = this.attackCooldown;
      }
    }
  }

  shootAcid(player) {
    if (!this.game) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const bullet = new Bullet(
      this.x + this.width / 2,
      this.y + this.height / 3,
      (dx / distance) * 8,
      (dy / distance) * 8,
      this.damage,
      true
    );
    bullet.color = '#00ff00';
    bullet.width = 12;
    bullet.height = 12;

    this.game.bullets.push(bullet);
    this.game.spawnParticles(this.x + this.width / 2, this.y + this.height / 3, '#00ff00', 5);
  }

  exploderAI(dx, dy, distance, player) {
    // Exploder: Unstable, stumbling rush toward player
    if (distance < 45) {
      this.explode();
      return;
    }

    if (distance > this.aggroRange) {
      // Stumbling wander
      this.vx = Math.sin(this.wobbleOffset * 2) * this.speed * 0.5;
      this.vy = Math.cos(this.wobbleOffset * 1.5) * this.speed * 0.3;
      return;
    }

    // Erratic rush toward player
    const erratic = Math.sin(this.wobbleOffset * 3) * 0.4;

    // Horizontal - stumbling charge
    this.vx = (dx > 0 ? this.speed : -this.speed) * (1 + erratic);

    // Vertical - erratic weaving
    if (Math.abs(dy) > 15) {
      this.vy = (dy > 0 ? this.speed * 0.7 : -this.speed * 0.7) * (1 + erratic * 0.5);
    } else {
      this.vy = erratic * this.speed * 0.5; // Random vertical wobble
    }

    // Occasionally stumble (brief pause)
    if (Math.random() < 0.02) {
      this.shufflePause = true;
      this.shufflePauseDuration = 100;
    }
  }

  explode() {
    if (this.isDead) return;

    this.isDead = true;

    if (!this.game) return;

    const player = this.game.player;
    if (player && !player.isDead) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100 && !player.invincible && !player.shieldActive) {
        player.takeDamage(this.damage, this.game);
      }
    }

    this.game.addScreenShake(10, 300);
    for (let i = 0; i < 30; i++) {
      this.game.spawnParticles(
        this.x + this.width / 2 + (Math.random() - 0.5) * 80,
        this.y + this.height / 2 + (Math.random() - 0.5) * 80,
        ['#ff4400', '#ff8800', '#ffaa00'][Math.floor(Math.random() * 3)]
      );
    }
  }

  // === ZOMBIE ANIMAL AI ===

  zombieDogAI(dx, dy, distance, player) {
    // Zombie Dog: Fast, aggressive, lunges at player
    if (distance > this.aggroRange) {
      // Pacing, sniffing behavior
      this.vx = Math.sin(this.wobbleOffset * 2) * this.speed * 0.4;
      this.vy = Math.cos(this.wobbleOffset * 3) * this.speed * 0.3;
      return;
    }

    // Erratic, predatory movement
    const erratic = Math.sin(this.wobbleOffset * 5) * 0.4;

    if (distance > 50) {
      // Fast pursuit with zigzag
      this.vx = (dx > 0 ? this.speed : -this.speed) * (1.2 + erratic);

      // Vertical tracking
      if (Math.abs(dy) > 15) {
        this.vy = (dy > 0 ? this.speed * 0.8 : -this.speed * 0.8);
      } else {
        this.vy = Math.sin(this.wobbleOffset * 4) * this.speed * 0.4;
      }

      // Lunge behavior - sudden burst of speed
      if (distance < 120 && this.lurchTimer <= 0) {
        this.lurchTimer = 200;
        this.vx *= 2;
      }
    } else {
      // At player - biting frenzy
      this.vx = (Math.random() - 0.5) * this.speed;
      this.vy = (Math.random() - 0.5) * this.speed * 0.5;
    }
  }

  zombieCrowAI(dx, dy, distance, player) {
    // Zombie Crow: Flying, swooping attacks from above
    if (distance > this.aggroRange) {
      // Circling in the air
      this.vx = Math.sin(this.wobbleOffset) * this.speed * 0.6;
      this.vy = Math.cos(this.wobbleOffset * 0.5) * this.speed * 0.3;
      return;
    }

    // Swooping attack pattern
    const swoopPhase = Math.sin(this.wobbleOffset * 2);

    if (distance > 80) {
      // Approach from above at angle
      this.vx = (dx > 0 ? this.speed : -this.speed) * (0.8 + Math.abs(swoopPhase) * 0.5);

      // Dive-bomb behavior
      if (swoopPhase > 0.5) {
        // Diving down
        this.vy = this.speed * 0.6;
      } else if (swoopPhase < -0.5) {
        // Pulling up
        this.vy = -this.speed * 0.4;
      } else {
        // Level approach
        this.vy = (dy > 0 ? this.speed * 0.3 : -this.speed * 0.3);
      }
    } else {
      // Close - pecking attack with erratic movement
      this.vx = (dx > 0 ? this.speed * 0.5 : -this.speed * 0.5) + (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * this.speed;
    }
  }

  zombieRatAI(dx, dy, distance, player) {
    // Zombie Rat: Small, fast, scurrying, attacks in groups
    if (distance > this.aggroRange) {
      // Scurrying around randomly
      if (Math.random() < 0.05) {
        // Random direction change
        this.vx = (Math.random() - 0.5) * this.speed * 2;
        this.vy = (Math.random() - 0.5) * this.speed;
      }
      return;
    }

    // Erratic scurrying toward player
    const jitter = (Math.random() - 0.5) * 1.5;

    if (distance > 30) {
      // Quick, jerky movement toward player
      this.vx = (dx > 0 ? this.speed : -this.speed) + jitter;

      // Frequent direction changes
      if (Math.random() < 0.1) {
        this.vy = (Math.random() - 0.5) * this.speed * 2;
      } else if (Math.abs(dy) > 10) {
        this.vy = dy > 0 ? this.speed * 0.6 : -this.speed * 0.6;
      }

      // Sudden burst of speed
      if (Math.random() < 0.03) {
        this.lurchTimer = 100;
      }
    } else {
      // At player - nibbling, erratic
      this.vx = jitter * this.speed;
      this.vy = (Math.random() - 0.5) * this.speed;
    }
  }

  bossAI(dx, dy, distance, player, deltaTime) {
    // Boss: Menacing, deliberate movement with powerful attacks
    this.attackTimer += deltaTime;

    // Special attack patterns every 3 seconds
    if (this.attackTimer > 3000) {
      const pattern = Math.floor(Math.random() * 3);

      switch (pattern) {
        case 0:
          // Devastating charge
          this.vx = dx > 0 ? this.speed * 5 : -this.speed * 5;
          this.lurchTimer = 800;
          if (this.game) this.game.addScreenShake(5, 300);
          setTimeout(() => { this.vx = 0; }, 800);
          break;

        case 1:
          // Summon minions (reduced count)
          if (this.game) {
            this.game.spawnZombie('walker');
          }
          break;

        case 2:
          // Acid barrage
          for (let i = 0; i < 3; i++) {
            setTimeout(() => this.shootAcid(player), i * 300);
          }
          break;
      }

      this.attackTimer = 0;
    }

    // Vertical - slow, deliberate adjustment
    if (Math.abs(dy) > 30) {
      this.vy = dy > 0 ? this.speed * 0.4 : -this.speed * 0.4;
    } else {
      this.vy *= 0.8;
    }

    // Horizontal - menacing approach
    if (distance > 120) {
      // Slow, intimidating advance
      this.vx = dx > 0 ? this.speed * 0.7 : -this.speed * 0.7;
    } else if (distance > 80) {
      // Circle slightly at medium range
      this.vx = dx > 0 ? this.speed * 0.3 : -this.speed * 0.3;
      this.vy += Math.sin(this.wobbleOffset) * 0.5;
    } else {
      // In attack range - brief pause before strike
      this.vx *= 0.4;
    }
  }

  takeDamage(amount) {
    if (this.isDead) return;

    this.health -= amount;
    this.flashTimer = 100;

    // Add blood splatter
    this.bloodSplatters.push({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: 3 + Math.random() * 5
    });

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;

    if (this.type === 'exploder') {
      this.explode();
    }
  }

  render(ctx) {
    if (this.isDead && this.deathTimer <= 0) return;

    ctx.save();

    // Death fade out
    if (this.isDead) {
      ctx.globalAlpha = this.deathTimer / 1000;
    }

    // Flip sprite if facing left
    if (!this.facingRight) {
      ctx.translate(this.x + this.width / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(this.x + this.width / 2), 0);
    }

    // Flash when hit
    const isFlashing = this.flashTimer > 0;
    if (isFlashing) {
      this.flashTimer -= 16;
    }

    // Use detailed procedural rendering for zombies
    // Animation wobble for shambling effect
    const shambleX = Math.sin(this.wobbleOffset) * 2;
    const shambleY = Math.cos(this.wobbleOffset * 1.3) * 1;

    ctx.translate(shambleX, shambleY);

    // Draw zombie based on type
    switch (this.type) {
      case 'walker':
        this.renderWalker(ctx, isFlashing);
        break;
      case 'runner':
        this.renderRunner(ctx, isFlashing);
        break;
      case 'brute':
        this.renderBrute(ctx, isFlashing);
        break;
      case 'spitter':
        this.renderSpitter(ctx, isFlashing);
        break;
      case 'exploder':
        this.renderExploder(ctx, isFlashing);
        break;
      case 'boss':
        this.renderBoss(ctx, isFlashing);
        break;
      case 'zombie_dog':
        this.renderZombieDog(ctx, isFlashing);
        break;
      case 'zombie_crow':
        this.renderZombieCrow(ctx, isFlashing);
        break;
      case 'zombie_rat':
        this.renderZombieRat(ctx, isFlashing);
        break;
      default:
        this.renderWalker(ctx, isFlashing);
    }

    ctx.restore();

    // Health bar for non-dead zombies with damage
    if (!this.isDead && this.health < this.maxHealth) {
      this.renderHealthBar(ctx);
    }

    // Boss health bar at top
    if (this.type === 'boss' && !this.isDead) {
      this.renderBossHealthBar(ctx);
    }
  }

  renderWalker(ctx, isFlashing) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    const skinColor = isFlashing ? '#ffffff' : '#6a7a5a'; // Pale greenish dead skin
    const darkSkin = isFlashing ? '#dddddd' : '#4a5a3a';
    const clothesColor = isFlashing ? '#cccccc' : '#3d4d3d';
    const animOffset = Math.sin((this.animFrame + this.limbOffset) * Math.PI / 2) * 6;
    const breathe = Math.sin(Date.now() / 800) * 1;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 8, w / 2 + 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // === LEGS (shambling, bent) ===
    ctx.fillStyle = clothesColor;
    // Left leg - bent at knee
    ctx.save();
    ctx.translate(x + 10, y + h - 22);
    ctx.rotate(0.1 + animOffset * 0.02);
    ctx.fillRect(-5, 0, 12, 28);
    // Torn pants edge
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(-3, 25);
    ctx.lineTo(8, 28);
    ctx.lineTo(10, 32);
    ctx.lineTo(-5, 30);
    ctx.fill();
    ctx.restore();

    // Right leg
    ctx.fillStyle = clothesColor;
    ctx.save();
    ctx.translate(x + w - 10, y + h - 22);
    ctx.rotate(-0.1 - animOffset * 0.02);
    ctx.fillRect(-7, 0, 12, 28);
    ctx.fillStyle = skinColor;
    ctx.fillRect(-5, 26, 10, 6);
    ctx.restore();

    // Bare feet (no shoes - zombie!)
    ctx.fillStyle = darkSkin;
    ctx.fillRect(x + 3, y + h + 5 + animOffset * 0.5, 14, 6);
    ctx.fillRect(x + w - 17, y + h + 5 - animOffset * 0.5, 14, 6);

    // === TORSO (hunched, decayed) ===
    ctx.fillStyle = clothesColor;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 20 + breathe);
    ctx.lineTo(x + w - 3, y + 18 + breathe);
    ctx.lineTo(x + w - 5, y + h - 22);
    ctx.lineTo(x + 5, y + h - 22);
    ctx.closePath();
    ctx.fill();

    // Torn shirt revealing flesh
    ctx.fillStyle = '#6a3a3a'; // Rotting flesh
    ctx.beginPath();
    ctx.ellipse(x + w / 2 + 3, y + 32, 10, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Exposed ribs
    ctx.fillStyle = '#c4b494';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(x + w / 2 + 2, y + 26 + i * 5, 8, 2, 0.1, 0, Math.PI);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Intestines hanging out
    ctx.fillStyle = '#8a4a5a';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 42);
    ctx.quadraticCurveTo(x + w / 2 + 5, y + 50, x + w / 2 - 2, y + 55);
    ctx.quadraticCurveTo(x + w / 2 + 8, y + 58, x + w / 2 + 3, y + 48);
    ctx.stroke();

    // === ARMS (reaching forward, zombie pose) ===
    const armY = y + 22 + breathe;

    // Back arm (left, hanging/dragging)
    ctx.fillStyle = skinColor;
    ctx.save();
    ctx.translate(x - 2, armY);
    ctx.rotate(0.4);
    // Upper arm
    ctx.fillRect(0, 0, 9, 16);
    // Rotting patch on arm
    ctx.fillStyle = darkSkin;
    ctx.fillRect(2, 6, 5, 6);
    // Forearm (limp, hanging)
    ctx.translate(0, 14);
    ctx.rotate(0.3);
    ctx.fillStyle = skinColor;
    ctx.fillRect(0, 0, 8, 14);

    // Back hand (limp claw)
    ctx.translate(0, 12);
    ctx.fillStyle = skinColor;
    ctx.fillRect(-1, 0, 10, 10);
    // Curled fingers
    ctx.fillStyle = darkSkin;
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(7, 1 + i * 2.5);
      ctx.rotate(0.4 + i * 0.1);
      ctx.fillRect(0, 0, 7, 2);
      ctx.restore();
    }
    ctx.restore();

    // Front arm (right, extended reaching)
    ctx.fillStyle = skinColor;
    const reachOffset = animOffset * 0.8;
    ctx.save();
    ctx.translate(x + w - 3, armY - 5);
    ctx.rotate(-0.3);
    // Upper arm
    ctx.fillRect(0, -4, 18 + reachOffset, 10);
    // Elbow joint
    ctx.beginPath();
    ctx.arc(18 + reachOffset, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    // Forearm
    ctx.translate(18 + reachOffset, 0);
    ctx.rotate(0.15);
    ctx.fillRect(0, -4, 16, 9);

    // Claw hand (drawn in arm's coordinate system)
    ctx.translate(16, 0);
    // Palm
    ctx.fillStyle = skinColor;
    ctx.fillRect(-2, -5, 12, 12);
    // Gnarled fingers reaching out
    ctx.fillStyle = darkSkin;
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(8, -4 + i * 3);
      ctx.rotate(-0.3 + i * 0.2);
      ctx.fillRect(0, 0, 12, 3);
      // Dirty fingernail
      ctx.fillStyle = '#1a1a0a';
      ctx.fillRect(10, -1, 4, 4);
      ctx.restore();
    }
    // Thumb
    ctx.save();
    ctx.translate(2, 8);
    ctx.rotate(0.5);
    ctx.fillStyle = darkSkin;
    ctx.fillRect(0, 0, 8, 3);
    ctx.restore();

    ctx.restore();

    // === HEAD (tilted, decayed) ===
    const headW = w * 0.75;
    const headH = headW * 1.15;
    const headX = x + (w - headW) / 2 - 2;
    const headY = y - headH * 0.35;

    // Neck (exposed tendons)
    ctx.fillStyle = darkSkin;
    ctx.fillRect(x + w / 2 - 6, y + 5, 12, 18);
    ctx.fillStyle = '#8a4a4a';
    ctx.fillRect(x + w / 2 - 2, y + 8, 2, 12);
    ctx.fillRect(x + w / 2 + 2, y + 10, 2, 10);

    // Head shape (slightly misshapen)
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(headX + headW / 2, headY + headH / 2, headW / 2, headH / 2, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Missing chunk from skull
    ctx.fillStyle = '#4a2a2a';
    ctx.beginPath();
    ctx.arc(headX + headW * 0.8, headY + headH * 0.25, 7, 0, Math.PI * 2);
    ctx.fill();
    // Exposed skull
    ctx.fillStyle = '#d4c4a4';
    ctx.beginPath();
    ctx.arc(headX + headW * 0.8, headY + headH * 0.25, 5, 0, Math.PI * 2);
    ctx.fill();

    // Rotting patches
    ctx.fillStyle = '#3a4a2a';
    ctx.beginPath();
    ctx.ellipse(headX + headW * 0.2, headY + headH * 0.6, 6, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Sunken eye sockets
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.ellipse(headX + headW * 0.32, headY + headH * 0.42, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + headW * 0.68, headY + headH * 0.4, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing pupils
    ctx.fillStyle = '#ff2200';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(headX + headW * 0.32, headY + headH * 0.42, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + headW * 0.68, headY + headH * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Nose (mostly gone)
    ctx.fillStyle = '#2a1a1a';
    ctx.beginPath();
    ctx.moveTo(headX + headW * 0.5, headY + headH * 0.5);
    ctx.lineTo(headX + headW * 0.45, headY + headH * 0.6);
    ctx.lineTo(headX + headW * 0.55, headY + headH * 0.6);
    ctx.fill();

    // Mouth (gaping, showing teeth and jaw)
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.ellipse(headX + headW * 0.5, headY + headH * 0.78, headW * 0.3, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Upper teeth
    ctx.fillStyle = '#c4c4a4';
    for (let i = 0; i < 5; i++) {
      const tx = headX + headW * 0.3 + i * 4;
      ctx.fillRect(tx, headY + headH * 0.72, 3, 5);
    }
    // Lower teeth (fewer, broken)
    for (let i = 0; i < 3; i++) {
      const tx = headX + headW * 0.35 + i * 5;
      ctx.fillRect(tx, headY + headH * 0.82, 3, 4);
    }

    // Blood dripping
    ctx.fillStyle = '#6b0000';
    const dripY = headY + headH * 0.88 + Math.sin(Date.now() / 200) * 2;
    ctx.fillRect(headX + headW * 0.4, headY + headH * 0.85, 3, dripY - headY - headH * 0.8);
    ctx.fillRect(headX + headW * 0.55, headY + headH * 0.85, 2, dripY - headY - headH * 0.75);

    // Blood splatters from damage
    ctx.fillStyle = '#6b0000';
    this.bloodSplatters.forEach(splat => {
      ctx.beginPath();
      ctx.arc(x + splat.x, y + splat.y, splat.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderRunner(ctx, isFlashing) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    const skinColor = isFlashing ? '#ffffff' : this.skinColor;
    const clothesColor = isFlashing ? '#dddddd' : this.clothesColor;
    const animOffset = Math.sin((this.animFrame + this.limbOffset) * Math.PI / 2) * 8;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 5, w / 2, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs (running pose, more dynamic)
    ctx.fillStyle = clothesColor;
    ctx.save();
    ctx.translate(x + 8, y + h - 15);
    ctx.rotate(animOffset * 0.05);
    ctx.fillRect(-4, 0, 8, 22);
    ctx.restore();

    ctx.save();
    ctx.translate(x + w - 8, y + h - 15);
    ctx.rotate(-animOffset * 0.05);
    ctx.fillRect(-4, 0, 8, 22);
    ctx.restore();

    // Skinny body
    ctx.fillStyle = clothesColor;
    ctx.fillRect(x + 5, y + 12, w - 10, h - 30);

    // Visible spine/ribs (emaciated)
    ctx.fillStyle = skinColor;
    ctx.fillRect(x + w / 2 - 8, y + 20, 16, 20);
    ctx.fillStyle = '#c4b494';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + w / 2 - 6, y + 22 + i * 5, 12, 2);
    }

    // Arms (frantic reaching pose)
    ctx.fillStyle = skinColor;

    // Right arm (upper, reaching forward)
    ctx.save();
    ctx.translate(x + w - 5, y + 15);
    ctx.rotate(-0.2 + animOffset * 0.03);
    ctx.fillRect(0, -3, 16, 7);
    // Forearm
    ctx.translate(14, 0);
    ctx.rotate(-0.1);
    ctx.fillRect(0, -3, 14, 6);
    // Claw hand
    ctx.translate(12, 0);
    ctx.fillRect(0, -4, 8, 10);
    // Sharp fingers
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(6, -3 + i * 3);
      ctx.rotate(-0.2 + i * 0.15);
      ctx.fillRect(0, 0, 10, 2);
      ctx.fillStyle = '#1a1a0a';
      ctx.fillRect(8, -1, 3, 3);
      ctx.fillStyle = skinColor;
      ctx.restore();
    }
    ctx.restore();

    // Left arm (lower, also reaching)
    ctx.save();
    ctx.translate(x + w - 5, y + 28);
    ctx.rotate(-0.1 - animOffset * 0.02);
    ctx.fillRect(0, -3, 14, 6);
    ctx.translate(12, 0);
    ctx.rotate(0.1);
    ctx.fillRect(0, -2, 12, 5);
    // Claw hand
    ctx.translate(10, 0);
    ctx.fillRect(0, -3, 7, 8);
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(5, -2 + i * 2.5);
      ctx.rotate(-0.15 + i * 0.1);
      ctx.fillRect(0, 0, 8, 2);
      ctx.restore();
    }
    ctx.restore();

    // Head (gaunt)
    const headW = w * 0.75;
    const headH = headW * 0.9;
    const headX = x + (w - headW) / 2;
    const headY = y - headH * 0.2;

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(headX + headW / 2, headY + headH / 2, headW / 2, headH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sunken cheeks
    ctx.fillStyle = '#6a4a4a';
    ctx.beginPath();
    ctx.ellipse(headX + 3, headY + headH * 0.6, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + headW - 3, headY + headH * 0.6, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wild eyes
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.ellipse(headX + headW * 0.3, headY + headH * 0.35, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + headW * 0.7, headY + headH * 0.35, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crazed red eyes
    ctx.fillStyle = '#ff3300';
    ctx.shadowColor = '#ff3300';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(headX + headW * 0.3, headY + headH * 0.35, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + headW * 0.7, headY + headH * 0.35, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Open screaming mouth
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.ellipse(headX + headW / 2, headY + headH * 0.75, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blood splatters
    ctx.fillStyle = '#6b0000';
    this.bloodSplatters.forEach(splat => {
      ctx.beginPath();
      ctx.arc(x + splat.x, y + splat.y, splat.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderBrute(ctx, isFlashing) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    const skinColor = isFlashing ? '#ffffff' : this.skinColor;
    const clothesColor = isFlashing ? '#dddddd' : this.clothesColor;
    const animOffset = Math.sin((this.animFrame + this.limbOffset) * Math.PI / 2) * 4;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 8, w / 2, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Massive legs
    ctx.fillStyle = clothesColor;
    ctx.fillRect(x + 8, y + h - 30, 18, 38 + animOffset);
    ctx.fillRect(x + w - 26, y + h - 30, 18, 38 - animOffset);

    // Huge muscular body
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 30);
    ctx.lineTo(x + w - 5, y + 30);
    ctx.lineTo(x + w - 10, y + h - 25);
    ctx.lineTo(x + 10, y + h - 25);
    ctx.closePath();
    ctx.fill();

    // Torn vest/armor
    ctx.fillStyle = '#4a4a3a';
    ctx.fillRect(x + 15, y + 35, w - 30, h - 65);

    // Metal plates
    ctx.fillStyle = '#6a6a5a';
    ctx.fillRect(x + 18, y + 40, 12, 20);
    ctx.fillRect(x + w - 30, y + 40, 12, 20);

    // Massive arms
    ctx.fillStyle = skinColor;
    // Right arm (huge)
    ctx.beginPath();
    ctx.moveTo(x + w - 5, y + 35);
    ctx.lineTo(x + w + 25, y + 40 + animOffset);
    ctx.lineTo(x + w + 30, y + 55 + animOffset);
    ctx.lineTo(x + w + 20, y + 60 + animOffset);
    ctx.lineTo(x + w - 5, y + 55);
    ctx.closePath();
    ctx.fill();

    // Left arm
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 35);
    ctx.lineTo(x - 15, y + 45 - animOffset);
    ctx.lineTo(x - 20, y + 60 - animOffset);
    ctx.lineTo(x - 10, y + 65 - animOffset);
    ctx.lineTo(x + 5, y + 55);
    ctx.closePath();
    ctx.fill();

    // Right fist (massive clenched)
    ctx.fillStyle = skinColor;
    ctx.save();
    ctx.translate(x + w + 20, y + 55 + animOffset);
    // Fist base
    ctx.fillRect(0, -5, 18, 18);
    // Knuckles
    ctx.fillStyle = '#5a6a4a';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(16, -2 + i * 5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // Thumb
    ctx.fillStyle = skinColor;
    ctx.fillRect(-3, 5, 8, 6);
    ctx.restore();

    // Left fist
    ctx.fillStyle = skinColor;
    ctx.save();
    ctx.translate(x - 25, y + 58 - animOffset);
    ctx.fillRect(0, -5, 18, 18);
    ctx.fillStyle = '#5a6a4a';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(2, -2 + i * 5, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = skinColor;
    ctx.fillRect(13, 5, 8, 6);
    ctx.restore();

    // Massive head
    const headW = w * 0.6;
    const headH = headW * 1.2;
    const headX = x + (w - headW) / 2;
    const headY = y - headH * 0.1;

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(headX + headW / 2, headY + headH / 2, headW / 2, headH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Scars
    ctx.strokeStyle = '#4a3a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(headX + 5, headY + 10);
    ctx.lineTo(headX + 20, headY + 25);
    ctx.stroke();

    // Angry brow
    ctx.fillStyle = skinColor;
    ctx.fillRect(headX + 5, headY + headH * 0.25, headW - 10, 8);

    // Small angry eyes
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(headX + headW * 0.3, headY + headH * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + headW * 0.7, headY + headH * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Grimacing mouth
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(headX + headW * 0.2, headY + headH * 0.7, headW * 0.6, 10);

    // Jagged teeth
    ctx.fillStyle = '#c4c4a4';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(headX + headW * 0.25 + i * 7, headY + headH * 0.7);
      ctx.lineTo(headX + headW * 0.28 + i * 7, headY + headH * 0.7 + 6);
      ctx.lineTo(headX + headW * 0.22 + i * 7, headY + headH * 0.7);
      ctx.fill();
    }

    // Blood splatters
    ctx.fillStyle = '#6b0000';
    this.bloodSplatters.forEach(splat => {
      ctx.beginPath();
      ctx.arc(x + splat.x, y + splat.y, splat.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderSpitter(ctx, isFlashing) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    const skinColor = isFlashing ? '#ffffff' : this.skinColor;
    const clothesColor = isFlashing ? '#dddddd' : this.clothesColor;
    const animOffset = Math.sin((this.animFrame + this.limbOffset) * Math.PI / 2) * 4;

    // Shadow
    ctx.fillStyle = 'rgba(0, 50, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 5, w / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = clothesColor;
    ctx.fillRect(x + 5, y + h - 18, 10, 23 + animOffset);
    ctx.fillRect(x + w - 15, y + h - 18, 10, 23 - animOffset);

    // Body with acid-swollen belly
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 2, h / 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Acid glow in belly
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2 + 5, w / 3, h / 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Arms (thin, sickly) with dripping acid hands
    ctx.fillStyle = skinColor;

    // Right arm
    ctx.save();
    ctx.translate(x + w - 3, y + 18);
    ctx.fillRect(0, 0, 14 + animOffset, 5);
    // Hand with acid drip
    ctx.translate(12 + animOffset, -2);
    ctx.fillRect(0, 0, 8, 10);
    // Fingers
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(6, i * 2.5, 6, 2);
    }
    // Acid dripping from hand
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 5;
    const dripLen = 5 + Math.sin(Date.now() / 150 + this.limbOffset) * 3;
    ctx.fillRect(4, 10, 3, dripLen);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Left arm
    ctx.fillStyle = skinColor;
    ctx.save();
    ctx.translate(x - 12, y + 18);
    ctx.fillRect(0, 0, 14, 5);
    ctx.translate(-2, -2);
    ctx.fillRect(-6, 0, 8, 10);
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(-10, i * 2.5, 5, 2);
    }
    ctx.restore();

    // Head (bloated)
    const headW = w * 0.8;
    const headH = headW * 1.1;
    const headX = x + (w - headW) / 2;
    const headY = y - headH * 0.4;

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(headX + headW / 2, headY + headH / 2, headW / 2, headH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Acid pustules
    ctx.fillStyle = '#88ff88';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(headX + headW * 0.2, headY + headH * 0.3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + headW * 0.8, headY + headH * 0.5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Sunken eyes
    ctx.fillStyle = '#003300';
    ctx.beginPath();
    ctx.ellipse(headX + headW * 0.35, headY + headH * 0.4, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + headW * 0.65, headY + headH * 0.4, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing green eyes
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(headX + headW * 0.35, headY + headH * 0.4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + headW * 0.65, headY + headH * 0.4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Drooling acid mouth
    ctx.fillStyle = '#002200';
    ctx.fillRect(headX + headW * 0.3, headY + headH * 0.7, headW * 0.4, 8);

    // Acid drool
    ctx.fillStyle = '#00ff00';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 5;
    const droolHeight = 10 + Math.sin(this.animFrame) * 5;
    ctx.fillRect(headX + headW * 0.45, headY + headH * 0.78, 4, droolHeight);
    ctx.shadowBlur = 0;

    // Blood splatters
    ctx.fillStyle = '#006600';
    this.bloodSplatters.forEach(splat => {
      ctx.beginPath();
      ctx.arc(x + splat.x, y + splat.y, splat.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderExploder(ctx, isFlashing) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    const skinColor = isFlashing ? '#ffffff' : this.skinColor;
    const animOffset = Math.sin((this.animFrame + this.limbOffset) * Math.PI / 2) * 5;
    const pulseOffset = Math.sin(Date.now() / 100) * 3;

    // Shadow (pulsing)
    ctx.fillStyle = 'rgba(255, 50, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 5, w / 2 + pulseOffset, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs (stubby)
    ctx.fillStyle = skinColor;
    ctx.fillRect(x + 8, y + h - 15, 10, 20 + animOffset);
    ctx.fillRect(x + w - 18, y + h - 15, 10, 20 - animOffset);

    // Bloated body
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing explosive belly
    const gradient = ctx.createRadialGradient(
      x + w / 2, y + h / 2, 0,
      x + w / 2, y + h / 2, w / 2
    );
    gradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 20 + pulseOffset * 2;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 3 + pulseOffset, h / 3 + pulseOffset, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Veins/cracks glowing
    ctx.strokeStyle = '#ff8800';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 5;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h / 2);
      ctx.lineTo(
        x + w / 2 + Math.cos(angle) * (w / 3 + pulseOffset),
        y + h / 2 + Math.sin(angle) * (h / 3 + pulseOffset)
      );
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Small stubby arms (bloated body makes them look tiny)
    ctx.fillStyle = skinColor;
    // Right arm
    ctx.save();
    ctx.translate(x + w - 2, y + 15);
    ctx.fillRect(0, 0, 10, 6);
    // Tiny twitchy hand
    ctx.translate(8, -1);
    ctx.fillRect(0, 0, 6, 8);
    // Small fingers
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(5, i * 3, 4, 2);
    }
    ctx.restore();

    // Left arm
    ctx.save();
    ctx.translate(x - 8, y + 15);
    ctx.fillRect(0, 0, 10, 6);
    ctx.translate(-4, -1);
    ctx.fillRect(-2, 0, 6, 8);
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-5, i * 3, 4, 2);
    }
    ctx.restore();

    // Small head
    const headW = w * 0.5;
    const headH = headW;
    const headX = x + (w - headW) / 2;
    const headY = y - headH * 0.3;

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(headX + headW / 2, headY + headH / 2, headW / 2, headH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crazed eyes
    ctx.fillStyle = '#ff4400';
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(headX + headW * 0.3, headY + headH * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + headW * 0.7, headY + headH * 0.4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Warning icon on body
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚠', x + w / 2, y + h / 2 + 5);
    ctx.textAlign = 'left';
  }

  renderBoss(ctx, isFlashing) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    const skinColor = isFlashing ? '#ffffff' : this.skinColor;
    const clothesColor = isFlashing ? '#dddddd' : this.clothesColor;
    const animOffset = Math.sin((this.animFrame + this.limbOffset) * Math.PI / 2) * 6;

    // Ominous shadow
    ctx.fillStyle = 'rgba(50, 0, 50, 0.5)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 10, w / 2, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Massive legs
    ctx.fillStyle = clothesColor;
    ctx.fillRect(x + 15, y + h - 40, 25, 50 + animOffset);
    ctx.fillRect(x + w - 40, y + h - 40, 25, 50 - animOffset);

    // Huge muscular body
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(x, y + 40);
    ctx.lineTo(x + w, y + 40);
    ctx.lineTo(x + w - 15, y + h - 35);
    ctx.lineTo(x + 15, y + h - 35);
    ctx.closePath();
    ctx.fill();

    // Armor/spikes
    ctx.fillStyle = '#3a2a3a';
    ctx.fillRect(x + 20, y + 50, w - 40, h - 100);

    // Spike decorations
    ctx.fillStyle = '#5a4a5a';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 30 + i * 20, y + 50);
      ctx.lineTo(x + 40 + i * 20, y + 35);
      ctx.lineTo(x + 50 + i * 20, y + 50);
      ctx.fill();
    }

    // Massive arms
    ctx.fillStyle = skinColor;
    // Right arm
    ctx.beginPath();
    ctx.moveTo(x + w, y + 45);
    ctx.quadraticCurveTo(x + w + 40, y + 60, x + w + 35, y + 90 + animOffset);
    ctx.lineTo(x + w + 20, y + 90 + animOffset);
    ctx.quadraticCurveTo(x + w + 15, y + 65, x + w, y + 70);
    ctx.closePath();
    ctx.fill();

    // Left arm
    ctx.beginPath();
    ctx.moveTo(x, y + 45);
    ctx.quadraticCurveTo(x - 40, y + 60, x - 35, y + 90 - animOffset);
    ctx.lineTo(x - 20, y + 90 - animOffset);
    ctx.quadraticCurveTo(x - 15, y + 65, x, y + 70);
    ctx.closePath();
    ctx.fill();

    // Huge menacing fists with claws
    ctx.fillStyle = skinColor;

    // Right fist
    ctx.save();
    ctx.translate(x + w + 18, y + 85 + animOffset);
    // Massive fist
    ctx.fillRect(0, 0, 25, 22);
    ctx.beginPath();
    ctx.arc(12, 0, 12, Math.PI, 0);
    ctx.fill();
    // Knuckle spikes
    ctx.fillStyle = '#8a7a6a';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(3 + i * 6, 0);
      ctx.lineTo(6 + i * 6, -8);
      ctx.lineTo(9 + i * 6, 0);
      ctx.fill();
    }
    // Clawed fingers
    ctx.fillStyle = skinColor;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(22, 3 + i * 5, 10, 4);
      ctx.fillStyle = '#2a1a1a';
      ctx.beginPath();
      ctx.moveTo(32, 3 + i * 5);
      ctx.lineTo(38, 5 + i * 5);
      ctx.lineTo(32, 7 + i * 5);
      ctx.fill();
      ctx.fillStyle = skinColor;
    }
    ctx.restore();

    // Left fist
    ctx.save();
    ctx.translate(x - 43, y + 85 - animOffset);
    ctx.fillRect(0, 0, 25, 22);
    ctx.beginPath();
    ctx.arc(12, 0, 12, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#8a7a6a';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(3 + i * 6, 0);
      ctx.lineTo(6 + i * 6, -8);
      ctx.lineTo(9 + i * 6, 0);
      ctx.fill();
    }
    ctx.fillStyle = skinColor;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(-8, 3 + i * 5, 10, 4);
      ctx.fillStyle = '#2a1a1a';
      ctx.beginPath();
      ctx.moveTo(-8, 3 + i * 5);
      ctx.lineTo(-14, 5 + i * 5);
      ctx.lineTo(-8, 7 + i * 5);
      ctx.fill();
      ctx.fillStyle = skinColor;
    }
    ctx.restore();

    // Massive head
    const headW = w * 0.5;
    const headH = headW * 1.3;
    const headX = x + (w - headW) / 2;
    const headY = y - headH * 0.2;

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(headX + headW / 2, headY + headH / 2, headW / 2, headH / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = '#8a7a6a';
    // Left horn
    ctx.beginPath();
    ctx.moveTo(headX + 5, headY + 10);
    ctx.quadraticCurveTo(headX - 15, headY - 20, headX - 10, headY - 35);
    ctx.quadraticCurveTo(headX - 5, headY - 20, headX + 10, headY + 5);
    ctx.fill();
    // Right horn
    ctx.beginPath();
    ctx.moveTo(headX + headW - 5, headY + 10);
    ctx.quadraticCurveTo(headX + headW + 15, headY - 20, headX + headW + 10, headY - 35);
    ctx.quadraticCurveTo(headX + headW + 5, headY - 20, headX + headW - 10, headY + 5);
    ctx.fill();

    // Crown
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(headX + 10, headY + 5);
    ctx.lineTo(headX + 15, headY - 10);
    ctx.lineTo(headX + 25, headY + 5);
    ctx.lineTo(headX + headW / 2, headY - 15);
    ctx.lineTo(headX + headW - 25, headY + 5);
    ctx.lineTo(headX + headW - 15, headY - 10);
    ctx.lineTo(headX + headW - 10, headY + 5);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Menacing eyes
    ctx.fillStyle = '#1a001a';
    ctx.beginPath();
    ctx.ellipse(headX + headW * 0.3, headY + headH * 0.4, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + headW * 0.7, headY + headH * 0.4, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing purple eyes
    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(headX + headW * 0.3, headY + headH * 0.4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + headW * 0.7, headY + headH * 0.4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Fearsome mouth
    ctx.fillStyle = '#0a000a';
    ctx.fillRect(headX + headW * 0.15, headY + headH * 0.7, headW * 0.7, 15);

    // Sharp teeth
    ctx.fillStyle = '#d4d4b4';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(headX + headW * 0.2 + i * 8, headY + headH * 0.7);
      ctx.lineTo(headX + headW * 0.24 + i * 8, headY + headH * 0.7 + 10);
      ctx.lineTo(headX + headW * 0.16 + i * 8, headY + headH * 0.7);
      ctx.fill();
    }

    // Aura effect
    ctx.strokeStyle = 'rgba(128, 0, 128, 0.3)';
    ctx.lineWidth = 3;
    const auraOffset = Math.sin(Date.now() / 200) * 5;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2 + 10 + auraOffset, h / 2 + 10 + auraOffset, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === ZOMBIE ANIMAL RENDER METHODS ===

  renderZombieDog(ctx, isFlashing) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    const skinColor = isFlashing ? '#ffffff' : this.skinColor;
    const darkSkin = isFlashing ? '#dddddd' : '#4a3a2a';
    const animOffset = Math.sin((this.animFrame + this.limbOffset) * Math.PI / 2) * 5;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 3, w / 2 - 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Back legs
    ctx.fillStyle = skinColor;
    ctx.save();
    ctx.translate(x + 8, y + h - 8);
    ctx.rotate(-0.2 + animOffset * 0.04);
    ctx.fillRect(-3, 0, 6, 12);
    // Paw
    ctx.fillStyle = darkSkin;
    ctx.fillRect(-4, 10, 8, 4);
    ctx.restore();

    ctx.fillStyle = skinColor;
    ctx.save();
    ctx.translate(x + 18, y + h - 8);
    ctx.rotate(0.1 - animOffset * 0.03);
    ctx.fillRect(-3, 0, 6, 10);
    ctx.fillStyle = darkSkin;
    ctx.fillRect(-4, 8, 8, 4);
    ctx.restore();

    // Body - emaciated, ribs showing
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 3, h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Exposed ribs
    ctx.fillStyle = '#8a7a6a';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(x + 15 + i * 7, y + h / 2, 3, 6, 0.2, 0, Math.PI);
      ctx.stroke();
    }

    // Rotting patches
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.ellipse(x + w / 2 + 5, y + h / 2 - 3, 8, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Front legs
    ctx.fillStyle = skinColor;
    ctx.save();
    ctx.translate(x + w - 18, y + h - 10);
    ctx.rotate(0.2 + animOffset * 0.04);
    ctx.fillRect(-3, 0, 6, 14);
    ctx.fillStyle = darkSkin;
    ctx.fillRect(-4, 12, 8, 4);
    ctx.restore();

    ctx.fillStyle = skinColor;
    ctx.save();
    ctx.translate(x + w - 8, y + h - 10);
    ctx.rotate(-0.1 - animOffset * 0.03);
    ctx.fillRect(-3, 0, 6, 12);
    ctx.fillStyle = darkSkin;
    ctx.fillRect(-4, 10, 8, 4);
    ctx.restore();

    // Tail (mangy, partially missing)
    ctx.fillStyle = skinColor;
    ctx.save();
    ctx.translate(x + 3, y + h / 2 - 5);
    ctx.rotate(-0.3 + Math.sin(this.wobbleOffset * 3) * 0.2);
    ctx.fillRect(-12, -2, 12, 4);
    // Missing chunk
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(-8, -1, 4, 3);
    ctx.restore();

    // Head
    const headW = 18;
    const headH = 14;
    const headX = x + w - 8;
    const headY = y + 2;

    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(headX, headY + headH / 2, headW / 2, headH / 2, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = darkSkin;
    ctx.beginPath();
    ctx.ellipse(headX + headW / 2 + 3, headY + headH / 2 + 2, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.arc(headX + headW / 2 + 10, headY + headH / 2 + 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Ears (torn)
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(headX - 3, headY);
    ctx.lineTo(headX - 8, headY - 10);
    ctx.lineTo(headX + 2, headY + 2);
    ctx.fill();
    // Torn ear
    ctx.beginPath();
    ctx.moveTo(headX + 5, headY);
    ctx.lineTo(headX + 3, headY - 8);
    ctx.lineTo(headX + 8, headY + 2);
    ctx.fill();

    // Glowing red eyes
    ctx.fillStyle = '#ff2200';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(headX + 2, headY + headH / 2 - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + 8, headY + headH / 2 - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snarling mouth with teeth
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.ellipse(headX + headW / 2 + 5, headY + headH / 2 + 6, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sharp teeth
    ctx.fillStyle = '#c4c4a4';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(headX + headW / 2 + i * 3, headY + headH / 2 + 4);
      ctx.lineTo(headX + headW / 2 + 1.5 + i * 3, headY + headH / 2 + 8);
      ctx.lineTo(headX + headW / 2 - 1 + i * 3, headY + headH / 2 + 4);
      ctx.fill();
    }

    // Drool/blood
    ctx.fillStyle = '#6b0000';
    ctx.fillRect(headX + headW / 2 + 3, headY + headH / 2 + 8, 2, 4 + Math.sin(Date.now() / 200) * 2);

    // Blood splatters
    ctx.fillStyle = '#6b0000';
    this.bloodSplatters.forEach(splat => {
      ctx.beginPath();
      ctx.arc(x + splat.x, y + splat.y, splat.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderZombieCrow(ctx, isFlashing) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    const bodyColor = isFlashing ? '#ffffff' : this.skinColor;
    const darkColor = isFlashing ? '#cccccc' : '#0a0a1a';
    const animOffset = Math.sin((this.animFrame + this.limbOffset) * Math.PI / 2) * 8;
    const flapOffset = Math.sin(Date.now() / 80) * 15; // Wing flap

    // Shadow (on ground below)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 40, w / 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = bodyColor;

    // Left wing
    ctx.save();
    ctx.translate(x + w / 2 - 5, y + h / 2);
    ctx.rotate(-0.3 - flapOffset * 0.03);
    // Wing shape
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-20, -10 - flapOffset, -30, 5);
    ctx.quadraticCurveTo(-20, 8, 0, 5);
    ctx.closePath();
    ctx.fill();
    // Feathers (ragged)
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(-25, 0);
    ctx.lineTo(-32, 2);
    ctx.lineTo(-28, 5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-20, 3);
    ctx.lineTo(-26, 6);
    ctx.lineTo(-22, 8);
    ctx.fill();
    ctx.restore();

    // Right wing
    ctx.fillStyle = bodyColor;
    ctx.save();
    ctx.translate(x + w / 2 + 5, y + h / 2);
    ctx.rotate(0.3 + flapOffset * 0.03);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(20, -10 - flapOffset, 30, 5);
    ctx.quadraticCurveTo(20, 8, 0, 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.lineTo(32, 2);
    ctx.lineTo(28, 5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(20, 3);
    ctx.lineTo(26, 6);
    ctx.lineTo(22, 8);
    ctx.fill();
    ctx.restore();

    // Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 3, h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotting patches
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.ellipse(x + w / 2 + 3, y + h / 2 + 2, 5, 4, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Missing feathers (exposed flesh)
    ctx.fillStyle = '#4a2a2a';
    ctx.beginPath();
    ctx.ellipse(x + w / 2 - 5, y + h / 2 - 3, 4, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Tail feathers (ragged)
    ctx.fillStyle = darkColor;
    ctx.save();
    ctx.translate(x + w / 2 - 10, y + h / 2 + 5);
    ctx.rotate(0.2);
    ctx.fillRect(0, 0, -15, 4);
    ctx.fillRect(-3, -2, -12, 3);
    ctx.fillRect(-5, 4, -10, 3);
    ctx.restore();

    // Legs (small, dangling)
    ctx.fillStyle = '#3a3a2a';
    ctx.fillRect(x + w / 2 - 5, y + h - 3, 2, 8);
    ctx.fillRect(x + w / 2 + 3, y + h - 3, 2, 8);
    // Claws
    ctx.fillRect(x + w / 2 - 7, y + h + 4, 5, 2);
    ctx.fillRect(x + w / 2 + 2, y + h + 4, 5, 2);

    // Head
    const headX = x + w / 2 + 8;
    const headY = y + 3;

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(headX, headY + 6, 7, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Beak (sharp, cracked)
    ctx.fillStyle = '#4a4a3a';
    ctx.beginPath();
    ctx.moveTo(headX + 5, headY + 5);
    ctx.lineTo(headX + 18, headY + 7);
    ctx.lineTo(headX + 5, headY + 9);
    ctx.closePath();
    ctx.fill();

    // Beak crack
    ctx.strokeStyle = '#2a2a1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(headX + 10, headY + 6);
    ctx.lineTo(headX + 8, headY + 8);
    ctx.stroke();

    // Eye socket
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(headX + 2, headY + 5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Glowing red eye
    ctx.fillStyle = '#ff3300';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(headX + 2, headY + 5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Blood drip from beak
    ctx.fillStyle = '#6b0000';
    ctx.fillRect(headX + 14, headY + 8, 2, 3 + Math.sin(Date.now() / 150) * 2);

    // Blood splatters
    this.bloodSplatters.forEach(splat => {
      ctx.beginPath();
      ctx.arc(x + splat.x, y + splat.y, splat.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderZombieRat(ctx, isFlashing) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;
    const furColor = isFlashing ? '#ffffff' : this.skinColor;
    const darkFur = isFlashing ? '#cccccc' : '#3a2a2a';
    const animOffset = Math.sin((this.animFrame + this.limbOffset) * Math.PI / 2) * 3;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 2, w / 2 - 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail (long, disgusting)
    ctx.strokeStyle = '#5a4a4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h / 2);
    ctx.quadraticCurveTo(
      x - 10 + Math.sin(this.wobbleOffset * 4) * 3,
      y + h / 2 + 5,
      x - 18 + Math.sin(this.wobbleOffset * 3) * 5,
      y + h / 2 + 2
    );
    ctx.stroke();

    // Back legs
    ctx.fillStyle = furColor;
    ctx.save();
    ctx.translate(x + 5, y + h - 4);
    ctx.rotate(-0.1 + animOffset * 0.05);
    ctx.fillRect(-2, 0, 4, 6);
    ctx.fillStyle = darkFur;
    ctx.fillRect(-2, 5, 5, 2);
    ctx.restore();

    ctx.fillStyle = furColor;
    ctx.save();
    ctx.translate(x + 10, y + h - 4);
    ctx.rotate(0.1 - animOffset * 0.04);
    ctx.fillRect(-2, 0, 4, 5);
    ctx.fillStyle = darkFur;
    ctx.fillRect(-2, 4, 5, 2);
    ctx.restore();

    // Body
    ctx.fillStyle = furColor;
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 2, h / 2 - 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mangy patches
    ctx.fillStyle = '#4a3a3a';
    ctx.beginPath();
    ctx.ellipse(x + w / 2 - 3, y + h / 2, 4, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Exposed skin/wound
    ctx.fillStyle = '#6a3a3a';
    ctx.beginPath();
    ctx.ellipse(x + w / 2 + 2, y + h / 2 + 2, 3, 2, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Front legs
    ctx.fillStyle = furColor;
    ctx.save();
    ctx.translate(x + w - 8, y + h - 4);
    ctx.rotate(0.15 + animOffset * 0.05);
    ctx.fillRect(-2, 0, 4, 5);
    ctx.fillStyle = darkFur;
    ctx.fillRect(-2, 4, 5, 2);
    ctx.restore();

    ctx.fillStyle = furColor;
    ctx.save();
    ctx.translate(x + w - 4, y + h - 4);
    ctx.rotate(-0.1 - animOffset * 0.04);
    ctx.fillRect(-2, 0, 4, 4);
    ctx.fillStyle = darkFur;
    ctx.fillRect(-2, 3, 5, 2);
    ctx.restore();

    // Head
    const headX = x + w - 3;
    const headY = y + 2;

    ctx.fillStyle = furColor;
    ctx.beginPath();
    ctx.ellipse(headX, headY + 5, 6, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = darkFur;
    ctx.beginPath();
    ctx.ellipse(headX + 6, headY + 6, 4, 3, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = '#2a1a1a';
    ctx.beginPath();
    ctx.arc(headX + 9, headY + 6, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Ears (ragged)
    ctx.fillStyle = furColor;
    ctx.beginPath();
    ctx.ellipse(headX - 3, headY + 1, 3, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(headX + 1, headY, 3, 4, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Torn ear
    ctx.fillStyle = '#2a1a1a';
    ctx.beginPath();
    ctx.arc(headX - 2, headY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Beady red eyes
    ctx.fillStyle = '#ff2200';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(headX + 2, headY + 4, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headX + 5, headY + 4, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Whiskers
    ctx.strokeStyle = '#3a2a2a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(headX + 7, headY + 5 + i);
      ctx.lineTo(headX + 12, headY + 4 + i * 1.5);
      ctx.stroke();
    }

    // Sharp teeth
    ctx.fillStyle = '#c4c4a4';
    ctx.beginPath();
    ctx.moveTo(headX + 6, headY + 8);
    ctx.lineTo(headX + 7, headY + 10);
    ctx.lineTo(headX + 5, headY + 8);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + 8, headY + 8);
    ctx.lineTo(headX + 9, headY + 10);
    ctx.lineTo(headX + 7, headY + 8);
    ctx.fill();

    // Blood splatters
    ctx.fillStyle = '#6b0000';
    this.bloodSplatters.forEach(splat => {
      ctx.beginPath();
      ctx.arc(x + splat.x, y + splat.y, splat.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  renderHealthBar(ctx) {
    const barWidth = this.width;
    const barHeight = 6;
    const x = this.x;
    const y = this.y - 18;

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);

    // Health
    const healthPercent = this.health / this.maxHealth;
    const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
    if (healthPercent > 0.5) {
      gradient.addColorStop(0, '#00ff00');
      gradient.addColorStop(1, '#88ff88');
    } else if (healthPercent > 0.25) {
      gradient.addColorStop(0, '#ffff00');
      gradient.addColorStop(1, '#ffaa00');
    } else {
      gradient.addColorStop(0, '#ff0000');
      gradient.addColorStop(1, '#ff4444');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth * healthPercent, barHeight);

    // Border
    ctx.strokeStyle = '#444';
    ctx.strokeRect(x - 1, y - 1, barWidth + 2, barHeight + 2);
  }

  renderBossHealthBar(ctx) {
    if (!this.game) return;

    const barWidth = this.game.width - 100;
    const barHeight = 25;
    const x = 50;
    const y = 50;

    // Background panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 10, y - 25, barWidth + 20, barHeight + 40);
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 10, y - 25, barWidth + 20, barHeight + 40);

    // Boss name
    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 10;
    ctx.font = 'bold 16px Orbitron, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💀 BOSS - THE UNDEAD KING 💀', x + barWidth / 2, y - 5);
    ctx.shadowBlur = 0;

    // Health bar background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, barWidth, barHeight);

    // Health
    const healthPercent = this.health / this.maxHealth;
    const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
    gradient.addColorStop(0, '#ff0066');
    gradient.addColorStop(0.5, '#ff00ff');
    gradient.addColorStop(1, '#aa00ff');

    ctx.fillStyle = gradient;
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 10;
    ctx.fillRect(x + 2, y + 2, (barWidth - 4) * healthPercent, barHeight - 4);
    ctx.shadowBlur = 0;

    // Health text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Orbitron, Arial';
    ctx.fillText(`${Math.ceil(this.health)} / ${this.maxHealth}`, x + barWidth / 2, y + barHeight - 5);

    // Border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);
    ctx.lineWidth = 1;
    ctx.textAlign = 'left';
  }
}

// Export for use in other modules
window.Zombie = Zombie;
