// Main Game Engine
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Game state
    this.state = 'menu'; // menu, playing, paused, gameover, levelcomplete
    this.score = 0;
    this.lives = 3;
    this.currentLevel = 1;
    this.wave = 1;
    this.waveZombiesRemaining = 0;
    this.wavesPerLevel = 5;
    this.waitingForNextWave = false;

    // Wave banner display
    this.waveBanner = {
      active: false,
      text: '',
      timer: 0,
      duration: 2000,
      scale: 0,
    };

    // Weapon switch display
    this.weaponSwitchDisplay = {
      active: false,
      weapon: null,
      timer: 0,
      duration: 1200,
    };

    // Game objects
    this.player = null;
    this.zombies = [];
    this.bullets = [];
    this.powerups = [];
    this.particles = [];
    this.damageNumbers = [];

    // Timing
    this.lastTime = 0;
    this.deltaTime = 0;
    this.gameTime = 0;
    this.waveTimer = 0;
    this.waveDelay = 2000;

    // Level data
    this.levelManager = null;

    // Input
    this.keys = {};
    this.mouseDown = false;
    this.mousePos = { x: 0, y: 0 };

    // Weapon slot UI
    this.weaponSlotBounds = [];
    this.hoveredWeaponSlot = null;

    // Stats for tracking
    this.sessionStats = {
      kills: 0,
      deaths: 0,
      shotsHired: 0,
      shotsHit: 0,
      meleeKills: 0,
      damageTaken: 0,
      powerupsCollected: 0,
    };

    // Camera for scrolling
    this.camera = { x: 0, y: 0 };
    this.levelWidth = 2000;

    // Screen shake
    this.screenShake = { intensity: 0, duration: 0 };

    // Combo system
    this.combo = 0;
    this.comboTimer = 0;
    this.comboTimeout = 3000; // 3 seconds to maintain combo
    this.maxCombo = 0;
    this.comboDisplay = { text: '', color: '', alpha: 0, scale: 1 };

    // Grenades array
    this.grenades = [];

    // Challenge mode
    this.challengeMode = false;
    this.challengeData = null;
    this.challengeProgress = 0;
    this.challengeWeaponKills = {};
    this.levelStartTime = 0;

    // Sprite manager
    this.spritesLoaded = false;
    this.initSprites();

    this.setupInput();
  }

  async initSprites() {
    if (window.spriteManager) {
      await window.spriteManager.init();
      this.spritesLoaded = true;
      console.log('Game sprites initialized');
    }
  }

  setupInput() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'KeyP' && this.state === 'playing') {
        this.togglePause();
      }

      // Weapon switching (1-9 keys)
      if (e.code >= 'Digit1' && e.code <= 'Digit9' && this.player) {
        const weaponIndex = parseInt(e.code.replace('Digit', '')) - 1;
        if (weaponIndex < this.player.weapons.length) {
          this.player.switchWeapon(weaponIndex);
          this.showWeaponSwitch(this.player.weapons[weaponIndex]);
        }
      }

      // Prevent default for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.updateMousePos(e);

      // Check if clicking on a weapon slot
      const clickedSlot = this.getClickedWeaponSlot(this.mousePos.x, this.mousePos.y);
      if (clickedSlot !== null && this.player && clickedSlot < this.player.weapons.length) {
        this.player.switchWeapon(clickedSlot);
        this.showWeaponSwitch(this.player.weapons[clickedSlot]);
        return; // Don't shoot when clicking weapon slots
      }

      this.mouseDown = true;
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mouseDown = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.updateMousePos(e);

      // Track hover state for weapon slots
      const hoveredSlot = this.getClickedWeaponSlot(this.mousePos.x, this.mousePos.y);
      if (hoveredSlot !== this.hoveredWeaponSlot) {
        this.hoveredWeaponSlot = hoveredSlot;
        this.canvas.style.cursor = hoveredSlot !== null ? 'pointer' : 'default';
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.player && this.state === 'playing') {
        this.player.melee(this);
      }
    });
  }

  updateMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    this.mousePos.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
  }

  init(levelManager) {
    this.levelManager = levelManager;
    this.reset();
  }

  reset() {
    this.state = 'menu';
    this.score = 0;
    this.lives = 3;
    this.currentLevel = 1;
    this.wave = 1;
    this.waitingForNextWave = false;
    this.zombies = [];
    this.bullets = [];
    this.powerups = [];
    this.particles = [];
    this.damageNumbers = [];
    this.camera = { x: 0, y: 0 };
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.comboDisplay = { text: '', color: '', alpha: 0, scale: 1 };
    this.grenades = [];
    this.challengeMode = false;
    this.challengeData = null;
    this.challengeProgress = 0;
    this.challengeWeaponKills = {};
    this.levelStartTime = 0;
    this.sessionStats = {
      kills: 0,
      deaths: 0,
      shotsFired: 0,
      shotsHit: 0,
      meleeKills: 0,
      damageTaken: 0,
      powerupsCollected: 0,
      grenadeKills: 0,
      bossKills: 0,
      noDamageKills: 0,
      maxCombo: 0,
      levelCompletedNoDamage: false,
    };
  }

  startGame(level = 1) {
    this.currentLevel = level;
    this.score = 0;
    this.lives = 3;
    this.loadLevel(level);
    this.state = 'playing';
    this.levelStartTime = Date.now();
  }

  setChallengeMode(challengeData) {
    this.challengeMode = true;
    this.challengeData = challengeData;
    this.challengeProgress = 0;
    this.challengeWeaponKills = {};
  }

  loadLevel(levelNum) {
    const levelData = this.levelManager.getLevel(levelNum);
    this.levelWidth = levelData.width;
    this.wave = 1;
    this.waveTimer = 0;
    this.waitingForNextWave = false;

    // Create player or reposition existing one (preserve weapons/state across levels)
    const playableMiddleY = this.height - 160;
    if (this.player) {
      // Keep existing player — preserve weapon selection, ammo, and stats
      this.player.x = 100;
      this.player.y = playableMiddleY - 60;
      this.player.isDead = false;
      this.player.health = this.player.maxHealth;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.targetVx = 0;
      this.player.targetVy = 0;
      this.player.invincible = true;
      this.player.invincibleTimer = 2000;
    } else {
      this.player = new Player(100, playableMiddleY - 60);
      this.player.game = this;
    }

    // Clear objects
    this.zombies = [];
    this.bullets = [];
    this.powerups = [];
    this.particles = [];

    // Update level start time for time-based challenges
    this.levelStartTime = Date.now();

    // Start first wave
    this.startWave();
  }

  startWave() {
    const levelData = this.levelManager.getLevel(this.currentLevel);
    const waveData = levelData.waves[this.wave - 1];

    if (!waveData) {
      // Level complete
      this.levelComplete();
      return;
    }

    this.waveZombiesRemaining = waveData.zombies.reduce((sum, z) => sum + z.count, 0);

    // Spawn zombies for this wave
    waveData.zombies.forEach((zombieGroup) => {
      for (let i = 0; i < zombieGroup.count; i++) {
        setTimeout(() => {
          this.spawnZombie(zombieGroup.type);
        }, i * zombieGroup.spawnDelay);
      }
    });

    // Show wave notification with wave banner
    this.showWaveBanner(this.wave);
    this.showNotification(`Wave ${this.wave}`);
  }

  spawnZombie(type) {
    // Limit: Maximum 8 zombies on screen at once (except bosses always spawn)
    const maxZombies = 8;
    const activeZombies = this.zombies.filter(z => !z.isDead).length;
    if (activeZombies >= maxZombies && type !== 'boss') {
      // Queue this zombie to spawn later when there's room
      setTimeout(() => this.spawnZombie(type), 1000);
      return;
    }

    // Spawn from either side
    const spawnLeft = Math.random() < 0.5;
    const x = spawnLeft ? this.camera.x - 50 : this.camera.x + this.width + 50;
    // Spawn at random vertical position within playable area (beat-em-up style)
    const minY = this.height - 250;  // Back of floor
    const maxY = this.height - 70;   // Front of floor
    const y = minY + Math.random() * (maxY - minY - 60); // -60 for zombie height

    const zombie = new Zombie(type, x, y);
    zombie.game = this;

    // Apply difficulty multiplier from current level
    const levelData = this.levelManager.getLevel(this.currentLevel);
    const multiplier = levelData.difficultyMultiplier || 1.0;

    // Scale zombie stats based on difficulty (tougher zombies, not more zombies)
    zombie.health = Math.floor(zombie.health * multiplier);
    zombie.maxHealth = zombie.health;
    zombie.damage = Math.floor(zombie.damage * (1 + (multiplier - 1) * 0.6)); // Damage scales slower
    zombie.scoreValue = Math.floor(zombie.scoreValue * multiplier); // More points for tougher zombies

    this.zombies.push(zombie);
  }

  spawnPowerup(x, y) {
    // Random chance to spawn powerup on zombie death
    if (Math.random() < 0.15) {
      const types = ['health', 'ammo', 'speed', 'damage', 'shield', 'grenade'];
      // Grenades have slightly lower spawn weight
      const weights = [1, 1, 1, 1, 1, 0.6];
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;

      let type = types[0];
      for (let i = 0; i < types.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          type = types[i];
          break;
        }
      }
      this.powerups.push(new Powerup(type, x, y));
    }
  }

  update(deltaTime) {
    if (this.state !== 'playing') return;

    this.deltaTime = deltaTime;
    this.gameTime += deltaTime;

    // Update screen shake
    if (this.screenShake.duration > 0) {
      this.screenShake.duration -= deltaTime;
    }

    // Update combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime;
      if (this.comboTimer <= 0) {
        this.resetCombo();
      }
    }

    // Update combo display animation
    if (this.comboDisplay.scale > 1) {
      this.comboDisplay.scale = Math.max(1, this.comboDisplay.scale - deltaTime * 0.003);
    }
    if (this.comboDisplay.alpha > 0 && this.combo < 5) {
      this.comboDisplay.alpha = Math.max(0, this.comboDisplay.alpha - deltaTime * 0.002);
    }

    // Update wave banner
    this.updateWaveBanner(deltaTime);

    // Update weapon switch display
    this.updateWeaponSwitchDisplay(deltaTime);

    // Handle input
    this.handleInput();

    // Update player
    if (this.player) {
      this.player.update(deltaTime, this);
      this.updateCamera();
    }

    // Update zombies
    this.zombies.forEach((zombie) => zombie.update(deltaTime, this.player));

    // Update bullets
    this.bullets.forEach((bullet) => bullet.update(deltaTime));

    // Update grenades
    this.grenades.forEach((grenade) => grenade.update(deltaTime, this));

    // Update powerups
    this.powerups.forEach((powerup) => powerup.update(deltaTime));

    // Update particles
    this.particles.forEach((particle) => particle.update(deltaTime));

    // Update damage numbers
    this.damageNumbers.forEach((dn) => dn.update(deltaTime));

    // Check collisions
    this.checkCollisions();

    // Remove dead objects
    this.cleanup();

    // Check wave completion
    this.checkWaveComplete();
  }

  handleInput() {
    if (!this.player || this.player.isDead) return;

    // Movement (beat-em-up style - 4 directions)
    let dx = 0;
    let dy = 0;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) dx = -1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) dx = 1;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) dy = -1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) dy = 1;
    this.player.move(dx, dy);

    // Dodge/roll (Shift key)
    if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
      this.player.dodge(dx, dy);
    }

    // Shoot (Space, Z, or left mouse click)
    if (this.keys['Space'] || this.keys['KeyZ'] || this.mouseDown) {
      this.player.shoot(this);
    }

    // Melee
    if (this.keys['KeyX']) {
      this.player.melee(this);
    }

    // Special attack (bomb)
    if (this.keys['KeyC']) {
      this.player.specialAttack(this);
    }

    // Throw grenade (G or Q)
    if (this.keys['KeyG'] || this.keys['KeyQ']) {
      this.player.throwGrenade(this, this.mousePos.x + this.camera.x, this.mousePos.y);
      this.keys['KeyG'] = false; // Prevent continuous throwing
      this.keys['KeyQ'] = false;
    }
  }

  updateCamera() {
    // Follow player with some dead zone
    const targetX = this.player.x - this.width / 3;
    this.camera.x = Math.max(0, Math.min(this.levelWidth - this.width, targetX));
  }

  checkCollisions() {
    // Bullets vs Zombies
    this.bullets.forEach((bullet) => {
      if (!bullet.active || bullet.isEnemy) return;
      this.zombies.forEach((zombie) => {
        // Skip if zombie already hit by this piercing bullet
        if (bullet.hitZombies && bullet.hitZombies.includes(zombie)) return;
        if (!zombie.isDead && this.checkCollision(bullet, zombie)) {
          zombie.takeDamage(bullet.damage);
          this.sessionStats.shotsHit++;

          // Spawn hit particles
          this.spawnParticles(bullet.x, bullet.y, '#ff0000', 5);
          this.showDamageNumber(zombie.x, zombie.y - 30, bullet.damage);

          // Handle explosive bullets
          if (bullet.isExplosive) {
            this.createExplosion(bullet.x, bullet.y, bullet.explosionRadius || 80, bullet.damage * 0.5);
            bullet.active = false;
          }
          // Piercing bullets go through enemies
          else if (bullet.isPiercing) {
            // Mark this zombie as hit so we don't hit it again
            if (!bullet.hitZombies) bullet.hitZombies = [];
            bullet.hitZombies.push(zombie);
            // Don't deactivate - bullet keeps going
          }
          // Normal bullets
          else {
            bullet.active = false;
          }
        }
      });
    });

    // Player vs Zombies
    if (this.player && !this.player.isDead && !this.player.invincible) {
      this.zombies.forEach((zombie) => {
        if (!zombie.isDead && zombie.canAttack && this.checkCollision(this.player, zombie)) {
          this.player.takeDamage(zombie.damage, this);
          zombie.canAttack = false;
          setTimeout(() => { zombie.canAttack = true; }, zombie.attackCooldown);
        }
      });
    }

    // Player vs Powerups
    if (this.player && !this.player.isDead) {
      this.powerups.forEach((powerup) => {
        if (powerup.active && this.checkCollision(this.player, powerup)) {
          this.player.collectPowerup(powerup, this);
          powerup.active = false;
          this.sessionStats.powerupsCollected++;
        }
      });
    }

    // Enemy bullets vs Player
    this.bullets.forEach((bullet) => {
      if (!bullet.active || !bullet.isEnemy) return;
      if (this.player && !this.player.isDead && !this.player.invincible) {
        if (this.checkCollision(bullet, this.player)) {
          this.player.takeDamage(bullet.damage, this);
          bullet.active = false;
        }
      }
    });
  }

  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  createExplosion(x, y, radius, damage) {
    // Screen shake
    this.addScreenShake(12, 300);

    // Damage all zombies in radius
    this.zombies.forEach((zombie) => {
      if (zombie.isDead) return;
      const dx = zombie.x + zombie.width / 2 - x;
      const dy = zombie.y + zombie.height / 2 - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < radius) {
        // Damage falls off with distance
        const damageMultiplier = 1 - (distance / radius);
        const explosionDamage = Math.floor(damage * damageMultiplier);
        zombie.takeDamage(explosionDamage);
        this.showDamageNumber(zombie.x, zombie.y - 30, explosionDamage);
      }
    });

    // Explosion particles
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = 3 + Math.random() * 5;
      const particle = new Particle(x, y, ['#ff4400', '#ff6600', '#ffaa00', '#ffffff'][Math.floor(Math.random() * 4)]);
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.size = 5 + Math.random() * 10;
      particle.life = 400 + Math.random() * 200;
      this.particles.push(particle);
    }

    // Smoke particles
    for (let i = 0; i < 15; i++) {
      const particle = new Particle(
        x + (Math.random() - 0.5) * radius,
        y + (Math.random() - 0.5) * radius,
        '#444444'
      );
      particle.vx = (Math.random() - 0.5) * 2;
      particle.vy = -1 - Math.random() * 2;
      particle.size = 10 + Math.random() * 15;
      particle.life = 600 + Math.random() * 400;
      this.particles.push(particle);
    }
  }

  cleanup() {
    this.zombies = this.zombies.filter((z) => {
      if (z.isDead && z.deathTimer <= 0) {
        this.onZombieDeath(z);
        return false;
      }
      return true;
    });

    this.bullets = this.bullets.filter((b) => b.active);
    this.grenades = this.grenades.filter((g) => g.active);
    this.powerups = this.powerups.filter((p) => p.active);
    this.particles = this.particles.filter((p) => p.life > 0);
    this.damageNumbers = this.damageNumbers.filter((d) => d.life > 0);
  }

  onZombieDeath(zombie, killedByGrenade = false) {
    // Increment combo and apply multiplier
    this.incrementCombo();
    const multiplier = this.getComboMultiplier();
    const finalScore = Math.floor(zombie.scoreValue * multiplier);
    this.score += finalScore;
    this.sessionStats.kills++;
    this.waveZombiesRemaining--;

    // Track grenade kills
    if (killedByGrenade) {
      this.sessionStats.grenadeKills++;
    }

    // Track boss kills
    if (zombie.type === 'boss') {
      this.sessionStats.bossKills++;
    }

    // Track no damage kills (kills while player hasn't taken damage this game)
    if (this.sessionStats.damageTaken === 0) {
      this.sessionStats.noDamageKills++;
    }

    // Track weapon-specific kills for challenge mode
    if (this.player && this.player.currentWeapon) {
      const weaponName = this.player.currentWeapon.name.toLowerCase();
      this.challengeWeaponKills[weaponName] = (this.challengeWeaponKills[weaponName] || 0) + 1;
    }

    // Update challenge progress
    if (this.challengeMode && this.challengeData) {
      this.updateChallengeProgress();
    }

    // Chance to spawn powerup
    this.spawnPowerup(zombie.x, zombie.y);

    // Spawn death particles
    this.spawnParticles(zombie.x + zombie.width / 2, zombie.y + zombie.height / 2, '#880000', 15);

    // Show combo score if multiplier active
    if (multiplier > 1) {
      this.showDamageNumber(zombie.x, zombie.y - 50, `+${finalScore} (${multiplier}x)`);
    }

    // Dispatch achievement events for real-time checking
    if (this.sessionStats.kills === 1) {
      window.dispatchEvent(new CustomEvent('achievementTrigger', { detail: { type: 'first_blood' } }));
    }
    if (this.combo === 20) {
      window.dispatchEvent(new CustomEvent('achievementTrigger', { detail: { type: 'combo_master' } }));
    }
    if (this.combo === 50) {
      window.dispatchEvent(new CustomEvent('achievementTrigger', { detail: { type: 'mega_combo' } }));
    }
  }

  checkWaveComplete() {
    // Prevent multiple triggers - only check if we're not already waiting for next wave
    if (this.waveZombiesRemaining <= 0 && this.zombies.length === 0 && !this.waitingForNextWave) {
      this.wave++;
      this.waveTimer = this.waveDelay;
      this.waitingForNextWave = true; // Flag to prevent multiple triggers

      setTimeout(() => {
        if (this.state === 'playing') {
          this.waitingForNextWave = false;
          this.startWave();
        }
      }, this.waveDelay);
    }
  }

  levelComplete() {
    this.state = 'levelcomplete';
    this.showNotification('Level Complete!');

    // Bonus points for completing level
    this.score += 1000 * this.currentLevel;

    // Update challenge progress for level/time/nodamage types
    if (this.challengeMode && this.challengeData) {
      const req = this.challengeData.requirement;
      if (req.type === 'nodamage' && this.sessionStats.damageTaken === 0) {
        this.challengeProgress = 1;
      }
      if (req.type === 'level' && this.currentLevel >= req.target) {
        this.challengeProgress = this.currentLevel;
      }
      if (req.type === 'time') {
        const elapsed = Math.floor((Date.now() - this.levelStartTime) / 1000);
        if (elapsed <= req.target) {
          this.challengeProgress = 1;
        }
      }
    }

    // Emit event for app.js to handle
    window.dispatchEvent(
      new CustomEvent('levelComplete', {
        detail: {
          level: this.currentLevel,
          score: this.score,
          stats: this.sessionStats,
          challengeMode: this.challengeMode,
          challengeData: this.challengeData,
          challengeProgress: this.getChallengeProgressForEnd(),
          weaponKills: this.challengeWeaponKills,
        },
      })
    );
  }

  nextLevel() {
    this.currentLevel++;
    if (this.currentLevel > 5) {
      this.gameWin();
    } else {
      this.loadLevel(this.currentLevel);
      this.state = 'playing';
    }
  }

  gameWin() {
    this.state = 'win';
    this.showNotification('YOU WIN!');
    window.dispatchEvent(
      new CustomEvent('gameWin', {
        detail: {
          score: this.score,
          stats: this.sessionStats,
          challengeMode: this.challengeMode,
          challengeData: this.challengeData,
          challengeProgress: this.getChallengeProgressForEnd(),
          weaponKills: this.challengeWeaponKills,
        },
      })
    );
  }

  playerDeath() {
    this.sessionStats.deaths++;
    this.lives--;

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Respawn player
      setTimeout(() => {
        if (this.state === 'playing') {
          this.player.respawn();
        }
      }, 2000);
    }
  }

  gameOver() {
    this.state = 'gameover';
    window.dispatchEvent(
      new CustomEvent('gameOver', {
        detail: {
          score: this.score,
          stats: this.sessionStats,
          level: this.currentLevel,
          challengeMode: this.challengeMode,
          challengeData: this.challengeData,
          challengeProgress: this.getChallengeProgressForEnd(),
          weaponKills: this.challengeWeaponKills,
        },
      })
    );
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
    } else if (this.state === 'paused') {
      this.state = 'playing';
    }
  }

  addScreenShake(intensity, duration) {
    this.screenShake.intensity = intensity;
    this.screenShake.duration = duration;
  }

  // Combo system methods
  incrementCombo() {
    this.combo++;
    this.comboTimer = this.comboTimeout;

    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
      this.sessionStats.maxCombo = this.maxCombo;
    }

    // Update combo display
    this.updateComboDisplay();
  }

  resetCombo() {
    if (this.combo > 0) {
      this.combo = 0;
      this.comboDisplay.alpha = 0;
    }
  }

  updateChallengeProgress() {
    if (!this.challengeMode || !this.challengeData) return;

    const req = this.challengeData.requirement;
    let progress = 0;

    switch (req.type) {
      case 'kills':
        progress = this.sessionStats.kills;
        break;
      case 'weapon':
        progress = this.challengeWeaponKills[req.weapon] || 0;
        break;
      case 'melee':
        progress = this.sessionStats.meleeKills;
        break;
      case 'combo':
        progress = this.maxCombo;
        break;
      case 'grenade':
        progress = this.sessionStats.grenadeKills;
        break;
      case 'boss_kills':
        progress = this.sessionStats.bossKills;
        break;
      case 'nodamage_kills':
        progress = this.sessionStats.noDamageKills;
        break;
      case 'nodamage':
        progress = this.sessionStats.damageTaken === 0 ? 0 : 0; // evaluated at level complete
        break;
      case 'level':
        progress = 0; // evaluated at level complete
        break;
      case 'time':
        progress = 0; // evaluated at level complete
        break;
    }

    const oldProgress = this.challengeProgress;
    this.challengeProgress = progress;

    if (progress !== oldProgress) {
      window.dispatchEvent(new CustomEvent('challengeProgress', {
        detail: {
          progress,
          target: req.target,
          type: req.type,
          completed: progress >= req.target,
          challengeTitle: this.challengeData.title,
        },
      }));
    }
  }

  getChallengeProgressForEnd() {
    if (!this.challengeMode || !this.challengeData) return 0;

    const req = this.challengeData.requirement;
    switch (req.type) {
      case 'kills':
        return this.sessionStats.kills;
      case 'weapon':
        return this.challengeWeaponKills[req.weapon] || 0;
      case 'melee':
        return this.sessionStats.meleeKills;
      case 'combo':
        return this.maxCombo;
      case 'grenade':
        return this.sessionStats.grenadeKills;
      case 'boss_kills':
        return this.sessionStats.bossKills;
      case 'nodamage_kills':
        return this.sessionStats.noDamageKills;
      case 'nodamage':
        return this.sessionStats.damageTaken === 0 ? 1 : 0;
      case 'level':
        return this.currentLevel;
      case 'time': {
        const elapsed = Math.floor((Date.now() - this.levelStartTime) / 1000);
        // For time challenges, progress is 1 if completed under target time, 0 otherwise
        return elapsed <= req.target ? 1 : 0;
      }
    }
    return this.challengeProgress;
  }

  getComboMultiplier() {
    if (this.combo < 5) return 1.0;
    if (this.combo < 10) return 1.5;
    if (this.combo < 20) return 2.0;
    if (this.combo < 30) return 2.5;
    return 3.0; // Max 3x multiplier
  }

  updateComboDisplay() {
    const multiplier = this.getComboMultiplier();

    if (this.combo >= 30) {
      this.comboDisplay.text = 'MEGA COMBO!';
      this.comboDisplay.color = '#ff00ff'; // Purple
    } else if (this.combo >= 20) {
      this.comboDisplay.text = `COMBO x${this.combo}!`;
      this.comboDisplay.color = '#ff0000'; // Red
    } else if (this.combo >= 10) {
      this.comboDisplay.text = `COMBO x${this.combo}!`;
      this.comboDisplay.color = '#ff8800'; // Orange
    } else if (this.combo >= 5) {
      this.comboDisplay.text = `COMBO x${this.combo}!`;
      this.comboDisplay.color = '#ffff00'; // Yellow
    } else {
      this.comboDisplay.text = '';
      this.comboDisplay.alpha = 0;
      return;
    }

    this.comboDisplay.alpha = 1;
    this.comboDisplay.scale = 1.5; // Pop effect
  }

  spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  showDamageNumber(x, y, damage) {
    this.damageNumbers.push(new DamageNumber(x, y, damage));
  }

  showNotification(text) {
    window.dispatchEvent(new CustomEvent('notification', { detail: { text } }));
  }

  showWaveBanner(waveNum) {
    this.waveBanner.active = true;
    this.waveBanner.text = `WAVE ${waveNum}`;
    this.waveBanner.timer = this.waveBanner.duration;
    this.waveBanner.scale = 0;
  }

  updateWaveBanner(deltaTime) {
    if (!this.waveBanner.active) return;

    this.waveBanner.timer -= deltaTime;

    // Scale animation
    const progress = 1 - (this.waveBanner.timer / this.waveBanner.duration);
    if (progress < 0.2) {
      // Zoom in
      this.waveBanner.scale = progress / 0.2;
    } else if (progress > 0.8) {
      // Fade out
      this.waveBanner.scale = (1 - progress) / 0.2;
    } else {
      this.waveBanner.scale = 1;
    }

    if (this.waveBanner.timer <= 0) {
      this.waveBanner.active = false;
    }
  }

  showWeaponSwitch(weapon) {
    this.weaponSwitchDisplay.active = true;
    this.weaponSwitchDisplay.weapon = weapon;
    this.weaponSwitchDisplay.timer = this.weaponSwitchDisplay.duration;
  }

  updateWeaponSwitchDisplay(deltaTime) {
    if (!this.weaponSwitchDisplay.active) return;
    this.weaponSwitchDisplay.timer -= deltaTime;
    if (this.weaponSwitchDisplay.timer <= 0) {
      this.weaponSwitchDisplay.active = false;
    }
  }

  renderWeaponSwitchDisplay(ctx) {
    if (!this.weaponSwitchDisplay.active || !this.weaponSwitchDisplay.weapon) return;

    const weapon = this.weaponSwitchDisplay.weapon;
    const progress = this.weaponSwitchDisplay.timer / this.weaponSwitchDisplay.duration;
    const alpha = progress > 0.7 ? 1 : progress / 0.7;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Position - right side of screen
    const x = this.width - 200;
    const y = 120;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, 180, 70);
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 180, 70);

    // "EQUIPPED" label
    ctx.fillStyle = '#888';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EQUIPPED', x + 90, y + 15);

    // Weapon name
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(weapon.name, x + 90, y + 38);

    // Quick stats
    ctx.fillStyle = '#aaa';
    ctx.font = '11px Arial';
    ctx.fillText(`DMG: ${weapon.damage}  •  ${weapon.infinite ? '∞' : weapon.ammo} ammo`, x + 90, y + 55);

    ctx.restore();
  }

  renderWaveBanner(ctx) {
    if (!this.waveBanner.active) return;

    const centerX = this.width / 2;
    const centerY = this.height / 2 - 50;
    const scale = this.waveBanner.scale;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.globalAlpha = scale;

    // Background bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(-200, -40, 400, 80);

    // Border
    ctx.strokeStyle = '#ff4400';
    ctx.lineWidth = 3;
    ctx.strokeRect(-200, -40, 400, 80);

    // Glow effect
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 20;

    // Wave text
    ctx.fillStyle = '#ff4400';
    ctx.font = 'bold 48px Orbitron, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.waveBanner.text, 0, 0);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  render() {
    const ctx = this.ctx;

    // Apply screen shake
    let shakeX = 0,
      shakeY = 0;
    if (this.screenShake.duration > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake.intensity;
      shakeY = (Math.random() - 0.5) * this.screenShake.intensity;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.state === 'menu') {
      this.renderMenu();
    } else {
      // Render game world
      ctx.save();
      ctx.translate(-this.camera.x, -this.camera.y);

      this.renderBackground();
      this.renderPowerups();
      this.renderPlayer();
      this.renderZombies();
      this.renderBullets();
      this.renderGrenades();
      this.renderParticles();
      this.renderDamageNumbers();

      ctx.restore();

      // Render combo display (not affected by camera)
      this.renderComboDisplay();

      // Render wave banner (not affected by camera)
      this.renderWaveBanner(ctx);

      // Render weapon switch display
      this.renderWeaponSwitchDisplay(ctx);

      // Render HUD (not affected by camera)
      this.renderHUD();

      // Render challenge HUD if in challenge mode
      if (this.challengeMode && this.challengeData) {
        this.renderChallengeHUD();
      }

      if (this.state === 'paused') {
        this.renderPauseScreen();
      } else if (this.state === 'gameover') {
        this.renderGameOver();
      } else if (this.state === 'levelcomplete') {
        this.renderLevelComplete();
      } else if (this.state === 'win') {
        this.renderWinScreen();
      }
    }

    ctx.restore();
  }

  renderBackground() {
    const ctx = this.ctx;
    const levelData = this.levelManager.getLevel(this.currentLevel);
    const currentTheme = levelData.theme || 'city';
    const floorTop = this.height - 250; // Back of playable floor area

    // Try to use sprite-based backgrounds
    if (this.spritesLoaded && window.spriteManager?.sprites?.backgrounds?.[currentTheme]) {
      const bg = window.spriteManager.sprites.backgrounds[currentTheme];

      // Far background (slowest parallax - 0.1x) - sky/distant
      if (bg.far) {
        const farOffset = this.camera.x * 0.1;
        const farX = -(farOffset % 1200);
        ctx.drawImage(bg.far, farX + this.camera.x, 0, 1200, floorTop);
        ctx.drawImage(bg.far, farX + 1200 + this.camera.x, 0, 1200, floorTop);
      }

      // Mid background (medium parallax - 0.3x)
      if (bg.mid) {
        const midOffset = this.camera.x * 0.3;
        const midX = -(midOffset % 1200);
        ctx.drawImage(bg.mid, midX + this.camera.x, 0, 1200, floorTop);
        ctx.drawImage(bg.mid, midX + 1200 + this.camera.x, 0, 1200, floorTop);
      }

      // Near background (faster parallax - 0.6x)
      if (bg.near) {
        const nearOffset = this.camera.x * 0.6;
        const nearX = -(nearOffset % 1200);
        ctx.drawImage(bg.near, nearX + this.camera.x, 0, 1200, floorTop);
        ctx.drawImage(bg.near, nearX + 1200 + this.camera.x, 0, 1200, floorTop);
      }

      // Ground/floor layer (1:1 with camera) - the beat-em-up floor
      if (bg.ground) {
        for (let x = 0; x < this.levelWidth; x += 1200) {
          ctx.drawImage(bg.ground, x, floorTop, 1200, this.height - floorTop);
        }
      } else {
        // Fallback floor rendering if no ground sprite
        this.renderSimpleBackground(ctx, levelData);
      }
    } else {
      // Fallback to procedural backgrounds
      this.renderSimpleBackground(ctx, levelData);
    }

    // Atmospheric fog/particles
    this.renderAtmosphere(ctx);
  }

  renderSimpleBackground(ctx, levelData) {
    // Beat-em-up style background with proper floor perspective
    // Playable area: height-250 (back) to height-150 (front)
    const floorTop = this.height - 250;      // Back of floor (where horizon meets floor)
    const floorBottom = this.height;          // Front edge of screen
    const horizonY = floorTop;                // Where sky meets the floor

    // === SKY SECTION (top half) ===
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, levelData.skyColor || '#0a0a1a');
    skyGrad.addColorStop(0.7, this.adjustColor(levelData.skyColor || '#0a0a1a', 20));
    skyGrad.addColorStop(1, this.adjustColor(levelData.skyColor || '#0a0a1a', 40));
    ctx.fillStyle = skyGrad;
    ctx.fillRect(this.camera.x, 0, this.width, horizonY);

    // === BACKGROUND SCENERY (based on level theme) ===
    this.renderLevelScenery(ctx, levelData, horizonY);

    // === FLOOR/GROUND with perspective (bottom section) ===
    // Floor gradient - darker at back, lighter at front for depth
    const floorGrad = ctx.createLinearGradient(0, floorTop, 0, floorBottom);
    const baseFloorColor = levelData.groundColor || '#2a2a2a';
    floorGrad.addColorStop(0, this.darkenColor(baseFloorColor, 40));   // Back (darker)
    floorGrad.addColorStop(0.3, this.darkenColor(baseFloorColor, 20)); // Mid-back
    floorGrad.addColorStop(0.6, baseFloorColor);                        // Mid
    floorGrad.addColorStop(1, this.lightenColor(baseFloorColor, 15));  // Front (lighter)
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorTop, this.levelWidth, floorBottom - floorTop);

    // === FLOOR DETAILS (tiles/lines for depth) ===
    this.renderFloorDetails(ctx, levelData, floorTop, floorBottom);

    // === HORIZON LINE (where floor meets background) ===
    ctx.strokeStyle = this.darkenColor(baseFloorColor, 60);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, floorTop);
    ctx.lineTo(this.levelWidth, floorTop);
    ctx.stroke();
  }

  renderLevelScenery(ctx, levelData, horizonY) {
    const theme = levelData.theme || 'city';

    switch(theme) {
      case 'city':
        this.renderCityScenery(ctx, horizonY);
        break;
      case 'suburbs':
        this.renderSuburbsScenery(ctx, horizonY);
        break;
      case 'industrial':
        this.renderIndustrialScenery(ctx, horizonY);
        break;
      case 'highway':
        this.renderHighwayScenery(ctx, horizonY);
        break;
      case 'downtown':
        this.renderDowntownScenery(ctx, horizonY);
        break;
      default:
        this.renderCityScenery(ctx, horizonY);
    }
  }

  renderCityScenery(ctx, horizonY) {
    // Distant city skyline (3 layers with parallax)
    const layers = [
      { color: 'rgba(15, 15, 25, 0.9)', parallax: 0.1, heightRange: [80, 180] },
      { color: 'rgba(25, 25, 40, 0.95)', parallax: 0.25, heightRange: [100, 220] },
      { color: 'rgba(35, 35, 55, 1)', parallax: 0.4, heightRange: [120, 250] }
    ];

    layers.forEach((layer, layerIdx) => {
      const parallaxX = this.camera.x * layer.parallax;

      for (let i = -2; i < this.levelWidth / 120 + 2; i++) {
        const seed = (i * 1234 + layerIdx * 567) % 1000 / 1000;
        const buildingHeight = layer.heightRange[0] + seed * (layer.heightRange[1] - layer.heightRange[0]);
        const buildingWidth = 40 + seed * 60;
        const x = i * 120 - parallaxX + this.camera.x;

        if (x > this.camera.x - 150 && x < this.camera.x + this.width + 150) {
          ctx.fillStyle = layer.color;
          ctx.fillRect(x, horizonY - buildingHeight, buildingWidth, buildingHeight);

          // Windows on front layer
          if (layerIdx === 2) {
            ctx.fillStyle = 'rgba(255, 200, 100, 0.15)';
            for (let wy = horizonY - buildingHeight + 10; wy < horizonY - 10; wy += 15) {
              for (let wx = x + 5; wx < x + buildingWidth - 8; wx += 12) {
                if ((wx * wy * i) % 5 > 1) {
                  ctx.fillRect(wx, wy, 5, 8);
                }
              }
            }
          }
        }
      }
    });
  }

  renderSuburbsScenery(ctx, horizonY) {
    // Mall/shopping district with signs
    const parallaxX = this.camera.x * 0.3;

    for (let i = -1; i < this.levelWidth / 200 + 1; i++) {
      const x = i * 200 - parallaxX + this.camera.x;
      if (x > this.camera.x - 250 && x < this.camera.x + this.width + 250) {
        // Store building
        ctx.fillStyle = '#2a2a35';
        ctx.fillRect(x, horizonY - 150, 180, 150);

        // Store front window
        ctx.fillStyle = 'rgba(60, 80, 100, 0.5)';
        ctx.fillRect(x + 10, horizonY - 100, 160, 80);

        // Sign
        ctx.fillStyle = ['#ff4444', '#44ff44', '#4444ff', '#ffff44'][i % 4];
        ctx.fillRect(x + 20, horizonY - 140, 140, 25);

        // Broken elements
        if (i % 3 === 0) {
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(x + 50, horizonY - 90, 40, 70);
        }
      }
    }
  }

  renderIndustrialScenery(ctx, horizonY) {
    // Hospital/industrial buildings
    const parallaxX = this.camera.x * 0.25;

    // Main hospital building (repeating)
    for (let i = -1; i < this.levelWidth / 300 + 1; i++) {
      const x = i * 300 - parallaxX + this.camera.x;
      if (x > this.camera.x - 350 && x < this.camera.x + this.width + 350) {
        // Main building
        ctx.fillStyle = '#252530';
        ctx.fillRect(x, horizonY - 200, 250, 200);

        // Windows grid
        ctx.fillStyle = 'rgba(100, 200, 150, 0.15)';
        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 8; col++) {
            ctx.fillRect(x + 15 + col * 28, horizonY - 185 + row * 30, 20, 22);
          }
        }

        // Red cross
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(x + 100, horizonY - 195, 50, 15);
        ctx.fillRect(x + 115, horizonY - 210, 20, 45);

        // Emergency lights (blinking effect)
        if (Math.floor(Date.now() / 500) % 2 === 0) {
          ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
          ctx.beginPath();
          ctx.arc(x + 30, horizonY - 190, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  renderHighwayScenery(ctx, horizonY) {
    // Military base / highway scene
    const parallaxX = this.camera.x * 0.2;

    // Watchtowers
    for (let i = 0; i < this.levelWidth / 400 + 1; i++) {
      const x = i * 400 - parallaxX + this.camera.x;
      if (x > this.camera.x - 100 && x < this.camera.x + this.width + 100) {
        // Tower base
        ctx.fillStyle = '#2a2a20';
        ctx.fillRect(x, horizonY - 180, 40, 180);

        // Tower top
        ctx.fillStyle = '#3a3a30';
        ctx.fillRect(x - 15, horizonY - 200, 70, 30);

        // Searchlight
        ctx.fillStyle = 'rgba(255, 255, 200, 0.1)';
        ctx.beginPath();
        ctx.moveTo(x + 20, horizonY - 170);
        ctx.lineTo(x - 80, horizonY);
        ctx.lineTo(x + 120, horizonY);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Barricades and sandbags
    for (let i = 0; i < this.levelWidth / 150 + 1; i++) {
      const x = i * 150 - parallaxX * 1.5 + this.camera.x;
      if (x > this.camera.x - 100 && x < this.camera.x + this.width + 100) {
        // Sandbags
        ctx.fillStyle = '#4a4a35';
        ctx.fillRect(x, horizonY - 30, 60, 30);
        ctx.fillRect(x + 10, horizonY - 50, 40, 25);
      }
    }

    // Distant mountains
    ctx.fillStyle = 'rgba(20, 25, 20, 0.8)';
    for (let i = 0; i < 5; i++) {
      const mx = this.camera.x + i * 250 - (this.camera.x * 0.05) % 250;
      ctx.beginPath();
      ctx.moveTo(mx, horizonY);
      ctx.lineTo(mx + 100, horizonY - 120 - (i % 3) * 40);
      ctx.lineTo(mx + 200, horizonY);
      ctx.closePath();
      ctx.fill();
    }
  }

  renderDowntownScenery(ctx, horizonY) {
    // Apocalyptic downtown - burning buildings
    const parallaxX = this.camera.x * 0.3;

    // Ruined skyscrapers
    for (let i = -1; i < this.levelWidth / 150 + 1; i++) {
      const x = i * 150 - parallaxX + this.camera.x;
      const seed = (i * 7919) % 100 / 100;

      if (x > this.camera.x - 200 && x < this.camera.x + this.width + 200) {
        const height = 150 + seed * 150;

        // Building
        ctx.fillStyle = '#1a1015';
        ctx.fillRect(x, horizonY - height, 80, height);

        // Damage/holes
        ctx.fillStyle = '#0a0508';
        if (seed > 0.3) {
          ctx.fillRect(x + 20, horizonY - height + 30, 25, 40);
        }
        if (seed > 0.6) {
          ctx.fillRect(x + 10, horizonY - 80, 35, 50);
        }

        // Fire glow
        if (i % 3 === 0) {
          const fireY = horizonY - height + 50;
          const gradient = ctx.createRadialGradient(x + 40, fireY, 0, x + 40, fireY, 60);
          gradient.addColorStop(0, 'rgba(255, 150, 50, 0.4)');
          gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.2)');
          gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(x - 20, fireY - 60, 120, 120);

          // Animated flames
          ctx.fillStyle = `rgba(255, ${150 + Math.sin(Date.now()/100 + i) * 50}, 0, 0.6)`;
          for (let f = 0; f < 3; f++) {
            const flameH = 15 + Math.sin(Date.now()/150 + f + i) * 8;
            ctx.fillRect(x + 25 + f * 15, fireY - flameH, 8, flameH);
          }
        }
      }
    }

    // Smoke clouds
    ctx.fillStyle = 'rgba(40, 30, 30, 0.3)';
    for (let i = 0; i < 8; i++) {
      const sx = this.camera.x + (i * 150 + Date.now() / 50) % (this.width + 200) - 100;
      const sy = 50 + (i * 37) % 100;
      ctx.beginPath();
      ctx.arc(sx, sy, 40 + (i % 3) * 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderFloorDetails(ctx, levelData, floorTop, floorBottom) {
    const theme = levelData.theme || 'city';

    // Perspective lines (converging toward horizon)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;

    // Horizontal lines (get closer together toward the back for perspective)
    const numLines = 8;
    for (let i = 1; i < numLines; i++) {
      // Use exponential spacing for perspective effect
      const t = Math.pow(i / numLines, 0.7);
      const y = floorTop + t * (floorBottom - floorTop);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.levelWidth, y);
      ctx.stroke();
    }

    // Theme-specific floor details
    switch(theme) {
      case 'city':
      case 'downtown':
        // Street markings
        ctx.fillStyle = 'rgba(60, 60, 40, 0.4)';
        for (let x = 0; x < this.levelWidth; x += 100) {
          ctx.fillRect(x, floorTop + 50, 60, 6);
        }
        // Debris
        ctx.fillStyle = 'rgba(30, 30, 30, 0.5)';
        for (let i = 0; i < this.levelWidth / 80; i++) {
          const dx = (i * 97) % this.levelWidth;
          const dy = floorTop + 20 + (i * 31) % 80;
          ctx.fillRect(dx, dy, 15 + (i % 10), 8);
        }
        break;

      case 'suburbs':
        // Tile pattern
        ctx.strokeStyle = 'rgba(80, 70, 60, 0.3)';
        for (let x = 0; x < this.levelWidth; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, floorTop);
          ctx.lineTo(x, floorBottom);
          ctx.stroke();
        }
        break;

      case 'industrial':
        // Hospital floor tiles
        ctx.fillStyle = 'rgba(100, 150, 130, 0.1)';
        for (let x = 0; x < this.levelWidth; x += 80) {
          for (let y = floorTop; y < floorBottom; y += 40) {
            if ((x + y) % 160 < 80) {
              ctx.fillRect(x, y, 80, 40);
            }
          }
        }
        // Blood stains
        ctx.fillStyle = 'rgba(80, 20, 20, 0.3)';
        for (let i = 0; i < this.levelWidth / 200; i++) {
          const bx = (i * 193) % this.levelWidth;
          const by = floorTop + 30 + (i * 47) % 70;
          ctx.beginPath();
          ctx.ellipse(bx, by, 25, 15, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'highway':
        // Road texture
        ctx.fillStyle = 'rgba(50, 50, 40, 0.3)';
        ctx.fillRect(0, floorTop + 30, this.levelWidth, 60);
        // Lane markings
        ctx.fillStyle = 'rgba(200, 180, 50, 0.4)';
        for (let x = 0; x < this.levelWidth; x += 120) {
          ctx.fillRect(x, floorTop + 55, 70, 8);
        }
        break;
    }
  }

  // Helper: Darken a hex color
  darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `rgb(${R}, ${G}, ${B})`;
  }

  // Helper: Lighten a hex color
  lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `rgb(${R}, ${G}, ${B})`;
  }

  // Helper: Adjust color brightness
  adjustColor(hex, amount) {
    return amount > 0 ? this.lightenColor(hex, amount) : this.darkenColor(hex, -amount);
  }

  renderAtmosphere(ctx) {
    const levelData = this.levelManager.getLevel(this.currentLevel);
    const fogColor = levelData.fogColor || 'rgba(50, 0, 0, 0.3)';
    const fogDensity = levelData.fogDensity || 0.3;
    const atmosphere = levelData.atmosphere || { dustParticles: true };
    const time = Date.now() / 1000;

    // Fog overlay
    const fogGrad = ctx.createRadialGradient(
      this.camera.x + this.width / 2, this.height / 2, 0,
      this.camera.x + this.width / 2, this.height / 2, this.width
    );
    fogGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    fogGrad.addColorStop(0.6, fogColor.replace(/[\d.]+\)$/, (fogDensity * 0.3) + ')'));
    fogGrad.addColorStop(1, fogColor.replace(/[\d.]+\)$/, fogDensity + ')'));
    ctx.fillStyle = fogGrad;
    ctx.fillRect(this.camera.x, 0, this.width, this.height);

    // Floating dust particles
    if (atmosphere.dustParticles) {
      ctx.fillStyle = 'rgba(255, 200, 150, 0.3)';
      for (let i = 0; i < 25; i++) {
        const seed = i * 123.456;
        const x = ((seed * 100 + time * 20 + this.camera.x * 0.5) % (this.width + 100)) + this.camera.x - 50;
        const y = (seed * 50 + Math.sin(time + seed) * 30) % this.height;
        const size = 1 + (seed % 3);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Rain effect
    if (atmosphere.rain) {
      ctx.strokeStyle = 'rgba(150, 180, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 80; i++) {
        const seed = i * 77.77;
        const x = ((seed * 50 + time * 400) % (this.width + 50)) + this.camera.x - 25;
        const y = ((seed * 30 + time * 600) % (this.height + 100)) - 50;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 3, y + 20);
        ctx.stroke();
      }
    }

    // Light rays (god rays effect)
    if (atmosphere.lightRays) {
      ctx.save();
      const rayCount = 5;
      for (let i = 0; i < rayCount; i++) {
        const rayX = (this.camera.x + (i * this.width / rayCount) + time * 10) % (this.width * 1.5) + this.camera.x - this.width * 0.25;
        const gradient = ctx.createLinearGradient(rayX, 0, rayX + 60, this.height);
        gradient.addColorStop(0, 'rgba(255, 200, 100, 0.05)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.02)');
        gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(rayX, 0);
        ctx.lineTo(rayX + 20, 0);
        ctx.lineTo(rayX + 80, this.height);
        ctx.lineTo(rayX + 40, this.height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Fire glow effect (distant fires)
    if (atmosphere.fireGlow) {
      const fireGlowIntensity = 0.1 + Math.sin(time * 3) * 0.05;
      ctx.fillStyle = `rgba(255, 100, 0, ${fireGlowIntensity})`;
      for (let i = 0; i < 3; i++) {
        const fireX = (this.camera.x * 0.3 + i * 400) % this.levelWidth;
        const fireY = this.height - 150;
        const glowGrad = ctx.createRadialGradient(fireX, fireY, 0, fireX, fireY, 100);
        glowGrad.addColorStop(0, `rgba(255, 150, 50, ${fireGlowIntensity})`);
        glowGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(fireX - 100, fireY - 100, 200, 150);
      }
    }
  }

  renderPlayer() {
    if (this.player) {
      this.player.render(this.ctx);
    }
  }

  renderZombies() {
    this.zombies.forEach((zombie) => zombie.render(this.ctx));
  }

  renderBullets() {
    this.bullets.forEach((bullet) => bullet.render(this.ctx));
  }

  renderPowerups() {
    this.powerups.forEach((powerup) => powerup.render(this.ctx));
  }

  renderParticles() {
    this.particles.forEach((particle) => particle.render(this.ctx));
  }

  renderDamageNumbers() {
    this.damageNumbers.forEach((dn) => dn.render(this.ctx));
  }

  renderGrenades() {
    this.grenades.forEach((grenade) => grenade.render(this.ctx));
  }

  renderComboDisplay() {
    if (this.comboDisplay.alpha <= 0 || !this.comboDisplay.text) return;

    const ctx = this.ctx;
    const x = this.width / 2;
    const y = 120;

    ctx.save();
    ctx.globalAlpha = this.comboDisplay.alpha;
    ctx.translate(x, y);
    ctx.scale(this.comboDisplay.scale, this.comboDisplay.scale);

    // Glow effect
    ctx.shadowColor = this.comboDisplay.color;
    ctx.shadowBlur = 20;

    // Main text
    ctx.fillStyle = this.comboDisplay.color;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.comboDisplay.text, 0, 0);

    // Multiplier text below
    const multiplier = this.getComboMultiplier();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${multiplier}x MULTIPLIER`, 0, 35);

    ctx.shadowBlur = 0;
    ctx.restore();

    // Screen tint at high combos
    if (this.combo >= 20) {
      ctx.fillStyle = this.combo >= 30 ? 'rgba(255, 0, 255, 0.05)' : 'rgba(255, 100, 0, 0.05)';
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  renderHUD() {
    const ctx = this.ctx;

    // Health bar
    ctx.fillStyle = '#333';
    ctx.fillRect(10, 10, 200, 20);
    ctx.fillStyle = '#ff3333';
    const healthWidth = (this.player?.health / this.player?.maxHealth) * 196 || 0;
    ctx.fillRect(12, 12, healthWidth, 16);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(10, 10, 200, 20);

    // Health text
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`HP: ${this.player?.health || 0}/${this.player?.maxHealth || 100}`, 15, 24);

    // Lives
    ctx.fillStyle = '#ff6666';
    for (let i = 0; i < this.lives; i++) {
      ctx.fillText('❤️', 220 + i * 25, 24);
    }

    // Score
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Score: ${this.score}`, 10, 50);

    // Level & Wave
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText(`Level ${this.currentLevel} - Wave ${this.wave}`, 10, 70);

    // Ammo
    if (this.player) {
      const weapon = this.player.currentWeapon;
      ctx.fillStyle = '#aaa';
      ctx.fillText(`${weapon.name}: ${weapon.ammo}/${weapon.maxAmmo}`, 10, 90);

      // Grenades
      ctx.fillStyle = '#ff8800';
      ctx.fillText(`Grenades: ${this.player.grenades} [G/Q]`, 10, 110);
    }

    // Combo counter (small version in HUD)
    if (this.combo >= 5) {
      ctx.fillStyle = this.comboDisplay.color;
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`Combo: ${this.combo} (${this.getComboMultiplier()}x)`, this.width - 150, 44);
    }

    // Weapon slots
    this.renderWeaponSlots();

    // Mini kill counter
    ctx.fillStyle = '#ff4444';
    ctx.font = '14px Arial';
    ctx.fillText(`Kills: ${this.sessionStats.kills}`, this.width - 100, 24);
  }

  renderChallengeHUD() {
    const ctx = this.ctx;
    const req = this.challengeData.requirement;
    const progress = this.challengeProgress;
    const target = req.target;
    const percent = Math.min(100, (progress / target) * 100);
    const completed = progress >= target;

    const barWidth = 220;
    const barHeight = 16;
    const x = this.width / 2 - barWidth / 2;
    const y = 8;

    // Background panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 10, y - 4, barWidth + 20, 42);
    ctx.strokeStyle = completed ? '#44ff44' : '#ff6600';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 10, y - 4, barWidth + 20, 42);

    // Challenge title
    ctx.fillStyle = completed ? '#44ff44' : '#ff8844';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.challengeData.title, this.width / 2, y + 8);

    // Progress bar background
    ctx.fillStyle = '#222';
    ctx.fillRect(x, y + 14, barWidth, barHeight);

    // Progress bar fill
    const gradient = ctx.createLinearGradient(x, 0, x + barWidth * percent / 100, 0);
    if (completed) {
      gradient.addColorStop(0, '#44ff44');
      gradient.addColorStop(1, '#22cc22');
    } else {
      gradient.addColorStop(0, '#ff4444');
      gradient.addColorStop(1, '#ff8844');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y + 14, barWidth * percent / 100, barHeight);

    // Progress bar border
    ctx.strokeStyle = '#555';
    ctx.strokeRect(x, y + 14, barWidth, barHeight);

    // Progress text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.fillText(`${progress} / ${target}`, this.width / 2, y + 26);

    ctx.textAlign = 'left';
  }

  renderWeaponSlots() {
    const ctx = this.ctx;
    if (!this.player) return;

    const slotWidth = 60;
    const slotHeight = 50;
    const gap = 4;
    const startX = this.width / 2 - (this.player.weapons.length * (slotWidth + gap)) / 2;
    const y = this.height - 60;

    // Clear and rebuild weapon slot bounds
    this.weaponSlotBounds = [];

    this.player.weapons.forEach((weapon, i) => {
      const x = startX + i * (slotWidth + gap);
      const isActive = weapon === this.player.currentWeapon;
      const isHovered = this.hoveredWeaponSlot === i;

      // Store bounds for click detection
      this.weaponSlotBounds.push({ x, y, width: slotWidth, height: slotHeight });

      // Slot background with hover effect
      if (isActive) {
        ctx.fillStyle = '#cc3333';
      } else if (isHovered) {
        ctx.fillStyle = '#444';
      } else {
        ctx.fillStyle = '#222';
      }
      ctx.fillRect(x, y, slotWidth, slotHeight);

      // Border with hover effect
      if (isActive) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
      } else if (isHovered) {
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
      }
      ctx.strokeRect(x, y, slotWidth, slotHeight);
      ctx.lineWidth = 1;

      // Key hint at top
      ctx.fillStyle = isActive ? '#ffff00' : '#888';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`[${i + 1}]`, x + slotWidth / 2, y + 10);

      // Weapon short name
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Arial';
      ctx.fillText(weapon.shortName, x + slotWidth / 2, y + 25);

      // Ammo count
      ctx.fillStyle = weapon.ammo > 0 ? '#aaa' : '#ff4444';
      ctx.font = '10px Arial';
      const ammoText = weapon.infinite ? '∞' : `${weapon.ammo}`;
      ctx.fillText(ammoText, x + slotWidth / 2, y + 38);

      // Low ammo indicator
      if (!weapon.infinite && weapon.ammo < weapon.maxAmmo * 0.2) {
        ctx.fillStyle = '#ff4444';
        ctx.font = '8px Arial';
        ctx.fillText('LOW', x + slotWidth / 2, y + 47);
      }
    });

    // Render tooltip for hovered weapon
    if (this.hoveredWeaponSlot !== null && this.hoveredWeaponSlot < this.player.weapons.length) {
      this.renderWeaponTooltip(this.player.weapons[this.hoveredWeaponSlot], startX + this.hoveredWeaponSlot * (slotWidth + gap), y);
    }

    ctx.textAlign = 'left';
  }

  renderWeaponTooltip(weapon, slotX, slotY) {
    const ctx = this.ctx;
    const tooltipWidth = 160;
    const tooltipHeight = 95;
    let x = slotX - tooltipWidth / 2 + 30;
    const y = slotY - tooltipHeight - 10;

    // Keep tooltip on screen
    if (x < 10) x = 10;
    if (x + tooltipWidth > this.width - 10) x = this.width - tooltipWidth - 10;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(x, y, tooltipWidth, tooltipHeight);
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, tooltipWidth, tooltipHeight);
    ctx.lineWidth = 1;

    // Weapon name
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(weapon.name, x + 10, y + 20);

    // Stats
    ctx.fillStyle = '#fff';
    ctx.font = '11px Arial';
    ctx.fillText(`Damage: ${weapon.damage}`, x + 10, y + 38);
    ctx.fillText(`Fire Rate: ${weapon.fireRate}ms`, x + 10, y + 52);
    ctx.fillText(`Ammo: ${weapon.infinite ? 'Infinite' : weapon.ammo + '/' + weapon.maxAmmo}`, x + 10, y + 66);

    // Special properties
    ctx.fillStyle = '#00ffff';
    ctx.font = '10px Arial';
    let special = '';
    if (weapon.isFlame) special = 'Fire damage';
    if (weapon.isPiercing) special = 'Pierces enemies';
    if (weapon.isExplosive) special = 'Explosive';
    if (weapon.isLaser) special = 'Laser beam';
    if (weapon.bulletsPerShot > 1) special = `${weapon.bulletsPerShot} projectiles`;
    if (special) ctx.fillText(special, x + 10, y + 82);
  }

  getClickedWeaponSlot(mouseX, mouseY) {
    for (let i = 0; i < this.weaponSlotBounds.length; i++) {
      const slot = this.weaponSlotBounds[i];
      if (
        mouseX >= slot.x &&
        mouseX <= slot.x + slot.width &&
        mouseY >= slot.y &&
        mouseY <= slot.y + slot.height
      ) {
        return i;
      }
    }
    return null;
  }

  renderMenu() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ZOMBIE APOCALYPSE', this.width / 2, 120);

    ctx.fillStyle = '#888';
    ctx.font = '16px Arial';
    ctx.fillText('A beat-em-up zombie shooter', this.width / 2, 160);

    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Press ENTER or click START to play', this.width / 2, 250);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px Arial';
    ctx.fillText('Controls:', this.width / 2, 290);
    ctx.fillText('WASD / Arrows - Move', this.width / 2, 315);
    ctx.fillText('Shift - Dodge Roll', this.width / 2, 335);
    ctx.fillText('Space / Z / Click - Shoot', this.width / 2, 355);
    ctx.fillText('X / Right Click - Melee', this.width / 2, 375);
    ctx.fillText('G / Q - Throw Grenade', this.width / 2, 395);
    ctx.fillText('C - Bomb', this.width / 2, 415);
    ctx.fillText('1-5 - Switch Weapons', this.width / 2, 435);
    ctx.fillText('P - Pause', this.width / 2, 455);

    ctx.textAlign = 'left';
  }

  renderPauseScreen() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', this.width / 2, this.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press P to resume', this.width / 2, this.height / 2 + 40);
    ctx.textAlign = 'left';
  }

  renderGameOver() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 50);

    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 10);
    ctx.fillText(`Zombies Killed: ${this.sessionStats.kills}`, this.width / 2, this.height / 2 + 40);

    ctx.font = '18px Arial';
    ctx.fillText('Click RESTART to try again', this.width / 2, this.height / 2 + 90);
    ctx.textAlign = 'left';
  }

  renderLevelComplete() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL COMPLETE!', this.width / 2, this.height / 2 - 50);

    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 2 + 10);

    ctx.font = '18px Arial';
    ctx.fillText('Click NEXT LEVEL to continue', this.width / 2, this.height / 2 + 60);
    ctx.textAlign = 'left';
  }

  renderWinScreen() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('YOU SURVIVED!', this.width / 2, this.height / 2 - 80);

    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('The zombie apocalypse is over... for now.', this.width / 2, this.height / 2 - 30);

    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 20);

    ctx.fillStyle = '#aaa';
    ctx.font = '16px Arial';
    ctx.fillText(`Total Kills: ${this.sessionStats.kills}`, this.width / 2, this.height / 2 + 60);

    ctx.textAlign = 'left';
  }

  gameLoop(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  start() {
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }
}

// Particle class for effects
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10 - 5;
    this.life = 500;
    this.size = Math.random() * 5 + 2;
    this.gravity = 0.3;
  }

  update(deltaTime) {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life -= deltaTime;
    this.size *= 0.98;
  }

  render(ctx) {
    const alpha = Math.max(0, this.life / 500);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

// Damage number floating text
class DamageNumber {
  constructor(x, y, damage) {
    this.x = x;
    this.y = y;
    this.damage = damage;
    this.life = 1000;
    this.vy = -2;
  }

  update(deltaTime) {
    this.y += this.vy;
    this.life -= deltaTime;
  }

  render(ctx) {
    const alpha = Math.max(0, this.life / 1000);
    ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`-${this.damage}`, this.x, this.y);
    ctx.textAlign = 'left';
  }
}

// Bullet class
class Bullet {
  constructor(x, y, vx, vy, damage, isEnemy = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.isEnemy = isEnemy;
    this.active = true;
    this.width = 8;
    this.height = 4;
    this.color = isEnemy ? '#00ff00' : '#ffff00';
  }

  update(deltaTime) {
    this.x += this.vx * (deltaTime / 16);
    this.y += this.vy * (deltaTime / 16);

    // Deactivate if off screen
    if (this.x < -50 || this.x > 5000 || this.y < -50 || this.y > 600) {
      this.active = false;
    }
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Bullet trail
    ctx.fillStyle = this.isEnemy ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 255, 0, 0.3)';
    ctx.fillRect(this.x - this.vx * 0.5, this.y, this.width * 2, this.height);
  }
}

// Powerup class
class Powerup {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.active = true;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.lifetime = 10000;

    this.colors = {
      health: '#ff4444',
      ammo: '#ffaa00',
      speed: '#44ff44',
      damage: '#ff44ff',
      shield: '#4444ff',
      life: '#ff66ff',
      grenade: '#ff8800',
    };
  }

  update(deltaTime) {
    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.active = false;
    }
    this.bobOffset += deltaTime * 0.005;
  }

  render(ctx) {
    const bobY = Math.sin(this.bobOffset) * 5;

    // Try to use sprite manager first
    if (window.spriteManager?.loaded && window.spriteManager.sprites.powerups?.[this.type]) {
      const sprite = window.spriteManager.sprites.powerups[this.type];
      ctx.shadowColor = this.colors[this.type] || '#fff';
      ctx.shadowBlur = 15;
      ctx.drawImage(sprite, this.x - 5, this.y + bobY - 5, this.width + 10, this.height + 10);
      ctx.shadowBlur = 0;
      return;
    }

    // Fallback rendering
    ctx.shadowColor = this.colors[this.type] || '#fff';
    ctx.shadowBlur = 10;

    ctx.fillStyle = this.colors[this.type] || '#fff';
    ctx.fillRect(this.x, this.y + bobY, this.width, this.height);

    // Icon
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    const icons = { health: '+', ammo: 'A', speed: 'S', damage: 'D', shield: 'O', life: '❤', grenade: 'G' };
    ctx.fillText(icons[this.type] || '?', this.x + this.width / 2, this.y + bobY + 20);

    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
  }
}

// Grenade class with arc trajectory
class Grenade {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.targetX = targetX;
    this.targetY = targetY;

    // Calculate trajectory
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Limit max throw distance
    const maxDistance = 400;
    if (distance > maxDistance) {
      const ratio = maxDistance / distance;
      this.targetX = x + dx * ratio;
      this.targetY = y + dy * ratio;
    }

    this.flightTime = 800; // Total flight time in ms
    this.timer = 0;
    this.active = true;
    this.exploded = false;

    // Arc height based on distance
    this.arcHeight = Math.min(150, distance * 0.4);

    // Rotation for visual effect
    this.rotation = 0;
    this.rotationSpeed = 0.02;

    // Size
    this.width = 12;
    this.height = 12;

    // Explosion properties
    this.explosionRadius = 100;
    this.explosionDamage = 80;
  }

  update(deltaTime, game) {
    if (!this.active) return;

    this.timer += deltaTime;
    this.rotation += this.rotationSpeed * deltaTime;

    // Calculate position along arc
    const progress = Math.min(1, this.timer / this.flightTime);

    // Linear interpolation for x/y
    const dx = this.targetX - this.startX;
    const dy = this.targetY - this.startY;

    this.x = this.startX + dx * progress;
    // Add arc (parabola)
    const arcProgress = progress * 2 - 1; // -1 to 1
    const arcOffset = this.arcHeight * (1 - arcProgress * arcProgress);
    this.y = this.startY + dy * progress - arcOffset;

    // Explode when reaching target
    if (progress >= 1) {
      this.explode(game);
    }
  }

  explode(game) {
    if (this.exploded) return;
    this.exploded = true;
    this.active = false;

    // Screen shake
    game.addScreenShake(12, 300);

    // Damage zombies in radius
    game.zombies.forEach((zombie) => {
      if (zombie.isDead) return;

      const dx = (zombie.x + zombie.width / 2) - this.x;
      const dy = (zombie.y + zombie.height / 2) - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.explosionRadius) {
        // Damage falls off with distance
        const damageMultiplier = 1 - (distance / this.explosionRadius) * 0.5;
        const damage = Math.floor(this.explosionDamage * damageMultiplier);
        zombie.takeDamage(damage);
        zombie.grenadeKill = true; // Mark for grenade kill tracking
        game.showDamageNumber(zombie.x + zombie.width / 2, zombie.y, damage);

        // Knockback
        if (distance > 0) {
          zombie.x += (dx / distance) * 30;
          zombie.y += (dy / distance) * 15;
        }
      }
    });

    // Explosion particles
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = 3 + Math.random() * 5;
      const colors = ['#ff4400', '#ff8800', '#ffcc00', '#ff0000'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particle = new Particle(this.x, this.y, color);
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed - 2;
      particle.size = 5 + Math.random() * 5;
      particle.life = 600;
      game.particles.push(particle);
    }

    // Central flash
    for (let i = 0; i < 10; i++) {
      const particle = new Particle(this.x, this.y, '#ffffff');
      particle.vx = (Math.random() - 0.5) * 8;
      particle.vy = (Math.random() - 0.5) * 8;
      particle.size = 8 + Math.random() * 8;
      particle.life = 300;
      game.particles.push(particle);
    }

    game.showNotification('BOOM!');
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Grenade body (dark green)
    ctx.fillStyle = '#2a4a2a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#3a6a3a';
    ctx.beginPath();
    ctx.ellipse(-2, -2, 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pin/lever (gold)
    ctx.fillStyle = '#c4a444';
    ctx.fillRect(-2, -10, 4, 4);

    // Fuse spark
    const sparkAlpha = 0.5 + Math.sin(Date.now() / 50) * 0.5;
    ctx.fillStyle = `rgba(255, 200, 100, ${sparkAlpha})`;
    ctx.beginPath();
    ctx.arc(0, -12, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Trail effect
    ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.beginPath();
    ctx.arc(this.x - 5, this.y + 3, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Export for use in other modules
window.Game = Game;
window.Bullet = Bullet;
window.Powerup = Powerup;
window.Particle = Particle;
window.Grenade = Grenade;
