import { useState, useCallback, useRef, useEffect } from 'react';
import { Font, History, Shape, Glyph } from '../types';
import { createDefaultFont } from '../utils/fontFactory';

type ShapeUpdateMap = Map<number, Partial<Shape>>;

export const useFontEditor = () => {
  const [font, setFont] = useState<Font>(createDefaultFont());
  const [currentGlyph, setCurrentGlyphState] = useState('A');
  const [history, setHistory] = useState<History>({});

  const pendingFrameRef = useRef<number | null>(null);
  const pendingShapeUpdatesRef = useRef<Map<string, ShapeUpdateMap>>(new Map());

  useEffect(() => {
    return () => {
      if (pendingFrameRef.current !== null) {
        cancelAnimationFrame(pendingFrameRef.current);
        pendingFrameRef.current = null;
      }
      pendingShapeUpdatesRef.current.clear();
    };
  }, []);

  const applyPendingShapeUpdates = useCallback(() => {
    if (pendingShapeUpdatesRef.current.size === 0) {
      return;
    }

    const updatesSnapshot = new Map(pendingShapeUpdatesRef.current);
    pendingShapeUpdatesRef.current.clear();

    setFont(prevFont => {
      let glyphsUpdated: Record<string, Glyph> | null = null;

      updatesSnapshot.forEach((shapeUpdates, glyphKey) => {
        const glyph = prevFont.glyphs[glyphKey];
        if (!glyph || shapeUpdates.size === 0) {
          return;
        }

        let mutated = false;
        const nextShapes = glyph.shapes.map(shape => {
          const update = shapeUpdates.get(shape.id);
          if (!update) {
            return shape;
          }
          mutated = true;
          return { ...shape, ...update };
        });

        if (!mutated) {
          return;
        }

        if (!glyphsUpdated) {
          glyphsUpdated = { ...prevFont.glyphs };
        }

        glyphsUpdated[glyphKey] = {
          ...glyph,
          shapes: nextShapes,
          modifiedAt: Date.now(),
        };
      });

      if (!glyphsUpdated) {
        return prevFont;
      }

      return {
        ...prevFont,
        glyphs: glyphsUpdated,
      };
    });
  }, []);

  const schedulePendingUpdate = useCallback(() => {
    if (pendingFrameRef.current !== null) {
      return;
    }

    pendingFrameRef.current = requestAnimationFrame(() => {
      pendingFrameRef.current = null;
      applyPendingShapeUpdates();

      if (pendingShapeUpdatesRef.current.size > 0) {
        schedulePendingUpdate();
      }
    });
  }, [applyPendingShapeUpdates]);

  const getGlyphSnapshot = useCallback((glyphKey: string, glyph: Glyph): Shape[] => {
    const pendingUpdates = pendingShapeUpdatesRef.current.get(glyphKey);
    if (!pendingUpdates || pendingUpdates.size === 0) {
      return glyph.shapes.map(shape => ({ ...shape }));
    }

    return glyph.shapes.map(shape => {
      const update = pendingUpdates.get(shape.id);
      return update ? { ...shape, ...update } : { ...shape };
    });
  }, []);

  const removePendingUpdateForShape = useCallback((glyphKey: string, shapeId: number) => {
    const updates = pendingShapeUpdatesRef.current.get(glyphKey);
    if (!updates) {
      return;
    }
    updates.delete(shapeId);
    if (updates.size === 0) {
      pendingShapeUpdatesRef.current.delete(glyphKey);
    }
  }, []);

  const clearPendingUpdatesForGlyph = useCallback((glyphKey: string) => {
    pendingShapeUpdatesRef.current.delete(glyphKey);
  }, []);

  const cancelScheduledFrame = useCallback(() => {
    if (pendingFrameRef.current !== null) {
      cancelAnimationFrame(pendingFrameRef.current);
      pendingFrameRef.current = null;
    }
  }, []);

  const saveToHistory = useCallback(() => {
    const glyph = font.glyphs[currentGlyph];
    if (!glyph) return;

    const snapshot = getGlyphSnapshot(currentGlyph, glyph);

    setHistory(prevHistory => {
      const hist = prevHistory[currentGlyph] || { past: [], future: [] };
      const newPast = [...hist.past, snapshot];

      if (newPast.length > 50) {
        newPast.shift();
      }

      return {
        ...prevHistory,
        [currentGlyph]: { past: newPast, future: [] },
      };
    });
    schedulePendingUpdate();
  }, [font, currentGlyph, getGlyphSnapshot, schedulePendingUpdate]);

  const addShape = useCallback(
    (shape: Shape) => {
      cancelScheduledFrame();
      applyPendingShapeUpdates();

      setFont(prevFont => {
        const glyph = prevFont.glyphs[currentGlyph];
        if (!glyph) return prevFont;

        return {
          ...prevFont,
          glyphs: {
            ...prevFont.glyphs,
            [currentGlyph]: {
              ...glyph,
              shapes: [...glyph.shapes, shape],
              modifiedAt: Date.now(),
            },
          },
        };
      });
    },
    [currentGlyph, cancelScheduledFrame, applyPendingShapeUpdates]
  );

  const updateShape = useCallback(
    (shapeId: number, updates: Partial<Shape>) => {
      if (!updates || Object.keys(updates).length === 0) {
        return;
      }

      const glyphId = currentGlyph;
      const pendingUpdates = pendingShapeUpdatesRef.current;
      let glyphUpdates = pendingUpdates.get(glyphId);

      if (!glyphUpdates) {
        glyphUpdates = new Map();
        pendingUpdates.set(glyphId, glyphUpdates);
      }

      const existing = glyphUpdates.get(shapeId);
      glyphUpdates.set(shapeId, existing ? { ...existing, ...updates } : { ...updates });

      schedulePendingUpdate();
    },
    [currentGlyph, schedulePendingUpdate]
  );

  const deleteShape = useCallback(
    (shapeId: number) => {
      const glyph = font.glyphs[currentGlyph];
      if (!glyph) return;

      saveToHistory();
      removePendingUpdateForShape(currentGlyph, shapeId);

      setFont(prevFont => {
        const targetGlyph = prevFont.glyphs[currentGlyph];
        if (!targetGlyph) return prevFont;

        const newShapes = targetGlyph.shapes.filter(s => s.id !== shapeId);
        if (newShapes.length === targetGlyph.shapes.length) {
          return prevFont;
        }

        return {
          ...prevFont,
          glyphs: {
            ...prevFont.glyphs,
            [currentGlyph]: {
              ...targetGlyph,
              shapes: newShapes,
              modifiedAt: Date.now(),
            },
          },
        };
      });
    },
    [font, currentGlyph, saveToHistory, removePendingUpdateForShape]
  );

  const duplicateShape = useCallback(
    (shapeId: number) => {
      const glyph = font.glyphs[currentGlyph];
      if (!glyph) return;

      const snapshot = getGlyphSnapshot(currentGlyph, glyph);
      const shape = snapshot.find(s => s.id === shapeId);
      if (!shape) return;

      saveToHistory();

      const cellSize = 32;
      const newShape: Shape = {
        ...shape,
        id: Date.now() + Math.random(),
        x: shape.x + cellSize,
        y: shape.y + cellSize,
      };

      setFont(prevFont => {
        const targetGlyph = prevFont.glyphs[currentGlyph];
        if (!targetGlyph) return prevFont;

        return {
          ...prevFont,
          glyphs: {
            ...prevFont.glyphs,
            [currentGlyph]: {
              ...targetGlyph,
              shapes: [...targetGlyph.shapes, newShape],
              modifiedAt: Date.now(),
            },
          },
        };
      });
    },
    [font, currentGlyph, getGlyphSnapshot, saveToHistory]
  );

  const clearGlyph = useCallback(() => {
    const glyph = font.glyphs[currentGlyph];
    if (!glyph) return;

    if (glyph.shapes.length > 0) {
      if (!confirm(`Clear all shapes from "${glyph.char}"?`)) return;
    }

    saveToHistory();
    cancelScheduledFrame();
    clearPendingUpdatesForGlyph(currentGlyph);

    setFont(prevFont => {
      const targetGlyph = prevFont.glyphs[currentGlyph];
      if (!targetGlyph) return prevFont;

      return {
        ...prevFont,
        glyphs: {
          ...prevFont.glyphs,
          [currentGlyph]: { ...targetGlyph, shapes: [], modifiedAt: Date.now() },
        },
      };
    });
  }, [font, currentGlyph, saveToHistory, cancelScheduledFrame, clearPendingUpdatesForGlyph]);

  const undo = useCallback(() => {
    const hist = history[currentGlyph];
    if (!hist || hist.past.length === 0) return;

    cancelScheduledFrame();
    clearPendingUpdatesForGlyph(currentGlyph);

    const glyph = font.glyphs[currentGlyph];
    if (!glyph) return;

    const previous = hist.past[hist.past.length - 1];
    const newPast = hist.past.slice(0, -1);
    const newFuture = [[...getGlyphSnapshot(currentGlyph, glyph)], ...hist.future];

    setFont(prevFont => {
      const targetGlyph = prevFont.glyphs[currentGlyph];
      if (!targetGlyph) return prevFont;

      return {
        ...prevFont,
        glyphs: {
          ...prevFont.glyphs,
          [currentGlyph]: { ...targetGlyph, shapes: previous, modifiedAt: Date.now() },
        },
      };
    });

    setHistory(prevHistory => ({
      ...prevHistory,
      [currentGlyph]: { past: newPast, future: newFuture },
    }));
  }, [font, currentGlyph, history, getGlyphSnapshot, cancelScheduledFrame, clearPendingUpdatesForGlyph]);

  const redo = useCallback(() => {
    const hist = history[currentGlyph];
    if (!hist || hist.future.length === 0) return;

    cancelScheduledFrame();
    clearPendingUpdatesForGlyph(currentGlyph);

    const glyph = font.glyphs[currentGlyph];
    if (!glyph) return;

    const next = hist.future[0];
    const newPast = [...hist.past, [...getGlyphSnapshot(currentGlyph, glyph)]];
    const newFuture = hist.future.slice(1);

    setFont(prevFont => {
      const targetGlyph = prevFont.glyphs[currentGlyph];
      if (!targetGlyph) return prevFont;

      return {
        ...prevFont,
        glyphs: {
          ...prevFont.glyphs,
          [currentGlyph]: { ...targetGlyph, shapes: next, modifiedAt: Date.now() },
        },
      };
    });

    setHistory(prevHistory => ({
      ...prevHistory,
      [currentGlyph]: { past: newPast, future: newFuture },
    }));
  }, [font, currentGlyph, history, getGlyphSnapshot, cancelScheduledFrame, clearPendingUpdatesForGlyph]);

  const updateGlyph = useCallback(
    <K extends keyof Glyph>(prop: K, value: Glyph[K]) => {
      cancelScheduledFrame();
      applyPendingShapeUpdates();

      setFont(prevFont => {
        const glyph = prevFont.glyphs[currentGlyph];
        if (!glyph) return prevFont;

        return {
          ...prevFont,
          glyphs: {
            ...prevFont.glyphs,
            [currentGlyph]: { ...glyph, [prop]: value, modifiedAt: Date.now() },
          },
        };
      });
    },
    [currentGlyph, cancelScheduledFrame, applyPendingShapeUpdates]
  );

  const updateMetrics = useCallback(
    (updates: Partial<typeof font.metrics>) => {
      setFont(prevFont => ({
        ...prevFont,
        metrics: { ...prevFont.metrics, ...updates },
      }));
    },
    []
  );

  const importFont = useCallback(
    (fontData: Font) => {
      cancelScheduledFrame();
      pendingShapeUpdatesRef.current.clear();
      setFont(fontData);
      setHistory({});
      setCurrentGlyphState(Object.keys(fontData.glyphs)[0] ?? 'A');
    },
    [cancelScheduledFrame]
  );

  const setCurrentGlyph = useCallback(
    (glyphKey: string) => {
      cancelScheduledFrame();
      applyPendingShapeUpdates();
      setCurrentGlyphState(glyphKey);
    },
    [cancelScheduledFrame, applyPendingShapeUpdates]
  );

  return {
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
  };
};
