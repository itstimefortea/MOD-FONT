import { z } from 'zod';
import { ShapeType, ArcCorner } from '../types';

// Schema for ArcCorner enum
const ArcCornerSchema = z.enum([ArcCorner.TL, ArcCorner.TR, ArcCorner.BL, ArcCorner.BR]);

// Schema for ShapeType enum
const ShapeTypeSchema = z.enum([
  ShapeType.SQUARE,
  ShapeType.CIRCLE,
  ShapeType.TRIANGLE,
  ShapeType.QUARTER_CIRCLE,
]);

// Schema for Shape
const ShapeSchema = z.object({
  id: z.number(),
  type: ShapeTypeSchema,
  x: z.number(),
  y: z.number(),
  width: z.number().min(0),
  height: z.number().min(0),
  rotation: z.number(),
  corner: ArcCornerSchema.nullable(),
});

// Schema for Glyph
const GlyphSchema = z.object({
  char: z.string(),
  unicode: z.number(),
  gridSize: z.number().min(1),
  shapes: z.array(ShapeSchema),
  leftBearing: z.number(),
  rightBearing: z.number(),
  advanceWidth: z.number(),
  modifiedAt: z.number(),
});

// Schema for FontMetrics
const FontMetricsSchema = z.object({
  gridSize: z.number().min(1),
  ascender: z.number(),
  capHeight: z.number(),
  xHeight: z.number(),
  baseline: z.number(),
  descender: z.number(),
  defaultAdvanceWidth: z.number(),
  tracking: z.number(),
});

// Schema for FontMeta
const FontMetaSchema = z.object({
  familyName: z.string().min(1),
  styleName: z.string().min(1),
});

// Schema for Font
const FontSchema = z.object({
  meta: FontMetaSchema,
  metrics: FontMetricsSchema,
  glyphs: z.record(z.string(), GlyphSchema),
  version: z.number(),
});

export type ValidatedFont = z.infer<typeof FontSchema>;

/**
 * Validates font data from JSON import
 * @param data - Unknown data to validate
 * @returns Validated Font object or null if invalid
 */
export const validateFont = (data: unknown): ValidatedFont | null => {
  try {
    return FontSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Font validation failed:', error.issues);
    }
    return null;
  }
};

/**
 * Validates font data and provides detailed error messages
 * @param data - Unknown data to validate
 * @returns Object with success status and either font or errors
 */
export const validateFontWithErrors = (
  data: unknown
): { success: true; font: ValidatedFont } | { success: false; errors: string[] } => {
  try {
    const font = FontSchema.parse(data);
    return { success: true, font };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => {
        const path = issue.path.join('.') || '<root>';
        return `${path}: ${issue.message}`;
      });
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
};
