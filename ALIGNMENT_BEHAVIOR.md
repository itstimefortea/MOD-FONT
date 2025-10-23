# Alignment Controls - Expected Behavior

This document describes how the alignment controls work in the MOD FONT editor, following industry-standard practices from tools like Figma, Adobe Illustrator, and Sketch.

## Single Shape Selection

When **one shape** is selected, alignment controls align the shape to the **canvas edges**:

| Control | Keyboard | Behavior |
|---------|----------|----------|
| Align Left | Shift+L | Moves shape to x = 0 (left edge of canvas) |
| Align Right | Shift+R | Moves shape so right edge touches right canvas edge |
| Center Horizontal | Shift+C | Centers shape horizontally on canvas |
| Align Top | Shift+T | Moves shape to y = 0 (top edge of canvas) |
| Align Bottom | Shift+B | Moves shape so bottom edge touches bottom canvas edge |
| Center Vertical | Shift+M | Centers shape vertically on canvas |

## Multiple Shape Selection

When **two or more shapes** are selected, alignment controls align shapes **relative to each other**:

### Horizontal Alignment

#### Align Left (Shift+L)
- **Finds**: The leftmost LEFT edge among all selected shapes
- **Action**: Moves all shapes so their LEFT edges align to this position
- **Example**:
  ```
  Before:        After:
  □   □          □
                 □
  ```

#### Align Right (Shift+R)
- **Finds**: The rightmost RIGHT edge among all selected shapes
- **Action**: Moves all shapes so their RIGHT edges align to this position
- **Example**:
  ```
  Before:        After:
  □   □              □
                     □
  ```

#### Center Horizontal (Shift+C)
- **Calculates**: The average of all shape center X positions
- **Action**: Moves all shapes so their horizontal centers align to this average position
- **Example**:
  ```
  Before:        After:
  □     □         □
                  □
  ```
- **Important**: Both shapes move toward each other to meet in the middle
- Shapes align their CENTER points vertically (forming a vertical centerline)
- Each click produces the same result (no incremental movement)

### Vertical Alignment

#### Align Top (Shift+T)
- **Finds**: The topmost TOP edge among all selected shapes
- **Action**: Moves all shapes so their TOP edges align to this position
- **Example**:
  ```
  Before:        After:
  □              □ □
    □
  ```

#### Align Bottom (Shift+B)
- **Finds**: The bottommost BOTTOM edge among all selected shapes
- **Action**: Moves all shapes so their BOTTOM edges align to this position
- **Example**:
  ```
  Before:        After:
  □
    □            □ □
  ```

#### Center Vertical (Shift+M)
- **Calculates**: The average of all shape center Y positions
- **Action**: Moves all shapes so their vertical centers align to this average position
- **Example**:
  ```
  Before:        After:
  □              □
      □          □
  ```
- **Important**: Both shapes move toward each other to meet in the middle
- Shapes align their CENTER points horizontally (forming a horizontal centerline)
- Each click produces the same result (no incremental movement)

## Technical Implementation

### Selection Bounding Box Calculation

For multiple shapes, we calculate the bounding box as:

```typescript
minX = Math.min(...shapes.map(s => s.x))
maxX = Math.max(...shapes.map(s => s.x + s.width))
minY = Math.min(...shapes.map(s => s.y))
maxY = Math.max(...shapes.map(s => s.y + s.height))
```

### Alignment Formulas

#### Left Alignment
```typescript
targetX = Math.min(...shapes.map(s => s.x))
// Each shape: newX = targetX
```

#### Right Alignment
```typescript
rightEdge = Math.max(...shapes.map(s => s.x + s.width))
// Each shape: newX = rightEdge - shape.width
```

#### Center Horizontal
```typescript
centerXs = shapes.map(s => s.x + s.width / 2)
avgCenterX = centerXs.reduce((sum, cx) => sum + cx) / centerXs.length
// Each shape: newX = avgCenterX - shape.width / 2
```

#### Top Alignment
```typescript
targetY = Math.min(...shapes.map(s => s.y))
// Each shape: newY = targetY
```

#### Bottom Alignment
```typescript
bottomEdge = Math.max(...shapes.map(s => s.y + s.height))
// Each shape: newY = bottomEdge - shape.height
```

#### Center Vertical
```typescript
centerYs = shapes.map(s => s.y + s.height / 2)
avgCenterY = centerYs.reduce((sum, cy) => sum + cy) / centerYs.length
// Each shape: newY = avgCenterY - shape.height / 2
```

## Key Principles

1. **Predictability**: Running the same alignment multiple times should produce identical results
2. **No Side Effects**: Alignment only affects position (x, y), never size or rotation
3. **Relative Positioning**: Multi-selection alignment preserves the concept of "relative to the group"
4. **Single History Entry**: All shape updates from one alignment operation count as one undo/redo action

## Testing Checklist

When testing alignment controls, verify:

- [ ] Single shape aligns to canvas edges correctly
- [ ] Multiple shapes align to each other, not to canvas
- [ ] Align Left: all left edges line up
- [ ] Align Right: all right edges line up
- [ ] Center Horizontal: all centers line up vertically down the middle
- [ ] Align Top: all top edges line up
- [ ] Align Bottom: all bottom edges line up
- [ ] Center Vertical: all centers line up horizontally through the middle
- [ ] Clicking alignment multiple times produces the same result (idempotent)
- [ ] Undo reverts all shapes from alignment as one operation
- [ ] Alignment works with shapes of different sizes
- [ ] Alignment works with 2, 3, 4+ shapes selected
