import React, { useState } from 'react';
import { Font } from '../types';
import { PreviewBar } from './PreviewBar';
import { TypefacePreview } from './TypefacePreview';

interface PreviewPanelProps {
  font: Font;
}

type PreviewMode = 'text' | 'typeface';

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ font }) => {
  const [mode, setMode] = useState<PreviewMode>('text');

  return (
    <div className="w-full h-full bg-white border-t border-neutral-200 flex flex-col">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-neutral-200 bg-neutral-50 flex-shrink-0">
        <button
          onClick={() => setMode('text')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            mode === 'text'
              ? 'text-blue-600 bg-white'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <i className="ph ph-text-aa mr-1.5"></i>
          Text Preview
          {mode === 'text' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setMode('typeface')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            mode === 'typeface'
              ? 'text-blue-600 bg-white'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <i className="ph ph-grid-four mr-1.5"></i>
          Typeface Preview
          {mode === 'typeface' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'text' ? (
          <PreviewBar font={font} />
        ) : (
          <TypefacePreview font={font} />
        )}
      </div>
    </div>
  );
};
