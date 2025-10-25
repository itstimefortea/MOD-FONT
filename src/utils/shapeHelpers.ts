import { Shape, ShapeType } from '../types';
import { CELL_SIZE } from '../constants/shapes';
import { clamp } from './performanceHelpers';

/**
 * Calculate shape bounds for better collision detection
 */
export interface ShapeBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function getShapeBounds(shape: Shape): ShapeBounds {
  return {
    minX: shape.x,
    minY: shape.y,
    maxX: shape.x + shape.width,
    maxY: shape.y + shape.height,
  };
}

/**
 * Check if two shapes overlap
 */
export function shapesOverlap(shape1: Shape, shape2: Shape): boolean {
  const bounds1 = getShapeBounds(shape1);
  const bounds2 = getShapeBounds(shape2);

  return !(
    bounds1.maxX < bounds2.minX ||
    bounds1.minX > bounds2.maxX ||
    bounds1.maxY < bounds2.minY ||
    bounds1.minY > bounds2.maxY
  );
}

/**
 * Get shape center point
 */
export function getShapeCenter(shape: Shape): { x: number; y: number } {
  return {
    x: shape.x + shape.width / 2,
    y: shape.y + shape.height / 2,
  };
}

/**
 * Check if shape is fully within canvas bounds
 */
export function isShapeInBounds(shape: Shape, canvasSize: number): boolean {
  return (
    shape.x >= 0 &&
    shape.y >= 0 &&
    shape.x + shape.width <= canvasSize &&
    shape.y + shape.height <= canvasSize
  );
}

/**
 * Get visual description of shape for accessibility
 */
export function getShapeDescription(shape: Shape): string {
  const typeNames: Record<ShapeType, string> = {
    [ShapeType.SQUARE]: 'Square',
    [ShapeType.CIRCLE]: 'Circle',
    [ShapeType.TRIANGLE]: 'Triangle',
    [ShapeType.QUARTER_CIRCLE]: 'Quarter Circle',
  };

  return `${typeNames[shape.type]} at position (${Math.round(shape.x)}, ${Math.round(shape.y)})`;
}

/**
 * Normalize a shape so it remains within the bounds of a glyph canvas.
 * Useful when pasting shapes across glyphs with different grid sizes.
 */
export function normalizeShapeToCanvas(shape: Shape, gridSize: number): Shape {
  const canvasSize = gridSize * CELL_SIZE;

  const snap = (value: number) => Math.round(value / CELL_SIZE) * CELL_SIZE;
  const snapDimension = (dimension: number) => {
    const snapped = snap(dimension);
    return clamp(snapped, CELL_SIZE, canvasSize);
  };

  const width = Math.min(snapDimension(shape.width), canvasSize);
  const height = Math.min(snapDimension(shape.height), canvasSize);

  const maxX = Math.max(0, canvasSize - width);
  const maxY = Math.max(0, canvasSize - height);

  const x = clamp(snap(shape.x), 0, maxX);
  const y = clamp(snap(shape.y), 0, maxY);

  return { ...shape, x, y, width, height };
}
