import React, { useRef } from 'react';
import { Font } from '../types';

interface ToolbarProps {
  font: Font;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowShortcuts: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  font,
  onExportJSON,
  onImportJSON,
  onShowShortcuts,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        <button
          onClick={onExportJSON}
          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm"
        >
          <i className="ph ph-download-simple"></i> Export
        </button>
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

