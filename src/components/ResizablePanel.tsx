import React, { useState, useCallback, useEffect, useRef } from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultSize: number; // in pixels
  minSize?: number;
  maxSize?: number;
  direction: 'horizontal' | 'vertical'; // horizontal = left/right resize, vertical = top/bottom resize
  position: 'left' | 'right' | 'top' | 'bottom';
  storageKey?: string; // for localStorage persistence
  className?: string;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultSize,
  minSize = 200,
  maxSize = 800,
  direction,
  position,
  storageKey,
  className = '',
}) => {
  // Load size from localStorage if available
  const getInitialSize = () => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const size = parseInt(saved, 10);
          return Math.max(minSize, Math.min(maxSize, size));
        }
      } catch (error) {
        // localStorage might be unavailable (private browsing, storage full, etc.)
        console.warn('Failed to load panel size from localStorage:', error);
      }
    }
    return defaultSize;
  };

  const [size, setSize] = useState(getInitialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  // Save to localStorage when size changes
  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, size.toString());
      } catch (error) {
        // localStorage might be unavailable (private browsing, storage full, etc.)
        console.warn('Failed to save panel size to localStorage:', error);
      }
    }
  }, [size, storageKey]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
      startSizeRef.current = size;

      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
    },
    [direction, size]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      let delta = currentPos - startPosRef.current;

      // Invert delta for right/bottom positions
      if (position === 'right' || position === 'bottom') {
        delta = -delta;
      }

      const newSize = startSizeRef.current + delta;
      const clampedSize = Math.max(minSize, Math.min(maxSize, newSize));

      setSize(clampedSize);
    },
    [isResizing, direction, position, minSize, maxSize]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.userSelect = '';
  }, []);

  // Global mouse event listeners
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Determine cursor style based on direction
  const getCursorClass = () => {
    if (direction === 'horizontal') {
      return 'cursor-col-resize';
    }
    return 'cursor-row-resize';
  };

  // Determine handle position and styling
  const getHandleStyles = () => {
    const baseStyles = 'absolute z-10 transition-colors';
    // Invisible hit area for easier interaction
    const hoverStyles = 'bg-transparent';

    if (direction === 'horizontal') {
      // Vertical handle for horizontal resizing
      const horizontalStyles = `${baseStyles} ${hoverStyles} top-0 bottom-0 w-2 ${getCursorClass()}`;

      if (position === 'left') {
        return `${horizontalStyles} -right-1`;
      }
      return `${horizontalStyles} -left-1`;
    } else {
      // Horizontal handle for vertical resizing
      const verticalStyles = `${baseStyles} ${hoverStyles} left-0 right-0 h-2 ${getCursorClass()}`;

      if (position === 'top') {
        return `${verticalStyles} -bottom-1`;
      }
      return `${verticalStyles} -top-1`;
    }
  };

  // Determine panel size styles
  const getPanelStyles = () => {
    if (direction === 'horizontal') {
      return { width: `${size}px`, flexShrink: 0 };
    }
    return { height: `${size}px`, flexShrink: 0 };
  };

  return (
    <div
      className={`relative ${className}`}
      style={getPanelStyles()}
    >
      {children}

      {/* Drag handle */}
      <div
        className={getHandleStyles()}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Visual indicator when hovering - directly on the border */}
        {(isHovering || isResizing) && (
          <div
            className="absolute bg-blue-500 transition-opacity pointer-events-none"
            style={{
              width: direction === 'horizontal' ? '2px' : '100%',
              height: direction === 'vertical' ? '2px' : '100%',
              left: direction === 'horizontal' ? '50%' : 0,
              top: direction === 'vertical' ? '50%' : 0,
              transform: direction === 'horizontal' ? 'translateX(-50%)' : 'translateY(-50%)',
              opacity: isResizing ? 0.8 : 0.5,
            }}
          />
        )}
      </div>
    </div>
  );
};
