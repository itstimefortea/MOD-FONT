// Shape types and enums
export enum ShapeType {
  SQUARE = 'square',
  CIRCLE = 'circle',
  TRIANGLE = 'triangle',
  QUARTER_CIRCLE = 'quarter-circle',
}

export enum ArcCorner {
  TL = 'tl',
  TR = 'tr',
  BL = 'bl',
  BR = 'br',
}

export enum Tool {
  DRAW = 'draw',
  SELECT = 'select',
}

export enum AlignmentType {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom',
  CENTER_H = 'center-h',
  CENTER_V = 'center-v',
}

// Shape interface
export interface Shape {
  id: number;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  corner: ArcCorner | null;
}

// Glyph interface
export interface Glyph {
  char: string;
  unicode: number;
  gridSize: number;
  shapes: Shape[];
  leftBearing: number;
  rightBearing: number;
  advanceWidth: number;
  modifiedAt: number;
}

// Font metrics
export interface FontMetrics {
  gridSize: number;
  ascender: number;
  capHeight: number;
  xHeight: number;
  baseline: number;
  descender: number;
  defaultAdvanceWidth: number;
  tracking: number;
}

// Font metadata
export interface FontMeta {
  familyName: string;
  styleName: string;
}

// Font data structure
export interface Font {
  meta: FontMeta;
  metrics: FontMetrics;
  glyphs: Record<string, Glyph>;
  version: number;
}

// History state for undo/redo
export interface HistoryState {
  past: Shape[][];
  future: Shape[][];
}

export type History = Record<string, HistoryState>;

// Preview box for drawing
export interface PreviewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// SVG point
export interface SVGPoint {
  x: number;
  y: number;
}

