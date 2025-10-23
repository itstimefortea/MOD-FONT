import React from 'react';
import { ShapeType, Tool } from '../types';
import { SHAPE_DEFINITIONS } from '../constants/shapes';

interface ShapePaletteProps {
  selectedShape: ShapeType;
  onSelectShape: (shape: ShapeType) => void;
  tool: Tool;
  onToolChange: (tool: Tool) => void;
}

export const ShapePalette: React.FC<ShapePaletteProps> = ({
  selectedShape,
  onSelectShape,
  tool,
  onToolChange,
}) => {
  return (
    <div className="bg-white border-b border-neutral-200 p-3">
      <div className="flex items-center gap-4">
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
      </div>
    </div>
  );
};
