import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Toolbar } from './components/Toolbar';
import { ShapePalette } from './components/ShapePalette';
import { GlyphGrid } from './components/GlyphGrid';
import { EditorCanvas } from './components/EditorCanvas';
import { Inspector } from './components/Inspector';
import { PreviewPanel } from './components/PreviewPanel';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ResizablePanel } from './components/ResizablePanel';
import { useFontEditor } from './hooks/useFontEditor';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useShapeTransform } from './hooks/useShapeTransform';
import { ShapeType, Tool, AlignmentType } from './types';
import { exportFontAsJSON, exportFontAsTTF } from './utils/exportHelpers';
import { validateFontWithErrors } from './utils/fontValidator';
import { CELL_SIZE } from './constants/shapes';

function App() {
  const {
    font,
    currentGlyph,
    history,
    setCurrentGlyph,
    saveToHistory,
    addShape,
    updateShape,
    deleteShape,
    duplicateShape,
    clearGlyph,
    undo,
    redo,
    updateGlyph,
    updateMetrics,
    importFont,
  } = useFontEditor();

  const [selectedShapeType, setSelectedShapeType] = useState(ShapeType.SQUARE);
  const [tool, setTool] = useState(Tool.DRAW);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedShapeIds, setSelectedShapeIds] = useState<number[]>([]);

  useEffect(() => {
    setSelectedShapeIds([]);
  }, [currentGlyph]);

  // Calculate canvas size for alignment operations
  const glyph = font.glyphs[currentGlyph];
  const canvasSize = useMemo(
    () => (glyph?.gridSize || 16) * CELL_SIZE,
    [glyph?.gridSize]
  );

  // Create alignment handler at App level
  const { alignShapes } = useShapeTransform(canvasSize, saveToHistory, updateShape);

  const handleAlignShape = useCallback(
    (alignment: AlignmentType) => {
      if (selectedShapeIds.length === 0 || !glyph) return;
      const selectedShapes = glyph.shapes.filter(s => selectedShapeIds.includes(s.id));
      alignShapes(selectedShapes, alignment);
    },
    [selectedShapeIds, glyph, alignShapes]
  );

  const handleExportJSON = () => {
    exportFontAsJSON(font);
  };

  const handleExportTTF = () => {
    exportFontAsTTF(font);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        const validation = validateFontWithErrors(jsonData);

        if (validation.success) {
          importFont(validation.font);
        } else {
          const errorList = validation.errors.join('\n- ');
          alert(`Failed to import font. Validation errors:\n- ${errorList}`);
          console.error('Font import validation errors:', validation.errors);
        }
      } catch (error) {
        alert('Failed to import font: Invalid JSON format');
        console.error('JSON parse error:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Global keyboard shortcuts using centralized hook
  useKeyboardShortcuts([
    {
      key: '?',
      handler: () => setShowShortcuts(true),
      description: 'Show keyboard shortcuts',
    },
    {
      key: 'z',
      ctrl: true,
      shift: false,
      handler: () => undo(),
      description: 'Undo',
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      handler: () => redo(),
      description: 'Redo',
    },
  ], [undo, redo]);

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <Toolbar
        font={font}
        onExportJSON={handleExportJSON}
        onExportTTF={handleExportTTF}
        onImportJSON={handleImportJSON}
        onShowShortcuts={() => setShowShortcuts(true)}
      />
      <ShapePalette
        selectedShape={selectedShapeType}
        onSelectShape={setSelectedShapeType}
        tool={tool}
        onToolChange={setTool}
        selectedShapeIds={selectedShapeIds}
        onAlign={handleAlignShape}
        font={font}
        currentGlyph={currentGlyph}
        onUpdateGlyph={updateGlyph}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Glyph Grid */}
          <ResizablePanel
            defaultSize={280}
            minSize={200}
            maxSize={500}
            direction="horizontal"
            position="left"
            storageKey="panel-glyph-grid-width"
          >
            <GlyphGrid
              font={font}
              currentGlyph={currentGlyph}
              onSelectGlyph={setCurrentGlyph}
            />
          </ResizablePanel>

          {/* Center - Editor Canvas */}
          <div className="flex-1 flex overflow-hidden">
            <EditorCanvas
              font={font}
              currentGlyph={currentGlyph}
              selectedShapeType={selectedShapeType}
              tool={tool}
              onToolChange={setTool}
              onAddShape={addShape}
              onUpdateShape={updateShape}
              onDeleteShape={deleteShape}
              onClearGlyph={clearGlyph}
              onUndo={undo}
              onRedo={redo}
              history={history}
              saveToHistory={saveToHistory}
              onDuplicateShape={duplicateShape}
              onUpdateMetrics={updateMetrics}
              selectedShapeIds={selectedShapeIds}
              onSelectionChange={setSelectedShapeIds}
              onAlign={handleAlignShape}
            />
          </div>

          {/* Right Sidebar - Inspector */}
          <ResizablePanel
            defaultSize={320}
            minSize={250}
            maxSize={600}
            direction="horizontal"
            position="right"
            storageKey="panel-inspector-width"
          >
            <Inspector
              font={font}
              currentGlyph={currentGlyph}
              onUpdateGlyph={updateGlyph}
              onUpdateMetrics={updateMetrics}
              selectedShapeIds={selectedShapeIds}
              onUpdateShape={updateShape}
              onSaveHistory={saveToHistory}
            />
          </ResizablePanel>
        </div>

        {/* Bottom Panel - Preview Bar */}
        <ResizablePanel
          defaultSize={120}
          minSize={80}
          maxSize={300}
          direction="vertical"
          position="bottom"
          storageKey="panel-preview-height"
        >
          <PreviewPanel font={font} />
        </ResizablePanel>
      </div>
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}

export default App;
