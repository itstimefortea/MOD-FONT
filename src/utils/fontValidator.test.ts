/// <reference types="vitest" />
import { describe, expect, it } from 'vitest';
import { createDefaultFont } from './fontFactory';
import { validateFontWithErrors } from './fontValidator';

const cloneFont = (font: ReturnType<typeof createDefaultFont>) =>
  JSON.parse(JSON.stringify(font)) as ReturnType<typeof createDefaultFont>;

describe('validateFontWithErrors', () => {
  it('accepts valid font data produced by the factory', () => {
    const font = createDefaultFont();
    const result = validateFontWithErrors(font);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.font).toEqual(font);
    }
  });

  it('collects descriptive errors for invalid font data', () => {
    const baseFont = createDefaultFont();
    const invalidFont = cloneFont(baseFont);

    invalidFont.meta.familyName = '';
    invalidFont.metrics.gridSize = 0;

    const result = validateFontWithErrors(invalidFont);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.some(error => error.includes('meta.familyName'))).toBe(true);
      expect(result.errors.some(error => error.includes('metrics.gridSize'))).toBe(true);
    }
  });
});
