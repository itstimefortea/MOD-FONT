import React, { useState, useMemo, useDeferredValue } from 'react';
import { Font } from '../types';
import { renderTextLineWithGlyphs } from '../utils/textRenderer';

interface PreviewBarProps {
  font: Font;
}

export const PreviewBar: React.FC<PreviewBarProps> = React.memo(({ font }) => {
  const [previewText, setPreviewText] = useState('Hamburgefonts');
  const [size, setSize] = useState(64);
  const [tracking, setTracking] = useState(0);

  // Defer tracking updates to keep slider responsive
  const deferredTracking = useDeferredValue(tracking);

  // Only track the specific glyphs used in preview text for better memoization
  const usedGlyphs = useMemo(() => {
    const chars = new Set(previewText);
    const glyphMap: Record<string, typeof font.glyphs[string]> = {};
    chars.forEach(char => {
      if (font.glyphs[char]) {
        glyphMap[char] = font.glyphs[char];
      }
    });
    return glyphMap;
  }, [previewText, font]);

  // Memoize preview rendering for better performance
  const previewElements = useMemo(() => {
    return renderTextLineWithGlyphs(
      previewText,
      size,
      usedGlyphs,
      font.metrics,
      deferredTracking,
      'preview'
    );
  }, [previewText, size, deferredTracking, usedGlyphs, font.metrics]);

  return (
    <div className="w-full h-full bg-white p-4 flex flex-col">
      <div className="flex items-center gap-3 mb-3 flex-shrink-0">
        <input
          type="text"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded text-sm focus:outline-none focus:border-neutral-400"
          placeholder="Preview text..."
        />
        <div className="flex items-center gap-2">
          <i className="ph ph-text-aa text-sm text-neutral-400"></i>
          <input
            type="range"
            min="32"
            max="128"
            step="8"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-neutral-500 w-10">{size}px</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="ph ph-arrows-horizontal text-sm text-neutral-400"></i>
          <input
            type="range"
            min="-20"
            max="40"
            step="1"
            value={tracking}
            onChange={(e) => setTracking(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-neutral-500 font-mono w-10">{tracking > 0 ? '+' : ''}{tracking}</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex items-center">
        <svg width="100%" height={size + 20} style={{ minHeight: '100%' }}>
          {previewElements}
        </svg>
      </div>
    </div>
  );
});

