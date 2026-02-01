// Sprite and Asset Management System
class SpriteManager {
  constructor() {
    this.sprites = {};
    this.loaded = false;
    this.loadPromises = [];
  }

  // Create sprites using off-screen canvas for better quality
  async init() {
    // Generate all sprite sheets
    this.sprites.player = this.createPlayerSprites();
    this.sprites.zombies = this.createZombieSprites();
    this.sprites.weapons = this.createWeaponSprites();
    this.sprites.effects = this.createEffectSprites();
    this.sprites.powerups = this.createPowerupSprites();
    this.sprites.backgrounds = await this.createBackgroundSprites();
    this.sprites.ui = this.createUISprites();

    this.loaded = true;
    console.log('All sprites loaded');
  }

  createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  // HIGH-QUALITY PLAYER SPRITES
  createPlayerSprites() {
    const sprites = {};
    const frames = ['idle1', 'idle2', 'walk1', 'walk2', 'walk3', 'walk4', 'jump', 'shoot'];

    frames.forEach(frame => {
      const canvas = this.createCanvas(80, 100);
      const ctx = canvas.getContext('2d');
      this.drawPlayerFrame(ctx, frame, 40, 50);
      sprites[frame] = canvas;
    });

    return sprites;
  }

  drawPlayerFrame(ctx, frame, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);

    const isWalking = frame.startsWith('walk');
    const walkPhase = isWalking ? parseInt(frame.slice(-1)) : 0;
    const legOffset = isWalking ? Math.sin(walkPhase * Math.PI / 2) * 8 : 0;
    const isJumping = frame === 'jump';
    const isShooting = frame === 'shoot';

    // SHADOW
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 45, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // LEGS with 3D shading
    const legGradient = ctx.createLinearGradient(-15, 0, 15, 0);
    legGradient.addColorStop(0, '#1a2a1a');
    legGradient.addColorStop(0.5, '#2d3d2d');
    legGradient.addColorStop(1, '#1a2a1a');
    ctx.fillStyle = legGradient;

    // Left leg
    ctx.beginPath();
    ctx.roundRect(-12, 15, 10, 28 + legOffset, 3);
    ctx.fill();

    // Right leg
    ctx.beginPath();
    ctx.roundRect(2, 15, 10, 28 - legOffset, 3);
    ctx.fill();

    // BOOTS with shine
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.roundRect(-14, 40 + legOffset, 14, 8, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(0, 40 - legOffset, 14, 8, 2);
    ctx.fill();

    // Boot shine
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(-12, 41 + legOffset, 10, 2);
    ctx.fillRect(2, 41 - legOffset, 10, 2);

    // BODY - Tactical vest with 3D effect
    const bodyGradient = ctx.createLinearGradient(-18, -25, 18, -25);
    bodyGradient.addColorStop(0, '#2a3a2a');
    bodyGradient.addColorStop(0.3, '#4a5a4a');
    bodyGradient.addColorStop(0.7, '#4a5a4a');
    bodyGradient.addColorStop(1, '#2a3a2a');
    ctx.fillStyle = bodyGradient;

    ctx.beginPath();
    ctx.moveTo(-15, -20);
    ctx.lineTo(15, -20);
    ctx.lineTo(12, 18);
    ctx.lineTo(-12, 18);
    ctx.closePath();
    ctx.fill();

    // Vest highlights
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-12, -18);
    ctx.lineTo(-12, 15);
    ctx.stroke();

    // Vest pouches with 3D
    const pouchGradient = ctx.createLinearGradient(0, 0, 0, 12);
    pouchGradient.addColorStop(0, '#5a6a5a');
    pouchGradient.addColorStop(1, '#3a4a3a');
    ctx.fillStyle = pouchGradient;
    ctx.beginPath();
    ctx.roundRect(-11, -5, 8, 12, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(3, -5, 8, 12, 2);
    ctx.fill();

    // Pouch flaps
    ctx.fillStyle = '#4a5a4a';
    ctx.fillRect(-11, -5, 8, 3);
    ctx.fillRect(3, -5, 8, 3);

    // Straps
    ctx.fillStyle = '#3a4a3a';
    ctx.fillRect(-8, -20, 4, 35);
    ctx.fillRect(4, -20, 4, 35);

    // Belt with buckle
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-13, 12, 26, 5);

    // Belt buckle (metallic)
    const buckleGradient = ctx.createLinearGradient(-4, 12, 4, 17);
    buckleGradient.addColorStop(0, '#d4a444');
    buckleGradient.addColorStop(0.5, '#ffd700');
    buckleGradient.addColorStop(1, '#b8860b');
    ctx.fillStyle = buckleGradient;
    ctx.fillRect(-4, 12, 8, 5);

    // ARMS with 3D shading
    const armGradient = ctx.createLinearGradient(0, 0, 10, 0);
    armGradient.addColorStop(0, '#3a5a3a');
    armGradient.addColorStop(1, '#4a6a4a');
    ctx.fillStyle = armGradient;

    // Left arm
    ctx.beginPath();
    ctx.roundRect(-22, -15, 10, 28, 3);
    ctx.fill();

    // Left hand (skin tone with gradient)
    const skinGradient = ctx.createRadialGradient(-17, 15, 0, -17, 15, 8);
    skinGradient.addColorStop(0, '#e8c4a0');
    skinGradient.addColorStop(1, '#c4a080');
    ctx.fillStyle = skinGradient;
    ctx.beginPath();
    ctx.ellipse(-17, 16, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right arm (holding weapon)
    ctx.fillStyle = armGradient;
    ctx.beginPath();
    ctx.roundRect(12, -15, 10, 20, 3);
    ctx.fill();

    // Forearm extended
    ctx.beginPath();
    ctx.roundRect(18, -10, 18, 8, 2);
    ctx.fill();

    // Right hand
    ctx.fillStyle = skinGradient;
    ctx.beginPath();
    ctx.ellipse(35, -6, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // WEAPON (Assault Rifle)
    this.drawWeaponOnPlayer(ctx, isShooting);

    // HEAD with helmet
    // Helmet base
    const helmetGradient = ctx.createRadialGradient(0, -32, 5, 0, -32, 18);
    helmetGradient.addColorStop(0, '#5a6a5a');
    helmetGradient.addColorStop(1, '#2a3a2a');
    ctx.fillStyle = helmetGradient;
    ctx.beginPath();
    ctx.ellipse(0, -32, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Helmet rim
    ctx.fillStyle = '#1a2a1a';
    ctx.beginPath();
    ctx.ellipse(0, -25, 18, 5, 0, 0, Math.PI);
    ctx.fill();

    // Night vision mount
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-3, -45, 6, 8);

    // Face area
    ctx.fillStyle = skinGradient;
    ctx.beginPath();
    ctx.ellipse(0, -24, 11, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tactical goggles with glow
    const goggleGradient = ctx.createLinearGradient(-12, -28, 12, -28);
    goggleGradient.addColorStop(0, '#0a2a4a');
    goggleGradient.addColorStop(0.5, '#1a4a7a');
    goggleGradient.addColorStop(1, '#0a2a4a');
    ctx.fillStyle = goggleGradient;
    ctx.beginPath();
    ctx.roundRect(-12, -30, 24, 8, 3);
    ctx.fill();

    // Goggle glow effect
    ctx.shadowColor = '#00aaff';
    ctx.shadowBlur = 8;
    ctx.fillStyle = 'rgba(0, 170, 255, 0.3)';
    ctx.beginPath();
    ctx.roundRect(-10, -29, 20, 6, 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Goggle shine
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.roundRect(-9, -29, 8, 2, 1);
    ctx.fill();

    // Balaclava/mask
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.roundRect(-9, -20, 18, 8, 2);
    ctx.fill();

    // Muzzle flash if shooting
    if (isShooting) {
      this.drawMuzzleFlash(ctx, 55, -8);
    }

    ctx.restore();
  }

  drawWeaponOnPlayer(ctx, isShooting) {
    // Rifle body
    const gunGradient = ctx.createLinearGradient(25, -15, 25, -5);
    gunGradient.addColorStop(0, '#3a3a3a');
    gunGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gunGradient;

    // Main body
    ctx.beginPath();
    ctx.roundRect(25, -12, 35, 10, 2);
    ctx.fill();

    // Stock
    ctx.fillStyle = '#4a3020';
    ctx.beginPath();
    ctx.roundRect(18, -10, 10, 6, 2);
    ctx.fill();

    // Barrel
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(58, -9, 15, 5);

    // Scope
    const scopeGradient = ctx.createLinearGradient(35, -20, 35, -14);
    scopeGradient.addColorStop(0, '#2a2a4a');
    scopeGradient.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = scopeGradient;
    ctx.beginPath();
    ctx.roundRect(35, -18, 15, 5, 2);
    ctx.fill();

    // Scope lens glow
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(48, -15, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Magazine
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.roundRect(32, -2, 8, 14, 2);
    ctx.fill();

    // Foregrip
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.roundRect(50, -2, 5, 8, 1);
    ctx.fill();
  }

  drawMuzzleFlash(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Outer glow
    ctx.fillStyle = 'rgba(255, 200, 0, 0.5)';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(10, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    // Inner flash
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(25, -8);
    ctx.lineTo(20, 0);
    ctx.lineTo(30, 3);
    ctx.lineTo(20, 3);
    ctx.lineTo(25, 10);
    ctx.lineTo(0, 3);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // HIGH-QUALITY ZOMBIE SPRITES
  createZombieSprites() {
    const types = ['walker', 'runner', 'brute', 'spitter', 'exploder', 'boss'];
    const sprites = {};

    types.forEach(type => {
      sprites[type] = {};
      const frames = ['walk1', 'walk2', 'walk3', 'walk4', 'attack', 'death'];

      frames.forEach(frame => {
        const size = type === 'boss' ? { w: 150, h: 180 } :
                     type === 'brute' ? { w: 100, h: 130 } : { w: 70, h: 90 };
        const canvas = this.createCanvas(size.w, size.h);
        const ctx = canvas.getContext('2d');
        this.drawZombieFrame(ctx, type, frame, size.w / 2, size.h / 2);
        sprites[type][frame] = canvas;
      });
    });

    return sprites;
  }

  drawZombieFrame(ctx, type, frame, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);

    const isWalking = frame.startsWith('walk');
    const walkPhase = isWalking ? parseInt(frame.slice(-1)) : 0;
    const animOffset = Math.sin(walkPhase * Math.PI / 2) * 6;
    const isDeath = frame === 'death';

    if (isDeath) {
      ctx.globalAlpha = 0.7;
      ctx.rotate(Math.PI / 6);
    }

    switch(type) {
      case 'walker':
        this.drawWalkerZombie(ctx, animOffset, isDeath);
        break;
      case 'runner':
        this.drawRunnerZombie(ctx, animOffset, isDeath);
        break;
      case 'brute':
        this.drawBruteZombie(ctx, animOffset, isDeath);
        break;
      case 'spitter':
        this.drawSpitterZombie(ctx, animOffset, isDeath);
        break;
      case 'exploder':
        this.drawExploderZombie(ctx, animOffset, isDeath);
        break;
      case 'boss':
        this.drawBossZombie(ctx, animOffset, isDeath);
        break;
    }

    ctx.restore();
  }

  drawWalkerZombie(ctx, animOffset, isDeath) {
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 38, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotting skin colors
    const skinBase = '#6a8a5a';
    const skinDark = '#4a6a3a';
    const skinRot = '#3a4a2a';
    const fleshRed = '#8a4a4a';

    // LEGS - torn pants
    const pantsGradient = ctx.createLinearGradient(-12, 10, 12, 10);
    pantsGradient.addColorStop(0, '#2a3a2a');
    pantsGradient.addColorStop(0.5, '#3a4a3a');
    pantsGradient.addColorStop(1, '#2a3a2a');
    ctx.fillStyle = pantsGradient;

    ctx.beginPath();
    ctx.roundRect(-12, 12, 10, 25 + animOffset, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(2, 12, 10, 25 - animOffset, 2);
    ctx.fill();

    // Exposed leg flesh
    ctx.fillStyle = skinBase;
    ctx.fillRect(-10, 32 + animOffset, 6, 8);
    ctx.fillRect(4, 32 - animOffset, 6, 8);

    // BODY - torn shirt showing ribs
    const bodyGradient = ctx.createLinearGradient(-15, -20, 15, -20);
    bodyGradient.addColorStop(0, '#3a4a3a');
    bodyGradient.addColorStop(0.5, '#4a5a4a');
    bodyGradient.addColorStop(1, '#3a4a3a');
    ctx.fillStyle = bodyGradient;

    ctx.beginPath();
    ctx.moveTo(-14, -18);
    ctx.lineTo(14, -18);
    ctx.lineTo(10, 15);
    ctx.lineTo(-10, 15);
    ctx.closePath();
    ctx.fill();

    // Exposed chest wound
    ctx.fillStyle = fleshRed;
    ctx.beginPath();
    ctx.ellipse(3, -5, 8, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Visible ribs
    ctx.fillStyle = '#d4c4a4';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(3, -10 + i * 5, 6, 1.5, 0.1, 0, Math.PI);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // ARMS - reaching zombie pose
    ctx.fillStyle = skinBase;

    // Right arm extended
    ctx.beginPath();
    ctx.moveTo(14, -15);
    ctx.quadraticCurveTo(35, -10, 38 + animOffset, -5);
    ctx.lineTo(38 + animOffset, 2);
    ctx.quadraticCurveTo(30, 0, 14, -8);
    ctx.closePath();
    ctx.fill();

    // Rotting patch on arm
    ctx.fillStyle = skinRot;
    ctx.beginPath();
    ctx.ellipse(25, -8, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hand with bent fingers
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.roundRect(36 + animOffset, -8, 8, 12, 3);
    ctx.fill();

    // Claw-like fingers
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(44 + animOffset, -6 + i * 3);
      ctx.lineTo(50 + animOffset, -5 + i * 3 + (i % 2) * 2);
      ctx.lineTo(44 + animOffset, -4 + i * 3);
      ctx.fill();
    }

    // Left arm (lower)
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.moveTo(-14, -12);
    ctx.quadraticCurveTo(-25, -5, -28, 5 - animOffset);
    ctx.lineTo(-22, 8 - animOffset);
    ctx.quadraticCurveTo(-18, 0, -14, -5);
    ctx.closePath();
    ctx.fill();

    // HEAD
    const headGradient = ctx.createRadialGradient(0, -30, 5, 0, -30, 15);
    headGradient.addColorStop(0, skinBase);
    headGradient.addColorStop(1, skinDark);
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(0, -30, 13, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotting patches on face
    ctx.fillStyle = skinRot;
    ctx.beginPath();
    ctx.ellipse(8, -35, 5, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-6, -25, 4, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Sunken eye sockets
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(-5, -32, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, -32, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing red eyes
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-5, -32, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -32, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Mouth - open with teeth
    ctx.fillStyle = '#2a1a1a';
    ctx.beginPath();
    ctx.ellipse(0, -22, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Teeth
    ctx.fillStyle = '#c4c4a4';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(-6 + i * 3, -24, 2, 4);
    }

    // Blood drip
    ctx.fillStyle = '#8a0000';
    ctx.beginPath();
    ctx.moveTo(-2, -19);
    ctx.quadraticCurveTo(-3, -12, -1, -8);
    ctx.quadraticCurveTo(0, -12, -2, -19);
    ctx.fill();
  }

  drawRunnerZombie(ctx, animOffset, isDeath) {
    // Fast zombie - leaner, more aggressive pose
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 35, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const skinBase = '#7a5a5a';
    const skinDark = '#5a3a3a';

    // Legs in running pose
    ctx.fillStyle = '#3a2a2a';
    ctx.save();
    ctx.translate(-8, 15);
    ctx.rotate(animOffset * 0.08);
    ctx.fillRect(-4, 0, 8, 22);
    ctx.restore();

    ctx.save();
    ctx.translate(8, 15);
    ctx.rotate(-animOffset * 0.08);
    ctx.fillRect(-4, 0, 8, 22);
    ctx.restore();

    // Emaciated body
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.moveTo(-10, -15);
    ctx.lineTo(10, -15);
    ctx.lineTo(8, 18);
    ctx.lineTo(-8, 18);
    ctx.closePath();
    ctx.fill();

    // Visible spine
    ctx.fillStyle = '#c4b494';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(0, -10 + i * 5, 3, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Arms reaching forward frantically
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.moveTo(10, -12);
    ctx.quadraticCurveTo(30, -15, 35 + animOffset * 1.5, -10);
    ctx.lineTo(35 + animOffset * 1.5, -3);
    ctx.quadraticCurveTo(25, -5, 10, -5);
    ctx.closePath();
    ctx.fill();

    // Head - gaunt
    const headGradient = ctx.createRadialGradient(0, -28, 3, 0, -28, 12);
    headGradient.addColorStop(0, skinBase);
    headGradient.addColorStop(1, skinDark);
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(0, -28, 11, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sunken cheeks
    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.ellipse(-8, -25, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -25, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wild eyes
    ctx.fillStyle = '#ff3300';
    ctx.shadowColor = '#ff3300';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-4, -30, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -30, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Screaming mouth
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.ellipse(0, -20, 6, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBruteZombie(ctx, animOffset, isDeath) {
    // Massive tank zombie
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 55, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const skinBase = '#5a6a4a';
    const skinDark = '#3a4a2a';

    // Huge legs
    ctx.fillStyle = '#2a2a1a';
    ctx.beginPath();
    ctx.roundRect(-22, 20, 18, 40 + animOffset, 4);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(4, 20, 18, 40 - animOffset, 4);
    ctx.fill();

    // Massive body
    const bodyGrad = ctx.createLinearGradient(-30, -30, 30, -30);
    bodyGrad.addColorStop(0, skinDark);
    bodyGrad.addColorStop(0.5, skinBase);
    bodyGrad.addColorStop(1, skinDark);
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(-28, -25);
    ctx.lineTo(28, -25);
    ctx.lineTo(22, 25);
    ctx.lineTo(-22, 25);
    ctx.closePath();
    ctx.fill();

    // Armor plates
    ctx.fillStyle = '#4a4a3a';
    ctx.beginPath();
    ctx.roundRect(-20, -15, 40, 30, 5);
    ctx.fill();

    // Metal rivets
    ctx.fillStyle = '#6a6a5a';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(-15 + i * 10, -10, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Huge arms
    ctx.fillStyle = skinBase;
    // Right arm
    ctx.beginPath();
    ctx.moveTo(28, -20);
    ctx.quadraticCurveTo(50, -10, 48, 20 + animOffset);
    ctx.lineTo(38, 25 + animOffset);
    ctx.quadraticCurveTo(35, 0, 28, -10);
    ctx.closePath();
    ctx.fill();

    // Huge fist
    ctx.beginPath();
    ctx.arc(43, 28 + animOffset, 12, 0, Math.PI * 2);
    ctx.fill();

    // Left arm
    ctx.beginPath();
    ctx.moveTo(-28, -20);
    ctx.quadraticCurveTo(-50, -10, -48, 20 - animOffset);
    ctx.lineTo(-38, 25 - animOffset);
    ctx.quadraticCurveTo(-35, 0, -28, -10);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-43, 28 - animOffset, 12, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headGrad = ctx.createRadialGradient(0, -38, 5, 0, -38, 18);
    headGrad.addColorStop(0, skinBase);
    headGrad.addColorStop(1, skinDark);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, -38, 16, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Angry brow
    ctx.fillStyle = skinDark;
    ctx.fillRect(-14, -48, 28, 8);

    // Small angry eyes
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(-6, -40, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(6, -40, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Grimace with tusks
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-10, -30, 20, 8);

    ctx.fillStyle = '#d4d4a4';
    ctx.beginPath();
    ctx.moveTo(-8, -30);
    ctx.lineTo(-6, -22);
    ctx.lineTo(-4, -30);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, -30);
    ctx.lineTo(6, -22);
    ctx.lineTo(4, -30);
    ctx.fill();
  }

  drawSpitterZombie(ctx, animOffset, isDeath) {
    // Acid spitting zombie
    ctx.fillStyle = 'rgba(0, 50, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 38, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const skinBase = '#4a7a3a';
    const acidGreen = '#00ff00';

    // Legs
    ctx.fillStyle = '#2a4a2a';
    ctx.beginPath();
    ctx.roundRect(-10, 12, 8, 25 + animOffset, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(2, 12, 8, 25 - animOffset, 2);
    ctx.fill();

    // Bloated body
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Acid sac (glowing belly)
    const acidGrad = ctx.createRadialGradient(0, 5, 0, 0, 5, 15);
    acidGrad.addColorStop(0, 'rgba(100, 255, 100, 0.8)');
    acidGrad.addColorStop(0.5, 'rgba(0, 255, 0, 0.4)');
    acidGrad.addColorStop(1, 'rgba(0, 200, 0, 0)');
    ctx.fillStyle = acidGrad;
    ctx.shadowColor = acidGreen;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(0, 5, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Arms
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.roundRect(14, -10, 8, 20, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-22, -10, 8, 20, 3);
    ctx.fill();

    // Head with pustules
    const headGrad = ctx.createRadialGradient(0, -28, 3, 0, -28, 14);
    headGrad.addColorStop(0, skinBase);
    headGrad.addColorStop(1, '#3a5a2a');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, -28, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Acid pustules
    ctx.fillStyle = '#88ff88';
    ctx.shadowColor = acidGreen;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(-7, -35, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8, -30, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, -38, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Green glowing eyes
    ctx.fillStyle = acidGreen;
    ctx.shadowColor = acidGreen;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-4, -30, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -30, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Drooling acid
    ctx.fillStyle = acidGreen;
    ctx.shadowColor = acidGreen;
    ctx.shadowBlur = 5;
    const droolLen = 8 + Math.sin(animOffset) * 4;
    ctx.beginPath();
    ctx.moveTo(-2, -18);
    ctx.quadraticCurveTo(-3, -18 + droolLen / 2, -1, -18 + droolLen);
    ctx.quadraticCurveTo(1, -18 + droolLen / 2, -2, -18);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawExploderZombie(ctx, animOffset, isDeath) {
    const pulseOffset = Math.sin(Date.now() / 100) * 3;

    // Pulsing shadow
    ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 35, 15 + pulseOffset, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const skinBase = '#8a5a3a';

    // Stubby legs
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.roundRect(-10, 15, 8, 20 + animOffset, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(2, 15, 8, 20 - animOffset, 2);
    ctx.fill();

    // Bloated explosive body
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18 + pulseOffset, 22 + pulseOffset, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing core
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
    coreGrad.addColorStop(0, 'rgba(255, 200, 0, 0.9)');
    coreGrad.addColorStop(0.4, 'rgba(255, 100, 0, 0.6)');
    coreGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 25 + pulseOffset * 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14 + pulseOffset, 16 + pulseOffset, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glowing veins
    ctx.strokeStyle = '#ff8800';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff8800';
    ctx.shadowBlur = 5;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(angle) * (15 + pulseOffset),
        Math.sin(angle) * (18 + pulseOffset)
      );
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Small arms
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.roundRect(16, -8, 8, 12, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-24, -8, 8, 12, 3);
    ctx.fill();

    // Small head
    ctx.fillStyle = skinBase;
    ctx.beginPath();
    ctx.ellipse(0, -28, 10, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crazed eyes
    ctx.fillStyle = '#ff4400';
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-4, -30, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -30, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Warning symbol
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚠', 0, 5);
  }

  drawBossZombie(ctx, animOffset, isDeath) {
    // Massive undead king
    ctx.fillStyle = 'rgba(50, 0, 50, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 75, 40, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    const skinBase = '#5a3a5a';
    const skinDark = '#3a1a3a';

    // Massive legs
    ctx.fillStyle = '#1a0a1a';
    ctx.beginPath();
    ctx.roundRect(-30, 30, 22, 50 + animOffset, 5);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(8, 30, 22, 50 - animOffset, 5);
    ctx.fill();

    // Huge body
    const bodyGrad = ctx.createLinearGradient(-40, -40, 40, -40);
    bodyGrad.addColorStop(0, skinDark);
    bodyGrad.addColorStop(0.5, skinBase);
    bodyGrad.addColorStop(1, skinDark);
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(-38, -35);
    ctx.lineTo(38, -35);
    ctx.lineTo(30, 35);
    ctx.lineTo(-30, 35);
    ctx.closePath();
    ctx.fill();

    // Dark armor
    ctx.fillStyle = '#2a1a2a';
    ctx.beginPath();
    ctx.roundRect(-30, -25, 60, 50, 8);
    ctx.fill();

    // Armor spikes
    ctx.fillStyle = '#4a3a4a';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-20 + i * 15, -25);
      ctx.lineTo(-15 + i * 15, -40);
      ctx.lineTo(-10 + i * 15, -25);
      ctx.fill();
    }

    // Massive arms
    ctx.fillStyle = skinBase;
    // Right arm
    ctx.beginPath();
    ctx.moveTo(38, -30);
    ctx.quadraticCurveTo(65, -15, 60, 30 + animOffset);
    ctx.lineTo(48, 35 + animOffset);
    ctx.quadraticCurveTo(45, 0, 38, -20);
    ctx.closePath();
    ctx.fill();

    // Huge clawed fist
    ctx.beginPath();
    ctx.arc(54, 40 + animOffset, 16, 0, Math.PI * 2);
    ctx.fill();

    // Left arm
    ctx.beginPath();
    ctx.moveTo(-38, -30);
    ctx.quadraticCurveTo(-65, -15, -60, 30 - animOffset);
    ctx.lineTo(-48, 35 - animOffset);
    ctx.quadraticCurveTo(-45, 0, -38, -20);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-54, 40 - animOffset, 16, 0, Math.PI * 2);
    ctx.fill();

    // Massive head
    const headGrad = ctx.createRadialGradient(0, -55, 8, 0, -55, 25);
    headGrad.addColorStop(0, skinBase);
    headGrad.addColorStop(1, skinDark);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0, -55, 22, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = '#6a5a4a';
    // Left horn
    ctx.beginPath();
    ctx.moveTo(-18, -65);
    ctx.quadraticCurveTo(-35, -85, -25, -95);
    ctx.quadraticCurveTo(-20, -80, -15, -60);
    ctx.closePath();
    ctx.fill();
    // Right horn
    ctx.beginPath();
    ctx.moveTo(18, -65);
    ctx.quadraticCurveTo(35, -85, 25, -95);
    ctx.quadraticCurveTo(20, -80, 15, -60);
    ctx.closePath();
    ctx.fill();

    // Crown
    const crownGrad = ctx.createLinearGradient(-15, -75, 15, -75);
    crownGrad.addColorStop(0, '#b8860b');
    crownGrad.addColorStop(0.5, '#ffd700');
    crownGrad.addColorStop(1, '#b8860b');
    ctx.fillStyle = crownGrad;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(-15, -68);
    ctx.lineTo(-12, -80);
    ctx.lineTo(-5, -70);
    ctx.lineTo(0, -85);
    ctx.lineTo(5, -70);
    ctx.lineTo(12, -80);
    ctx.lineTo(15, -68);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glowing purple eyes
    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(-8, -58, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(8, -58, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Fearsome mouth
    ctx.fillStyle = '#0a000a';
    ctx.beginPath();
    ctx.roundRect(-15, -42, 30, 15, 3);
    ctx.fill();

    // Sharp teeth
    ctx.fillStyle = '#d4d4b4';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(-12 + i * 4, -42);
      ctx.lineTo(-10 + i * 4, -32);
      ctx.lineTo(-8 + i * 4, -42);
      ctx.fill();
    }

    // Aura effect
    ctx.strokeStyle = 'rgba(128, 0, 128, 0.4)';
    ctx.lineWidth = 3;
    const auraOffset = Math.sin(Date.now() / 200) * 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 50 + auraOffset, 65 + auraOffset, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  createWeaponSprites() {
    return {}; // Weapons drawn with player
  }

  createEffectSprites() {
    const sprites = {};

    // Muzzle flash
    const flashCanvas = this.createCanvas(60, 40);
    const flashCtx = flashCanvas.getContext('2d');
    this.drawMuzzleFlash(flashCtx, 10, 20);
    sprites.muzzleFlash = flashCanvas;

    // Explosion frames
    for (let i = 0; i < 8; i++) {
      const expCanvas = this.createCanvas(100, 100);
      const expCtx = expCanvas.getContext('2d');
      this.drawExplosionFrame(expCtx, 50, 50, i);
      sprites[`explosion${i}`] = expCanvas;
    }

    return sprites;
  }

  drawExplosionFrame(ctx, cx, cy, frame) {
    const progress = frame / 7;
    const radius = 20 + progress * 30;
    const alpha = 1 - progress;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = alpha;

    // Outer glow
    const outerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    outerGrad.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
    outerGrad.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
    outerGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    if (frame < 4) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  createPowerupSprites() {
    const types = ['health', 'ammo', 'speed', 'damage', 'shield', 'life'];
    const sprites = {};

    types.forEach(type => {
      const canvas = this.createCanvas(40, 40);
      const ctx = canvas.getContext('2d');
      this.drawPowerup(ctx, type, 20, 20);
      sprites[type] = canvas;
    });

    return sprites;
  }

  drawPowerup(ctx, type, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);

    const colors = {
      health: { main: '#ff4444', glow: '#ff0000' },
      ammo: { main: '#ffaa00', glow: '#ff8800' },
      speed: { main: '#44ff44', glow: '#00ff00' },
      damage: { main: '#ff44ff', glow: '#ff00ff' },
      shield: { main: '#4444ff', glow: '#0000ff' },
      life: { main: '#ff88ff', glow: '#ff44ff' }
    };

    const color = colors[type] || colors.health;

    // Glow
    ctx.shadowColor = color.glow;
    ctx.shadowBlur = 15;

    // Outer ring
    ctx.strokeStyle = color.main;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.stroke();

    // Inner fill
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
    grad.addColorStop(0, color.main);
    grad.addColorStop(1, color.glow);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Icon
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const icons = {
      health: '+',
      ammo: '⚡',
      speed: '»',
      damage: '★',
      shield: '◈',
      life: '♥'
    };
    ctx.fillText(icons[type] || '+', 0, 1);

    ctx.restore();
  }

  async createBackgroundSprites() {
    const sprites = {};

    // Create parallax layers for different levels
    const levels = ['city', 'suburbs', 'industrial', 'highway', 'downtown'];

    levels.forEach(level => {
      sprites[level] = {
        far: this.createBackgroundLayer(level, 'far'),
        mid: this.createBackgroundLayer(level, 'mid'),
        near: this.createBackgroundLayer(level, 'near'),
        ground: this.createGroundLayer(level)
      };
    });

    return sprites;
  }

  createBackgroundLayer(level, depth) {
    const canvas = this.createCanvas(1200, 400);
    const ctx = canvas.getContext('2d');

    const colors = {
      city: { sky: '#0a0a1a', buildings: '#1a1a2a', accent: '#2a2a4a' },
      suburbs: { sky: '#1a0a0a', buildings: '#2a1a1a', accent: '#3a2a2a' },
      industrial: { sky: '#0a1a0a', buildings: '#1a2a1a', accent: '#2a3a2a' },
      highway: { sky: '#1a1a0a', buildings: '#2a2a1a', accent: '#3a3a2a' },
      downtown: { sky: '#0a0a2a', buildings: '#1a1a3a', accent: '#2a2a5a' }
    };

    const c = colors[level] || colors.city;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 400);
    skyGrad.addColorStop(0, c.sky);
    skyGrad.addColorStop(1, '#000000');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1200, 400);

    if (depth === 'far') {
      // Distant cityscape silhouette
      this.drawDistantBuildings(ctx, c.buildings, 0.3);
      // Moon/sun
      ctx.fillStyle = 'rgba(255, 200, 150, 0.3)';
      ctx.beginPath();
      ctx.arc(900, 80, 40, 0, Math.PI * 2);
      ctx.fill();
    } else if (depth === 'mid') {
      // Medium distance buildings
      this.drawMediumBuildings(ctx, c.buildings, c.accent);
    } else {
      // Near buildings with more detail
      this.drawNearBuildings(ctx, c.buildings, c.accent);
    }

    return canvas;
  }

  drawDistantBuildings(ctx, color, alpha) {
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;

    for (let x = 0; x < 1200; x += 60 + Math.random() * 40) {
      const height = 50 + Math.random() * 150;
      const width = 40 + Math.random() * 60;
      ctx.fillRect(x, 400 - height, width, height);
    }

    ctx.globalAlpha = 1;
  }

  drawMediumBuildings(ctx, color, accent) {
    for (let x = 0; x < 1200; x += 80 + Math.random() * 60) {
      const height = 100 + Math.random() * 200;
      const width = 60 + Math.random() * 80;

      // Building body
      const grad = ctx.createLinearGradient(x, 0, x + width, 0);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, accent);
      grad.addColorStop(1, color);
      ctx.fillStyle = grad;
      ctx.fillRect(x, 400 - height, width, height);

      // Windows
      ctx.fillStyle = 'rgba(255, 200, 100, 0.2)';
      for (let wy = 400 - height + 20; wy < 380; wy += 25) {
        for (let wx = x + 10; wx < x + width - 15; wx += 20) {
          if (Math.random() > 0.3) {
            ctx.fillRect(wx, wy, 8, 12);
          }
        }
      }
    }
  }

  drawNearBuildings(ctx, color, accent) {
    for (let x = -50; x < 1250; x += 120 + Math.random() * 80) {
      const height = 150 + Math.random() * 200;
      const width = 80 + Math.random() * 100;

      // Building body with gradient
      const grad = ctx.createLinearGradient(x, 0, x + width, 0);
      grad.addColorStop(0, '#0a0a0a');
      grad.addColorStop(0.1, color);
      grad.addColorStop(0.9, color);
      grad.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 400 - height, width, height);

      // Building edge highlight
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 400 - height, width, height);

      // Windows with variety
      for (let wy = 400 - height + 15; wy < 380; wy += 20) {
        for (let wx = x + 8; wx < x + width - 12; wx += 15) {
          const lit = Math.random() > 0.4;
          if (lit) {
            const windowColor = Math.random() > 0.7 ?
              'rgba(255, 200, 100, 0.6)' : 'rgba(100, 150, 255, 0.4)';
            ctx.fillStyle = windowColor;
            ctx.fillRect(wx, wy, 6, 10);
          } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(wx, wy, 6, 10);
          }
        }
      }

      // Rooftop details
      if (Math.random() > 0.5) {
        ctx.fillStyle = accent;
        ctx.fillRect(x + width / 2 - 5, 400 - height - 20, 10, 20);
      }
    }
  }

  createGroundLayer(level) {
    const canvas = this.createCanvas(1200, 150);
    const ctx = canvas.getContext('2d');

    const colors = {
      city: { road: '#2a2a2a', sidewalk: '#3a3a3a', line: '#4a4a2a' },
      suburbs: { road: '#3a3a3a', sidewalk: '#4a4a4a', line: '#5a5a3a' },
      industrial: { road: '#2a2a2a', sidewalk: '#3a3a3a', line: '#4a5a2a' },
      highway: { road: '#3a3a3a', sidewalk: '#4a4a4a', line: '#6a6a3a' },
      downtown: { road: '#2a2a3a', sidewalk: '#3a3a4a', line: '#5a5a4a' }
    };

    const c = colors[level] || colors.city;

    // Sidewalk
    ctx.fillStyle = c.sidewalk;
    ctx.fillRect(0, 0, 1200, 30);

    // Road
    ctx.fillStyle = c.road;
    ctx.fillRect(0, 30, 1200, 120);

    // Road texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 0; i < 50; i++) {
      ctx.fillRect(Math.random() * 1200, 30 + Math.random() * 120, 2 + Math.random() * 3, 1);
    }

    // Center line
    ctx.fillStyle = c.line;
    for (let x = 0; x < 1200; x += 60) {
      ctx.fillRect(x, 85, 40, 4);
    }

    // Curb
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(0, 28, 1200, 4);

    // Debris and details
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(Math.random() * 1200, 30 + Math.random() * 100, 3 + Math.random() * 8, 2);
    }

    return canvas;
  }

  createUISprites() {
    return {}; // UI drawn dynamically
  }

  // Get sprite by name
  getSprite(category, name, frame = 'idle1') {
    if (!this.loaded) return null;

    const cat = this.sprites[category];
    if (!cat) return null;

    if (typeof cat === 'object' && cat[name]) {
      const sprite = cat[name];
      if (sprite[frame]) return sprite[frame];
      return sprite;
    }

    return cat[name] || null;
  }
}

// Global sprite manager
window.SpriteManager = SpriteManager;
window.spriteManager = new SpriteManager();
