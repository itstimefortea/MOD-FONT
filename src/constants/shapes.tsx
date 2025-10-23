import type { ReactNode } from 'react';
import { ShapeType } from '../types';

interface ShapeDefinition {
  type: ShapeType;
  label: string;
  icon: ReactNode;
}

const iconProps = {
  viewBox: '0 0 24 24',
  className: 'w-5 h-5 fill-current',
} as const;

export const SHAPE_DEFINITIONS: readonly ShapeDefinition[] = [
  {
    type: ShapeType.SQUARE,
    label: 'Square',
    icon: (
      <svg {...iconProps}>
        <rect x="6" y="6" width="12" height="12" rx="2" />
      </svg>
    ),
  },
  {
    type: ShapeType.CIRCLE,
    label: 'Circle',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
  },
  {
    type: ShapeType.TRIANGLE,
    label: 'Right Triangle',
    icon: (
      <svg {...iconProps}>
        <path d="M6 6v12h12z" />
      </svg>
    ),
  },
  {
    type: ShapeType.QUARTER_CIRCLE,
    label: 'Quarter Circle',
    icon: (
      <svg {...iconProps}>
        <path d="M6 6L18 6A12 12 0 0 1 6 18Z" />
      </svg>
    ),
  },
];

export const CELL_SIZE = 32; // pixels per grid cell
