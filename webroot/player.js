// Player character class with detailed sprite rendering
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 60;

    // Movement - responsive player controls
    this.vx = 0;
    this.vy = 0;
    this.targetVx = 0;  // Target velocity for smooth movement
    this.targetVy = 0;
    this.speed = 5;
    this.acceleration = 0.4;    // How fast player reaches target speed
    this.deceleration = 0.3;    // How fast player stops
    this.gravity = 0; // Disabled for beat-em-up style
    this.onGround = true;
    this.facingRight = true;

    // Dodge/roll ability
    this.isDodging = false;
    this.dodgeTimer = 0;
    this.dodgeCooldown = 0;
    this.dodgeSpeed = 12;
    this.dodgeDirection = { x: 0, y: 0 };

    // Stats
    this.health = 150;
    this.maxHealth = 150;
    this.isDead = false;

    // Combat
    this.weapons = [];
    this.currentWeaponIndex = 0;
    this.meleeTimer = 0;
    this.meleeCooldown = 500;
    this.meleeDamage = 30;
    this.meleeRange = 60;
    this.isAttacking = false;
    this.attackTimer = 0;

    // Special attack
    this.bombs = 3;
    this.bombCooldown = 0;

    // Grenades
    this.grenades = 3;
    this.maxGrenades = 5;
    this.grenadeCooldown = 0;

    // Powerup effects
    this.speedBoost = 1;
    this.damageBoost = 1;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.shieldActive = false;
    this.shieldTimer = 0;

    // Visual
    this.color = '#4488ff';
    this.flashTimer = 0;

    // Animation
    this.animState = 'idle';
    this.animFrame = 0;
    this.animTimer = 0;
    this.breatheOffset = 0;

    // Initialize weapons
    this.initWeapons();

    // Reference to game
    this.game = null;
  }

  initWeapons() {
    this.weapons = [
      {
        name: 'Pistol',
        shortName: 'PST',
        damage: 15,
        fireRate: 300,
        ammo: 999,
        maxAmmo: 999,
        spread: 0,
        bulletSpeed: 15,
        bulletsPerShot: 1,
        lastFired: 0,
        infinite: true,
      },
      {
        name: 'Shotgun',
        shortName: 'SHT',
        damage: 10,
        fireRate: 800,
        ammo: 30,
        maxAmmo: 30,
        spread: 0.3,
        bulletSpeed: 12,
        bulletsPerShot: 5,
        lastFired: 0,
        infinite: false,
      },
      {
        name: 'Rifle',
        shortName: 'RIF',
        damage: 25,
        fireRate: 150,
        ammo: 60,
        maxAmmo: 60,
        spread: 0.05,
        bulletSpeed: 20,
        bulletsPerShot: 1,
        lastFired: 0,
        infinite: false,
      },
      {
        name: 'SMG',
        shortName: 'SMG',
        damage: 8,
        fireRate: 80,
        ammo: 120,
        maxAmmo: 120,
        spread: 0.15,
        bulletSpeed: 16,
        bulletsPerShot: 1,
        lastFired: 0,
        infinite: false,
      },
      {
        name: 'Flamethrower',
        shortName: 'FLM',
        damage: 5,
        fireRate: 50,
        ammo: 200,
        maxAmmo: 200,
        spread: 0.4,
        bulletSpeed: 8,
        bulletsPerShot: 3,
        lastFired: 0,
        infinite: false,
        isFlame: true,
      },
      {
        name: 'Sniper',
        shortName: 'SNP',
        damage: 80,
        fireRate: 1200,
        ammo: 15,
        maxAmmo: 15,
        spread: 0,
        bulletSpeed: 30,
        bulletsPerShot: 1,
        lastFired: 0,
        infinite: false,
        isPiercing: true,
      },
      {
        name: 'Rocket Launcher',
        shortName: 'RPG',
        damage: 100,
        fireRate: 1500,
        ammo: 10,
        maxAmmo: 10,
        spread: 0,
        bulletSpeed: 10,
        bulletsPerShot: 1,
        lastFired: 0,
        infinite: false,
        isExplosive: true,
        explosionRadius: 80,
      },
      {
        name: 'Laser Gun',
        shortName: 'LSR',
        damage: 35,
        fireRate: 200,
        ammo: 50,
        maxAmmo: 50,
        spread: 0,
        bulletSpeed: 25,
        bulletsPerShot: 1,
        lastFired: 0,
        infinite: false,
        isLaser: true,
      },
      {
        name: 'Minigun',
        shortName: 'MNG',
        damage: 12,
        fireRate: 40,
        ammo: 300,
        maxAmmo: 300,
        spread: 0.2,
        bulletSpeed: 18,
        bulletsPerShot: 1,
        lastFired: 0,
        infinite: false,
      },
    ];
  }

  get currentWeapon() {
    return this.weapons[this.currentWeaponIndex];
  }

  move(dx, dy = 0) {
    if (this.isDead || this.isDodging) return;

    // Set target velocity (smooth acceleration)
    this.targetVx = dx * this.speed * this.speedBoost;
    this.targetVy = dy * this.speed * this.speedBoost;

    if (dx !== 0) {
      this.facingRight = dx > 0;
    }

    if (dx !== 0 || dy !== 0) {
      this.animState = 'walk';
    } else {
      this.animState = 'idle';
    }
  }

  // Dodge/roll ability - quick evasive move
  dodge(dx, dy) {
    if (this.isDead || this.isDodging || this.dodgeCooldown > 0) return;

    // Use current facing if no direction specified
    if (dx === 0 && dy === 0) {
      dx = this.facingRight ? 1 : -1;
    }

    // Normalize direction
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      this.dodgeDirection.x = dx / len;
      this.dodgeDirection.y = dy / len;
    }

    this.isDodging = true;
    this.dodgeTimer = 200; // Dodge duration in ms
    this.dodgeCooldown = 800; // Cooldown before next dodge
    this.invincible = true; // Brief invincibility during dodge
    this.animState = 'dodge';
  }

  jump() {
    // No-op in beat-em-up style - space bar is used for shooting
    return;
  }

  shoot(game) {
    if (this.isDead) return;

    const weapon = this.currentWeapon;
    const now = Date.now();

    if (now - weapon.lastFired < weapon.fireRate) return;
    if (!weapon.infinite && weapon.ammo <= 0) return;

    weapon.lastFired = now;
    if (!weapon.infinite) weapon.ammo--;

    game.sessionStats.shotsFired++;

    // Create bullets
    for (let i = 0; i < weapon.bulletsPerShot; i++) {
      const spread = (Math.random() - 0.5) * weapon.spread;
      const direction = this.facingRight ? 1 : -1;
      const bulletX = this.x + (this.facingRight ? this.width : 0);
      const bulletY = this.y + this.height / 2 - 10;

      const bullet = new Bullet(
        bulletX,
        bulletY,
        direction * weapon.bulletSpeed,
        spread * 5,
        Math.floor(weapon.damage * this.damageBoost),
        false
      );

      // Flamethrower special visuals
      if (weapon.isFlame) {
        bullet.color = ['#ff4400', '#ff6600', '#ff8800'][Math.floor(Math.random() * 3)];
        bullet.width = 15;
        bullet.height = 10;
      }

      // Sniper - piercing bullets
      if (weapon.isPiercing) {
        bullet.color = '#00ffff';
        bullet.width = 20;
        bullet.height = 3;
        bullet.isPiercing = true;
      }

      // Rocket Launcher - explosive rockets
      if (weapon.isExplosive) {
        bullet.color = '#ff4400';
        bullet.width = 20;
        bullet.height = 10;
        bullet.isExplosive = true;
        bullet.explosionRadius = weapon.explosionRadius || 80;
      }

      // Laser Gun - laser beams
      if (weapon.isLaser) {
        bullet.color = '#00ff00';
        bullet.width = 25;
        bullet.height = 4;
        bullet.isLaser = true;
      }

      game.bullets.push(bullet);
    }

    // Muzzle flash particles
    const flashX = this.x + (this.facingRight ? this.width + 10 : -10);
    const flashY = this.y + this.height / 2 - 10;
    game.spawnParticles(flashX, flashY, '#ffff00', 3);

    // Screen shake for heavy weapons
    if (weapon.name === 'Shotgun') {
      game.addScreenShake(5, 100);
    }
    if (weapon.name === 'Rocket Launcher') {
      game.addScreenShake(8, 150);
    }
    if (weapon.name === 'Minigun') {
      game.addScreenShake(2, 50);
    }
    if (weapon.name === 'Sniper') {
      game.addScreenShake(6, 120);
    }

    this.isAttacking = true;
    this.attackTimer = 100;
  }

  melee(game) {
    if (this.isDead) return;

    const now = Date.now();
    if (now - this.meleeTimer < this.meleeCooldown) return;

    this.meleeTimer = now;
    this.isAttacking = true;
    this.attackTimer = 200;
    this.animState = 'melee';

    // Check for zombies in melee range
    const meleeX = this.facingRight ? this.x + this.width : this.x - this.meleeRange;

    game.zombies.forEach((zombie) => {
      if (zombie.isDead) return;

      const inRange =
        zombie.x + zombie.width > meleeX &&
        zombie.x < meleeX + this.meleeRange &&
        Math.abs(zombie.y - this.y) < 50;

      if (inRange) {
        const damage = Math.floor(this.meleeDamage * this.damageBoost);
        zombie.takeDamage(damage);
        game.showDamageNumber(zombie.x + zombie.width / 2, zombie.y, damage);
        game.spawnParticles(zombie.x + zombie.width / 2, zombie.y + zombie.height / 2, '#ff0000', 8);

        if (zombie.isDead) {
          game.sessionStats.meleeKills++;
        }

        // Knockback
        zombie.x += this.facingRight ? 30 : -30;
      }
    });

    // Melee swing effect
    const effectX = this.facingRight ? this.x + this.width : this.x - this.meleeRange;
    game.spawnParticles(effectX + this.meleeRange / 2, this.y + this.height / 2, '#ffffff', 5);
  }

  throwGrenade(game, targetX, targetY) {
    if (this.isDead || this.grenades <= 0 || this.grenadeCooldown > 0) return;

    this.grenades--;
    this.grenadeCooldown = 500; // 500ms cooldown between throws

    // Create grenade at player position
    const grenadeX = this.x + this.width / 2;
    const grenadeY = this.y + this.height / 3;

    const grenade = new Grenade(grenadeX, grenadeY, targetX, targetY);
    game.grenades.push(grenade);

    game.showNotification('GRENADE!');
  }

  specialAttack(game) {
    if (this.isDead || this.bombs <= 0 || this.bombCooldown > 0) return;

    this.bombs--;
    this.bombCooldown = 2000;

    // Screen clearing bomb
    game.addScreenShake(15, 500);

    // Damage all zombies on screen
    game.zombies.forEach((zombie) => {
      if (!zombie.isDead) {
        const distance = Math.abs(zombie.x - this.x);
        if (distance < game.width) {
          zombie.takeDamage(100);
          game.spawnParticles(zombie.x + zombie.width / 2, zombie.y + zombie.height / 2, '#ff8800', 20);
        }
      }
    });

    // Big explosion effect
    for (let i = 0; i < 50; i++) {
      game.spawnParticles(
        this.x + (Math.random() - 0.5) * game.width,
        this.y + (Math.random() - 0.5) * 200,
        ['#ff0000', '#ff4400', '#ff8800', '#ffff00'][Math.floor(Math.random() * 4)]
      );
    }

    game.showNotification('BOMB!');
  }

  switchWeapon(index) {
    if (index >= 0 && index < this.weapons.length) {
      this.currentWeaponIndex = index;
    }
  }

  takeDamage(amount, game) {
    if (this.isDead || this.invincible || this.shieldActive) return;

    this.health -= amount;
    this.flashTimer = 200;
    game.sessionStats.damageTaken += amount;
    game.addScreenShake(8, 150);

    // Reset combo when taking damage
    game.resetCombo();

    // Brief invincibility after being hit
    this.invincible = true;
    this.invincibleTimer = 1000;

    if (this.health <= 0) {
      this.die(game);
    }
  }

  die(game) {
    this.isDead = true;
    this.animState = 'death';
    game.spawnParticles(this.x + this.width / 2, this.y + this.height / 2, '#ff0000', 30);
    game.playerDeath();
  }

  respawn() {
    this.isDead = false;
    this.health = this.maxHealth;
    this.x = 100;
    // Respawn in middle of playable area (for beat-em-up style)
    this.y = this.game ? this.game.height - 220 : 300;
    this.invincible = true;
    this.invincibleTimer = 3000;
    this.animState = 'idle';
  }

  collectPowerup(powerup, game) {
    switch (powerup.type) {
      case 'health':
        this.health = Math.min(this.maxHealth, this.health + 30);
        break;
      case 'ammo':
        this.weapons.forEach((w) => {
          if (!w.infinite) {
            w.ammo = Math.min(w.maxAmmo, w.ammo + Math.floor(w.maxAmmo * 0.5));
          }
        });
        break;
      case 'speed':
        this.speedBoost = 1.5;
        setTimeout(() => {
          this.speedBoost = 1;
        }, 10000);
        break;
      case 'damage':
        this.damageBoost = 2;
        setTimeout(() => {
          this.damageBoost = 1;
        }, 10000);
        break;
      case 'shield':
        this.shieldActive = true;
        this.shieldTimer = 5000;
        break;
      case 'life':
        game.lives = Math.min(5, game.lives + 1);
        break;
      case 'grenade':
        this.grenades = Math.min(this.maxGrenades, this.grenades + 2);
        break;
    }

    game.showNotification(powerup.type.toUpperCase() + '!');
    game.spawnParticles(this.x + this.width / 2, this.y + this.height / 2, '#00ffff', 10);
  }

  update(deltaTime, game) {
    if (this.isDead) return;

    // Handle dodge movement
    if (this.isDodging) {
      this.dodgeTimer -= deltaTime;
      this.vx = this.dodgeDirection.x * this.dodgeSpeed;
      this.vy = this.dodgeDirection.y * this.dodgeSpeed;

      if (this.dodgeTimer <= 0) {
        this.isDodging = false;
        this.invincible = false;
        this.vx = 0;
        this.vy = 0;
        this.animState = 'idle';
      }
    } else {
      // Smooth acceleration toward target velocity
      if (this.targetVx !== 0) {
        // Accelerate toward target
        const diff = this.targetVx - this.vx;
        this.vx += diff * this.acceleration;
      } else {
        // Decelerate when no input
        this.vx *= (1 - this.deceleration);
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
      }

      if (this.targetVy !== 0) {
        const diff = this.targetVy - this.vy;
        this.vy += diff * this.acceleration;
      } else {
        this.vy *= (1 - this.deceleration);
        if (Math.abs(this.vy) < 0.1) this.vy = 0;
      }
    }

    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;

    // Vertical bounds (playable floor area in beat-em-up style)
    const minY = game.height - 250;
    const maxY = game.height - 70;
    this.y = Math.max(minY - this.height, Math.min(maxY - this.height, this.y));

    // Keep in horizontal bounds
    this.x = Math.max(game.camera.x, Math.min(game.camera.x + game.width - this.width, this.x));

    // Reset target velocities (player must keep pressing keys)
    this.targetVx = 0;
    this.targetVy = 0;

    // Dodge cooldown
    if (this.dodgeCooldown > 0) {
      this.dodgeCooldown -= deltaTime;
    }

    // Update timers
    if (this.flashTimer > 0) this.flashTimer -= deltaTime;
    if (this.attackTimer > 0) {
      this.attackTimer -= deltaTime;
      if (this.attackTimer <= 0) this.isAttacking = false;
    }
    if (this.bombCooldown > 0) this.bombCooldown -= deltaTime;
    if (this.grenadeCooldown > 0) this.grenadeCooldown -= deltaTime;

    // Invincibility timer
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= deltaTime;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }

    // Shield timer
    if (this.shieldTimer > 0) {
      this.shieldTimer -= deltaTime;
      if (this.shieldTimer <= 0) {
        this.shieldActive = false;
      }
    }

    // Animation
    this.animTimer += deltaTime;
    if (this.animTimer > 100) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }

    // Breathing animation
    this.breatheOffset = Math.sin(Date.now() / 500) * 1;
  }

  render(ctx) {
    // Flash when damaged
    if (this.flashTimer > 0 && Math.floor(this.flashTimer / 50) % 2 === 0) {
      return;
    }

    // Invincibility flashing
    if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.save();

    // Flip sprite if facing left
    if (!this.facingRight) {
      ctx.translate(this.x + this.width / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(this.x + this.width / 2), 0);
    }

    // Always use our detailed procedural rendering for better weapon display
    // (Skip sprite manager to show detailed weapons)

    // Fallback to detailed rendering
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h + 5, w / 2, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animation offsets
    const walkOffset = this.animState === 'walk' ? Math.sin(this.animFrame * Math.PI / 2) * 5 : 0;
    const jumpOffset = !this.onGround ? -3 : 0;

    // LEGS - Dark blue tactical pants
    ctx.fillStyle = '#1a2a3a';
    if (this.animState === 'walk') {
      ctx.fillRect(x + 8, y + h - 20 + jumpOffset, 10, 25 + walkOffset);
      ctx.fillRect(x + w - 18, y + h - 20 + jumpOffset, 10, 25 - walkOffset);
    } else {
      ctx.fillRect(x + 8, y + h - 20 + jumpOffset, 10, 25);
      ctx.fillRect(x + w - 18, y + h - 20 + jumpOffset, 10, 25);
    }
    // Knee pads
    ctx.fillStyle = '#2a3a4a';
    ctx.fillRect(x + 9, y + h - 10 + jumpOffset, 8, 6);
    ctx.fillRect(x + w - 17, y + h - 10 + jumpOffset, 8, 6);

    // Boots (brown combat boots)
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(x + 6, y + h + 3 + jumpOffset + walkOffset, 14, 7);
    ctx.fillRect(x + w - 20, y + h + 3 + jumpOffset - walkOffset, 14, 7);
    // Boot soles
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 5, y + h + 8 + jumpOffset + walkOffset, 16, 3);
    ctx.fillRect(x + w - 21, y + h + 8 + jumpOffset - walkOffset, 16, 3);

    // BODY - Blue tactical vest
    ctx.fillStyle = '#2a3a5a';
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 18 + this.breatheOffset);
    ctx.lineTo(x + w - 5, y + 18 + this.breatheOffset);
    ctx.lineTo(x + w - 8, y + h - 18);
    ctx.lineTo(x + 8, y + h - 18);
    ctx.closePath();
    ctx.fill();

    // Vest plate carrier (lighter blue center)
    ctx.fillStyle = '#3a4a6a';
    ctx.fillRect(x + 12, y + 22 + this.breatheOffset, w - 24, 25);

    // Vest details
    ctx.fillStyle = '#4a5a7a';
    // Pouches
    ctx.fillRect(x + 8, y + 30, 10, 12);
    ctx.fillRect(x + w - 18, y + 30, 10, 12);
    // Pouch flaps
    ctx.fillStyle = '#3a4a6a';
    ctx.fillRect(x + 8, y + 30, 10, 3);
    ctx.fillRect(x + w - 18, y + 30, 10, 3);
    // Straps
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(x + 10, y + 18, 4, 35);
    ctx.fillRect(x + w - 14, y + 18, 4, 35);

    // Belt (tan/khaki)
    ctx.fillStyle = '#6a5a3a';
    ctx.fillRect(x + 5, y + h - 22, w - 10, 5);
    // Belt buckle (gold)
    ctx.fillStyle = '#c4a444';
    ctx.fillRect(x + w / 2 - 4, y + h - 22, 8, 5);

    // ARMS AND WEAPON - Rendered together for proper holding
    const armY = y + 22 + this.breatheOffset;
    const recoilOffset = this.isAttacking ? Math.max(0, this.attackTimer / 20) : 0;

    this.renderArmsAndWeapon(ctx, x, y, w, h, armY, recoilOffset);

    // HEAD
    const headY = y - 5 + this.breatheOffset;

    // Helmet (dark blue tactical)
    ctx.fillStyle = '#2a3a5a';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, headY + 12, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Helmet rim
    ctx.fillStyle = '#1a2a4a';
    ctx.fillRect(x + w / 2 - 15, headY + 10, 30, 5);

    // Helmet stripe (orange for visibility)
    ctx.fillStyle = '#ff6622';
    ctx.fillRect(x + w / 2 - 2, headY + 2, 4, 12);

    // Face (healthy skin tone - clearly different from zombie)
    ctx.fillStyle = '#e8b88a';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, headY + 18, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Goggles/visor (bright blue glow)
    ctx.fillStyle = '#2266aa';
    ctx.shadowColor = '#44aaff';
    ctx.shadowBlur = 8;
    ctx.fillRect(x + w / 2 - 10, headY + 12, 20, 6);
    ctx.shadowBlur = 0;

    // Goggles shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x + w / 2 - 8, headY + 13, 6, 2);

    // Mouth area (black balaclava)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + w / 2 - 8, headY + 20, 16, 6);

    // Helmet side details (comms unit)
    ctx.fillStyle = '#3a4a6a';
    ctx.fillRect(x + w / 2 - 14, headY + 5, 5, 10);
    ctx.fillRect(x + w / 2 + 9, headY + 5, 5, 10);
    // Antenna
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + w / 2 - 16, headY + 2, 2, 10);

    // Melee attack visualization
    if (this.isAttacking && this.animState === 'melee') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      const swingX = x + w;
      ctx.beginPath();
      ctx.arc(swingX, y + h / 2, this.meleeRange, -0.6, 0.6);
      ctx.lineTo(swingX, y + h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();

    // Shield effect (drawn after restore so it's not flipped)
    if (this.shieldActive) {
      const shieldPulse = Math.sin(Date.now() / 100) * 5;
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 50 + shieldPulse, 0, Math.PI * 2);
      ctx.stroke();

      // Shield hexagon pattern
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + Date.now() / 1000;
        const hx = this.x + this.width / 2 + Math.cos(angle) * (35 + shieldPulse);
        const hy = this.y + this.height / 2 + Math.sin(angle) * (35 + shieldPulse);
        ctx.beginPath();
        ctx.arc(hx, hy, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    // Speed boost effect
    if (this.speedBoost > 1) {
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      for (let i = 0; i < 3; i++) {
        const trailX = this.x - (this.facingRight ? 1 : -1) * (i + 1) * 15;
        ctx.globalAlpha = 0.3 - i * 0.1;
        ctx.fillRect(trailX, this.y + 10, this.width, this.height - 20);
      }
      ctx.globalAlpha = 1;
    }

    // Damage boost effect
    if (this.damageBoost > 1) {
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 10;
      ctx.strokeRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  }

  renderArmsAndWeapon(ctx, x, y, w, h, armY, recoilOffset) {
    const weapon = this.currentWeapon;
    const isTwoHanded = ['Shotgun', 'Rifle', 'SMG', 'Flamethrower'].includes(weapon.name);

    // Skin and sleeve colors (blue tactical sleeves, healthy skin)
    const skinColor = '#e8b88a';
    const sleeveColor = '#2a3a5a';

    if (isTwoHanded) {
      this.renderTwoHandedWeapon(ctx, x, y, w, armY, recoilOffset, weapon, skinColor, sleeveColor);
    } else {
      this.renderOneHandedWeapon(ctx, x, y, w, armY, recoilOffset, weapon, skinColor, sleeveColor);
    }
  }

  renderOneHandedWeapon(ctx, x, y, w, armY, recoil, weapon, skinColor, sleeveColor) {
    // Left arm relaxed at side
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(x - 3, armY, 10, 25);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(x + 2, armY + 28, 5, 0, Math.PI * 2);
    ctx.fill();

    // Right arm extended holding pistol
    const gunX = x + w + 8 - recoil;
    const gunY = armY + 8;

    // Upper arm
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(x + w - 7, armY, 10, 15);

    // Forearm extended
    ctx.save();
    ctx.translate(x + w, armY + 10);
    ctx.rotate(-0.1); // Slight angle
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(0, -4, 20 - recoil, 8);
    ctx.restore();

    // Hand gripping pistol
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(gunX - 5, gunY + 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // === PISTOL ===
    ctx.fillStyle = '#1a1a1a';
    // Slide (top)
    ctx.fillRect(gunX, gunY - 3, 22, 7);
    // Frame (lower)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(gunX + 2, gunY + 4, 14, 8);
    // Grip
    ctx.fillStyle = '#3a3020';
    ctx.fillRect(gunX + 2, gunY + 4, 10, 12);
    // Grip texture
    ctx.fillStyle = '#2a2015';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(gunX + 3, gunY + 6 + i * 3, 8, 1);
    }
    // Trigger guard
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(gunX + 14, gunY + 10, 4, 0, Math.PI);
    ctx.stroke();
    // Barrel
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(gunX + 20, gunY - 1, 10, 5);
    // Sight
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(gunX + 2, gunY - 5, 3, 3);
    ctx.fillRect(gunX + 18, gunY - 5, 3, 3);
    // Ejection port
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(gunX + 8, gunY - 2, 8, 3);

    this.renderMuzzleFlash(ctx, gunX + 30, gunY + 1, 'small');
  }

  renderTwoHandedWeapon(ctx, x, y, w, armY, recoil, weapon, skinColor, sleeveColor) {
    const gunX = x + w - 5 - recoil;
    const gunY = armY + 5;

    switch (weapon.name) {
      case 'Shotgun':
        this.renderShotgun(ctx, x, w, armY, gunX, gunY, recoil, skinColor, sleeveColor);
        break;
      case 'Rifle':
        this.renderRifle(ctx, x, w, armY, gunX, gunY, recoil, skinColor, sleeveColor);
        break;
      case 'SMG':
        this.renderSMG(ctx, x, w, armY, gunX, gunY, recoil, skinColor, sleeveColor);
        break;
      case 'Flamethrower':
        this.renderFlamethrower(ctx, x, w, armY, gunX, gunY, recoil, skinColor, sleeveColor);
        break;
    }
  }

  renderShotgun(ctx, x, w, armY, gunX, gunY, recoil, skinColor, sleeveColor) {
    // === SHOTGUN - Pump action ===

    // Back arm (supporting front of gun)
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(x - 5, armY + 5, 12, 20);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(gunX + 15, gunY + 12, 5, 0, Math.PI * 2); // Hand on pump
    ctx.fill();

    // Front arm (trigger hand)
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(x + w - 8, armY, 12, 18);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(gunX + 2, gunY + 8, 5, 0, Math.PI * 2); // Hand on grip
    ctx.fill();

    // Stock (wood)
    ctx.fillStyle = '#5a4030';
    ctx.beginPath();
    ctx.moveTo(gunX - 20, gunY + 2);
    ctx.lineTo(gunX - 5, gunY);
    ctx.lineTo(gunX - 5, gunY + 12);
    ctx.lineTo(gunX - 18, gunY + 15);
    ctx.closePath();
    ctx.fill();
    // Stock texture
    ctx.strokeStyle = '#4a3020';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gunX - 18, gunY + 5);
    ctx.lineTo(gunX - 8, gunY + 4);
    ctx.stroke();

    // Receiver (metal body)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(gunX - 5, gunY, 25, 12);

    // Pump/forend
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(gunX + 12, gunY + 2, 15, 10);
    ctx.fillStyle = '#4a3020';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(gunX + 13 + i * 3, gunY + 3, 2, 8);
    }

    // Barrel (double barrel look)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(gunX + 27, gunY + 1, 25, 5);
    ctx.fillRect(gunX + 27, gunY + 7, 25, 5);
    // Barrel end
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(gunX + 52, gunY + 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(gunX + 52, gunY + 9, 3, 0, Math.PI * 2);
    ctx.fill();

    // Trigger guard
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(gunX + 5, gunY + 14, 5, 0, Math.PI);
    ctx.stroke();

    this.renderMuzzleFlash(ctx, gunX + 55, gunY + 6, 'large');
  }

  renderRifle(ctx, x, w, armY, gunX, gunY, recoil, skinColor, sleeveColor) {
    // === ASSAULT RIFLE ===

    // Back arm (supporting front)
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(x - 8, armY + 8, 14, 18);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(gunX + 20, gunY + 15, 5, 0, Math.PI * 2);
    ctx.fill();

    // Front arm
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(x + w - 8, armY, 12, 16);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(gunX, gunY + 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Stock (adjustable)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(gunX - 25, gunY + 2, 20, 8);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(gunX - 28, gunY, 8, 12);
    // Buffer tube
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(gunX - 8, gunY + 3, 10, 6);

    // Lower receiver
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(gunX - 5, gunY + 5, 30, 10);
    // Grip
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(gunX - 2, gunY + 12, 8, 14);
    ctx.fillStyle = '#2a2a2a';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(gunX - 1, gunY + 14 + i * 2, 6, 1);
    }

    // Upper receiver
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(gunX - 5, gunY - 2, 35, 8);

    // Magazine
    ctx.fillStyle = '#3a3a3a';
    ctx.save();
    ctx.translate(gunX + 10, gunY + 15);
    ctx.rotate(0.15);
    ctx.fillRect(0, 0, 8, 18);
    ctx.restore();

    // Handguard/rail
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(gunX + 25, gunY - 1, 20, 10);
    // Rail lines
    ctx.fillStyle = '#3a3a3a';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(gunX + 27 + i * 3, gunY - 1, 2, 2);
    }

    // Barrel
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(gunX + 45, gunY + 2, 18, 5);

    // Flash hider
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(gunX + 60, gunY + 1, 8, 7);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(gunX + 62, gunY + 2, 2, 5);
    ctx.fillRect(gunX + 65, gunY + 2, 2, 5);

    // Scope/optic
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(gunX + 5, gunY - 8, 20, 7);
    ctx.fillStyle = '#2a4a6a';
    ctx.beginPath();
    ctx.arc(gunX + 8, gunY - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff3333';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.arc(gunX + 22, gunY - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    this.renderMuzzleFlash(ctx, gunX + 68, gunY + 4, 'medium');
  }

  renderSMG(ctx, x, w, armY, gunX, gunY, recoil, skinColor, sleeveColor) {
    // === SMG (Compact) ===

    // Back arm on foregrip
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(x - 3, armY + 8, 12, 18);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(gunX + 18, gunY + 18, 5, 0, Math.PI * 2);
    ctx.fill();

    // Front arm
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(x + w - 8, armY, 12, 16);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(gunX + 2, gunY + 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Stock (folded wire stock)
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(gunX - 8, gunY + 3);
    ctx.lineTo(gunX - 15, gunY - 5);
    ctx.lineTo(gunX - 15, gunY + 10);
    ctx.stroke();

    // Body
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(gunX - 8, gunY, 35, 12);

    // Grip
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(gunX - 2, gunY + 10, 8, 12);

    // Magazine (extended)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(gunX + 8, gunY + 12, 7, 22);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(gunX + 9, gunY + 14, 5, 2);

    // Foregrip
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(gunX + 16, gunY + 12, 6, 10);

    // Barrel with suppressor
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(gunX + 27, gunY + 3, 8, 6);
    // Suppressor
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(gunX + 33, gunY + 1, 18, 10);
    ctx.fillStyle = '#3a3a3a';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(gunX + 35 + i * 4, gunY + 2, 2, 8);
    }

    // Iron sights
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(gunX + 5, gunY - 3, 3, 4);
    ctx.fillRect(gunX + 25, gunY - 3, 3, 4);

    this.renderMuzzleFlash(ctx, gunX + 51, gunY + 6, 'small');
  }

  renderFlamethrower(ctx, x, w, armY, gunX, gunY, recoil, skinColor, sleeveColor) {
    // === FLAMETHROWER ===

    // Back arm holding tank strap
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(x - 5, armY, 12, 25);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(x + 2, armY + 28, 5, 0, Math.PI * 2);
    ctx.fill();

    // Front arm on nozzle
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(x + w - 8, armY + 5, 12, 18);
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(gunX + 10, gunY + 12, 5, 0, Math.PI * 2);
    ctx.fill();

    // Fuel tank (on back)
    ctx.fillStyle = '#6a4a2a';
    ctx.beginPath();
    ctx.ellipse(x - 15, armY + 25, 12, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a3a1a';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Tank straps
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 10, armY + 8);
    ctx.lineTo(x + 5, armY + 15);
    ctx.stroke();
    // Pressure gauge
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(x - 10, armY + 15, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#44ff44';
    ctx.beginPath();
    ctx.arc(x - 10, armY + 15, 3, 0, Math.PI * 2);
    ctx.fill();

    // Fuel line
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 5, armY + 30);
    ctx.quadraticCurveTo(x + 10, armY + 35, gunX, gunY + 10);
    ctx.stroke();

    // Main body/handle
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(gunX, gunY + 5, 20, 12);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(gunX + 5, gunY + 15, 8, 10);

    // Igniter housing
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(gunX + 18, gunY, 15, 18);

    // Nozzle
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.moveTo(gunX + 33, gunY + 2);
    ctx.lineTo(gunX + 55, gunY - 3);
    ctx.lineTo(gunX + 55, gunY + 18);
    ctx.lineTo(gunX + 33, gunY + 16);
    ctx.closePath();
    ctx.fill();

    // Nozzle holes
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(gunX + 53, gunY + 3 + i * 5, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pilot flame
    ctx.fillStyle = '#ff6600';
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(gunX + 56, gunY + 8, 4 + Math.sin(Date.now() / 100) * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Flame effect when firing
    if (this.isAttacking) {
      this.renderFlame(ctx, gunX + 55, gunY + 8);
    }
  }

  renderFlame(ctx, startX, startY) {
    const time = Date.now() / 50;

    for (let i = 0; i < 8; i++) {
      const t = i / 8;
      const spread = t * 25;
      const x = startX + i * 8;
      const y = startY + Math.sin(time + i) * spread * 0.3;
      const size = 12 - i * 1;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, `rgba(255, 255, 200, ${0.9 - t * 0.5})`);
      gradient.addColorStop(0.3, `rgba(255, 200, 50, ${0.8 - t * 0.5})`);
      gradient.addColorStop(0.6, `rgba(255, 100, 0, ${0.6 - t * 0.4})`);
      gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderMuzzleFlash(ctx, x, y, size) {
    if (!this.isAttacking || this.attackTimer < 50) return;
    if (this.currentWeapon.name === 'Flamethrower') return;

    const sizes = { small: 1, medium: 1.3, large: 1.8 };
    const scale = sizes[size] || 1;

    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 15 * scale;

    // Main flash
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 12 * scale, y - 6 * scale);
    ctx.lineTo(x + 8 * scale, y);
    ctx.lineTo(x + 15 * scale, y + 2 * scale);
    ctx.lineTo(x + 8 * scale, y + 2 * scale);
    ctx.lineTo(x + 12 * scale, y + 8 * scale);
    ctx.lineTo(x, y + 3 * scale);
    ctx.closePath();
    ctx.fill();

    // Bright center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + 4 * scale, y + 1, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}


// Export for use in other modules
window.Player = Player;
