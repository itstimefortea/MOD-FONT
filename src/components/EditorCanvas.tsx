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
  onDeleteShapes: (shapeIds: number[]) => void;
  onClearGlyph: () => void;
  onUndo: () => void;
  onRedo: () => void;
  history: History;
  saveToHistory: () => void;
  onDuplicateShape: (shapeId: number) => void;
  onUpdateMetrics: (updates: Partial<Font['metrics']>) => void;
  selectedShapeIds: number[];
  onSelectionChange: (ids: number[]) => void;
  onAlign: (alignment: AlignmentType) => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  font,
  currentGlyph,
  selectedShapeType,
  tool,
  onToolChange,
  onAddShape,
  onUpdateShape,
  onDeleteShapes,
  onClearGlyph,
  onUndo,
  onRedo,
  history,
  saveToHistory,
  onDuplicateShape,
  onUpdateMetrics,
  selectedShapeIds,
  onSelectionChange,
  onAlign,
  onCopy,
  onCut,
  onPaste,
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
  const [dragStart, setDragStart] = useState<SVGPoint | null>(null);
  const [shapeStartPositions, setShapeStartPositions] = useState<Map<number, SVGPoint>>(new Map());
  const [resizeStartShape, setResizeStartShape] = useState<Shape | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [drawStart, setDrawStart] = useState<SVGPoint | null>(null);
  const [previewBox, setPreviewBox] = useState<PreviewBox | null>(null);
  const [selectionBox, setSelectionBox] = useState<PreviewBox | null>(null);

  // Guide line state
  type MetricGuide = 'baseline' | 'xHeight' | 'capHeight' | 'ascender' | 'descender';
  const [isDraggingGuide, setIsDraggingGuide] = useState(false);
  const [draggedGuide, setDraggedGuide] = useState<MetricGuide | null>(null);
  const [hoveredGuide, setHoveredGuide] = useState<MetricGuide | null>(null);
  const [showGuides, setShowGuides] = useState(true);
  const [guidesLocked, setGuidesLocked] = useState(true);

  // Calculate grid and canvas size - use default if glyph is not available
  const gridSize = glyph?.gridSize || 16;
  const canvasSize = gridSize * CELL_SIZE;

  // Convert metric value to canvas Y coordinate
  // Metrics: baseline=0, positive up, negative down
  // Canvas: Y=0 at top, increases downward
  const metricToY = useCallback((metricValue: number) => {
    return canvasSize - (metricValue * CELL_SIZE);
  }, [canvasSize]);

  // Convert canvas Y coordinate to metric value
  const yToMetric = useCallback((y: number) => {
    return (canvasSize - y) / CELL_SIZE;
  }, [canvasSize]);

  // Get Y position for each guide
  const getGuideY = useCallback((guide: MetricGuide): number => {
    switch (guide) {
      case 'baseline': return metricToY(font.metrics.baseline);
      case 'xHeight': return metricToY(font.metrics.xHeight);
      case 'capHeight': return metricToY(font.metrics.capHeight);
      case 'ascender': return metricToY(font.metrics.ascender);
      case 'descender': return metricToY(font.metrics.descender);
    }
  }, [font.metrics, metricToY]);

  // Check if point is near a guide line (within 6 pixels)
  const getGuideAtPoint = useCallback((y: number): MetricGuide | null => {
    if (!showGuides || guidesLocked) return null;

    const guides: MetricGuide[] = ['baseline', 'xHeight', 'capHeight', 'ascender', 'descender'];
    const threshold = 6;

    for (const guide of guides) {
      const guideY = getGuideY(guide);
      if (Math.abs(y - guideY) < threshold) {
        return guide;
      }
    }
    return null;
  }, [showGuides, guidesLocked, getGuideY]);

  // Update metrics when dragging guide
  const updateGuideMetric = useCallback((guide: MetricGuide, y: number) => {
    const metricValue = Math.round(yToMetric(y));

    switch (guide) {
      case 'baseline':
        onUpdateMetrics({ baseline: metricValue });
        break;
      case 'xHeight':
        onUpdateMetrics({ xHeight: metricValue });
        break;
      case 'capHeight':
        onUpdateMetrics({ capHeight: metricValue });
        break;
      case 'ascender':
        onUpdateMetrics({ ascender: metricValue });
        break;
      case 'descender':
        onUpdateMetrics({ descender: metricValue });
        break;
    }
  }, [yToMetric, onUpdateMetrics]);

  // All hooks must be called before any conditional returns
  const { flipHorizontal, flipVertical, rotate90 } = useShapeTransform(
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
    onSelectionChange([]);
    setDragStart(null);
    setShapeStartPositions(new Map());
    setResizeStartShape(null);
    setResizeHandle(null);
    setDrawStart(null);
    setPreviewBox(null);
    setSelectionBox(null);
  }, [glyph?.char, onSelectionChange]);

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

      // Check for guide line drag first (highest priority)
      const guideAtPoint = getGuideAtPoint(point.y);
      if (guideAtPoint) {
        e.preventDefault();
        setIsDraggingGuide(true);
        setDraggedGuide(guideAtPoint);
        return;
      }

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

          const isModifierPressed = e.shiftKey || e.metaKey || e.ctrlKey;
          const isAlreadySelected = selectedShapeIds.includes(clickedShape.id);

          if (isModifierPressed) {
            if (isAlreadySelected) {
              onSelectionChange(selectedShapeIds.filter(id => id !== clickedShape.id));
            } else {
              onSelectionChange([...selectedShapeIds, clickedShape.id]);
            }
          } else {
            const selectionForDrag = isAlreadySelected ? selectedShapeIds : [clickedShape.id];
            if (!isAlreadySelected) {
              onSelectionChange(selectionForDrag);
            }

            setIsDragging(true);
            setDragStart(point);

            const positions = new Map<number, SVGPoint>();
            selectionForDrag.forEach(id => {
              const shape = glyph.shapes.find(s => s.id === id);
              if (shape) {
                positions.set(id, { x: shape.x, y: shape.y });
              }
            });
            setShapeStartPositions(positions);
          }
        } else {
          // Click on empty space - start selection box
          if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
            onSelectionChange([]);
          }
          setIsSelecting(true);
          setDragStart(point);
        }
      }
    },
    [tool, selectedShapeIds, selectedShapeType, glyph, getGuideAtPoint, onSelectionChange]
  );

  // Throttled mouse move handler for smooth 60fps performance
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement> | React.PointerEvent<SVGSVGElement>) => {
    const point = getSVGPoint(e, svgRef.current);

    // Handle guide dragging
    if (isDraggingGuide && draggedGuide) {
      updateGuideMetric(draggedGuide, point.y);
      return;
    }

    // Update hover state for guides (only when not dragging anything else)
    if (!isDragging && !isResizing && !isSelecting && !drawStart) {
      const guideAtPoint = getGuideAtPoint(point.y);
      setHoveredGuide(guideAtPoint);
    }

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
    isDraggingGuide,
    draggedGuide,
    selectedShapeIds,
    dragStart,
    shapeStartPositions,
    resizeHandle,
    resizeStartShape,
    canvasSize,
    onUpdateShape,
    updateGuideMetric,
    getGuideAtPoint,
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
    // Handle guide dragging end
    if (isDraggingGuide) {
      setIsDraggingGuide(false);
      setDraggedGuide(null);
      return;
    }

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
      onSelectionChange(selectedIds);
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
    isDraggingGuide,
    saveToHistory,
    onAddShape,
    selectedShapeType,
    glyph,
    onSelectionChange,
  ]);

  // Keyboard shortcuts - now supports multiple selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (!glyph) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedShapeIds.length > 0) {
          e.preventDefault();
          onDeleteShapes(selectedShapeIds);
          onSelectionChange([]);
        }
      } else if ((e.key === 'c' || e.key === 'C') && (e.ctrlKey || e.metaKey)) {
        // Copy selected shapes
        e.preventDefault();
        onCopy();
      } else if ((e.key === 'x' || e.key === 'X') && (e.ctrlKey || e.metaKey)) {
        // Cut selected shapes
        e.preventDefault();
        onCut();
      } else if ((e.key === 'v' || e.key === 'V') && (e.ctrlKey || e.metaKey)) {
        // Paste shapes from clipboard
        e.preventDefault();
        onPaste();
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
        onSelectionChange([]);
      } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        // Select all shapes
        e.preventDefault();
        onSelectionChange(glyph.shapes.map(s => s.id));
      } else if ((e.key === 'h' || e.key === 'H') && selectedShapeIds.length > 0) {
        e.preventDefault();
        handleFlipHorizontal();
      } else if ((e.key === 'r' || e.key === 'R') && selectedShapeIds.length > 0) {
        e.preventDefault();
        handleRotate90();
      } else if (e.shiftKey && selectedShapeIds.length > 0) {
        if (e.key === 'L') {
          e.preventDefault();
          onAlign(AlignmentType.LEFT);
        } else if (e.key === 'R') {
          e.preventDefault();
          onAlign(AlignmentType.RIGHT);
        } else if (e.key === 'T') {
          e.preventDefault();
          onAlign(AlignmentType.TOP);
        } else if (e.key === 'B') {
          e.preventDefault();
          onAlign(AlignmentType.BOTTOM);
        } else if (e.key === 'C') {
          e.preventDefault();
          onAlign(AlignmentType.CENTER_H);
        } else if (e.key === 'M') {
          e.preventDefault();
          onAlign(AlignmentType.CENTER_V);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedShapeIds,
    glyph,
    onDeleteShapes,
    onToolChange,
    handleFlipHorizontal,
    handleFlipVertical,
    handleRotate90,
    onDuplicateShape,
    onAlign,
    onSelectionChange,
    onCopy,
    onCut,
    onPaste,
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

            <div className="text-xs text-neutral-500">
              {selectedShapes.length === 1 
                ? `Size: ${Math.round(selectedShapes[0].width / CELL_SIZE)}×${Math.round(selectedShapes[0].height / CELL_SIZE)}`
                : `${selectedShapes.length} shapes selected`
              }
            </div>
            <button
              onClick={() => {
                if (selectedShapeIds.length > 0) {
                  onDeleteShapes(selectedShapeIds);
                  onSelectionChange([]);
                }
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
          onClick={() => setShowGuides(!showGuides)}
          className={`tool-btn px-2.5 py-2 rounded ${showGuides ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-neutral-700'}`}
          title={showGuides ? 'Hide Guides' : 'Show Guides'}
        >
          <i className="ph ph-ruler text-base"></i>
        </button>

        {showGuides && (
          <button
            onClick={() => setGuidesLocked(!guidesLocked)}
            className={`tool-btn px-2.5 py-2 rounded ${!guidesLocked ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-white text-neutral-700'}`}
            title={guidesLocked ? 'Unlock Guides to Edit' : 'Lock Guides'}
          >
            <i className={`ph ${guidesLocked ? 'ph-lock' : 'ph-lock-open'} text-base`}></i>
          </button>
        )}

        <div className="w-px h-6 bg-neutral-200"></div>

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

          {/* Guide lines */}
          {showGuides && (
            <g className="guides">
              {/* Ascender */}
              <line
                x1="0"
                y1={getGuideY('ascender')}
                x2={canvasSize}
                y2={getGuideY('ascender')}
                stroke={hoveredGuide === 'ascender' || draggedGuide === 'ascender' ? '#3b82f6' : (guidesLocked ? '#cbd5e1' : '#94a3b8')}
                strokeWidth={hoveredGuide === 'ascender' || draggedGuide === 'ascender' ? '2' : '1'}
                strokeDasharray="4 4"
                opacity={guidesLocked ? '0.5' : '1'}
                style={{ cursor: guidesLocked ? 'default' : 'ns-resize' }}
              />
              {!guidesLocked && (hoveredGuide === 'ascender' || draggedGuide === 'ascender') && (
                <text
                  x="4"
                  y={getGuideY('ascender') - 4}
                  fontSize="10"
                  fill="#3b82f6"
                  fontFamily="system-ui"
                >
                  Ascender ({font.metrics.ascender})
                </text>
              )}

              {/* Cap Height */}
              <line
                x1="0"
                y1={getGuideY('capHeight')}
                x2={canvasSize}
                y2={getGuideY('capHeight')}
                stroke={hoveredGuide === 'capHeight' || draggedGuide === 'capHeight' ? '#8b5cf6' : (guidesLocked ? '#cbd5e1' : '#94a3b8')}
                strokeWidth={hoveredGuide === 'capHeight' || draggedGuide === 'capHeight' ? '2' : '1'}
                strokeDasharray="4 4"
                opacity={guidesLocked ? '0.5' : '1'}
                style={{ cursor: guidesLocked ? 'default' : 'ns-resize' }}
              />
              {!guidesLocked && (hoveredGuide === 'capHeight' || draggedGuide === 'capHeight') && (
                <text
                  x="4"
                  y={getGuideY('capHeight') - 4}
                  fontSize="10"
                  fill="#8b5cf6"
                  fontFamily="system-ui"
                >
                  Cap Height ({font.metrics.capHeight})
                </text>
              )}

              {/* X Height */}
              <line
                x1="0"
                y1={getGuideY('xHeight')}
                x2={canvasSize}
                y2={getGuideY('xHeight')}
                stroke={hoveredGuide === 'xHeight' || draggedGuide === 'xHeight' ? '#10b981' : (guidesLocked ? '#cbd5e1' : '#94a3b8')}
                strokeWidth={hoveredGuide === 'xHeight' || draggedGuide === 'xHeight' ? '2' : '1'}
                strokeDasharray="4 4"
                opacity={guidesLocked ? '0.5' : '1'}
                style={{ cursor: guidesLocked ? 'default' : 'ns-resize' }}
              />
              {!guidesLocked && (hoveredGuide === 'xHeight' || draggedGuide === 'xHeight') && (
                <text
                  x="4"
                  y={getGuideY('xHeight') - 4}
                  fontSize="10"
                  fill="#10b981"
                  fontFamily="system-ui"
                >
                  X-Height ({font.metrics.xHeight})
                </text>
              )}

              {/* Baseline */}
              <line
                x1="0"
                y1={getGuideY('baseline')}
                x2={canvasSize}
                y2={getGuideY('baseline')}
                stroke={hoveredGuide === 'baseline' || draggedGuide === 'baseline' ? '#ef4444' : (guidesLocked ? '#cbd5e1' : '#64748b')}
                strokeWidth={hoveredGuide === 'baseline' || draggedGuide === 'baseline' ? '3' : '2'}
                opacity={guidesLocked ? '0.5' : '1'}
                style={{ cursor: guidesLocked ? 'default' : 'ns-resize' }}
              />
              {!guidesLocked && (hoveredGuide === 'baseline' || draggedGuide === 'baseline') && (
                <text
                  x="4"
                  y={getGuideY('baseline') - 4}
                  fontSize="10"
                  fill="#ef4444"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  Baseline ({font.metrics.baseline})
                </text>
              )}

              {/* Descender */}
              <line
                x1="0"
                y1={getGuideY('descender')}
                x2={canvasSize}
                y2={getGuideY('descender')}
                stroke={hoveredGuide === 'descender' || draggedGuide === 'descender' ? '#f59e0b' : (guidesLocked ? '#cbd5e1' : '#94a3b8')}
                strokeWidth={hoveredGuide === 'descender' || draggedGuide === 'descender' ? '2' : '1'}
                strokeDasharray="4 4"
                opacity={guidesLocked ? '0.5' : '1'}
                style={{ cursor: guidesLocked ? 'default' : 'ns-resize' }}
              />
              {!guidesLocked && (hoveredGuide === 'descender' || draggedGuide === 'descender') && (
                <text
                  x="4"
                  y={getGuideY('descender') + 12}
                  fontSize="10"
                  fill="#f59e0b"
                  fontFamily="system-ui"
                >
                  Descender ({font.metrics.descender})
                </text>
              )}
            </g>
          )}

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
