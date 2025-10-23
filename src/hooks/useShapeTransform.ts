import { useCallback } from 'react';
import { Shape, ShapeType, ArcCorner, AlignmentType } from '../types';

export const useShapeTransform = (
  canvasSize: number,
  saveToHistory: () => void,
  updateShape: (shapeId: number, updates: Partial<Shape>) => void
) => {
  const flipHorizontal = useCallback(
    (shape: Shape) => {
      if (!shape || typeof shape.id !== 'number') {
        console.warn('Invalid shape provided to flipHorizontal');
        return;
      }

      saveToHistory();

      // Flip in place - only change orientation, not position
      let updates: Partial<Shape> = {};

      if (shape.type === ShapeType.TRIANGLE) {
        // For triangles, flip by rotating 180° around vertical axis
        // This depends on current rotation
        const newRotation = (360 - shape.rotation) % 360;
        updates.rotation = newRotation;
      } else if (shape.type === ShapeType.QUARTER_CIRCLE) {
        // Flip the corner horizontally
        const cornerMap: Record<ArcCorner, ArcCorner> = {
          [ArcCorner.TL]: ArcCorner.TR,
          [ArcCorner.TR]: ArcCorner.TL,
          [ArcCorner.BL]: ArcCorner.BR,
          [ArcCorner.BR]: ArcCorner.BL,
        };
        updates.corner = cornerMap[shape.corner || ArcCorner.TL];
      }
      // Square and Circle don't change when flipped horizontally

      updateShape(shape.id, updates);
    },
    [saveToHistory, updateShape]
  );

  const flipVertical = useCallback(
    (shape: Shape) => {
      if (!shape || typeof shape.id !== 'number') {
        console.warn('Invalid shape provided to flipVertical');
        return;
      }

      saveToHistory();

      // Flip in place - only change orientation, not position
      let updates: Partial<Shape> = {};

      if (shape.type === ShapeType.TRIANGLE) {
        // For triangles, flip by mirroring rotation across horizontal axis
        const newRotation = shape.rotation === 0 
          ? 180 
          : shape.rotation === 90 
          ? 270 
          : shape.rotation === 180 
          ? 0 
          : 90;
        updates.rotation = newRotation;
      } else if (shape.type === ShapeType.QUARTER_CIRCLE) {
        // Flip the corner vertically
        const cornerMap: Record<ArcCorner, ArcCorner> = {
          [ArcCorner.TL]: ArcCorner.BL,
          [ArcCorner.TR]: ArcCorner.BR,
          [ArcCorner.BL]: ArcCorner.TL,
          [ArcCorner.BR]: ArcCorner.TR,
        };
        updates.corner = cornerMap[shape.corner || ArcCorner.TL];
      }
      // Square and Circle don't change when flipped vertically

      updateShape(shape.id, updates);
    },
    [saveToHistory, updateShape]
  );

  const rotate90 = useCallback(
    (shape: Shape) => {
      if (!shape || typeof shape.id !== 'number') {
        console.warn('Invalid shape provided to rotate90');
        return;
      }

      saveToHistory();

      if (shape.type === ShapeType.TRIANGLE) {
        updateShape(shape.id, { rotation: (shape.rotation + 90) % 360 });
      } else if (shape.type === ShapeType.QUARTER_CIRCLE) {
        const cornerMap: Record<ArcCorner, ArcCorner> = {
          [ArcCorner.TL]: ArcCorner.TR,
          [ArcCorner.TR]: ArcCorner.BR,
          [ArcCorner.BR]: ArcCorner.BL,
          [ArcCorner.BL]: ArcCorner.TL,
        };
        updateShape(shape.id, { corner: cornerMap[shape.corner || ArcCorner.TL] });
      }
    },
    [saveToHistory, updateShape]
  );

  const alignShape = useCallback(
    (shape: Shape, alignment: AlignmentType) => {
      saveToHistory();

      let updates: Partial<Shape> = {};

      switch (alignment) {
        case AlignmentType.LEFT:
          updates.x = 0;
          break;
        case AlignmentType.RIGHT:
          updates.x = canvasSize - shape.width;
          break;
        case AlignmentType.CENTER_H:
          updates.x = (canvasSize - shape.width) / 2;
          break;
        case AlignmentType.TOP:
          updates.y = 0;
          break;
        case AlignmentType.BOTTOM:
          updates.y = canvasSize - shape.height;
          break;
        case AlignmentType.CENTER_V:
          updates.y = (canvasSize - shape.height) / 2;
          break;
      }

      updateShape(shape.id, updates);
    },
    [canvasSize, saveToHistory, updateShape]
  );

  const alignShapes = useCallback(
    (shapes: Shape[], alignment: AlignmentType) => {
      if (shapes.length === 0) return;

      // Save to history once at the start
      saveToHistory();

      // For single shape, align to canvas edges (original behavior)
      if (shapes.length === 1) {
        const shape = shapes[0];
        let updates: Partial<Shape> = {};

        switch (alignment) {
          case AlignmentType.LEFT:
            updates.x = 0;
            break;
          case AlignmentType.RIGHT:
            updates.x = canvasSize - shape.width;
            break;
          case AlignmentType.CENTER_H:
            updates.x = (canvasSize - shape.width) / 2;
            break;
          case AlignmentType.TOP:
            updates.y = 0;
            break;
          case AlignmentType.BOTTOM:
            updates.y = canvasSize - shape.height;
            break;
          case AlignmentType.CENTER_V:
            updates.y = (canvasSize - shape.height) / 2;
            break;
        }

        updateShape(shape.id, updates);
        return;
      }

      // For multiple shapes, calculate alignment target based on the initial state
      // This ensures consistent behavior regardless of update order
      let targetValue: number;

      switch (alignment) {
        case AlignmentType.LEFT:
          // Find the leftmost x position
          targetValue = Math.min(...shapes.map(s => s.x));
          shapes.forEach(shape => {
            updateShape(shape.id, { x: targetValue });
          });
          break;

        case AlignmentType.RIGHT:
          // Find the rightmost right edge
          const rightmostEdge = Math.max(...shapes.map(s => s.x + s.width));
          shapes.forEach(shape => {
            updateShape(shape.id, { x: rightmostEdge - shape.width });
          });
          break;

        case AlignmentType.CENTER_H:
          // Align all shape centers to the same vertical line
          // Use the average center x position as the target
          const centerXs = shapes.map(s => s.x + s.width / 2);
          const avgCenterX = centerXs.reduce((sum, cx) => sum + cx, 0) / centerXs.length;
          shapes.forEach(shape => {
            updateShape(shape.id, { x: avgCenterX - shape.width / 2 });
          });
          break;

        case AlignmentType.TOP:
          // Find the topmost y position
          targetValue = Math.min(...shapes.map(s => s.y));
          shapes.forEach(shape => {
            updateShape(shape.id, { y: targetValue });
          });
          break;

        case AlignmentType.BOTTOM:
          // Find the bottommost bottom edge
          const bottommostEdge = Math.max(...shapes.map(s => s.y + s.height));
          shapes.forEach(shape => {
            updateShape(shape.id, { y: bottommostEdge - shape.height });
          });
          break;

        case AlignmentType.CENTER_V:
          // Align all shape centers to the same horizontal line
          // Use the average center y position as the target
          const centerYs = shapes.map(s => s.y + s.height / 2);
          const avgCenterY = centerYs.reduce((sum, cy) => sum + cy, 0) / centerYs.length;
          shapes.forEach(shape => {
            updateShape(shape.id, { y: avgCenterY - shape.height / 2 });
          });
          break;
      }
    },
    [canvasSize, saveToHistory, updateShape]
  );

  return {
    flipHorizontal,
    flipVertical,
    rotate90,
    alignShape,
    alignShapes,
  };
};

