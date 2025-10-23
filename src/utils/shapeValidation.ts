import { Shape, Glyph, Font } from '../types';

/**
 * Validates that shape dimensions are within acceptable bounds
 * @param shape - Shape to validate
 * @param canvasSize - Canvas size for boundary validation (optional)
 * @returns True if shape is valid, false otherwise
 */
export const isShapeValid = (shape: Shape, canvasSize?: number): boolean => {
  // Check for negative or zero dimensions
  if (shape.width <= 0 || shape.height <= 0) {
    return false;
  }

  // Check for negative coordinates
  if (shape.x < 0 || shape.y < 0) {
    return false;
  }

  // Check if shape exceeds canvas bounds (if canvasSize provided)
  if (canvasSize !== undefined) {
    if (shape.x + shape.width > canvasSize || shape.y + shape.height > canvasSize) {
      return false;
    }
  }

  // Check for NaN values
  if (
    isNaN(shape.x) ||
    isNaN(shape.y) ||
    isNaN(shape.width) ||
    isNaN(shape.height) ||
    isNaN(shape.rotation)
  ) {
    return false;
  }

  return true;
};

/**
 * Validates and sanitizes a shape, clamping values to acceptable ranges
 * @param shape - Shape to sanitize
 * @param canvasSize - Canvas size for boundary validation
 * @returns Sanitized shape with valid dimensions
 */
export const sanitizeShape = (shape: Shape, canvasSize: number): Shape => {
  const minSize = 1; // Minimum 1 unit

  return {
    ...shape,
    x: Math.max(0, Math.min(canvasSize - minSize, shape.x || 0)),
    y: Math.max(0, Math.min(canvasSize - minSize, shape.y || 0)),
    width: Math.max(minSize, Math.min(canvasSize, shape.width || minSize)),
    height: Math.max(minSize, Math.min(canvasSize, shape.height || minSize)),
    rotation: isNaN(shape.rotation) ? 0 : shape.rotation,
  };
};

/**
 * Validates glyph data structure
 * @param glyph - Glyph to validate
 * @returns True if glyph is valid
 */
export const isGlyphValid = (glyph: Glyph): boolean => {
  if (!glyph || typeof glyph !== 'object') {
    return false;
  }

  if (typeof glyph.char !== 'string' || glyph.char.length === 0) {
    return false;
  }

  if (typeof glyph.gridSize !== 'number' || glyph.gridSize <= 0) {
    return false;
  }

  if (!Array.isArray(glyph.shapes)) {
    return false;
  }

  // Validate all shapes
  const canvasSize = glyph.gridSize * 32; // Assuming 32px per grid cell
  for (const shape of glyph.shapes) {
    if (!isShapeValid(shape, canvasSize)) {
      return false;
    }
  }

  return true;
};

/**
 * Validates font metrics
 * @param metrics - Font metrics to validate
 * @returns True if metrics are valid
 */
export const areFontMetricsValid = (metrics: Font['metrics']): boolean => {
  if (!metrics || typeof metrics !== 'object') {
    return false;
  }

  // Grid size must be positive
  if (typeof metrics.gridSize !== 'number' || metrics.gridSize <= 0) {
    return false;
  }

  // Check for NaN values in all metric fields
  const numericFields = [
    'gridSize',
    'ascender',
    'capHeight',
    'xHeight',
    'baseline',
    'descender',
    'defaultAdvanceWidth',
    'tracking',
  ];

  for (const field of numericFields) {
    const value = metrics[field as keyof Font['metrics']];
    if (typeof value !== 'number' || isNaN(value)) {
      return false;
    }
  }

  return true;
};
