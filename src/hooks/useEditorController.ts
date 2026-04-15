import { useState, useCallback } from "react";
import { useHistory } from "./useHistory";
import { usePDFRenderer } from "./usePDFRenderer";
import { usePDFExport } from "./usePDFExport";
import { useAutoSave } from "./useAutoSave";
import { useEditorShortcuts } from "./useEditorShortcuts";
import { toast } from "sonner";

interface UseEditorControllerProps {
  file: File;
  onExit: () => void;
  initialEdits?: Record<string, string>;
}

export function useEditorController({ file, onExit, initialEdits = {} }: UseEditorControllerProps) {
  // ── Core Logic Hooks ────────────────────────────────────────────────
  const {
    state: edits,
    setState: setEdits,
    undo,
    redo,
    reset: resetHistory,
    canUndo,
    canRedo,
  } = useHistory<Record<string, string>>(initialEdits);

  const {
    canvasRef,
    numPages,
    currentPage,
    scale,
    paragraphs,
    remoteParagraphs,
    sessionId,
    currentPageProxy,
    paragraphRegistry,
    discoveredFonts,
    setDiscoveredFonts,
    goToNextPage,
    goToPrevPage,
    zoomIn,
    zoomOut,
  } = usePDFRenderer(file, onExit);

  // ── UI Interactivity State ──────────────────────────────────────────
  const [activeParaId, setActiveParaId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Export Handling ─────────────────────────────────────────────────
  const { isExporting, performExport, isExportingDocx, performExportDocx } = usePDFExport({
    file,
    sessionId,
    edits,
    remoteParagraphs,
    paragraphRegistry,
    discoveredFonts,
  });

  // ── Handlers ───────────────────────────────────────────────────────
  const handleParagraphEdit = useCallback((paraId: string, newText: string) => {
    // Search in visual paragraphs or remote runs to validate existence
    const isVisualPara = paragraphs.some(p => p.id === paraId);
    const isRemoteRun = remoteParagraphs.some(rp => rp.runs.some(r => r.id === paraId));
    
    if (!isVisualPara && !isRemoteRun) return;

    setEdits(prev => ({
      ...prev,
      [paraId]: newText,
    }));
  }, [paragraphs, remoteParagraphs, setEdits]);

  const editCount = Object.keys(edits).length;

  const handleSaveClick = useCallback(() => {
    if (editCount === 0) {
      toast.info("No modifications detected yet.");
      return;
    }
    setShowConfirm(true);
  }, [editCount]);

  const confirmExport = useCallback(() => {
    setShowConfirm(false);
    performExport();
  }, [performExport]);

  const confirmExportDocx = useCallback(() => {
    setShowConfirm(false);
    performExportDocx();
  }, [performExportDocx]);

  // ── Background SoC Hooks ───────────────────────────────────────────
  useAutoSave({ fileName: file.name, edits });
  useEditorShortcuts({ undo, redo, onSave: handleSaveClick });

  // ── Final Orchestration Object ────────────────────────────────────
  return {
    // Document State
    file,
    edits,
    editCount,
    setEdits,
    paragraphs,
    remoteParagraphs,
    sessionId,
    discoveredFonts,
    
    // Rendering State
    canvasRef,
    numPages,
    currentPage,
    scale,
    currentPageProxy,
    
    // UI State
    activeParaId,
    setActiveParaId,
    showConfirm,
    setShowConfirm,
    isExporting,
    isExportingDocx,
    
    // Capabilities
    canUndo,
    canRedo,
    
    // Actions
    undo,
    redo,
    resetHistory,
    goToNextPage,
    goToPrevPage,
    zoomIn,
    zoomOut,
    handleParagraphEdit,
    handleSaveClick,
    confirmExport,
    confirmExportDocx,
    setDiscoveredFonts,
    onExit,
  };
}
