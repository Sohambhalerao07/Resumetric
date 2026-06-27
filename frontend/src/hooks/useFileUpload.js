/**
 * useFileUpload — File selection and drag-and-drop handling
 *
 * WHY: Drag-and-drop has complex event logic (dragover, dragleave, drop)
 * that's cleaner to isolate in a hook. The component just spreads the handlers.
 *
 * @param {Function} onFileSelect - Called with the selected File object
 * @param {number}   maxSize      - Max file size in bytes (for UI feedback only)
 */

import { useState, useCallback } from 'react';

function useFileUpload(onFileSelect) {
  // Track drag state for visual feedback (dropzone highlight)
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Handles a file from any source (input, drop)
   */
  const processFile = useCallback((file) => {
    if (!file) return;
    onFileSelect(file);
  }, [onFileSelect]);

  /**
   * Handles <input type="file"> change events
   */
  const handleFileInput = useCallback((event) => {
    const file = event.target.files?.[0];
    processFile(file);
    // Reset input so the same file can be re-selected if needed
    event.target.value = '';
  }, [processFile]);

  /**
   * Prevents browser default (open file in new tab) during drag
   */
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  }, []);

  /**
   * Handles mouse leaving the dropzone area.
   * Uses relatedTarget to avoid flicker when moving over child elements.
   */
  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    // Only reset if leaving the dropzone entirely, not entering a child element
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  /**
   * Handles file drop
   */
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    processFile(file);
  }, [processFile]);

  return {
    isDragging,
    handleFileInput,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}

export default useFileUpload;
