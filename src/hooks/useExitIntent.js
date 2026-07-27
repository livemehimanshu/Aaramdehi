import { useEffect, useCallback } from 'react';

/**
 * useExitIntent Hook
 * Detects when user is about to leave the page and triggers callback
 * 
 * Usage:
 * useExitIntent(() => {
 *   // Show exit-intent modal
 *   setShowExitModal(true);
 * });
 */
const useExitIntent = (onExit, threshold = 20) => {
  const handleMouseLeave = useCallback((e) => {
    // Only trigger for mouse leaving at top of page
    if (e.clientY <= threshold) {
      onExit();
    }
  }, [onExit, threshold]);

  const handleKeyDown = useCallback((e) => {
    // Detect Alt+F4, Ctrl+W, Cmd+W (common close shortcuts)
    if (
      (e.key === 'F4' && e.altKey) ||
      (e.key === 'w' && (e.ctrlKey || e.metaKey)) ||
      e.keyCode === 27 // ESC key
    ) {
      onExit();
    }
  }, [onExit]);

  useEffect(() => {
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMouseLeave, handleKeyDown]);
};

export default useExitIntent;
