import { Font, Glyph } from '../types';

export const createDefaultGlyph = (char: string, gridSize: number): Glyph => ({
  char,
  unicode: char.charCodeAt(0),
  gridSize,
  shapes: [],
  leftBearing: 1,
  rightBearing: 1,
  advanceWidth: gridSize,
  modifiedAt: Date.now(),
});

export const createDefaultFont = (): Font => {
  const metrics = {
    gridSize: 12,
    ascender: 10,
    capHeight: 8,
    xHeight: 5,
    baseline: 0,
    descender: -2,
    defaultAdvanceWidth: 12,
    tracking: 0,
  };

  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    'abcdefghijklmnopqrstuvwxyz' +
    '0123456789' +
    '.,;:-_+/?! ';

  const glyphs: Record<string, Glyph> = {};
  for (const char of chars) {
    glyphs[char] = createDefaultGlyph(char, metrics.gridSize);
  }

  return {
    meta: {
      familyName: 'ModGrid',
      styleName: 'Regular',
    },
    metrics,
    glyphs,
    version: 4,
  };
};

