# Resizable Panels - Implementation Guide

## Overview

All panels in the MOD FONT editor are now resizable, allowing users to customize their workspace layout. The implementation follows best practices from professional tools like VS Code, Figma, and Adobe products.

## Panel Configuration

### Left Sidebar (Glyph Grid)
- **Default Size**: 280px
- **Min Size**: 200px
- **Max Size**: 500px
- **Resize Direction**: Horizontal (drag left/right edge)
- **Storage Key**: `panel-glyph-grid-width`

### Right Sidebar (Inspector/Properties)
- **Default Size**: 320px
- **Min Size**: 250px
- **Max Size**: 600px
- **Resize Direction**: Horizontal (drag left/right edge)
- **Storage Key**: `panel-inspector-width`

### Bottom Panel (Preview/Test Area)
- **Default Size**: 120px
- **Min Size**: 80px
- **Max Size**: 300px
- **Resize Direction**: Vertical (drag top/bottom edge)
- **Storage Key**: `panel-preview-height`

## User Experience Features

### Visual Affordances

1. **Hover State**
   - When hovering over a panel edge, a blue highlight appears
   - Cursor changes to indicate resize direction:
     - `col-resize` for horizontal panels (↔)
     - `row-resize` for vertical panels (↕)

2. **Active Dragging**
   - Blue indicator remains visible while dragging
   - Smooth, real-time resize feedback
   - Mouse capture prevents losing drag when moving quickly

3. **Hit Area**
   - Invisible expanded hit area (8px) for easier grabbing
   - No need for pixel-perfect cursor placement

### Interaction Behavior

1. **Click and Drag**
   - Click on the edge between panels
   - Drag to resize
   - Release to finalize size

2. **Constraints**
   - Panels cannot be resized below minimum size
   - Panels cannot be resized above maximum size
   - Smooth clamping at boundaries

3. **Persistence**
   - Panel sizes are saved to localStorage
   - Sizes persist across browser sessions
   - Each panel has a unique storage key

## Technical Implementation

### ResizablePanel Component

Location: `src/components/ResizablePanel.tsx`

#### Props

```typescript
interface ResizablePanelProps {
  children: React.ReactNode;
  defaultSize: number;        // Initial size in pixels
  minSize?: number;           // Minimum size (default: 200)
  maxSize?: number;           // Maximum size (default: 800)
  direction: 'horizontal' | 'vertical';
  position: 'left' | 'right' | 'top' | 'bottom';
  storageKey?: string;        // For localStorage persistence
  className?: string;
}
```

#### Key Features

1. **State Management**
   - Uses React useState for current size
   - Refs for tracking drag state (prevents stale closures)
   - Local storage integration for persistence

2. **Event Handling**
   - MouseDown: Initiates resize, captures start position
   - MouseMove: Calculates delta and updates size (global listener)
   - MouseUp: Finalizes resize, removes global listeners

3. **Direction Handling**
   - Horizontal: Resizes width, responds to X-axis movement
   - Vertical: Resizes height, responds to Y-axis movement
   - Position affects delta calculation (right/bottom inverts delta)

4. **Visual Feedback**
   - Hover state management
   - Dynamic cursor classes
   - Conditional indicator rendering

### Layout Structure

```
App
├── Toolbar (fixed height)
├── ShapePalette (fixed height)
└── Main Content (flex-1)
    ├── Horizontal Layout (flex-1)
    │   ├── ResizablePanel (left - GlyphGrid)
    │   ├── Center Area (flex-1 - EditorCanvas)
    │   └── ResizablePanel (right - Inspector)
    └── ResizablePanel (bottom - PreviewBar)
```

## Best Practices Followed

### 1. **Progressive Disclosure**
- Resize handles are subtle by default
- Clear affordance on hover
- No visual clutter when not in use

### 2. **Predictable Behavior**
- Resize direction matches cursor icon
- Smooth, linear resize (no acceleration/easing)
- Consistent hit area across all panels

### 3. **User Control**
- Min/max constraints prevent unusable layouts
- Persistence respects user preferences
- No automatic resizing without user action

### 4. **Performance**
- Uses RAF throttling (implicit through React updates)
- Minimal reflows during drag
- Efficient event listener management

### 5. **Accessibility**
- Clear cursor indicators
- Sufficient hit area (8px) for easy interaction
- Visual feedback during interaction

## Edge Cases Handled

1. **Rapid Mouse Movement**
   - Global mouse listeners prevent losing drag
   - Mouse capture during resize

2. **Browser Resize**
   - Panels maintain proportions when possible
   - Min/max constraints prevent overflow

3. **Persistence Edge Cases**
   - Invalid localStorage values are clamped to min/max
   - Missing values fall back to defaults
   - Type checking on retrieved values

4. **Multiple Panels**
   - Independent resize state for each panel
   - No interference between panel resizes
   - Unique storage keys prevent conflicts

## Future Enhancements

Potential improvements (not currently implemented):

1. **Double-Click to Reset**
   - Double-click resize handle to return to default size

2. **Keyboard Shortcuts**
   - Cmd+B to toggle left sidebar
   - Cmd+Shift+B to toggle right sidebar
   - Cmd+J to toggle bottom panel

3. **Preset Layouts**
   - Save/load custom workspace layouts
   - Default layouts for different tasks

4. **Responsive Breakpoints**
   - Automatic panel hiding on small screens
   - Overlay mode for mobile devices

5. **Snap Points**
   - Subtle magnetic effect at default sizes
   - Visual guides for common layouts

## Testing Checklist

- [ ] Left panel resizes smoothly left/right
- [ ] Right panel resizes smoothly left/right
- [ ] Bottom panel resizes smoothly up/down
- [ ] Hover shows blue indicator
- [ ] Cursor changes appropriately
- [ ] Min/max constraints work
- [ ] Sizes persist after refresh
- [ ] No layout breaks at extreme sizes
- [ ] Dragging works with rapid mouse movement
- [ ] Multiple panels can be resized independently
- [ ] Center canvas remains responsive
