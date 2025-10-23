# Modular Typeface Editor

A modern, web-based typeface editor for creating modular fonts using geometric shapes.

## Features

- **Shape-Based Design**: Build glyphs using squares, circles, triangles, and quarter circles
- **Interactive Canvas**: Draw, select, and transform shapes with intuitive mouse controls
- **High Performance**: 60fps smooth rendering with RAF throttling and React optimization
- **Keyboard Shortcuts**: Efficient workflow with comprehensive keyboard shortcuts
- **Live Preview**: See your typeface in action with real-time text preview
- **Import/Export**: Save and load your work as JSON, export glyphs as SVG
- **Undo/Redo**: Full history management per glyph
- **Grid System**: Configurable grid resolutions (6×6 to 16×16)
- **Touch Support**: Works on touch devices with pointer events

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### Tools

- **Draw Tool (D)**: Draw new shapes on the canvas
- **Select Tool (V)**: Select and transform existing shapes

### Keyboard Shortcuts

#### Tools
- `V` - Select tool
- `D` - Draw tool

#### Editing
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo
- `Ctrl/Cmd + D` - Duplicate selected shape
- `Delete / Backspace` - Delete selected shape
- `H` - Flip horizontal
- `Shift + V` - Flip vertical
- `R` - Rotate 90°

#### Alignment
- `Shift + L` - Align left
- `Shift + R` - Align right
- `Shift + T` - Align top
- `Shift + B` - Align bottom
- `Shift + C` - Center horizontally
- `Shift + M` - Center vertically

#### View
- `?` - Show shortcuts

## Project Structure

```
src/
├── components/          # React components
│   ├── EditorCanvas.tsx
│   ├── GlyphGrid.tsx
│   ├── Inspector.tsx
│   ├── PreviewBar.tsx
│   ├── ShapePalette.tsx
│   ├── ShortcutsModal.tsx
│   └── Toolbar.tsx
├── hooks/              # Custom React hooks
│   ├── useFontEditor.ts
│   └── useShapeTransform.ts
├── utils/              # Utility functions
│   ├── exportHelpers.ts
│   ├── fontFactory.ts
│   ├── shapeFactory.ts
│   ├── shapeRenderer.tsx
│   └── svgHelpers.ts
├── constants/          # Constants and definitions
│   ├── shapes.ts
│   └── shortcuts.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles

```

## Technology Stack

- **React 18** - UI library with performance optimizations
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Phosphor Icons** - Clean, modern icons
- **SVG** - High-quality vector rendering

## Performance

The editor is optimized for smooth, responsive performance:

- **60 FPS rendering** using requestAnimationFrame throttling
- **React.memo** for efficient component re-rendering
- **useMemo/useCallback** for optimized computations
- **Boundary clamping** to keep shapes within canvas
- **Improved hit detection** for reliable shape selection
- **Pointer events** for better touch device support

See [PERFORMANCE_IMPROVEMENTS.md](./PERFORMANCE_IMPROVEMENTS.md) for details.

## Development

### Code Organization

- **Components**: Isolated, reusable UI components
- **Hooks**: Custom React hooks for state management and logic
- **Utils**: Pure utility functions for shapes, export, and SVG manipulation
- **Types**: Centralized TypeScript type definitions
- **Constants**: Shared constants and configuration

### Best Practices

- TypeScript for type safety
- Functional components with hooks
- Separation of concerns (UI, logic, data)
- Immutable state updates
- Keyboard accessibility
- Responsive design principles

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

# MOD_FONT
