import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Font,
  History,
  ShapeType,
  Tool,
  PreviewBox,
  SVGPoint,
  AlignmentType,
  Shape,
} from '../types';
import { CELL_SIZE } from '../constants/shapes';
import { getSVGPoint, snapToGrid } from '../utils/svgHelpers';
import { createShape } from '../utils/shapeFactory';
import { renderShapeOnly, renderSelectionIndicators } from '../utils/shapeRenderer';
import { exportGlyphAsSVG } from '../utils/exportHelpers';
import { useShapeTransform } from '../hooks/useShapeTransform';
import { rafThrottle, isPointInShape, clamp } from '../utils/performanceHelpers';

interface EditorCanvasProps {
  font: Font;
  currentGlyph: string;
  selectedShapeType: ShapeType;
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  onAddShape: (shape: Shape) => void;
  onUpdateShape: (shapeId: number, updates: Partial<Shape>) => void;
  onDeleteShape: (shapeId: number) => void;
  onClearGlyph: () => void;
  onUndo: () => void;
  onRedo: () => void;
  history: History;
  saveToHistory: () => void;
  onDuplicateShape: (shapeId: number) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  font,
  currentGlyph,
  selectedShapeType,
  tool,
  onToolChange,
  onAddShape,
  onUpdateShape,
  onDeleteShape,
  onClearGlyph,
  onUndo,
  onRedo,
  history,
  saveToHistory,
  onDuplicateShape,
}) => {
  const glyph = font.glyphs[currentGlyph];
  const svgRef = useRef<SVGSVGElement>(null);
  const svgInputRef = useRef<HTMLInputElement>(null);

  // Use ref for glyph shapes to avoid recreating callbacks on every shape change
  const glyphShapesRef = useRef(glyph?.shapes || []);

  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedShapeIds, setSelectedShapeIds] = useState<number[]>([]);
  const [dragStart, setDragStart] = useState<SVGPoint | null>(null);
  const [shapeStartPositions, setShapeStartPositions] = useState<Map<number, SVGPoint>>(new Map());
  const [resizeStartShape, setResizeStartShape] = useState<Shape | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [drawStart, setDrawStart] = useState<SVGPoint | null>(null);
  const [previewBox, setPreviewBox] = useState<PreviewBox | null>(null);
  const [selectionBox, setSelectionBox] = useState<PreviewBox | null>(null);

  // Calculate grid and canvas size - use default if glyph is not available
  const gridSize = glyph?.gridSize || 16;
  const canvasSize = gridSize * CELL_SIZE;

  // All hooks must be called before any conditional returns
  const { flipHorizontal, flipVertical, rotate90, alignShapes } = useShapeTransform(
    canvasSize,
    saveToHistory,
    onUpdateShape
  );

  // Keep ref updated with current glyph shapes
  useEffect(() => {
    if (glyph) {
      glyphShapesRef.current = glyph.shapes;
    }
  }, [glyph]);

  useEffect(() => {
    if (!glyph) {
      return;
    }

    setIsDragging(false);
    setIsResizing(false);
    setIsSelecting(false);
    setSelectedShapeIds([]);
    setDragStart(null);
    setShapeStartPositions(new Map());
    setResizeStartShape(null);
    setResizeHandle(null);
    setDrawStart(null);
    setPreviewBox(null);
    setSelectionBox(null);
  }, [glyph?.char]);

  // Handle shape transforms - now supports multiple shapes
  const handleFlipHorizontal = useCallback(() => {
    if (selectedShapeIds.length === 0 || !glyph) return;
    selectedShapeIds.forEach(shapeId => {
      const shape = glyph.shapes.find((s) => s.id === shapeId);
      if (shape) flipHorizontal(shape);
    });
  }, [selectedShapeIds, glyph, flipHorizontal]);

  const handleFlipVertical = useCallback(() => {
    if (selectedShapeIds.length === 0 || !glyph) return;
    selectedShapeIds.forEach(shapeId => {
      const shape = glyph.shapes.find((s) => s.id === shapeId);
      if (shape) flipVertical(shape);
    });
  }, [selectedShapeIds, glyph, flipVertical]);

  const handleRotate90 = useCallback(() => {
    if (selectedShapeIds.length === 0 || !glyph) return;
    selectedShapeIds.forEach(shapeId => {
      const shape = glyph.shapes.find((s) => s.id === shapeId);
      if (shape) rotate90(shape);
    });
  }, [selectedShapeIds, glyph, rotate90]);

  const handleAlignShape = useCallback(
    (alignment: AlignmentType) => {
      if (selectedShapeIds.length === 0 || !glyph) return;

      // Get all selected shapes
      const selectedShapes = glyph.shapes.filter(s => selectedShapeIds.includes(s.id));

      // Use the new alignShapes function that handles multi-selection properly
      alignShapes(selectedShapes, alignment);
    },
    [selectedShapeIds, glyph, alignShapes]
  );

  // Export SVG
  const handleExportGlyphSVG = useCallback(() => {
    if (!glyph) return;
    exportGlyphAsSVG(glyph, canvasSize, font.meta.familyName);
  }, [glyph, canvasSize, font]);

  // Mouse handlers with improved hit detection and multi-selection
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<SVGSVGElement>) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (!glyph) return;

      const point = getSVGPoint(e, svgRef.current);

      // Check for resize handle (only works with single selection)
      if (tool === Tool.SELECT && selectedShapeIds.length === 1) {
        const target = e.target as SVGElement;
        const handle = target.getAttribute('data-handle');

        if (handle) {
          e.preventDefault();
          const shape = glyph.shapes.find((s) => s.id === selectedShapeIds[0]);
          if (shape) {
            setIsResizing(true);
            setResizeHandle(handle);
            setDragStart(point);
            setResizeStartShape({ ...shape }); // Store original shape dimensions
          }
          return;
        }
      }

      if (tool === Tool.DRAW && selectedShapeType) {
        e.preventDefault();
        const snappedX = snapToGrid(point.x);
        const snappedY = snapToGrid(point.y);
        setDrawStart({ x: snappedX, y: snappedY });
      } else if (tool === Tool.SELECT) {
        // Improved shape selection with multi-select support
        let clickedShape: Shape | null = null;
        
        // Iterate from top to bottom (last drawn to first)
        for (let i = glyph.shapes.length - 1; i >= 0; i--) {
          const shape = glyph.shapes[i];
          if (isPointInShape(point.x, point.y, shape)) {
            clickedShape = shape;
            break;
          }
        }

        if (clickedShape) {
          e.preventDefault();
          
          // Multi-selection with Shift or Cmd/Ctrl
          if (e.shiftKey || e.metaKey || e.ctrlKey) {
            if (selectedShapeIds.includes(clickedShape.id)) {
              // Remove from selection
              setSelectedShapeIds(selectedShapeIds.filter(id => id !== clickedShape.id));
            } else {
              // Add to selection
              setSelectedShapeIds([...selectedShapeIds, clickedShape.id]);
            }
          } else {
            // Single selection or start drag
            if (!selectedShapeIds.includes(clickedShape.id)) {
              setSelectedShapeIds([clickedShape.id]);
            }
            
            // Start dragging all selected shapes
            setIsDragging(true);
            setDragStart(point);
            
            // Store starting positions for all selected shapes
            const positions = new Map<number, SVGPoint>();
            selectedShapeIds.forEach(id => {
              const shape = glyph.shapes.find(s => s.id === id);
              if (shape) {
                positions.set(id, { x: shape.x, y: shape.y });
              }
            });
            // Also add the clicked shape if it's being added to selection
            if (!selectedShapeIds.includes(clickedShape.id)) {
              positions.set(clickedShape.id, { x: clickedShape.x, y: clickedShape.y });
            }
            setShapeStartPositions(positions);
          }
        } else {
          // Click on empty space - start selection box
          if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
            setSelectedShapeIds([]);
          }
          setIsSelecting(true);
          setDragStart(point);
        }
      }
    },
    [tool, selectedShapeIds, selectedShapeType, glyph]
  );

  // Throttled mouse move handler for smooth 60fps performance
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<SVGSVGElement>) => {
    const point = getSVGPoint(e, svgRef.current);

    if (drawStart && !isSelecting) {
      const width = Math.abs(point.x - drawStart.x);
      const height = Math.abs(point.y - drawStart.y);
      const x = Math.min(drawStart.x, point.x);
      const y = Math.min(drawStart.y, point.y);

      setPreviewBox({
        x: snapToGrid(x),
        y: snapToGrid(y),
        width: snapToGrid(width),
        height: snapToGrid(height),
      });
    } else if (isSelecting && dragStart) {
      // Draw selection box
      const width = Math.abs(point.x - dragStart.x);
      const height = Math.abs(point.y - dragStart.y);
      const x = Math.min(dragStart.x, point.x);
      const y = Math.min(dragStart.y, point.y);

      setSelectionBox({
        x,
        y,
        width,
        height,
      });
    } else if (isDragging && selectedShapeIds.length > 0 && dragStart && shapeStartPositions.size > 0) {
      // Drag multiple shapes
      const dx = point.x - dragStart.x;
      const dy = point.y - dragStart.y;

      selectedShapeIds.forEach(shapeId => {
        const shape = glyphShapesRef.current.find((s) => s.id === shapeId);
        const startPos = shapeStartPositions.get(shapeId);
        if (!shape || !startPos) return;

        // Calculate new position based on original shape position
        const newX = clamp(
          snapToGrid(startPos.x + dx), 
          0, 
          canvasSize - shape.width
        );
        const newY = clamp(
          snapToGrid(startPos.y + dy), 
          0, 
          canvasSize - shape.height
        );

        onUpdateShape(shapeId, {
          x: newX,
          y: newY,
        });
      });
    } else if (isResizing && selectedShapeIds.length === 1 && dragStart && resizeHandle && resizeStartShape) {
      const selectedShapeId = selectedShapeIds[0];

      // Calculate delta from original drag start position
      const dx = point.x - dragStart.x;
      const dy = point.y - dragStart.y;

      let updates: Partial<Shape> = {};

      // Calculate new dimensions based on original shape, not current shape
      switch (resizeHandle) {
        case 'resize-nw': {
          // Moving top-left corner: adjust x, y, width, height
          const newX = clamp(
            snapToGrid(resizeStartShape.x + dx),
            0,
            resizeStartShape.x + resizeStartShape.width - CELL_SIZE
          );
          const newY = clamp(
            snapToGrid(resizeStartShape.y + dy),
            0,
            resizeStartShape.y + resizeStartShape.height - CELL_SIZE
          );
          updates = {
            x: newX,
            y: newY,
            width: Math.max(CELL_SIZE, resizeStartShape.x + resizeStartShape.width - newX),
            height: Math.max(CELL_SIZE, resizeStartShape.y + resizeStartShape.height - newY),
          };
          break;
        }
        case 'resize-ne': {
          // Moving top-right corner: adjust y, width, height
          const newY = clamp(
            snapToGrid(resizeStartShape.y + dy),
            0,
            resizeStartShape.y + resizeStartShape.height - CELL_SIZE
          );
          const newWidth = Math.max(CELL_SIZE, snapToGrid(resizeStartShape.width + dx));
          updates = {
            y: newY,
            width: clamp(newWidth, CELL_SIZE, canvasSize - resizeStartShape.x),
            height: Math.max(CELL_SIZE, resizeStartShape.y + resizeStartShape.height - newY),
          };
          break;
        }
        case 'resize-sw': {
          // Moving bottom-left corner: adjust x, width, height
          const newX = clamp(
            snapToGrid(resizeStartShape.x + dx),
            0,
            resizeStartShape.x + resizeStartShape.width - CELL_SIZE
          );
          const newHeight = Math.max(CELL_SIZE, snapToGrid(resizeStartShape.height + dy));
          updates = {
            x: newX,
            width: Math.max(CELL_SIZE, resizeStartShape.x + resizeStartShape.width - newX),
            height: clamp(newHeight, CELL_SIZE, canvasSize - resizeStartShape.y),
          };
          break;
        }
        case 'resize-se': {
          // Moving bottom-right corner: adjust width, height
          const newWidth = Math.max(CELL_SIZE, snapToGrid(resizeStartShape.width + dx));
          const newHeight = Math.max(CELL_SIZE, snapToGrid(resizeStartShape.height + dy));
          updates = {
            width: clamp(newWidth, CELL_SIZE, canvasSize - resizeStartShape.x),
            height: clamp(newHeight, CELL_SIZE, canvasSize - resizeStartShape.y),
          };
          break;
        }
      }

      onUpdateShape(selectedShapeId, updates);
    }
  }, [
    drawStart,
    isDragging,
    isResizing,
    isSelecting,
    selectedShapeIds,
    dragStart,
    shapeStartPositions,
    resizeHandle,
    resizeStartShape,
    canvasSize,
    onUpdateShape,
  ]);

  // Create throttled version of handleMouseMove
  const throttledHandleMouseMove = useMemo(
    () => rafThrottle(handleMouseMove),
    [handleMouseMove]
  );

  useEffect(() => {
    return () => {
      throttledHandleMouseMove.cancel();
    };
  }, [throttledHandleMouseMove]);

  const handleMouseUp = useCallback(() => {
    if (drawStart && previewBox && !isSelecting) {
      if (previewBox.width >= CELL_SIZE && previewBox.height >= CELL_SIZE) {
        saveToHistory();
        onAddShape(
          createShape(
            selectedShapeType,
            previewBox.x,
            previewBox.y,
            previewBox.width,
            previewBox.height
          )
        );
      }
      setDrawStart(null);
      setPreviewBox(null);
    }

    if (isSelecting && selectionBox && glyph) {
      // Find all shapes within selection box
      const selectedIds: number[] = [];
      glyph.shapes.forEach(shape => {
        // Check if shape overlaps with selection box
        if (
          shape.x < selectionBox.x + selectionBox.width &&
          shape.x + shape.width > selectionBox.x &&
          shape.y < selectionBox.y + selectionBox.height &&
          shape.y + shape.height > selectionBox.y
        ) {
          selectedIds.push(shape.id);
        }
      });
      setSelectedShapeIds(selectedIds);
      setSelectionBox(null);
      setIsSelecting(false);
    }

    if (isDragging || isResizing) {
      saveToHistory();
    }

    setIsDragging(false);
    setIsResizing(false);
    setDragStart(null);
    setShapeStartPositions(new Map());
    setResizeHandle(null);
    setResizeStartShape(null);
  }, [
    drawStart,
    previewBox,
    selectionBox,
    isDragging,
    isResizing,
    isSelecting,
    saveToHistory,
    onAddShape,
    selectedShapeType,
    glyph,
  ]);

  // Keyboard shortcuts - now supports multiple selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (!glyph) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedShapeIds.length > 0) {
          e.preventDefault();
          selectedShapeIds.forEach(id => onDeleteShape(id));
          setSelectedShapeIds([]);
        }
      } else if (e.key === 'd' || e.key === 'D') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (selectedShapeIds.length > 0) {
            selectedShapeIds.forEach(id => onDuplicateShape(id));
          }
        } else {
          e.preventDefault();
          onToolChange(Tool.DRAW);
        }
      } else if (e.key === 'v' || e.key === 'V') {
        if (e.shiftKey && selectedShapeIds.length > 0) {
          e.preventDefault();
          handleFlipVertical();
        } else if (!e.shiftKey) {
          e.preventDefault();
          onToolChange(Tool.SELECT);
        }
      } else if (e.key === 'Escape') {
        setSelectedShapeIds([]);
      } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        // Select all shapes
        e.preventDefault();
        setSelectedShapeIds(glyph.shapes.map(s => s.id));
      } else if ((e.key === 'h' || e.key === 'H') && selectedShapeIds.length > 0) {
        e.preventDefault();
        handleFlipHorizontal();
      } else if ((e.key === 'r' || e.key === 'R') && selectedShapeIds.length > 0) {
        e.preventDefault();
        handleRotate90();
      } else if (e.shiftKey && selectedShapeIds.length > 0) {
        if (e.key === 'L') {
          e.preventDefault();
          handleAlignShape(AlignmentType.LEFT);
        } else if (e.key === 'R') {
          e.preventDefault();
          handleAlignShape(AlignmentType.RIGHT);
        } else if (e.key === 'T') {
          e.preventDefault();
          handleAlignShape(AlignmentType.TOP);
        } else if (e.key === 'B') {
          e.preventDefault();
          handleAlignShape(AlignmentType.BOTTOM);
        } else if (e.key === 'C') {
          e.preventDefault();
          handleAlignShape(AlignmentType.CENTER_H);
        } else if (e.key === 'M') {
          e.preventDefault();
          handleAlignShape(AlignmentType.CENTER_V);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedShapeIds,
    glyph,
    onDeleteShape,
    onToolChange,
    handleFlipHorizontal,
    handleFlipVertical,
    handleRotate90,
    onDuplicateShape,
    handleAlignShape,
  ]);

  // Memoize selected shapes to prevent unnecessary recalculations
  const selectedShapes = useMemo(
    () => glyph ? glyph.shapes.filter((s) => selectedShapeIds.includes(s.id)) : [],
    [glyph, selectedShapeIds]
  );

  // Dynamic cursor based on tool and hover state
  const canvasCursor = useMemo(() => {
    if (tool === Tool.DRAW) return 'cursor-crosshair';
    if (tool === Tool.SELECT && isDragging) return 'cursor-move';
    return 'cursor-default';
  }, [tool, isDragging]);

  // Memoize grid pattern to prevent recreation on every render
  const gridPattern = useMemo(
    () => (
      <defs>
        <pattern
          id="grid"
          width={CELL_SIZE}
          height={CELL_SIZE}
          patternUnits="userSpaceOnUse"
        >
          <rect width={CELL_SIZE} height={CELL_SIZE} fill="white" />
          <path
            d={`M ${CELL_SIZE} 0 L 0 0 0 ${CELL_SIZE}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        </pattern>
      </defs>
    ),
    [] // CELL_SIZE is a constant, so no dependencies needed
  );

  const handleSVGImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    alert('SVG import coming soon');
    e.target.value = '';
  };

  // Early return after all hooks have been called
  if (!glyph) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-500">
        Select a glyph
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white p-6">
      {/* Canvas toolbar */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <i className="ph ph-magnifying-glass text-sm text-neutral-400"></i>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.25"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-20"
          />
          <span className="text-xs text-neutral-500 w-10">
            {(zoom * 100).toFixed(0)}%
          </span>
        </div>

        <div className="w-px h-6 bg-neutral-200"></div>

        {selectedShapes.length > 0 && (
          <>
            <div className="flex gap-1">
              <button
                onClick={handleFlipHorizontal}
                className="tool-btn px-2 py-1.5 rounded text-xs"
                title="Flip Horizontal (H)"
              >
                <i className="ph ph-arrows-left-right text-base"></i>
              </button>
              <button
                onClick={handleFlipVertical}
                className="tool-btn px-2 py-1.5 rounded text-xs"
                title="Flip Vertical (Shift+V)"
              >
                <i className="ph ph-arrows-down-up text-base"></i>
              </button>
              <button
                onClick={handleRotate90}
                className="tool-btn px-2 py-1.5 rounded text-xs"
                title="Rotate 90° (R)"
              >
                <i className="ph ph-arrow-clockwise text-base"></i>
              </button>
            </div>

            <div className="w-px h-6 bg-neutral-200"></div>

            <button
              onClick={() => selectedShapeIds.forEach(id => onDuplicateShape(id))}
              className="tool-btn px-2 py-1.5 rounded text-xs"
              title="Duplicate (Ctrl+D)"
            >
              <i className="ph ph-copy text-base"></i>
            </button>

            <div className="w-px h-6 bg-neutral-200"></div>

            <div className="flex gap-1">
              <button
                onClick={() => handleAlignShape(AlignmentType.LEFT)}
                className="tool-btn px-2 py-1.5 rounded text-xs"
                title="Align Left (Shift+L)"
              >
                <i className="ph ph-align-left text-base"></i>
              </button>
              <button
                onClick={() => handleAlignShape(AlignmentType.CENTER_H)}
                className="tool-btn px-2 py-1.5 rounded text-xs"
                title="Center H (Shift+C)"
              >
                <i className="ph ph-align-center-horizontal text-base"></i>
              </button>
              <button
                onClick={() => handleAlignShape(AlignmentType.RIGHT)}
                className="tool-btn px-2 py-1.5 rounded text-xs"
                title="Align Right (Shift+R)"
              >
                <i className="ph ph-align-right text-base"></i>
              </button>
              <div className="w-px h-4 bg-neutral-200 mx-1"></div>
              <button
                onClick={() => handleAlignShape(AlignmentType.TOP)}
                className="tool-btn px-2 py-1.5 rounded text-xs"
                title="Align Top (Shift+T)"
              >
                <i className="ph ph-align-top text-base"></i>
              </button>
              <button
                onClick={() => handleAlignShape(AlignmentType.CENTER_V)}
                className="tool-btn px-2 py-1.5 rounded text-xs"
                title="Center V (Shift+M)"
              >
                <i className="ph ph-align-center-vertical text-base"></i>
              </button>
              <button
                onClick={() => handleAlignShape(AlignmentType.BOTTOM)}
                className="tool-btn px-2 py-1.5 rounded text-xs"
                title="Align Bottom (Shift+B)"
              >
                <i className="ph ph-align-bottom text-base"></i>
              </button>
            </div>

            <div className="w-px h-6 bg-neutral-200"></div>

            <div className="text-xs text-neutral-500">
              {selectedShapes.length === 1 
                ? `Size: ${Math.round(selectedShapes[0].width / CELL_SIZE)}×${Math.round(selectedShapes[0].height / CELL_SIZE)}`
                : `${selectedShapes.length} shapes selected`
              }
            </div>
            <button
              onClick={() => {
                selectedShapeIds.forEach(id => onDeleteShape(id));
                setSelectedShapeIds([]);
              }}
              className="tool-btn px-3 py-1.5 rounded bg-white text-neutral-700 flex items-center gap-1.5"
              title="Delete (Del)"
            >
              <i className="ph ph-trash text-base"></i>
              <span className="text-xs">Delete</span>
            </button>
            <div className="w-px h-6 bg-neutral-200"></div>
          </>
        )}

        <div className="flex gap-1">
          <button
            onClick={onUndo}
            disabled={!history[currentGlyph] || history[currentGlyph].past.length === 0}
            className="tool-btn px-2.5 py-2 rounded bg-white text-neutral-700 disabled:opacity-30"
            title="Undo (Cmd+Z)"
          >
            <i className="ph ph-arrow-counter-clockwise text-base"></i>
          </button>
          <button
            onClick={onRedo}
            disabled={
              !history[currentGlyph] || history[currentGlyph].future.length === 0
            }
            className="tool-btn px-2.5 py-2 rounded bg-white text-neutral-700 disabled:opacity-30"
            title="Redo (Cmd+Shift+Z)"
          >
            <i className="ph ph-arrow-clockwise text-base"></i>
          </button>
        </div>

        <div className="flex-1"></div>

        <button
          onClick={() => svgInputRef.current?.click()}
          className="tool-btn px-2.5 py-2 rounded bg-white text-neutral-700"
          title="Import SVG"
        >
          <i className="ph ph-upload-simple text-base"></i>
        </button>

        <button
          onClick={handleExportGlyphSVG}
          className="tool-btn px-2.5 py-2 rounded bg-white text-neutral-700"
          title="Export Glyph as SVG"
        >
          <i className="ph ph-download-simple text-base"></i>
        </button>

        <div className="w-px h-6 bg-neutral-200"></div>

        <button
          onClick={onClearGlyph}
          className="tool-btn px-2.5 py-2 rounded bg-white text-neutral-700"
          title="Clear"
        >
          <i className="ph ph-trash text-base"></i>
        </button>

        <input
          ref={svgInputRef}
          type="file"
          accept=".svg"
          onChange={handleSVGImport}
          className="hidden"
        />
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-neutral-50">
        <svg
          ref={svgRef}
          width={canvasSize * zoom}
          height={canvasSize * zoom}
          viewBox={`0 0 ${canvasSize} ${canvasSize}`}
          className={canvasCursor}
          style={{ 
            border: '1px solid #e5e5e5',
            touchAction: 'none', // Prevent scrolling on touch devices
            userSelect: 'none', // Prevent text selection during drag
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={throttledHandleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          // Also support pointer events for better touch support
          onPointerDown={handleMouseDown}
          onPointerMove={throttledHandleMouseMove}
          onPointerUp={handleMouseUp}
          onPointerLeave={handleMouseUp}
        >
          {/* Grid */}
          {gridPattern}
          <rect width={canvasSize} height={canvasSize} fill="url(#grid)" />

          {/* Shapes - render all shapes first */}
          {glyph.shapes.map((shape) => renderShapeOnly(shape))}

          {/* Selection indicators - render on top of all shapes */}
          {selectedShapes.map((shape) => renderSelectionIndicators(shape))}

          {/* Draw preview */}
          {previewBox && (
            <rect
              x={previewBox.x}
              y={previewBox.y}
              width={previewBox.width}
              height={previewBox.height}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.5"
            />
          )}
          
          {/* Selection box */}
          {selectionBox && (
            <rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3b82f6"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
