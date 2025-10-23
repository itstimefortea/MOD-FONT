import { SVGPoint } from '../types';
import { CELL_SIZE } from '../constants/shapes';

export const getSVGPoint = (
  e: React.MouseEvent | React.PointerEvent,
  svgRef: SVGSVGElement | null
): SVGPoint => {
  if (!svgRef) return { x: 0, y: 0 };

  const pt = svgRef.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const svgP = pt.matrixTransform(svgRef.getScreenCTM()!.inverse());
  return { x: svgP.x, y: svgP.y };
};

export const snapToGrid = (value: number): number => {
  return Math.round(value / CELL_SIZE) * CELL_SIZE;
};

