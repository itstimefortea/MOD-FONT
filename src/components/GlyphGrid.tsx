import React, { useMemo } from 'react';
import { Font } from '../types';
import { renderShapeOnly } from '../utils/shapeRenderer';

interface GlyphGridProps {
  font: Font;
  currentGlyph: string;
  onSelectGlyph: (char: string) => void;
}

export const GlyphGrid: React.FC<GlyphGridProps> = React.memo(({
  font,
  currentGlyph,
  onSelectGlyph,
}) => {
  // Memoize sorted glyphs list - recalculate when font.glyphs changes
  const glyphs = useMemo(
    () => Object.values(font.glyphs).sort((a, b) => a.unicode - b.unicode),
    [font.glyphs]
  );

  const renderGlyphPreview = (glyph: typeof glyphs[0]) => {
    const gridSize = glyph.gridSize;
    const cellSize = 4;
    const svgSize = gridSize * cellSize;

    return (
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${gridSize * 32} ${gridSize * 32}`}
        className="mx-auto max-w-full max-h-full"
      >
        {glyph.shapes.map((shape) => (
          <React.Fragment key={shape.id}>
            {renderShapeOnly(shape)}
          </React.Fragment>
        ))}
      </svg>
    );
  };

  return (
    <div className="w-full h-full bg-white border-r border-neutral-200 overflow-auto">
      <div className="p-3 border-b border-neutral-200">
        <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          Glyphs
        </h2>
      </div>
      <div className="p-3">
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))' }}>
          {glyphs.map((glyph) => (
            <button
              key={glyph.char}
              onClick={() => onSelectGlyph(glyph.char)}
              className={`aspect-square flex flex-col items-center justify-center p-2 rounded border-2 transition-all ${
                currentGlyph === glyph.char
                  ? 'bg-neutral-100 border-neutral-400'
                  : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
              }`}
            >
              {renderGlyphPreview(glyph)}
              <span
                className={`text-xs mt-1 ${
                  currentGlyph === glyph.char ? 'text-neutral-800 font-semibold' : 'text-neutral-600'
                }`}
              >
                {glyph.char === ' ' ? '␣' : glyph.char}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

