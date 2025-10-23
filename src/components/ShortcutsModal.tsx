import React from 'react';
import { KEYBOARD_SHORTCUTS } from '../constants/shortcuts';

interface ShortcutsModalProps {
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <i className="ph ph-x text-xl"></i>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {KEYBOARD_SHORTCUTS.map(({ category, items }) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-bold text-neutral-500 uppercase mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map(({ keys, description }) => (
                  <div key={keys} className="flex items-center justify-between">
                    <span className="text-neutral-700">{description}</span>
                    <kbd className="px-3 py-1 bg-neutral-100 border border-neutral-300 rounded text-sm font-mono">
                      {keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

