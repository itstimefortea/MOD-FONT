import React from 'react';
import { Shape, ShapeType, ArcCorner } from '../types';

// Memoized shape component for better performance
const ShapeElement = React.memo<{ shape: Shape; isSelected: boolean }>(
  ({ shape, isSelected }) => {
    return renderShapeElement(shape, isSelected);
  },
  (prev, next) => {
    // Only re-render if shape data or selection state changes
    return (
      prev.shape.id === next.shape.id &&
      prev.shape.x === next.shape.x &&
      prev.shape.y === next.shape.y &&
      prev.shape.width === next.shape.width &&
      prev.shape.height === next.shape.height &&
      prev.shape.rotation === next.shape.rotation &&
      prev.shape.corner === next.shape.corner &&
      prev.isSelected === next.isSelected
    );
  }
);

ShapeElement.displayName = 'ShapeElement';

export const renderShape = (shape: Shape, isSelected = false): JSX.Element => {
  return <ShapeElement key={shape.id} shape={shape} isSelected={isSelected} />;
};

// Render just the shape without selection indicators
export const renderShapeOnly = (shape: Shape): JSX.Element => {
  return renderShapeElement(shape, false);
};

// Render just the selection indicators for a shape
export const renderSelectionIndicators = (shape: Shape): JSX.Element | null => {
  const { id, x, y, width, height } = shape;

  return (
    <g key={`selection-${id}`}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray="4 4"
        pointerEvents="none"
      />
      {/* Larger invisible hit areas for better handle interaction */}
      <circle
        cx={x}
        cy={y}
        r="12"
        fill="transparent"
        data-handle="resize-nw"
        style={{ cursor: 'nw-resize', pointerEvents: 'all' }}
      />
      <circle
        cx={x + width}
        cy={y}
        r="12"
        fill="transparent"
        data-handle="resize-ne"
        style={{ cursor: 'ne-resize', pointerEvents: 'all' }}
      />
      <circle
        cx={x}
        cy={y + height}
        r="12"
        fill="transparent"
        data-handle="resize-sw"
        style={{ cursor: 'sw-resize', pointerEvents: 'all' }}
      />
      <circle
        cx={x + width}
        cy={y + height}
        r="12"
        fill="transparent"
        data-handle="resize-se"
        style={{ cursor: 'se-resize', pointerEvents: 'all' }}
      />
      {/* Visible handle indicators */}
      <circle
        cx={x}
        cy={y}
        r="6"
        fill="white"
        stroke="#3b82f6"
        strokeWidth="2"
        pointerEvents="none"
      />
      <circle
        cx={x + width}
        cy={y}
        r="6"
        fill="white"
        stroke="#3b82f6"
        strokeWidth="2"
        pointerEvents="none"
      />
      <circle
        cx={x}
        cy={y + height}
        r="6"
        fill="white"
        stroke="#3b82f6"
        strokeWidth="2"
        pointerEvents="none"
      />
      <circle
        cx={x + width}
        cy={y + height}
        r="6"
        fill="white"
        stroke="#3b82f6"
        strokeWidth="2"
        pointerEvents="none"
      />
    </g>
  );
};

const renderShapeElement = (shape: Shape, _isSelected = false): JSX.Element => {
  const { id, type, x, y, width, height, rotation, corner } = shape;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  let pathElement: JSX.Element | null = null;

  switch (type) {
    case ShapeType.SQUARE:
      pathElement = (
        <rect key={id} x={x} y={y} width={width} height={height} fill="#171717" />
      );
      break;

    case ShapeType.CIRCLE:
      pathElement = (
        <ellipse
          key={id}
          cx={centerX}
          cy={centerY}
          rx={width / 2}
          ry={height / 2}
          fill="#171717"
        />
      );
      break;

    case ShapeType.TRIANGLE:
      pathElement = (
        <path
          key={id}
          d={`M ${x} ${y}
              L ${x + width} ${y + height}
              L ${x} ${y + height}
              Z`}
          fill="#171717"
          transform={`rotate(${rotation} ${centerX} ${centerY})`}
        />
      );
      break;

    case ShapeType.QUARTER_CIRCLE: {
      let path = '';
      const actualCorner = corner || ArcCorner.TL;

      // Quarter circle that fits within bounding box
      // The arc originates from a corner and curves to fill a quarter of the box
      // Path structure: Move to corner -> Line to adjacent edge -> Arc back to other adjacent edge -> Close
      switch (actualCorner) {
        case ArcCorner.TL:
          // Top-left corner: right edge curves to bottom edge
          path = `M ${x} ${y} L ${x + width} ${y} A ${width} ${height} 0 0 1 ${x} ${y + height} Z`;
          break;
        case ArcCorner.TR:
          // Top-right corner: left edge curves to bottom edge
          path = `M ${x + width} ${y} L ${x} ${y} A ${width} ${height} 0 0 0 ${x + width} ${y + height} Z`;
          break;
        case ArcCorner.BL:
          // Bottom-left corner: right edge curves to top edge
          path = `M ${x} ${y + height} L ${x + width} ${y + height} A ${width} ${height} 0 0 0 ${x} ${y} Z`;
          break;
        case ArcCorner.BR:
          // Bottom-right corner: left edge curves to top edge
          path = `M ${x + width} ${y + height} L ${x} ${y + height} A ${width} ${height} 0 0 1 ${x + width} ${y} Z`;
          break;
      }

      pathElement = <path key={id} d={path} fill="#171717" />;
      break;
    }
  }

  return <>{pathElement}</>;
};
