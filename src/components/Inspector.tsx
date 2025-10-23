import React from 'react';
import { Font, FontMetrics, Glyph } from '../types';

interface InspectorProps {
  font: Font;
  currentGlyph: string;
  onUpdateGlyph: <K extends keyof Glyph>(prop: K, value: Glyph[K]) => void;
  onUpdateMetrics: (updates: Partial<FontMetrics>) => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  font,
  currentGlyph,
  onUpdateGlyph,
}) => {
  const glyph = font.glyphs[currentGlyph];

  if (!glyph) return null;

  return (
    <div className="w-full h-full bg-white border-l border-neutral-200 p-4 overflow-auto">
      <h2 className="text-sm font-semibold mb-4 text-neutral-900">Properties</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-medium mb-3 text-neutral-500 uppercase tracking-wide">
            Character
          </h3>
          <div className="text-4xl text-neutral-900 font-light mb-2">
            {glyph.char === ' ' ? '␣' : glyph.char}
          </div>
          <div className="text-xs text-neutral-500">
            U+{glyph.unicode.toString(16).toUpperCase().padStart(4, '0')}
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <h3 className="text-xs font-medium mb-3 text-neutral-500 uppercase tracking-wide">
            Info
          </h3>
          <div className="text-xs text-neutral-600 space-y-1">
            <div>Shapes: {glyph.shapes.length}</div>
            <div>
              Grid: {glyph.gridSize}×{glyph.gridSize}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200">
          <h3 className="text-xs font-medium mb-3 text-neutral-500 uppercase tracking-wide">
            Grid Resolution
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-neutral-500 block mb-1">
                Grid Size
              </label>
              <select
                value={glyph.gridSize}
                onChange={(e) => onUpdateGlyph('gridSize', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-xs border border-neutral-300 rounded"
              >
                <option value="6">6×6</option>
                <option value="8">8×8</option>
                <option value="10">10×10</option>
                <option value="12">12×12</option>
                <option value="16">16×16</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
