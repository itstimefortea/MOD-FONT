# Modular Typeface Editor

A modern, web-based typeface editor for creating modular fonts using geometric shapes.

## Features

- **Shape-Based Design**: Build glyphs using squares, circles, triangles, and quarter circles
- **Interactive Canvas**: Draw, select, and transform shapes with intuitive mouse controls
- **Multi-Selection**: Select and manipulate multiple shapes at once (Shift+click or drag-to-select)
- **High Performance**: 60fps smooth rendering with RAF throttling and React optimization
- **Keyboard Shortcuts**: Efficient workflow with comprehensive keyboard shortcuts
- **Live Preview**: See your typeface in action with real-time text preview
- **Export Options**:
  - Export as JSON (save your work)
  - Export as TTF (TrueType Font for use in other programs)
  - Export individual glyphs as SVG
- **Import/Load**: Load existing fonts from JSON files
- **Undo/Redo**: Full history management per glyph
- **Grid System**: Configurable grid resolutions (6×6 to 16×16)
- **Touch Support**: Works on touch devices with pointer events
- **Resizable Panels**: Adjust workspace layout to your preference

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
- `Ctrl/Cmd + D` - Duplicate selected shape(s)
- `Delete / Backspace` - Delete selected shape(s)
- `H` - Flip horizontal
- `Shift + V` - Flip vertical
- `R` - Rotate 90°

#### Selection
- `Shift + Click` - Add shape to selection
- `Ctrl/Cmd + Click` - Toggle shape in selection
- `Ctrl/Cmd + A` - Select all shapes
- `Escape` - Deselect all
- Drag on canvas - Select multiple shapes with selection box

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
│   ├── EditorCanvas.tsx    # Main drawing canvas
│   ├── GlyphGrid.tsx       # Glyph selection sidebar
│   ├── Inspector.tsx       # Properties panel
│   ├── PreviewPanel.tsx    # Text preview
│   ├── ResizablePanel.tsx  # Resizable panel wrapper
│   ├── ShapePalette.tsx    # Shape and tool selector
│   ├── ShortcutsModal.tsx  # Keyboard shortcuts help
│   └── Toolbar.tsx         # Top toolbar
├── hooks/              # Custom React hooks
│   ├── useFontEditor.ts       # Font state management
│   ├── useKeyboardShortcuts.ts # Keyboard shortcuts
│   └── useShapeTransform.ts    # Shape transformations
├── utils/              # Utility functions
│   ├── exportHelpers.ts       # JSON, TTF, SVG export
│   ├── fontFactory.ts         # Create default fonts
│   ├── fontValidator.ts       # Validate font data
│   ├── shapeFactory.ts        # Create shapes
│   ├── shapeRenderer.tsx      # Render shapes
│   ├── svgHelpers.ts          # SVG utilities
│   └── svgShapeGenerator.ts   # SVG path generation
├── constants/          # Constants and definitions
│   ├── shapes.tsx         # Shape definitions
│   └── shortcuts.ts       # Keyboard shortcuts list
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
- **opentype.js** - TrueType font generation
- **Zod** - Runtime type validation

## Performance

The editor is optimized for smooth, responsive performance:

- **60 FPS rendering** using requestAnimationFrame throttling
- **React.memo** for efficient component re-rendering
- **useMemo/useCallback** for optimized computations
- **Boundary clamping** to keep shapes within canvas
- **Improved hit detection** for reliable shape selection
- **Pointer events** for better touch device support

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
