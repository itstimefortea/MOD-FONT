import { Shape, ShapeType, ArcCorner } from '../types';

// Generate a cryptographically secure unique ID
export const generateUniqueId = (): number => {
  const timestamp = Date.now();
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  // Combine timestamp with crypto random for guaranteed uniqueness
  return timestamp * 1000000 + randomValues[0];
};

export const createShape = (
  type: ShapeType,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation = 0,
  corner: ArcCorner | null = null
): Shape => ({
  id: generateUniqueId(),
  type,
  x,
  y,
  width,
  height,
  rotation,
  corner,
});

