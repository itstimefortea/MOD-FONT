# Quick Start Guide

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   The app will automatically open at `http://localhost:3000`

## Project Structure Overview

```
src/
├── components/          # React UI components (7 components)
│   ├── EditorCanvas.tsx    - Main canvas with drawing/editing
│   ├── GlyphGrid.tsx       - Glyph selection sidebar
│   ├── Inspector.tsx       - Properties panel
│   ├── PreviewBar.tsx      - Text preview at bottom
│   ├── ShapePalette.tsx    - Tool and shape selection
│   ├── ShortcutsModal.tsx  - Keyboard shortcuts help
│   └── Toolbar.tsx         - Top toolbar with import/export
│
├── hooks/               # Custom React hooks
│   ├── useFontEditor.ts       - Font state management
│   └── useShapeTransform.ts   - Shape transformation logic
│
├── utils/               # Pure utility functions
│   ├── exportHelpers.ts   - JSON and SVG export
│   ├── fontFactory.ts     - Create default font data
│   ├── shapeFactory.ts    - Create shape instances
│   ├── shapeRenderer.tsx  - SVG shape rendering
│   └── svgHelpers.ts      - SVG coordinate helpers
│
├── constants/           # Shared constants
│   ├── shapes.ts          - Shape definitions
│   └── shortcuts.ts       - Keyboard shortcuts list
│
├── types/               # TypeScript types
│   └── index.ts           - All type definitions
│
├── App.tsx              # Main app component
├── main.tsx             # React entry point
└── index.css            # Global styles + Tailwind
```

## Key Improvements from Original File

### ✅ Code Organization
- **Separated Concerns**: UI components, business logic, utilities, and types are in separate files
- **Reusable Components**: Each component is self-contained and can be tested independently
- **Custom Hooks**: State management logic extracted into reusable hooks

### ✅ Type Safety
- **Full TypeScript**: All code is typed for better IDE support and fewer runtime errors
- **Type Definitions**: Centralized types for shapes, glyphs, fonts, etc.

### ✅ Best Practices
- **Functional Components**: Using modern React with hooks
- **Immutable State**: All state updates follow immutability patterns
- **Separation of Logic**: Business logic separated from UI
- **Code Splitting**: Components can be lazy-loaded if needed

### ✅ Developer Experience
- **Vite**: Fast dev server with HMR (Hot Module Replacement)
- **ESLint**: Code quality checking
- **Tailwind CSS**: Utility-first CSS with proper configuration
- **VS Code**: Recommended extensions for best experience

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Recent Bug Fixes

### Fixed Issues
- ✅ **Flip operations** now flip shapes in place instead of moving them
- ✅ **Vertical movement** is now smooth and reliable (was buggy)
- ✅ **Boundary handling** prevents erratic behavior at canvas edges
- ✅ **Performance optimizations** for smoother dragging and manipulation

See [BUG_FIXES.md](./BUG_FIXES.md) for technical details.

## What's Different from the Original HTML File?

### Architecture
- **Before**: One 1,624-line HTML file
- **After**: 24+ organized files with clear separation of concerns

### Technology Stack
- **Before**: Inline React via CDN
- **After**: Modern build system (Vite) with optimized production builds

### Maintainability
- **Before**: Hard to navigate and modify
- **After**: Easy to find and update specific features

### Scalability
- **Before**: Adding features would increase file complexity
- **After**: Can easily add new components, hooks, or utilities

### Type Safety
- **Before**: JavaScript with no type checking
- **After**: Full TypeScript with compile-time type checking

### Performance
- **Before**: Loads all React libraries from CDN
- **After**: Bundled and optimized for production

## Next Steps

1. **Customize the default font** in `src/utils/fontFactory.ts`
2. **Add new shapes** by extending types in `src/types/index.ts` and rendering in `src/utils/shapeRenderer.tsx`
3. **Add more tools** by extending the `Tool` enum and adding handlers in `EditorCanvas`
4. **Improve export** by adding more export formats in `src/utils/exportHelpers.ts`
5. **Add tests** using Vitest or Jest

## Troubleshooting

If you encounter any issues:

1. Make sure Node.js v16+ is installed
2. Delete `node_modules` and run `npm install` again
3. Clear browser cache if hot reload isn't working
4. Check the console for any error messages

## Contributing

Feel free to extend this editor! The modular structure makes it easy to:
- Add new shape types
- Implement additional tools
- Enhance the export functionality
- Add cloud storage integration
- Implement font preview features

