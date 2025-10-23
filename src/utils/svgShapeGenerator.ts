import { Shape, ShapeType, ArcCorner } from '../types';

/**
 * Generates SVG path data or elements for a given shape
 * Can be used for both React components and string-based SVG exports
 */

export interface SVGShapeData {
  element: 'rect' | 'ellipse' | 'path';
  attributes: Record<string, string | number>;
}

/**
 * Generates SVG element data for a shape
 * @param shape - The shape to convert to SVG
 * @returns Object containing element type and attributes
 */
export const getShapeSVGData = (shape: Shape): SVGShapeData => {
  const { type, x, y, width, height, rotation, corner } = shape;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  switch (type) {
    case ShapeType.SQUARE:
      return {
        element: 'rect',
        attributes: {
          x,
          y,
          width,
          height,
          fill: '#000',
        },
      };

    case ShapeType.CIRCLE:
      return {
        element: 'ellipse',
        attributes: {
          cx: centerX,
          cy: centerY,
          rx: width / 2,
          ry: height / 2,
          fill: '#000',
        },
      };

    case ShapeType.TRIANGLE: {
      const path = `M ${x} ${y} L ${x + width} ${y + height} L ${x} ${y + height} Z`;
      return {
        element: 'path',
        attributes: {
          d: path,
          fill: '#000',
          transform: `rotate(${rotation} ${centerX} ${centerY})`,
        },
      };
    }

    case ShapeType.QUARTER_CIRCLE: {
      const rx = width;
      const ry = height;
      const actualCorner = corner || ArcCorner.TL;
      let path = '';

      switch (actualCorner) {
        case ArcCorner.TL:
          path = `M ${x + width} ${y} A ${rx} ${ry} 0 0 1 ${x} ${y + height} L ${x} ${y} Z`;
          break;
        case ArcCorner.TR:
          path = `M ${x} ${y} A ${rx} ${ry} 0 0 0 ${x + width} ${y + height} L ${x + width} ${y} Z`;
          break;
        case ArcCorner.BL:
          path = `M ${x + width} ${y + height} A ${rx} ${ry} 0 0 0 ${x} ${y} L ${x} ${y + height} Z`;
          break;
        case ArcCorner.BR:
          path = `M ${x} ${y + height} A ${rx} ${ry} 0 0 1 ${x + width} ${y} L ${x + width} ${y + height} Z`;
          break;
      }

      return {
        element: 'path',
        attributes: {
          d: path,
          fill: '#000',
        },
      };
    }

    default:
      // Fallback to rectangle for unknown types
      return {
        element: 'rect',
        attributes: {
          x,
          y,
          width,
          height,
          fill: '#000',
        },
      };
  }
};

/**
 * Converts SVG element data to an HTML string
 * @param data - The SVG element data
 * @returns HTML string for the SVG element
 */
export const svgDataToString = (data: SVGShapeData): string => {
  const { element, attributes } = data;
  const attrString = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  return `<${element} ${attrString}/>`;
};

/**
 * Generates SVG string for a shape (convenience method for exports)
 * @param shape - The shape to convert
 * @returns SVG element as string
 */
export const shapeToSVGString = (shape: Shape): string => {
  const data = getShapeSVGData(shape);
  return svgDataToString(data);
};
