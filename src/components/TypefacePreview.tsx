import React, { useState, useMemo, useDeferredValue, useCallback } from 'react';
import { Font } from '../types';
import { renderTextLine as renderTextLineUtil } from '../utils/textRenderer';

interface TypefacePreviewProps {
  font: Font;
}

export const TypefacePreview: React.FC<TypefacePreviewProps> = React.memo(({ font }) => {
  const [tracking, setTracking] = useState(0);

  // Defer tracking updates to keep slider responsive
  const deferredTracking = useDeferredValue(tracking);

  // Sample texts at various sizes for waterfall view
  const waterfallSamples = [
    { size: 72, text: 'The quick brown fox' },
    { size: 60, text: 'The quick brown fox jumps' },
    { size: 48, text: 'The quick brown fox jumps over' },
    { size: 36, text: 'The quick brown fox jumps over the lazy dog' },
    { size: 28, text: 'Pack my box with five dozen liquor jugs' },
    { size: 20, text: 'How vexingly quick daft zebras jump!' },
    { size: 16, text: 'Sphinx of black quartz, judge my vow' },
    { size: 12, text: 'The five boxing wizards jump quickly' },
  ];

  // Helper function to render text at a specific size using shared utility
  const renderTextLine = useCallback((text: string, size: number, additionalTracking = 0) => {
    return renderTextLineUtil(
      text,
      size,
      font,
      deferredTracking + additionalTracking,
      `typeface-${text.substring(0, 10)}`
    );
  }, [font, deferredTracking]);

  // Render alphabet section
  const alphabetSection = useMemo(() => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';

    const size = 48;
    const upperResult = renderTextLine(uppercase, size);
    const lowerResult = renderTextLine(lowercase, size);
    const numbersResult = renderTextLine(numbers, size);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-medium text-neutral-500 mb-2">UPPERCASE</h3>
          <svg width="100%" height={size + 10}>
            <g transform="translate(0, 0)">
              {upperResult.elements}
            </g>
          </svg>
        </div>
        <div>
          <h3 className="text-xs font-medium text-neutral-500 mb-2">LOWERCASE</h3>
          <svg width="100%" height={size + 10}>
            <g transform="translate(0, 0)">
              {lowerResult.elements}
            </g>
          </svg>
        </div>
        <div>
          <h3 className="text-xs font-medium text-neutral-500 mb-2">NUMBERS</h3>
          <svg width="100%" height={size + 10}>
            <g transform="translate(0, 0)">
              {numbersResult.elements}
            </g>
          </svg>
        </div>
      </div>
    );
  }, [renderTextLine]);

  // Render waterfall section
  const waterfallSection = useMemo(() => {
    return (
      <div className="space-y-4">
        <h3 className="text-xs font-medium text-neutral-500 mb-3">WATERFALL</h3>
        {waterfallSamples.map((sample, index) => {
          const result = renderTextLine(sample.text, sample.size);
          return (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs text-neutral-400 font-mono w-8 flex-shrink-0">{sample.size}px</span>
              <svg width="100%" height={sample.size + 10}>
                <g transform="translate(0, 0)">
                  {result.elements}
                </g>
              </svg>
            </div>
          );
        })}
      </div>
    );
  }, [renderTextLine, waterfallSamples]);

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Controls */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-neutral-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <i className="ph ph-arrows-horizontal text-sm text-neutral-400"></i>
          <label className="text-xs text-neutral-600 font-medium">Tracking:</label>
          <input
            type="range"
            min="-20"
            max="40"
            step="1"
            value={tracking}
            onChange={(e) => setTracking(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="text-xs text-neutral-500 font-mono w-12">{tracking > 0 ? '+' : ''}{tracking}</span>
          {tracking !== 0 && (
            <button
              onClick={() => setTracking(0)}
              className="text-xs text-blue-500 hover:text-blue-600"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-12 max-w-[1400px]">
          {alphabetSection}
          <div className="border-t border-neutral-200 pt-8">
            {waterfallSection}
          </div>
        </div>
      </div>
    </div>
  );
});
