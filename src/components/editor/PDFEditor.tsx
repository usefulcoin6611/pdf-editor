import { motion, AnimatePresence } from "framer-motion";
import { TextOverlay } from "./TextOverlay";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Save, RotateCcw, Undo2, Redo2, FileText } from "lucide-react";

import { useEditorController } from "@/hooks/useEditorController";
import type { PDFEditorProps } from "@/types/editor";

export function PDFEditor({ file, onExit, initialEdits = {} }: PDFEditorProps) {
  const {
    // State
    edits,
    editCount,
    paragraphs,
    remoteParagraphs,
    sessionId,
    discoveredFonts,
    canvasRef,
    numPages,
    currentPage,
    scale,
    currentPageProxy,
    activeParaId,
    setActiveParaId,
    showConfirm,
    setShowConfirm,
    isExporting,
    isExportingDocx,
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
  } = useEditorController({ file, onExit, initialEdits });

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-full flex-col bg-zinc-100 dark:bg-zinc-900">
      {/* Toolbar */}
      <header className="flex h-14 items-center justify-between border-b bg-white px-4 shadow-sm shrink-0 gap-4">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" className="h-8" onClick={onExit}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate max-w-[180px]">{file.name}</span>
          {editCount > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 font-medium shrink-0">
              {editCount} edit{editCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Center: Zoom */}
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={zoomOut}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-sm tabular-nums w-12 text-center font-medium">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={zoomIn}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Active Font Display (Hybrid: Discovery + Backend Data) */}
          <AnimatePresence>
            {(activeParaId || Object.keys(discoveredFonts).length > 0 || remoteParagraphs.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="hidden md:flex items-center gap-2.5 px-3 py-1 bg-zinc-50 rounded-full border border-zinc-100 mr-1"
              >
                {(() => {
                  const targetId = activeParaId || Object.keys(discoveredFonts)[0] || remoteParagraphs[0]?.runs?.[0]?.id;
                  if (!targetId) return null;

                  const disc = discoveredFonts[targetId];
                  const backendRun = remoteParagraphs.flatMap(rp => rp.runs).find(r => r.id === targetId);
                  const visualPara = paragraphs.find(p => p.id === targetId);
                  
                  const family = disc?.fontFamily.split(',')[0].replace(/"/g, '').trim() || backendRun?.fontName || "Universal";
                  const isBold = disc ? (disc.fontWeight === '700' || disc.fontWeight === 'bold') : (backendRun?.bold);
                  const isItalic = disc ? (disc.fontStyle === 'italic') : (backendRun?.italic);
                  const fontSize = disc?.fontSize || (visualPara ? `${Math.round(visualPara.fontSize)}px` : "");

                  return (
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 leading-none">
                        <FileText className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate max-w-[100px]">{family}</span>
                        {fontSize && <span className="text-indigo-400 opacity-80">{fontSize}</span>}
                      </span>
                      <span className="text-[8px] text-zinc-400 font-medium mt-1 truncate">
                        {isBold ? 'Bold ' : ''}
                        {isItalic ? 'Italic' : (!isBold ? 'Regular' : '')}
                        {!disc && backendRun && " (Engine)"}
                        {!activeParaId && " (Doc Default)"}
                      </span>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center rounded-full border bg-muted overflow-hidden">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <div className="w-px h-4 bg-border" />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button
            variant="outline" size="sm" className="h-8"
            onClick={() => resetHistory({})}
            disabled={!editCount}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset
          </Button>

          {sessionId && (
            <Button
              variant="outline" size="sm" className="h-8 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              onClick={confirmExportDocx}
              disabled={isExportingDocx}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" /> {isExportingDocx ? "Exporting..." : "Download .docx"}
            </Button>
          )}

          <Button
            size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSaveClick}
            disabled={isExporting}
          >
            <Save className="h-3.5 w-3.5 mr-1.5" /> {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <main className="flex-1 overflow-auto p-6 bg-zinc-200/50">
          <div className="flex justify-center min-h-full">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative self-start shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5 rounded-sm overflow-hidden"
            >
              <canvas ref={canvasRef} className="block bg-white" />
              {currentPageProxy && (
                <TextOverlay
                  page={currentPageProxy}
                  scale={scale}
                  paragraphs={paragraphs}
                  edits={edits}
                  onParagraphEdit={handleParagraphEdit}
                  onFontsDiscovered={setDiscoveredFonts}
                  onActiveChange={setActiveParaId}
                />
              )}
            </motion.div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-80 border-l bg-white flex flex-col gap-0 shrink-0 shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
          <div className="p-4 border-b">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-3">Document Navigation</p>
            <div className="flex items-center justify-between bg-zinc-50 p-1 rounded-full border">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={goToPrevPage}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm tabular-nums font-semibold text-zinc-700">{currentPage} <span className="text-zinc-300 mx-1">/</span> {numPages}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={currentPage === numPages} onClick={goToNextPage}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em]">Modification History</p>
            {sessionId ? (
              <div className="flex flex-col gap-4">
                {remoteParagraphs.map((rp) => {
                  const hasEdits = rp.runs.some(r => edits[r.id]);
                  if (!hasEdits && remoteParagraphs.length > 20) return null;
                  
                  return (
                    <div key={rp.id} className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${hasEdits ? "bg-indigo-50/50 border-indigo-100 ring-1 ring-indigo-50" : "bg-zinc-50/30 border-transparent hover:border-zinc-200"}`}>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase">Section {rp.id}</span>
                        {hasEdits && (
                          <span className="flex items-center gap-1 text-[9px] text-indigo-600 font-black">
                            <span className="h-1 w-1 rounded-full bg-indigo-600 animate-pulse" /> MODIFIED
                          </span>
                        )}
                      </div>
                      
                      {rp.runs.map((run) => (
                        <div key={run.id} className="flex flex-col gap-1.5 mb-3 last:mb-0">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded uppercase">{run.id}</span>
                          </div>
                          <div className="relative">
                            <textarea
                              className={`text-xs w-full p-2.5 bg-white border rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none min-h-[60px] leading-relaxed ${edits[run.id] ? "border-indigo-200 text-zinc-900" : "text-zinc-500"}`}
                              style={{
                                color: run.color ? `#${run.color}` : "inherit",
                                fontWeight: run.bold ? "700" : "400",
                                fontStyle: run.italic ? "italic" : "normal",
                              }}
                              value={edits[run.id] ?? run.text}
                              onFocus={() => setActiveParaId(run.id)}
                              onChange={(e) => {
                                handleParagraphEdit(run.id, e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                <RotateCcw className="h-8 w-8 mb-2 animate-spin-slow" />
                <p className="text-xs font-medium">Booting precision engine...</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-zinc-500">
                <span>Modification Count</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{editCount}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-500">
                <span>Active Engine</span>
                <span className="flex items-center gap-1.5 font-semibold text-zinc-700">
                  <span className={`h-2 w-2 rounded-full ${sessionId ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500"}`} />
                  {sessionId ? "Precision (DOCX)" : "Local (PDF)"}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100"
            >
              <div className="p-8">
                <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                  <Save className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">Finalize Edits?</h3>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                  You are about to export <span className="font-bold text-zinc-900">{editCount} modification{editCount !== 1 ? "s" : ""}</span>. 
                  This will generate a high-precision PDF document with your changes integrated into the layout.
                </p>
                <div className="space-y-3">
                  <Button 
                    variant="cta"
                    className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-[0.98]"
                    onClick={confirmExport}
                  >
                    Yes, Export Document
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full h-12 text-base font-semibold text-zinc-500 hover:bg-zinc-50"
                    onClick={() => setShowConfirm(false)}
                  >
                    Continue Editing
                  </Button>
                </div>
              </div>
              <div className="bg-zinc-50 px-8 py-4 border-t flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Engine: {sessionId ? "Hybrid Precision" : "Local Masking"}</span>
                <span className="text-[10px] font-bold text-indigo-500">Antigravity PDF Forge v4</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
