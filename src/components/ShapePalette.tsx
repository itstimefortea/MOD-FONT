import React from 'react';
import { ShapeType, Tool, AlignmentType, Font, Glyph } from '../types';
import { SHAPE_DEFINITIONS } from '../constants/shapes';

interface ShapePaletteProps {
  selectedShape: ShapeType;
  onSelectShape: (shape: ShapeType) => void;
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  selectedShapeIds: number[];
  onAlign: (alignment: AlignmentType) => void;
  font: Font;
  currentGlyph: string;
  onUpdateGlyph: <K extends keyof Glyph>(prop: K, value: Glyph[K]) => void;
}

export const ShapePalette: React.FC<ShapePaletteProps> = ({
  selectedShape,
  onSelectShape,
  tool,
  onToolChange,
  selectedShapeIds,
  onAlign,
  font,
  currentGlyph,
  onUpdateGlyph,
}) => {
  const glyph = font.glyphs[currentGlyph];
  const hasSelection = selectedShapeIds.length > 0;

  return (
    <div className="bg-white border-b border-neutral-200 p-3">
      <div className="flex items-center gap-4">
        {/* Tools */}
        <div className="flex gap-2">
          <button
            onClick={() => onToolChange(Tool.DRAW)}
            className={`tool-btn px-3 py-2 rounded text-xs font-medium ${
              tool === Tool.DRAW ? 'active' : ''
            }`}
            title="Draw shapes (D)"
          >
            <i className="ph ph-pencil-simple text-base"></i>
          </button>
          <button
            onClick={() => onToolChange(Tool.SELECT)}
            className={`tool-btn px-3 py-2 rounded text-xs font-medium ${
              tool === Tool.SELECT ? 'active' : ''
            }`}
            title="Select & transform (V)"
          >
            <i className="ph ph-cursor text-base"></i>
          </button>
        </div>

        <div className="w-px h-6 bg-neutral-200"></div>

        {/* Shapes */}
        <div className="flex gap-2">
          {SHAPE_DEFINITIONS.map((shape) => (
            <button
              key={shape.type}
              onClick={() => {
                onSelectShape(shape.type);
                if (tool !== Tool.DRAW) onToolChange(Tool.DRAW);
              }}
              className={`shape-btn px-3 py-2 rounded text-center ${
                selectedShape === shape.type && tool === Tool.DRAW ? 'selected' : ''
              }`}
              title={shape.label}
            >
              <div className="w-6 h-6 flex items-center justify-center text-neutral-700">
                {shape.icon}
              </div>
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-neutral-200"></div>

        {/* Alignment Controls */}
        <div className="flex gap-1">
          <button
            onClick={() => onAlign(AlignmentType.LEFT)}
            disabled={!hasSelection}
            className="tool-btn px-2 py-1.5 rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            title="Align Left (Shift+L)"
          >
            <i className="ph ph-align-left text-base"></i>
          </button>
          <button
            onClick={() => onAlign(AlignmentType.CENTER_H)}
            disabled={!hasSelection}
            className="tool-btn px-2 py-1.5 rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            title="Center H (Shift+C)"
          >
            <i className="ph ph-align-center-horizontal text-base"></i>
          </button>
          <button
            onClick={() => onAlign(AlignmentType.RIGHT)}
            disabled={!hasSelection}
            className="tool-btn px-2 py-1.5 rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            title="Align Right (Shift+R)"
          >
            <i className="ph ph-align-right text-base"></i>
          </button>
          <div className="w-px h-4 bg-neutral-200 mx-1"></div>
          <button
            onClick={() => onAlign(AlignmentType.TOP)}
            disabled={!hasSelection}
            className="tool-btn px-2 py-1.5 rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            title="Align Top (Shift+T)"
          >
            <i className="ph ph-align-top text-base"></i>
          </button>
          <button
            onClick={() => onAlign(AlignmentType.CENTER_V)}
            disabled={!hasSelection}
            className="tool-btn px-2 py-1.5 rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            title="Center V (Shift+M)"
          >
            <i className="ph ph-align-center-vertical text-base"></i>
          </button>
          <button
            onClick={() => onAlign(AlignmentType.BOTTOM)}
            disabled={!hasSelection}
            className="tool-btn px-2 py-1.5 rounded text-xs disabled:opacity-30 disabled:cursor-not-allowed"
            title="Align Bottom (Shift+B)"
          >
            <i className="ph ph-align-bottom text-base"></i>
          </button>
        </div>

        {/* Spacer to push grid selector to the right */}
        <div className="flex-1"></div>

        {/* Grid Selector */}
        {glyph && (
          <>
            <div className="w-px h-6 bg-neutral-200"></div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-500">Grid:</label>
              <select
                value={glyph.gridSize}
                onChange={(e) => onUpdateGlyph('gridSize', parseInt(e.target.value))}
                className="px-2 py-1 text-xs border border-neutral-300 rounded bg-white"
              >
                <option value="6">6×6</option>
                <option value="8">8×8</option>
                <option value="10">10×10</option>
                <option value="12">12×12</option>
                <option value="16">16×16</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
