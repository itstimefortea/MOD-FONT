/**
 * Throttle function calls using requestAnimationFrame
 * Ensures smooth 60fps performance for mouse movements
 */
export function rafThrottle<T extends (...args: any[]) => any>(callback: T): T & { cancel: () => void } {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = ((...args: Parameters<T>) => {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (lastArgs) {
          callback(...lastArgs);
        }
        rafId = null;
        lastArgs = null;
      });
    }
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    lastArgs = null;
  };

  return throttled;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check if point is inside a shape with better precision
 * Handles different shape types for accurate hit detection
 */
export function isPointInShape(
  x: number,
  y: number,
  shape: {
    x: number;
    y: number;
    width: number;
    height: number;
    type?: string;
    rotation?: number;
    corner?: string | null;
  }
): boolean {
  // First check if point is within bounding box
  if (
    x < shape.x ||
    x > shape.x + shape.width ||
    y < shape.y ||
    y > shape.y + shape.height
  ) {
    return false;
  }

  // For squares, simple bounding box check is sufficient
  if (!shape.type || shape.type === 'SQUARE') {
    return true;
  }

  // For circles, check distance from center
  if (shape.type === 'CIRCLE') {
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;
    const rx = shape.width / 2;
    const ry = shape.height / 2;

    // Ellipse formula: (x-cx)²/rx² + (y-cy)²/ry² <= 1
    const normalizedX = (x - centerX) / rx;
    const normalizedY = (y - centerY) / ry;
    return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
  }

  // For triangles, check if point is inside the triangle
  if (shape.type === 'TRIANGLE') {
    const rotation = shape.rotation || 0;
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;

    // Rotate point back by inverse rotation to check against unrotated triangle
    const cos = Math.cos(-rotation * Math.PI / 180);
    const sin = Math.sin(-rotation * Math.PI / 180);
    const dx = x - centerX;
    const dy = y - centerY;
    const rotatedX = centerX + (dx * cos - dy * sin);
    const rotatedY = centerY + (dx * sin + dy * cos);

    // Triangle vertices (before rotation): top-left, bottom-right, bottom-left
    const x1 = shape.x;
    const y1 = shape.y;
    const x2 = shape.x + shape.width;
    const y2 = shape.y + shape.height;
    const x3 = shape.x;
    const y3 = shape.y + shape.height;

    // Use barycentric coordinates to check if point is inside triangle
    const denominator = ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
    const a = ((y2 - y3) * (rotatedX - x3) + (x3 - x2) * (rotatedY - y3)) / denominator;
    const b = ((y3 - y1) * (rotatedX - x3) + (x1 - x3) * (rotatedY - y3)) / denominator;
    const c = 1 - a - b;

    return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1;
  }

  // For quarter circles, check if point is in the quarter circle region
  if (shape.type === 'QUARTER_CIRCLE') {
    const corner = shape.corner || 'tl';
    const relX = x - shape.x;
    const relY = y - shape.y;

    // Calculate which corner the arc originates from
    let cx: number, cy: number; // Center of the arc circle

    switch (corner) {
      case 'tl':
      case 'TL':
        cx = 0;
        cy = 0;
        break;
      case 'tr':
      case 'TR':
        cx = shape.width;
        cy = 0;
        break;
      case 'bl':
      case 'BL':
        cx = 0;
        cy = shape.height;
        break;
      case 'br':
      case 'BR':
        cx = shape.width;
        cy = shape.height;
        break;
      default:
        cx = 0;
        cy = 0;
    }

    // Check if point is within the quarter circle arc region
    const distX = relX - cx;
    const distY = relY - cy;
    const normalizedDist = Math.sqrt(
      (distX / shape.width) ** 2 + (distY / shape.height) ** 2
    );

    // Point must be within ellipse radius
    if (normalizedDist > 1) {
      return false;
    }

    // Check if point is on the correct side of the quarter circle
    switch (corner) {
      case 'tl':
      case 'TL':
        return relX >= 0 && relY >= 0;
      case 'tr':
      case 'TR':
        return relX <= shape.width && relY >= 0;
      case 'bl':
      case 'BL':
        return relX >= 0 && relY <= shape.height;
      case 'br':
      case 'BR':
        return relX <= shape.width && relY <= shape.height;
      default:
        return true;
    }
  }

  // Default to bounding box check
  return true;
}

/**
 * Get distance from point to shape center
 * Used for better shape selection
 */
export function distanceToShapeCenter(
  x: number,
  y: number,
  shape: { x: number; y: number; width: number; height: number }
): number {
  const centerX = shape.x + shape.width / 2;
  const centerY = shape.y + shape.height / 2;
  return Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Batch multiple state updates
 */
export function batchUpdates(updates: (() => void)[]): void {
  updates.forEach(update => update());
}

/**
 * Create a simple cache for expensive computations
 */
export function createCache<K, V>(maxSize: number = 100) {
  const cache = new Map<K, V>();

  return {
    get(key: K): V | undefined {
      return cache.get(key);
    },
    set(key: K, value: V): void {
      if (cache.size >= maxSize) {
        // Remove oldest entry
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) {
          cache.delete(firstKey);
        }
      }
      cache.set(key, value);
    },
    has(key: K): boolean {
      return cache.has(key);
    },
    clear(): void {
      cache.clear();
    },
  };
}

/**
 * Memoize a function with a simple cache
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getCacheKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getCacheKey
      ? getCacheKey(...args)
      : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
