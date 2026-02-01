// Advanced rendering utilities
class Renderer {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  clear(color = '#1a1a2e') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Draw a rectangle with optional gradient
  drawRect(x, y, width, height, color, gradient = null) {
    if (gradient) {
      const grad = this.ctx.createLinearGradient(x, y, x, y + height);
      gradient.forEach((stop, i) => {
        grad.addColorStop(i / (gradient.length - 1), stop);
      });
      this.ctx.fillStyle = grad;
    } else {
      this.ctx.fillStyle = color;
    }
    this.ctx.fillRect(x, y, width, height);
  }

  // Draw text with shadow
  drawText(text, x, y, options = {}) {
    const {
      font = '16px Arial',
      color = '#fff',
      align = 'left',
      shadow = false,
      shadowColor = 'rgba(0,0,0,0.5)',
      shadowOffset = 2,
    } = options;

    this.ctx.font = font;
    this.ctx.textAlign = align;

    if (shadow) {
      this.ctx.fillStyle = shadowColor;
      this.ctx.fillText(text, x + shadowOffset, y + shadowOffset);
    }

    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    this.ctx.textAlign = 'left';
  }

  // Draw a progress bar
  drawProgressBar(x, y, width, height, value, maxValue, options = {}) {
    const {
      bgColor = '#333',
      fillColor = '#ff4444',
      borderColor = '#fff',
      showText = false,
      textColor = '#fff',
    } = options;

    const percent = Math.max(0, Math.min(1, value / maxValue));

    // Background
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(x, y, width, height);

    // Fill
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(x + 2, y + 2, (width - 4) * percent, height - 4);

    // Border
    this.ctx.strokeStyle = borderColor;
    this.ctx.strokeRect(x, y, width, height);

    // Text
    if (showText) {
      this.ctx.fillStyle = textColor;
      this.ctx.font = `${height - 4}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${Math.floor(value)}/${maxValue}`, x + width / 2, y + height - 3);
      this.ctx.textAlign = 'left';
    }
  }

  // Draw glowing effect
  drawGlow(x, y, radius, color) {
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = radius;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius / 4, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  // Draw a sprite (image)
  drawSprite(img, sx, sy, sw, sh, dx, dy, dw, dh, flipX = false) {
    this.ctx.save();

    if (flipX) {
      this.ctx.translate(dx + dw / 2, 0);
      this.ctx.scale(-1, 1);
      this.ctx.translate(-(dx + dw / 2), 0);
    }

    this.ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    this.ctx.restore();
  }

  // Draw particle effect
  drawParticle(x, y, size, color, alpha = 1) {
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
    this.ctx.globalAlpha = 1;
  }

  // Draw circle
  drawCircle(x, y, radius, color, fill = true) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (fill) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  // Draw line
  drawLine(x1, y1, x2, y2, color, width = 1) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.lineWidth = 1;
  }

  // Draw vignette effect (darkens edges)
  drawVignette(intensity = 0.3) {
    const gradient = this.ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      this.height / 3,
      this.width / 2,
      this.height / 2,
      this.height
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Draw blood splatter effect
  drawBloodSplatter(x, y, size = 30) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * size;
      const spotSize = Math.random() * 8 + 2;

      this.ctx.fillStyle = `rgba(${100 + Math.random() * 50}, 0, 0, ${0.3 + Math.random() * 0.4})`;
      this.ctx.beginPath();
      this.ctx.arc(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance,
        spotSize,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
  }

  // Draw muzzle flash
  drawMuzzleFlash(x, y, size = 20, direction = 1) {
    this.ctx.save();
    this.ctx.translate(x, y);
    if (direction < 0) this.ctx.scale(-1, 1);

    // Inner bright flash
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(size, -size / 4);
    this.ctx.lineTo(size * 1.2, 0);
    this.ctx.lineTo(size, size / 4);
    this.ctx.closePath();
    this.ctx.fill();

    // Outer glow
    this.ctx.fillStyle = 'rgba(255, 200, 0, 0.5)';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  // Fade in/out overlay
  drawFade(alpha, color = '#000') {
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalAlpha = 1;
  }

  // Draw scanlines effect (retro look)
  drawScanlines(intensity = 0.05) {
    this.ctx.fillStyle = `rgba(0, 0, 0, ${intensity})`;
    for (let y = 0; y < this.height; y += 4) {
      this.ctx.fillRect(0, y, this.width, 2);
    }
  }
}

// Background layers for parallax scrolling
class ParallaxBackground {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.layers = [];
  }

  addLayer(config) {
    this.layers.push({
      color: config.color || '#222',
      speed: config.speed || 0.5,
      objects: config.objects || [],
      yOffset: config.yOffset || 0,
    });
  }

  render(cameraX) {
    this.layers.forEach((layer) => {
      const offsetX = cameraX * layer.speed;

      layer.objects.forEach((obj) => {
        let x = obj.x - offsetX;

        // Wrap around for infinite scrolling
        while (x + obj.width < 0) x += this.width * 2;
        while (x > this.width) x -= this.width * 2;

        this.ctx.fillStyle = layer.color;
        this.ctx.fillRect(x, obj.y + layer.yOffset, obj.width, obj.height);
      });
    });
  }

  generateCityscape(layerIndex, buildingCount = 10) {
    const buildings = [];
    let x = 0;

    for (let i = 0; i < buildingCount; i++) {
      const width = 80 + Math.random() * 120;
      const height = 100 + Math.random() * 200;
      const gap = 20 + Math.random() * 40;

      buildings.push({
        x: x,
        y: this.height - 100 - height,
        width: width,
        height: height,
      });

      x += width + gap;
    }

    if (this.layers[layerIndex]) {
      this.layers[layerIndex].objects = buildings;
    }
  }
}

// Export
window.Renderer = Renderer;
window.ParallaxBackground = ParallaxBackground;
