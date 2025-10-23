# Testing Guide

## Manual Testing Checklist

Use this guide to verify all features work correctly after making changes.

---

## 🎨 Drawing & Shape Creation

### Basic Drawing
- [ ] Select Draw tool (D key)
- [ ] Select Square shape
- [ ] Click and drag to create a square
- [ ] Shape snaps to grid correctly
- [ ] Shape appears with correct fill color
- [ ] Minimum size is enforced (1 grid cell)

### All Shape Types
- [ ] Square draws correctly
- [ ] Circle draws correctly
- [ ] Triangle draws correctly (right angle at top-left)
- [ ] Quarter Circle draws correctly (arc at top-left)

### Drawing Constraints
- [ ] Cannot draw outside canvas bounds
- [ ] Shape preview shows while dragging
- [ ] Shape only created if minimum size reached
- [ ] Grid snapping works consistently

---

## 🖱️ Selection & Movement

### Shape Selection
- [ ] Switch to Select tool (V key)
- [ ] Click on shape selects it
- [ ] Blue dashed border appears around selected shape
- [ ] Corner resize handles appear
- [ ] Size indicator shows in toolbar
- [ ] Click empty area deselects

### Dragging Shapes
- [ ] **Horizontal dragging** - smooth left/right movement
- [ ] **Vertical dragging** - smooth up/down movement
- [ ] **Diagonal dragging** - smooth in all directions
- [ ] Drag to **left edge** - stops smoothly at boundary
- [ ] Drag to **right edge** - stops smoothly at boundary
- [ ] Drag to **top edge** - stops smoothly at boundary
- [ ] Drag to **bottom edge** - stops smoothly at boundary
- [ ] Drag to **corners** - stops at boundaries without jumping
- [ ] No erratic behavior when hitting edges
- [ ] 60fps smooth performance during drag

### Multi-Shape Testing
- [ ] Create 10+ shapes
- [ ] Selection still works smoothly
- [ ] Dragging maintains 60fps
- [ ] Always selects top-most shape

---

## 🔄 Shape Transformations

### Flip Horizontal (H key)
- [ ] Triangle flips in place (doesn't move)
- [ ] Quarter circle flips correctly
- [ ] Square stays the same (symmetrical)
- [ ] Circle stays the same (symmetrical)
- [ ] Position unchanged after flip
- [ ] Can flip multiple times
- [ ] Undo works after flip

### Flip Vertical (Shift+V)
- [ ] Triangle flips in place (doesn't move)
- [ ] Quarter circle flips correctly
- [ ] Square stays the same (symmetrical)
- [ ] Circle stays the same (symmetrical)
- [ ] Position unchanged after flip
- [ ] Can flip multiple times
- [ ] Undo works after flip

### Rotate 90° (R key)
- [ ] Triangle rotates correctly
- [ ] Quarter circle rotates correctly
- [ ] Can rotate 360° (4 times)
- [ ] Position stays centered
- [ ] Undo works after rotation

---

## 📐 Resizing

### Corner Resize Handles
- [ ] **NW (top-left)** handle resizes correctly
- [ ] **NE (top-right)** handle resizes correctly
- [ ] **SW (bottom-left)** handle resizes correctly
- [ ] **SE (bottom-right)** handle resizes correctly

### Resize Constraints
- [ ] Cannot resize below minimum (1 grid cell)
- [ ] Cannot resize beyond canvas bounds
- [ ] Grid snapping works during resize
- [ ] Shape maintains correct rendering during resize
- [ ] Cursor shows appropriate resize direction

---

## ⌨️ Keyboard Shortcuts

### Tool Switching
- [ ] `D` - switches to Draw tool
- [ ] `V` - switches to Select tool
- [ ] Tool indicator updates in toolbar

### Editing
- [ ] `Ctrl/Cmd + Z` - undo
- [ ] `Ctrl/Cmd + Shift + Z` - redo
- [ ] `Ctrl/Cmd + D` - duplicate shape
- [ ] `Delete` / `Backspace` - delete shape
- [ ] `H` - flip horizontal (with shape selected)
- [ ] `Shift + V` - flip vertical (with shape selected)
- [ ] `R` - rotate 90° (with shape selected)
- [ ] `Escape` - deselect shape

### Alignment
- [ ] `Shift + L` - align left
- [ ] `Shift + R` - align right
- [ ] `Shift + T` - align top
- [ ] `Shift + B` - align bottom
- [ ] `Shift + C` - center horizontally
- [ ] `Shift + M` - center vertically

### View
- [ ] `?` - show keyboard shortcuts modal

---

## 🎯 Alignment Tools

Test each alignment button in toolbar:

- [ ] **Align Left** - moves shape to left edge (x = 0)
- [ ] **Align Right** - moves shape to right edge
- [ ] **Align Top** - moves shape to top edge (y = 0)
- [ ] **Align Bottom** - moves shape to bottom edge
- [ ] **Center Horizontally** - centers shape on X axis
- [ ] **Center Vertically** - centers shape on Y axis

---

## ↩️ Undo/Redo System

### History Management
- [ ] Create a shape - can undo
- [ ] Move a shape - can undo
- [ ] Resize a shape - can undo
- [ ] Delete a shape - can undo
- [ ] Flip a shape - can undo
- [ ] Rotate a shape - can undo
- [ ] Multiple undos work correctly
- [ ] Redo works after undo
- [ ] History is per-glyph (switching glyphs preserves history)
- [ ] New action clears redo stack

---

## 🔤 Glyph Management

### Glyph Navigation
- [ ] Click glyph in sidebar to switch
- [ ] Current glyph highlights
- [ ] Canvas updates with glyph shapes
- [ ] History preserved when switching
- [ ] Empty glyphs show correctly

### Grid Resolution
- [ ] Change grid size in inspector (6x6 to 16x16)
- [ ] Canvas updates with new grid
- [ ] Existing shapes maintain position
- [ ] Grid lines update correctly

---

## 👁️ Preview Bar

### Text Preview
- [ ] Type text in preview input
- [ ] Preview updates in real-time
- [ ] Glyphs render correctly
- [ ] Spacing looks correct
- [ ] Unknown characters are skipped

### Size Control
- [ ] Size slider changes preview size
- [ ] Size indicator updates (32px to 128px)
- [ ] Preview maintains aspect ratio
- [ ] Large sizes don't break layout

---

## 💾 Import/Export

### Export JSON
- [ ] Click Export button
- [ ] File downloads with correct name
- [ ] JSON is valid and readable
- [ ] Contains all glyphs and metadata

### Import JSON
- [ ] Click Import button
- [ ] Select valid JSON file
- [ ] Font loads correctly
- [ ] All glyphs appear
- [ ] History is reset
- [ ] Invalid JSON shows error

### Export Glyph SVG
- [ ] Click SVG export button in canvas toolbar
- [ ] SVG file downloads
- [ ] SVG is valid
- [ ] Opens in image viewer correctly
- [ ] All shapes render correctly

---

## 🎨 UI/UX Elements

### Toolbar
- [ ] All buttons are clickable
- [ ] Tooltips show on hover
- [ ] Icons display correctly
- [ ] Layout doesn't break on narrow screens

### Canvas Toolbar
- [ ] Zoom slider works (50% to 200%)
- [ ] Zoom percentage updates
- [ ] Canvas scales correctly
- [ ] Grid stays sharp at all zoom levels

### Inspector Panel
- [ ] Shows correct character
- [ ] Unicode displays correctly
- [ ] Shape count is accurate
- [ ] Grid size selector works

---

## 🚀 Performance Testing

### 60 FPS Targets
- [ ] Draw 20+ shapes - stays smooth
- [ ] Drag shape rapidly - no stuttering
- [ ] Resize shape rapidly - no lag
- [ ] Switch between glyphs - instant
- [ ] Type in preview - no delay

### Stress Testing
- [ ] Create 50+ shapes - still usable
- [ ] Rapid undo/redo (10+ times) - works
- [ ] Switch glyphs rapidly - no crash
- [ ] Hold down drag for 30+ seconds - smooth

### Browser DevTools Check
- [ ] Open Performance tab
- [ ] Record while dragging shape
- [ ] Frame rate stays at 60fps
- [ ] No long tasks (> 50ms)
- [ ] Memory stays stable (no leaks)

---

## 🌐 Browser Compatibility

Test in multiple browsers:

### Chrome/Edge
- [ ] All features work
- [ ] Performance is good
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Performance is good
- [ ] No console errors

### Safari
- [ ] All features work
- [ ] Performance is good
- [ ] No console errors

---

## 📱 Device Testing

### Desktop
- [ ] Works at 1920x1080
- [ ] Works at 1440p
- [ ] Works at 4K
- [ ] Zoom controls work

### Tablet (if applicable)
- [ ] Touch drawing works
- [ ] Touch selection works
- [ ] Touch dragging works
- [ ] UI is usable

---

## 🐛 Bug Verification

### Fixed Bugs (verify still fixed)
- [ ] Flip operations flip in place (don't move)
- [ ] Vertical dragging is smooth
- [ ] No jumping at canvas boundaries
- [ ] Shapes stay within canvas

### Edge Cases
- [ ] Create shape at canvas edge
- [ ] Drag shape partially off canvas
- [ ] Resize to minimum size
- [ ] Delete last shape in glyph
- [ ] Switch glyph while dragging (cancel drag)
- [ ] Press keyboard shortcut while input focused (ignored)

---

## ✅ Acceptance Criteria

Before releasing:
- [ ] All checklist items pass
- [ ] No console errors in any browser
- [ ] Performance targets met (60fps)
- [ ] All keyboard shortcuts work
- [ ] All mouse operations work
- [ ] Touch operations work (if supported)
- [ ] Import/Export work correctly
- [ ] UI is responsive and polished

---

## 📝 Reporting Issues

If you find a bug:

1. **Reproduce** - Can you make it happen again?
2. **Document** - What exact steps cause it?
3. **Environment** - Browser, OS, screen size?
4. **Screenshot** - Capture the issue if visible
5. **Console** - Any errors in DevTools console?

Add to [BUG_FIXES.md](./BUG_FIXES.md) under "Known Issues" section.

