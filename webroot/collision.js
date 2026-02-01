// Collision detection utilities
class CollisionManager {
  // Basic AABB (Axis-Aligned Bounding Box) collision
  static checkAABB(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // Circle collision
  static checkCircle(a, b) {
    const dx = (a.x + a.radius) - (b.x + b.radius);
    const dy = (a.y + a.radius) - (b.y + b.radius);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < a.radius + b.radius;
  }

  // Point in rectangle
  static pointInRect(px, py, rect) {
    return (
      px >= rect.x &&
      px <= rect.x + rect.width &&
      py >= rect.y &&
      py <= rect.y + rect.height
    );
  }

  // Point in circle
  static pointInCircle(px, py, circle) {
    const dx = px - (circle.x + circle.radius);
    const dy = py - (circle.y + circle.radius);
    return Math.sqrt(dx * dx + dy * dy) <= circle.radius;
  }

  // Line segment intersection
  static lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) return null; // Lines are parallel

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1),
      };
    }
    return null;
  }

  // Ray cast for bullet hit detection
  static rayCast(startX, startY, endX, endY, objects) {
    let closestHit = null;
    let closestDist = Infinity;

    objects.forEach((obj) => {
      // Check all 4 edges of the rectangle
      const edges = [
        [obj.x, obj.y, obj.x + obj.width, obj.y], // Top
        [obj.x, obj.y + obj.height, obj.x + obj.width, obj.y + obj.height], // Bottom
        [obj.x, obj.y, obj.x, obj.y + obj.height], // Left
        [obj.x + obj.width, obj.y, obj.x + obj.width, obj.y + obj.height], // Right
      ];

      edges.forEach((edge) => {
        const hit = CollisionManager.lineIntersect(
          startX, startY, endX, endY,
          edge[0], edge[1], edge[2], edge[3]
        );

        if (hit) {
          const dist = Math.sqrt(
            (hit.x - startX) ** 2 + (hit.y - startY) ** 2
          );
          if (dist < closestDist) {
            closestDist = dist;
            closestHit = { ...hit, object: obj };
          }
        }
      });
    });

    return closestHit;
  }

  // Get distance between two points
  static distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  // Get distance between two objects (center to center)
  static objectDistance(a, b) {
    const ax = a.x + (a.width || 0) / 2;
    const ay = a.y + (a.height || 0) / 2;
    const bx = b.x + (b.width || 0) / 2;
    const by = b.y + (b.height || 0) / 2;
    return CollisionManager.distance(ax, ay, bx, by);
  }

  // Check if object A is within range of object B
  static inRange(a, b, range) {
    return CollisionManager.objectDistance(a, b) <= range;
  }

  // Separate two overlapping objects (push apart)
  static separate(a, b) {
    const overlapX = (a.width + b.width) / 2 - Math.abs((a.x + a.width / 2) - (b.x + b.width / 2));
    const overlapY = (a.height + b.height) / 2 - Math.abs((a.y + a.height / 2) - (b.y + b.height / 2));

    if (overlapX < overlapY) {
      // Push horizontally
      if (a.x < b.x) {
        a.x -= overlapX / 2;
        b.x += overlapX / 2;
      } else {
        a.x += overlapX / 2;
        b.x -= overlapX / 2;
      }
    } else {
      // Push vertically
      if (a.y < b.y) {
        a.y -= overlapY / 2;
        b.y += overlapY / 2;
      } else {
        a.y += overlapY / 2;
        b.y -= overlapY / 2;
      }
    }
  }

  // Check collision with ground
  static checkGround(obj, groundY) {
    if (obj.y + obj.height > groundY) {
      obj.y = groundY - obj.height;
      obj.vy = 0;
      return true;
    }
    return false;
  }

  // Check if object is within bounds
  static inBounds(obj, minX, maxX, minY, maxY) {
    return (
      obj.x >= minX &&
      obj.x + obj.width <= maxX &&
      obj.y >= minY &&
      obj.y + obj.height <= maxY
    );
  }

  // Clamp object to bounds
  static clampToBounds(obj, minX, maxX, minY, maxY) {
    obj.x = Math.max(minX, Math.min(maxX - obj.width, obj.x));
    obj.y = Math.max(minY, Math.min(maxY - obj.height, obj.y));
  }
}

// Quadtree for efficient spatial partitioning (useful for many objects)
class Quadtree {
  constructor(bounds, maxObjects = 10, maxLevels = 5, level = 0) {
    this.bounds = bounds;
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.level = level;
    this.objects = [];
    this.nodes = [];
  }

  clear() {
    this.objects = [];
    this.nodes.forEach((node) => node.clear());
    this.nodes = [];
  }

  split() {
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

    this.nodes[0] = new Quadtree(
      { x: x + subWidth, y: y, width: subWidth, height: subHeight },
      this.maxObjects, this.maxLevels, this.level + 1
    );
    this.nodes[1] = new Quadtree(
      { x: x, y: y, width: subWidth, height: subHeight },
      this.maxObjects, this.maxLevels, this.level + 1
    );
    this.nodes[2] = new Quadtree(
      { x: x, y: y + subHeight, width: subWidth, height: subHeight },
      this.maxObjects, this.maxLevels, this.level + 1
    );
    this.nodes[3] = new Quadtree(
      { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
      this.maxObjects, this.maxLevels, this.level + 1
    );
  }

  getIndex(obj) {
    const midX = this.bounds.x + this.bounds.width / 2;
    const midY = this.bounds.y + this.bounds.height / 2;

    const top = obj.y < midY && obj.y + obj.height < midY;
    const bottom = obj.y > midY;

    if (obj.x < midX && obj.x + obj.width < midX) {
      if (top) return 1;
      if (bottom) return 2;
    } else if (obj.x > midX) {
      if (top) return 0;
      if (bottom) return 3;
    }

    return -1;
  }

  insert(obj) {
    if (this.nodes.length > 0) {
      const index = this.getIndex(obj);
      if (index !== -1) {
        this.nodes[index].insert(obj);
        return;
      }
    }

    this.objects.push(obj);

    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      if (this.nodes.length === 0) {
        this.split();
      }

      let i = 0;
      while (i < this.objects.length) {
        const index = this.getIndex(this.objects[i]);
        if (index !== -1) {
          this.nodes[index].insert(this.objects.splice(i, 1)[0]);
        } else {
          i++;
        }
      }
    }
  }

  retrieve(obj) {
    const index = this.getIndex(obj);
    let result = [...this.objects];

    if (this.nodes.length > 0) {
      if (index !== -1) {
        result = result.concat(this.nodes[index].retrieve(obj));
      } else {
        this.nodes.forEach((node) => {
          result = result.concat(node.retrieve(obj));
        });
      }
    }

    return result;
  }
}

// Export
window.CollisionManager = CollisionManager;
window.Quadtree = Quadtree;
