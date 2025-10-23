import React, { useRef, useState } from 'react';
import { Font } from '../types';

interface ToolbarProps {
  font: Font;
  onExportJSON: () => void;
  onExportTTF: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowShortcuts: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  font,
  onExportJSON,
  onExportTTF,
  onImportJSON,
  onShowShortcuts,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  return (
    <div className="bg-neutral-900 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold">Typeface Editor</h1>
        <div className="text-sm text-neutral-400">
          {font.meta.familyName} {font.meta.styleName}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onShowShortcuts}
          className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
          title="Keyboard Shortcuts (?)"
        >
          <i className="ph ph-keyboard"></i> Shortcuts
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
        >
          <i className="ph ph-upload-simple"></i> Import
        </button>

        {/* Export split button with dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <div className="flex">
            <button
              onClick={onExportJSON}
              className="px-3 py-1.5 rounded-l bg-blue-600 hover:bg-blue-500 text-sm"
            >
              <i className="ph ph-download-simple"></i> Export
            </button>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-2 py-1.5 rounded-r bg-blue-600 hover:bg-blue-500 text-sm border-l border-blue-500"
              title="Export options"
            >
              <i className={`ph ph-caret-${showExportMenu ? 'up' : 'down'}`}></i>
            </button>
          </div>

          {showExportMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded shadow-lg border border-neutral-200 py-1 z-50">
              <button
                onClick={() => {
                  onExportJSON();
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
              >
                <i className="ph ph-file-text"></i>
                <span>Export as JSON</span>
              </button>
              <button
                onClick={() => {
                  onExportTTF();
                  setShowExportMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
              >
                <i className="ph ph-file-arrow-down"></i>
                <span>Export as TTF Font</span>
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={onImportJSON}
          className="hidden"
        />
      </div>
    </div>
  );
};

