import { Font, Glyph, Shape, ShapeType, ArcCorner } from '../types';
import { shapeToSVGString } from './svgShapeGenerator';
import opentype from 'opentype.js';
import { CELL_SIZE } from '../constants/shapes';

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

/**
 * Convert a shape to an opentype.js path
 * Coordinate system: In fonts, Y=0 is at baseline, positive Y goes up
 * In our canvas, Y=0 is at top, positive Y goes down
 */
const shapeToOpentypePath = (shape: Shape, canvasSize: number): opentype.Path => {
  const path = new opentype.Path();
  const { type, x, y, width, height, rotation, corner } = shape;

  // Simple Y-flip: canvas top (Y=0) becomes font top, canvas bottom becomes font bottom
  // We'll handle baseline adjustment during scaling
  const flipY = (yCoord: number) => canvasSize - yCoord;

  const y1 = flipY(y + height); // Bottom in canvas = top in font
  const y2 = flipY(y);           // Top in canvas = bottom in font

  switch (type) {
    case ShapeType.SQUARE:
      // Draw rectangle as closed path
      path.moveTo(x, y1);
      path.lineTo(x + width, y1);
      path.lineTo(x + width, y2);
      path.lineTo(x, y2);
      path.close();
      break;

    case ShapeType.CIRCLE:
      // Draw ellipse using bezier curves
      {
        const cx = x + width / 2;
        const cy = flipY(y + height / 2);
        const rx = width / 2;
        const ry = height / 2;
        const k = 0.5522847498; // Control point offset for circle approximation

        path.moveTo(cx, cy - ry);
        path.curveTo(cx + rx * k, cy - ry, cx + rx, cy - ry * k, cx + rx, cy);
        path.curveTo(cx + rx, cy + ry * k, cx + rx * k, cy + ry, cx, cy + ry);
        path.curveTo(cx - rx * k, cy + ry, cx - rx, cy + ry * k, cx - rx, cy);
        path.curveTo(cx - rx, cy - ry * k, cx - rx * k, cy - ry, cx, cy - ry);
        path.close();
      }
      break;

    case ShapeType.TRIANGLE:
      // Right triangle with rotation support
      {
        const centerX = x + width / 2;
        const centerY = flipY(y + height / 2);

        // Define triangle points before rotation
        const points = [
          { x: x, y: y1 },                    // Bottom-left
          { x: x + width, y: y1 },            // Bottom-right
          { x: x, y: y2 },                     // Top-left
        ];

        // Apply rotation if needed
        if (rotation !== 0) {
          const rad = (rotation * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);

          points.forEach((p, i) => {
            const px = p.x - centerX;
            const py = flipY(p.y) - centerY;
            points[i] = {
              x: centerX + px * cos - py * sin,
              y: flipY(centerY + px * sin + py * cos),
            };
          });
        }

        path.moveTo(points[0].x, points[0].y);
        path.lineTo(points[1].x, points[1].y);
        path.lineTo(points[2].x, points[2].y);
        path.close();
      }
      break;

    case ShapeType.QUARTER_CIRCLE:
      {
        const actualCorner = corner || ArcCorner.TL;
        const rx = width;
        const ry = height;

        // Approximate arc with cubic bezier
        const k = 0.5522847498;

        switch (actualCorner) {
          case ArcCorner.TL:
            path.moveTo(x + width, y1);
            path.curveTo(x + width, y1 + ry * k, x + rx * k, y2, x, y2);
            path.lineTo(x, y1);
            path.close();
            break;
          case ArcCorner.TR:
            path.moveTo(x, y1);
            path.curveTo(x + width - rx * k, y1, x + width, y1 + ry * k, x + width, y2);
            path.lineTo(x + width, y1);
            path.close();
            break;
          case ArcCorner.BL:
            path.moveTo(x + width, y2);
            path.curveTo(x + width - rx * k, y2, x, y2 - ry * k, x, y1);
            path.lineTo(x, y2);
            path.close();
            break;
          case ArcCorner.BR:
            path.moveTo(x, y2);
            path.curveTo(x, y2 - ry * k, x + width - rx * k, y1, x + width, y1);
            path.lineTo(x + width, y2);
            path.close();
            break;
        }
      }
      break;
  }

  return path;
};

/**
 * Export the entire font as a TrueType font file (.ttf)
 */
export const exportFontAsTTF = (font: Font): void => {
  try {
    const { meta, metrics, glyphs } = font;

    // Check if any glyphs have shapes
    const glyphsWithShapes = Object.values(glyphs).filter(g => g.shapes.length > 0);
    if (glyphsWithShapes.length === 0) {
      alert('No glyphs with shapes found!\n\nPlease draw shapes on some glyphs before exporting.\n\n1. Select a glyph from the left sidebar\n2. Use the Draw tool (D)\n3. Draw shapes on the canvas\n4. Then export your font');
      return;
    }

    // Calculate units per em (standard is 1000 for TrueType)
    const unitsPerEm = 1000;
    const gridSize = metrics.gridSize;
    const canvasSize = gridSize * CELL_SIZE;

    // Scale factor from canvas pixels to font units
    const scale = unitsPerEm / canvasSize;

    // Create notdef glyph (required for all fonts)
    const notdefGlyph = new opentype.Glyph({
      name: '.notdef',
      unicode: 0,
      advanceWidth: Math.round(metrics.defaultAdvanceWidth * scale),
      path: new opentype.Path(),
    });

    // Convert each glyph to opentype format
    const opentypeGlyphs: opentype.Glyph[] = [notdefGlyph];

    Object.values(glyphs).forEach((glyph) => {
      // Skip glyphs with no shapes
      if (glyph.shapes.length === 0) return;

      const path = new opentype.Path();

      // Combine all shapes into one path
      glyph.shapes.forEach((shape) => {
        const shapePath = shapeToOpentypePath(shape, canvasSize);
        // Add the shape's commands to the main path
        path.commands = path.commands.concat(shapePath.commands);
      });

      // Scale the path to font units
      path.commands.forEach((cmd: any) => {
        if (cmd.x !== undefined) cmd.x = Math.round(cmd.x * scale);
        if (cmd.y !== undefined) cmd.y = Math.round(cmd.y * scale);
        if (cmd.x1 !== undefined) cmd.x1 = Math.round(cmd.x1 * scale);
        if (cmd.y1 !== undefined) cmd.y1 = Math.round(cmd.y1 * scale);
        if (cmd.x2 !== undefined) cmd.x2 = Math.round(cmd.x2 * scale);
        if (cmd.y2 !== undefined) cmd.y2 = Math.round(cmd.y2 * scale);
      });

      const opentypeGlyph = new opentype.Glyph({
        name: glyph.char === ' ' ? 'space' : glyph.char,
        unicode: glyph.unicode,
        advanceWidth: Math.round(glyph.advanceWidth * scale),
        path: path,
      });

      opentypeGlyphs.push(opentypeGlyph);
    });
    // Create the font
    // Note: metrics.descender is already negative in our data structure
    const opentypeFont = new opentype.Font({
      familyName: meta.familyName,
      styleName: meta.styleName,
      unitsPerEm: unitsPerEm,
      ascender: Math.round(metrics.ascender * scale),
      descender: Math.round(metrics.descender * scale), // Already negative in our data
      glyphs: opentypeGlyphs,
    });

    // Download the font
    const arrayBuffer = opentypeFont.toArrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'font/ttf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meta.familyName}-${meta.styleName}.ttf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting TTF:', error);
    alert(`Error exporting TTF: ${error instanceof Error ? error.message : String(error)}`);
  }
};

