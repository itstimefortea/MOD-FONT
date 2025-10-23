export const KEYBOARD_SHORTCUTS = [
  {
    category: 'Tools',
    items: [
      { keys: 'V', description: 'Select tool' },
      { keys: 'D', description: 'Draw tool' },
    ],
  },
  {
    category: 'Editing',
    items: [
      { keys: 'Ctrl/Cmd + Z', description: 'Undo' },
      { keys: 'Ctrl/Cmd + Shift + Z', description: 'Redo' },
      { keys: 'Ctrl/Cmd + D', description: 'Duplicate selected shape' },
      { keys: 'Delete / Backspace', description: 'Delete selected shape' },
      { keys: 'H', description: 'Flip horizontal' },
      { keys: 'Shift + V', description: 'Flip vertical' },
      { keys: 'R', description: 'Rotate 90°' },
    ],
  },
  {
    category: 'Alignment',
    items: [
      { keys: 'Shift + L', description: 'Align left' },
      { keys: 'Shift + R', description: 'Align right' },
      { keys: 'Shift + T', description: 'Align top' },
      { keys: 'Shift + B', description: 'Align bottom' },
      { keys: 'Shift + C', description: 'Center horizontally' },
      { keys: 'Shift + M', description: 'Center vertically (Middle)' },
    ],
  },
  {
    category: 'View',
    items: [{ keys: '?', description: 'Show shortcuts' }],
  },
] as const;

