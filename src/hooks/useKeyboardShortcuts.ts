import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  meta?: boolean;
  handler: () => void;
  description?: string;
}

/**
 * Custom hook for managing keyboard shortcuts
 * Provides a clean way to register and handle keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  deps: any[] = []
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === (e.ctrlKey || e.metaKey);
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === e.shiftKey;
        const metaMatch = shortcut.meta === undefined || shortcut.meta === e.metaKey;
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && metaMatch && keyMatch) {
          e.preventDefault();
          shortcut.handler();
          break; // Only execute first matching shortcut
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, ...deps]);
}

