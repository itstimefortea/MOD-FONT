# Testing Guide - Current State

## 🚀 What's Ready to Test NOW

Run `npm run dev` and try these features:

---

## ✅ **Working Features**

### 1. Better Resize Handles
**How to test:**
1. Draw a shape (press D, draw a square)
2. Switch to Select tool (press V)
3. Click the shape to select it
4. Try grabbing the corner handles
5. **You should notice**: Handles are MUCH easier to click now (12px hit area vs old 5px)

**Expected behavior:**
- Handles respond reliably when you hover near them
- Cursor changes to resize arrows
- Dragging resizes smoothly

---

### 2. Multi-Selection (Shift+Click)
**How to test:**
1. Draw 3-4 shapes
2. Switch to Select tool (V)
3. Click one shape (selects it)
4. **Hold Shift** and click another shape
5. Both should now be selected!
6. Hold Shift and click a third shape
7. All three selected!

**To deselect:**
- Shift+click a selected shape to remove it from selection
- Click empty space to deselect all
- Press Escape to deselect all

---

### 3. Drag-to-Select (Selection Box)
**How to test:**
1. Draw several shapes scattered around
2. Switch to Select tool (V)
3. Click and drag on empty space
4. **Note**: You won't SEE the selection box yet (visual not implemented)
5. Release mouse
6. Shapes that were in the dragged area should now be selected

**Known limitation**: Selection box is invisible right now, but the logic works!

---

### 4. Move Multiple Shapes Together
**How to test:**
1. Select multiple shapes (using Shift+click)
2. Click and drag one of the selected shapes
3. **All selected shapes move together!**
4. Their relative positions are maintained

**Expected behavior:**
- Smooth 60fps movement
- All shapes stay in sync
- Snap to grid works
- Can't drag outside canvas bounds

---

### 5. Keyboard Shortcuts on Multiple Shapes
**Try these:**
- Select multiple shapes, press `H` → All flip horizontally
- Select multiple shapes, press `Shift+V` → All flip vertically
- Select multiple shapes, press `R` → All rotate 90°
- Select multiple shapes, press `Delete` → All deleted
- Select multiple shapes, press `Ctrl+D` → All duplicated
- **New**: Press `Ctrl+A` → Selects all shapes!

---

### 6. Alignment on Multiple Shapes
**How to test:**
1. Draw 3 shapes at different positions
2. Select all 3 (Shift+click or Ctrl+A)
3. Press `Shift+L` → All align to left edge
4. Press `Shift+C` → All center horizontally
5. Press `Shift+T` → All align to top

**Note**: Alignment buttons in toolbar may not work yet (known issue)

---

## ⚠️ **Known Limitations (Toolbar UI Not Updated)**

### Will Show Errors/Warnings:
1. **Toolbar buttons** - Some may reference old single-selection code
2. **Size display** - May show wrong info or error
3. **Selection box visual** - Invisible (works, just not drawn)
4. **Multi-select count** - Not shown in UI

### Workarounds:
- Use **keyboard shortcuts** instead of toolbar buttons
- Ignore size display when multiple shapes selected
- Trust that selection box works even though invisible

---

## 🧪 **Comprehensive Test Scenario**

**Building a simple "A" letterform:**

1. **Draw the left stroke:**
   - Press `D` (Draw tool)
   - Select Rectangle
   - Draw a tall vertical rectangle on the left

2. **Draw the right stroke:**
   - Draw another tall vertical rectangle on the right

3. **Draw the crossbar:**
   - Draw a horizontal rectangle in the middle

4. **Test multi-selection:**
   - Press `V` (Select tool)
   - Hold Shift, click all 3 shapes
   - All 3 should be selected

5. **Move them together:**
   - Drag one of the selected shapes
   - All 3 move together maintaining position

6. **Align them:**
   - Press `Shift+B` to align bottoms
   - All 3 align to bottom edge

7. **Adjust individual shapes:**
   - Click empty space to deselect
   - Select just the crossbar
   - Move it to proper position
   - **Use resize handles** - they should be much easier to grab!

---

## 📊 **What to Evaluate**

### Primary Goals:
1. **Can you reliably grab resize handles?** (This was issue #1)
2. **Can you select multiple shapes to align them?** (This was issue #2)
3. **Does multi-shape dragging feel smooth?**
4. **Can you build a letterform more easily than before?**

### Secondary:
- Are there any weird behaviors?
- Do shapes ever get "stuck"?
- Any console errors?
- Performance still good with 10+ shapes?

---

## 🐛 **How to Report Issues**

If something doesn't work:

1. **What were you doing?** (exact steps)
2. **What happened?** (describe the bug)
3. **What did you expect?** (expected behavior)
4. **Open the Console** (F12) - any errors?
5. **How many shapes** were on the canvas?

---

## 💡 **Tips for Testing**

- **Start simple**: Test with 2-3 shapes first
- **Use keyboard shortcuts**: More reliable than toolbar right now
- **Trust the invisible selection box**: It works, you just can't see it
- **Check resize handles first**: This was the biggest complaint
- **Build a simple letter**: Best real-world test

---

## 📝 **Feedback Questions**

After testing, please let me know:

1. **Resize handles**: Better? Worse? Still frustrating?
2. **Multi-selection**: Intuitive? Useful? Confusing?
3. **Drag multiple shapes**: Smooth? Laggy? Good enough?
4. **Overall frustration level**: Going down? Still high?
5. **What's the #1 remaining pain point?**

---

## 🎯 **Success Criteria**

You should be able to:
- ✅ Reliably grab and resize shapes
- ✅ Select 3+ shapes and move them together
- ✅ Use Shift+click to build up a selection
- ✅ Apply transforms to multiple shapes at once
- ✅ Build a simple letterform without rage-quitting 😄

---

## Next Steps

Based on your feedback, I'll:
1. Fix any critical bugs you find
2. Complete the toolbar UI updates
3. Add the selection box visual
4. Polish any rough edges
5. Implement relative alignment (if needed)

---

**Ready to test? Run `npm run dev` and have fun!** 🎨

Report back with your experience - the good, the bad, and the ugly!

