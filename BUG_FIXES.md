# Bug Fixes

## Recent Fixes

### Fixed: Flip Operations Move Shapes (2024)

**Problem:**
- Flipping shapes horizontally or vertically would move them across the canvas
- Expected: Shape should flip in place
- Actual: Shape position changed dramatically

**Root Cause:**
The flip functions were calculating new positions based on canvas size:
```typescript
// OLD - BUGGY CODE
let updates: Partial<Shape> = { x: canvasSize - shape.x - shape.width };
```

This moved the shape to the opposite side of the canvas instead of flipping its orientation.

**Solution:**
Changed flip operations to only modify shape orientation, not position:

```typescript
// NEW - FIXED CODE
let updates: Partial<Shape> = {};

if (shape.type === ShapeType.TRIANGLE) {
  const newRotation = (360 - shape.rotation) % 360;
  updates.rotation = newRotation;
} else if (shape.type === ShapeType.QUARTER_CIRCLE) {
  updates.corner = cornerMap[shape.corner || ArcCorner.TL];
}
// Square and Circle don't change when flipped
```

**Files Changed:**
- `src/hooks/useShapeTransform.ts`

**Testing:**
1. ✅ Create a triangle
2. ✅ Note its position
3. ✅ Press H (flip horizontal)
4. ✅ Shape flips in place, position unchanged
5. ✅ Press Shift+V (flip vertical)
6. ✅ Shape flips in place, position unchanged

---

### Fixed: Buggy Vertical Movement (2024)

**Problem:**
- Dragging shapes up and down was unreliable
- Shapes would "stick" at boundaries
- Erratic movement when approaching canvas edges
- Horizontal movement worked fine

**Root Cause:**
The dragging logic was updating `dragStart` every frame:
```typescript
// OLD - BUGGY CODE
const dx = point.x - dragStart.x;
const dy = point.y - dragStart.y;
onUpdateShape(selectedShapeId, {
  x: snapToGrid(shape.x + dx),
  y: snapToGrid(shape.y + dy),
});
setDragStart(point); // <-- Problem: updates every frame
```

When a shape hit a boundary and was clamped, the dragStart would keep moving with the mouse, causing the delta calculation to become incorrect. This was more noticeable in vertical movement.

**Example of the Bug:**
1. Shape at y=10, mouse at y=50, dragStart at y=50
2. Move mouse to y=0 (off canvas)
3. Calculate dy = 0 - 50 = -50
4. New position = 10 + (-50) = -40, **clamped to 0**
5. dragStart updated to y=0
6. Move mouse to y=-10
7. Calculate dy = -10 - 0 = -10 (wrong! should be -60)
8. Movement becomes erratic

**Solution:**
Store the shape's original position when drag starts and calculate deltas from that:

```typescript
// NEW - FIXED CODE
// On mouse down:
setDragStart(point);
setShapeStartPos({ x: clickedShape.x, y: clickedShape.y });

// On mouse move:
const dx = point.x - dragStart.x;
const dy = point.y - dragStart.y;

const newX = clamp(
  snapToGrid(shapeStartPos.x + dx),  // <-- Use original position
  0,
  canvasSize - shape.width
);
const newY = clamp(
  snapToGrid(shapeStartPos.y + dy),  // <-- Use original position
  0,
  canvasSize - shape.height
);
```

**Files Changed:**
- `src/components/EditorCanvas.tsx`

**Testing:**
1. ✅ Create a shape in the middle of canvas
2. ✅ Drag left/right - smooth movement
3. ✅ Drag up/down - smooth movement (was buggy before)
4. ✅ Drag to top edge - stays at boundary, no jumping
5. ✅ Drag to bottom edge - stays at boundary, no jumping
6. ✅ Drag diagonally - smooth in both directions

---

## Additional Improvements

### Enhanced Performance During Drag
- Removed unnecessary `setDragStart(point)` calls during drag
- More efficient state management
- Smoother 60fps performance maintained

### Better Boundary Handling
- Shapes now smoothly stop at canvas boundaries
- No erratic behavior when hitting edges
- Consistent behavior in all directions

### Code Quality
- Added `shapeStartPos` state for cleaner logic
- Improved comments explaining the approach
- More maintainable drag implementation

---

## Regression Testing Checklist

When making changes to shape manipulation, test:

- [x] Horizontal dragging
- [x] Vertical dragging  
- [x] Diagonal dragging
- [x] Dragging to canvas edges (all 4 sides)
- [x] Dragging to corners
- [x] Flip horizontal (H)
- [x] Flip vertical (Shift+V)
- [x] Rotate 90° (R)
- [x] Resize from all 4 corners
- [x] Multiple shapes selection
- [x] Undo after flip/move
- [x] Keyboard shortcuts during drag

---

## Known Issues

None currently! 🎉

If you find any bugs, please document them here with:
1. Description of the problem
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Browser/OS information

---

## Performance Monitoring

Monitor these metrics during shape manipulation:
- **FPS during drag**: Should maintain 60fps
- **Input lag**: Should be < 16ms
- **Memory usage**: Should be stable (no leaks)
- **CPU usage**: Should stay reasonable (< 50% on modern hardware)

Use browser DevTools Performance tab to profile if issues occur.

