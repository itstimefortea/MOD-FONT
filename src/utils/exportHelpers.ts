import { Font, Glyph } from '../types';
import { shapeToSVGString } from './svgShapeGenerator';

export const exportFontAsJSON = (font: Font): void => {
  const blob = new Blob([JSON.stringify(font, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${font.meta.familyName}-${font.meta.styleName}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportGlyphAsSVG = (
  glyph: Glyph,
  canvasSize: number,
  familyName: string
): void => {
  // Use shared SVG generation utility
  const shapesStr = glyph.shapes
    .map((shape) => shapeToSVGString(shape))
    .join('\n');

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasSize} ${canvasSize}" width="${canvasSize}" height="${canvasSize}">
${shapesStr}
</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${familyName}-${glyph.char}.svg`;
  a.click();
  URL.revokeObjectURL(url);
};

