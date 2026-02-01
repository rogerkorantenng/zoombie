// Weapons configuration and management
const WeaponTypes = {
  PISTOL: {
    id: 'pistol',
    name: 'Pistol',
    shortName: 'PST',
    damage: 15,
    fireRate: 300, // ms between shots
    ammo: 999,
    maxAmmo: 999,
    spread: 0,
    bulletSpeed: 15,
    bulletsPerShot: 1,
    infinite: true,
    sound: 'pistol',
    description: 'Reliable sidearm. Unlimited ammo.',
  },

  SHOTGUN: {
    id: 'shotgun',
    name: 'Shotgun',
    shortName: 'SHT',
    damage: 12,
    fireRate: 800,
    ammo: 30,
    maxAmmo: 30,
    spread: 0.35,
    bulletSpeed: 12,
    bulletsPerShot: 6,
    infinite: false,
    sound: 'shotgun',
    description: 'Devastating at close range.',
  },

  RIFLE: {
    id: 'rifle',
    name: 'Assault Rifle',
    shortName: 'RIF',
    damage: 22,
    fireRate: 120,
    ammo: 90,
    maxAmmo: 90,
    spread: 0.08,
    bulletSpeed: 22,
    bulletsPerShot: 1,
    infinite: false,
    sound: 'rifle',
    description: 'High damage, accurate.',
  },

  SMG: {
    id: 'smg',
    name: 'SMG',
    shortName: 'SMG',
    damage: 8,
    fireRate: 70,
    ammo: 150,
    maxAmmo: 150,
    spread: 0.18,
    bulletSpeed: 18,
    bulletsPerShot: 1,
    infinite: false,
    sound: 'smg',
    description: 'Rapid fire, low damage per shot.',
  },

  FLAMETHROWER: {
    id: 'flamethrower',
    name: 'Flamethrower',
    shortName: 'FLM',
    damage: 4,
    fireRate: 40,
    ammo: 300,
    maxAmmo: 300,
    spread: 0.5,
    bulletSpeed: 8,
    bulletsPerShot: 4,
    infinite: false,
    sound: 'flame',
    isFlame: true,
    description: 'Short range, continuous damage.',
  },
};

// Weapon manager class
class WeaponManager {
  constructor(player) {
    this.player = player;
    this.weapons = [];
    this.currentIndex = 0;

    this.initWeapons();
  }

  initWeapons() {
    // Start with all weapons
    Object.values(WeaponTypes).forEach((type) => {
      this.weapons.push(this.createWeapon(type));
    });
  }

  createWeapon(type) {
    return {
      ...type,
      lastFired: 0,
    };
  }

  get currentWeapon() {
    return this.weapons[this.currentIndex];
  }

  switchWeapon(index) {
    if (index >= 0 && index < this.weapons.length) {
      this.currentIndex = index;
      return true;
    }
    return false;
  }

  nextWeapon() {
    this.currentIndex = (this.currentIndex + 1) % this.weapons.length;
  }

  prevWeapon() {
    this.currentIndex = (this.currentIndex - 1 + this.weapons.length) % this.weapons.length;
  }

  canFire() {
    const weapon = this.currentWeapon;
    const now = Date.now();

    if (now - weapon.lastFired < weapon.fireRate) return false;
    if (!weapon.infinite && weapon.ammo <= 0) return false;

    return true;
  }

  fire(game, x, y, facingRight, damageMultiplier = 1) {
    if (!this.canFire()) return false;

    const weapon = this.currentWeapon;
    weapon.lastFired = Date.now();

    if (!weapon.infinite) {
      weapon.ammo--;
    }

    game.sessionStats.shotsFired++;

    // Create bullets
    const direction = facingRight ? 1 : -1;

    for (let i = 0; i < weapon.bulletsPerShot; i++) {
      const spread = (Math.random() - 0.5) * weapon.spread;
      const bulletX = x + (facingRight ? 0 : -20);
      const bulletY = y;

      const bullet = new Bullet(
        bulletX,
        bulletY,
        direction * weapon.bulletSpeed,
        spread * 8,
        Math.floor(weapon.damage * damageMultiplier),
        false
      );

      // Special bullet properties
      if (weapon.isFlame) {
        bullet.color = ['#ff4400', '#ff6600', '#ff8800', '#ffaa00'][Math.floor(Math.random() * 4)];
        bullet.width = 15 + Math.random() * 10;
        bullet.height = 10 + Math.random() * 5;
        bullet.lifetime = 300; // Flames don't travel far
      }

      game.bullets.push(bullet);
    }

    // Muzzle flash
    game.spawnParticles(x + (facingRight ? 20 : -20), y, '#ffff00', 3);

    // Screen shake for heavy weapons
    if (weapon.id === 'shotgun') {
      game.addScreenShake(6, 100);
    }

    return true;
  }

  addAmmo(type, amount) {
    const weapon = this.weapons.find((w) => w.id === type);
    if (weapon && !weapon.infinite) {
      weapon.ammo = Math.min(weapon.maxAmmo, weapon.ammo + amount);
      return true;
    }
    return false;
  }

  refillAll(percent = 0.5) {
    this.weapons.forEach((weapon) => {
      if (!weapon.infinite) {
        weapon.ammo = Math.min(weapon.maxAmmo, weapon.ammo + Math.floor(weapon.maxAmmo * percent));
      }
    });
  }

  hasAmmo() {
    return this.currentWeapon.infinite || this.currentWeapon.ammo > 0;
  }

  getAmmoDisplay() {
    const weapon = this.currentWeapon;
    if (weapon.infinite) {
      return '∞';
    }
    return `${weapon.ammo}/${weapon.maxAmmo}`;
  }
}

// Export
window.WeaponTypes = WeaponTypes;
window.WeaponManager = WeaponManager;
