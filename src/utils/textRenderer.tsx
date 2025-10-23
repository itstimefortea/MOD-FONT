import type { Font, Glyph, Shape } from '../types';
import { renderShape } from './shapeRenderer';

export interface TextRenderResult {
  elements: JSX.Element[];
  width: number;
  height: number;
}

/**
 * Renders a line of text as SVG elements using the font's glyphs
 * @param text - The text to render
 * @param size - Size in pixels
 * @param font - Font object containing glyphs and metrics
 * @param tracking - Additional tracking/letter-spacing to add (default: 0)
 * @param keyPrefix - Prefix for React keys to ensure uniqueness (default: 'text')
 * @returns Object containing SVG elements, total width, and height
 */
export const renderTextLine = (
  text: string,
  size: number,
  font: Font,
  tracking = 0,
  keyPrefix = 'text'
): TextRenderResult => {
  let x = 0;
  const elements: JSX.Element[] = [];
  const gridSize = font.metrics.gridSize;
  const scale = size / (gridSize * 32);
  const totalTracking = (font.metrics.tracking + tracking) * scale;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const glyph = font.glyphs[char];

    if (!glyph) {
      // Handle missing glyphs by adding default spacing
      x += font.metrics.defaultAdvanceWidth * scale + totalTracking;
      continue;
    }

    const glyphGroup = (
      <g key={`${keyPrefix}-${i}-${char}`} transform={`translate(${x}, 0) scale(${scale})`}>
        {glyph.shapes.map((shape: Shape) => renderShape(shape, false))}
      </g>
    );

    elements.push(glyphGroup);
    x += glyph.advanceWidth * 32 * scale + totalTracking;
  }

  return {
    elements,
    width: x,
    height: size,
  };
};

/**
 * Renders a line of text given a specific set of glyphs (for optimized rendering)
 * @param text - The text to render
 * @param size - Size in pixels
 * @param glyphs - Map of glyphs to use (can be subset)
 * @param metrics - Font metrics
 * @param tracking - Additional tracking/letter-spacing to add (default: 0)
 * @param keyPrefix - Prefix for React keys to ensure uniqueness (default: 'text')
 * @returns Array of SVG elements
 */
export const renderTextLineWithGlyphs = (
  text: string,
  size: number,
  glyphs: Record<string, Glyph>,
  metrics: Font['metrics'],
  tracking = 0,
  keyPrefix = 'text'
): JSX.Element[] => {
  let x = 0;
  const elements: JSX.Element[] = [];
  const gridSize = metrics.gridSize;
  const scale = size / (gridSize * 32);
  const totalTracking = (metrics.tracking + tracking) * scale;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const glyph = glyphs[char];

    if (!glyph) {
      x += metrics.defaultAdvanceWidth * scale + totalTracking;
      continue;
    }

    const glyphGroup = (
      <g key={`${keyPrefix}-${i}-${char}`} transform={`translate(${x}, 0) scale(${scale})`}>
        {glyph.shapes.map((shape: Shape) => renderShape(shape, false))}
      </g>
    );

    elements.push(glyphGroup);
    x += glyph.advanceWidth * 32 * scale + totalTracking;
  }

  return elements;
};
