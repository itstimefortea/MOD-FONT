import React, { useEffect, useMemo, useRef } from 'react';
import { Font, FontMetrics, Glyph, Shape, ShapeType, ArcCorner } from '../types';
import { CELL_SIZE } from '../constants/shapes';

interface InspectorProps {
  font: Font;
  currentGlyph: string;
  onUpdateGlyph: <K extends keyof Glyph>(prop: K, value: Glyph[K]) => void;
  onUpdateMetrics: (updates: Partial<FontMetrics>) => void;
  selectedShapeIds: number[];
  onUpdateShape: (shapeId: number, updates: Partial<Shape>) => void;
  onSaveHistory: () => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  font,
  currentGlyph,
  onUpdateGlyph,
  selectedShapeIds,
  onUpdateShape,
  onSaveHistory,
}) => {
  const glyph = font.glyphs[currentGlyph];

  if (!glyph) return null;

  const canvasSize = useMemo(() => glyph.gridSize * CELL_SIZE, [glyph.gridSize]);
  const selectedShapes = useMemo(
    () => glyph.shapes.filter(shape => selectedShapeIds.includes(shape.id)),
    [glyph.shapes, selectedShapeIds]
  );

  const historyStagedRef = useRef(false);

  useEffect(() => {
    historyStagedRef.current = false;
  }, [selectedShapeIds.join(','), glyph.char]);

  const stageHistory = () => {
    if (!historyStagedRef.current) {
      onSaveHistory();
      historyStagedRef.current = true;
    }
  };

  const clampToCanvas = (value: number, max: number) => {
    if (Number.isNaN(value)) return 0;
    return Math.min(Math.max(value, 0), max);
  };

  const handleSingleShapeUpdate = (shape: Shape, updates: Partial<Shape>) => {
    if (!shape) return;
    stageHistory();
    onUpdateShape(shape.id, updates);
  };

  const renderSingleShapeEditor = (shape: Shape) => {
    const xCells = Math.round(shape.x / CELL_SIZE);
    const yCells = Math.round(shape.y / CELL_SIZE);
    const widthCells = Math.round(shape.width / CELL_SIZE);
    const heightCells = Math.round(shape.height / CELL_SIZE);
    const maxXCells = Math.floor((canvasSize - shape.width) / CELL_SIZE);
    const maxYCells = Math.floor((canvasSize - shape.height) / CELL_SIZE);
    const maxWidthCells = glyph.gridSize - Math.floor(shape.x / CELL_SIZE);
    const maxHeightCells = glyph.gridSize - Math.floor(shape.y / CELL_SIZE);

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-neutral-500 block mb-1">X (cells)</label>
            <input
              type="number"
              min={0}
              max={maxXCells}
              value={xCells}
              onChange={(e) => {
                const raw = parseInt(e.target.value, 10);
                if (Number.isNaN(raw)) {
                  return;
                }
                const next = clampToCanvas(raw * CELL_SIZE, canvasSize - shape.width);
                handleSingleShapeUpdate(shape, { x: next });
              }}
              className="w-full px-2 py-1 text-xs border border-neutral-300 rounded"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1">Y (cells)</label>
            <input
              type="number"
              min={0}
              max={maxYCells}
              value={yCells}
              onChange={(e) => {
                const raw = parseInt(e.target.value, 10);
                if (Number.isNaN(raw)) {
                  return;
                }
                const next = clampToCanvas(raw * CELL_SIZE, canvasSize - shape.height);
                handleSingleShapeUpdate(shape, { y: next });
              }}
              className="w-full px-2 py-1 text-xs border border-neutral-300 rounded"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1">Width (cells)</label>
            <input
              type="number"
              min={1}
              max={maxWidthCells}
              value={widthCells}
              onChange={(e) => {
                const raw = parseInt(e.target.value, 10);
                if (Number.isNaN(raw)) {
                  return;
                }
                const nextCells = Math.max(1, Math.min(raw, maxWidthCells));
                handleSingleShapeUpdate(shape, { width: nextCells * CELL_SIZE });
              }}
              className="w-full px-2 py-1 text-xs border border-neutral-300 rounded"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1">Height (cells)</label>
            <input
              type="number"
              min={1}
              max={maxHeightCells}
              value={heightCells}
              onChange={(e) => {
                const raw = parseInt(e.target.value, 10);
                if (Number.isNaN(raw)) {
                  return;
                }
                const nextCells = Math.max(1, Math.min(raw, maxHeightCells));
                handleSingleShapeUpdate(shape, { height: nextCells * CELL_SIZE });
              }}
              className="w-full px-2 py-1 text-xs border border-neutral-300 rounded"
            />
          </div>
        </div>

        {shape.type === ShapeType.TRIANGLE && (
          <div>
            <label className="text-xs text-neutral-500 block mb-1">Rotation</label>
            <select
              value={shape.rotation ?? 0}
              onChange={(e) => {
                const nextRotation = parseInt(e.target.value, 10) % 360;
                handleSingleShapeUpdate(shape, { rotation: nextRotation });
              }}
              className="w-full px-2 py-1 text-xs border border-neutral-300 rounded"
            >
              {[0, 90, 180, 270].map(angle => (
                <option key={angle} value={angle}>{angle}°</option>
              ))}
            </select>
          </div>
        )}

        {shape.type === ShapeType.QUARTER_CIRCLE && (
          <div>
            <label className="text-xs text-neutral-500 block mb-1">Corner</label>
            <select
              value={shape.corner ?? ArcCorner.TL}
              onChange={(e) => {
                const value = e.target.value as ArcCorner;
                handleSingleShapeUpdate(shape, { corner: value });
              }}
              className="w-full px-2 py-1 text-xs border border-neutral-300 rounded"
            >
              <option value={ArcCorner.TL}>Top Left</option>
              <option value={ArcCorner.TR}>Top Right</option>
              <option value={ArcCorner.BL}>Bottom Left</option>
              <option value={ArcCorner.BR}>Bottom Right</option>
            </select>
          </div>
        )}
      </div>
    );
  };

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

        <div className="pt-4 border-t border-neutral-200">
          <h3 className="text-xs font-medium mb-3 text-neutral-500 uppercase tracking-wide">
            Shape
          </h3>
          {selectedShapes.length === 0 && (
            <div className="text-xs text-neutral-500">Select a shape to edit its properties.</div>
          )}
          {selectedShapes.length > 1 && (
            <div className="text-xs text-neutral-500">
              Multiple shapes selected. Use alignment tools for batch adjustments.
            </div>
          )}
          {selectedShapes.length === 1 && renderSingleShapeEditor(selectedShapes[0])}
        </div>
      </div>
    </div>
  );
};
