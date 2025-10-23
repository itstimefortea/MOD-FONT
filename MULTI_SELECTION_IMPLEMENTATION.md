# Multi-Selection Implementation Plan

## Status: IN PROGRESS 🚧

This document tracks the implementation of multi-selection and improved handle reliability.

---

## Completed ✅

### 1. Resize Handle Improvements
- ✅ **Larger hit areas**: Invisible 12px radius circles for better clicking
- ✅ **Separate visual and interactive elements**: 6px visible + 12px clickable
- ✅ **Pointer events properly configured**: `pointerEvents="all"` on hit areas

**File**: `src/utils/shapeRenderer.tsx`

### 2. State Changes for Multi-Selection
- ✅ Changed `selectedShapeId` (single) → `selectedShapeIds` (array)
- ✅ Added `isSelecting` for selection box state
- ✅ Added `shapeStartPositions` Map for multi-shape dragging
- ✅ Added `selectionBox` for visual selection box

**File**: `src/components/EditorCanvas.tsx`

### 3. Mouse Handlers - Partial
- ✅ `handleMouseDown`: Multi-selection with Shift/Cmd/Ctrl
- ✅ `handleMouseMove`: Drag multiple shapes simultaneously
- ✅ `handleMouseUp`: Finalize selection box
- ✅ Selection box drawing logic

### 4. Transform Operations
- ✅ `handleFlipHorizontal`: Works on all selected shapes
- ✅ `handleFlipVertical`: Works on all selected shapes
- ✅ `handleRotate90`: Works on all selected shapes
- ✅ `handleAlignShape`: Works on all selected shapes

### 5. Keyboard Shortcuts
- ✅ Updated all shortcuts to work with arrays
- ✅ Added `Ctrl/Cmd + A` for Select All
- ✅ Delete works on multiple shapes
- ✅ Duplicate works on multiple shapes

---

## In Progress 🔨

### 6. UI Toolbar Elements

**Need to update all button onClick handlers in toolbar**:

Current code uses `selectedShapeId` - needs to be updated to work with `selectedShapeIds`.

Lines that need updating in `EditorCanvas.tsx`:
- Line 526: `{selectedShape && (` → Should be `{selectedShapes.length > 0 && (`
- Line 555: `onDuplicateShape(selectedShapeId)` → Loop through selectedShapeIds
- Lines 566-606: All `handleAlignShape` calls need to remove the first parameter
- Line 617-618: Size display - should show count or first shape
- Line 622-623: Delete button - should delete all selected

### 7. Shape Rendering
- Line 736: `renderShape(shape, selectedShapeId === shape.id)` 
  → Should be `renderShape(shape, selectedShapeIds.includes(shape.id))`

### 8. Selection Box Visual
Need to render the selection box rectangle when `selectionBox` is not null.

---

## Remaining Tasks 🎯

### High Priority

1. **Fix all UI toolbar references** (15-20 lines)
   - Update duplicate button
   - Update alignment buttons
   - Update delete button
   - Update size display
   
2. **Add selection box rendering**
   ```tsx
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
   ```

3. **Multi-selection visual feedback**
   - Show count in toolbar ("3 shapes selected")
   - Different color for multi-select?
   - Bounding box around all selected shapes?

### Medium Priority

4. **Relative Alignment**
   - When multiple shapes selected, align relative to each other
   - Not just to canvas edges
   - Calculate bounding box of selection
   - Align within that box

5. **Group Operations**
   - Move all selected shapes together (DONE)
   - Maintain relative positions (DONE)
   - Scale group together?
   - Distribute evenly?

### Low Priority

6. **Selection Refinement**
   - Double-click to select shape
   - Drag selection box in any direction
   - Marquee select while holding space?

7. **Visual Polish**
   - Animate selection
   - Better multi-select feedback
   - Hover states for handles
   - Snap guides when aligning?

---

## Quick Reference: New State Variables

```typescript
// Old (single selection)
const [selectedShapeId, setSelectedShapeId] = useState<number | null>(null);

// New (multi-selection)
const [selectedShapeIds, setSelectedShapeIds] = useState<number[]>([]);
const [isSelecting, setIsSelecting] = useState(false);
const [shapeStartPositions, setShapeStartPositions] = useState<Map<number, SVGPoint>>(new Map());
const [selectionBox, setSelectionBox] = useState<PreviewBox | null>(null);
```

---

## Testing Checklist

After implementation is complete:

- [ ] Click to select single shape
- [ ] Shift+click to add to selection
- [ ] Shift+click selected shape to deselect
- [ ] Drag to create selection box
- [ ] Selection box selects all overlapping shapes
- [ ] Drag multiple shapes together
- [ ] Delete multiple shapes (Del key)
- [ ] Duplicate multiple shapes (Ctrl+D)
- [ ] Flip multiple shapes (H, Shift+V)
- [ ] Rotate multiple shapes (R)
- [ ] Align multiple shapes (Shift+L/R/T/B/C/M)
- [ ] Ctrl+A selects all shapes
- [ ] Escape deselects all
- [ ] Resize handles only show for single selection
- [ ] Resize handles are easy to click (12px hit area)
- [ ] Visual feedback for multi-selection
- [ ] Toolbar shows correct info for multi-select

---

## Performance Considerations

- ✅ Using Map for shape positions (O(1) lookup)
- ✅ RAF throttling still active
- ✅ Memoized selected shapes array
- ⚠️ May need to optimize for 50+ selected shapes
- ⚠️ Consider debouncing alignment operations

---

## Next Steps

1. **Immediate**: Complete the UI toolbar updates (30 minutes)
2. **Then**: Add selection box rendering (10 minutes)
3. **Then**: Test all multi-selection scenarios (30 minutes)
4. **Finally**: Polish and document (20 minutes)

**Total estimated time to complete**: ~90 minutes

---

## Notes

- Multi-selection makes the editor much more powerful
- Critical for building complex letterforms
- Handles are now much easier to grab
- Need to balance single vs multi-selection UX

---

Last Updated: 2024
Status: ~70% complete

