import { useState, useEffect, useCallback, useRef } from "react";
import { pdfManager, type RemoteParagraph, type TextParagraph } from "@/lib/pdf-manager";
import type { PDFPageProxy } from "pdfjs-dist";
import { toast } from "sonner";
import type { DiscoveredFont } from "@/types/editor";

export function usePDFRenderer(file: File, onExit: () => void) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [paragraphs, setParagraphs] = useState<TextParagraph[]>([]);
  const [remoteParagraphs, setRemoteParagraphs] = useState<RemoteParagraph[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPageProxy, setCurrentPageProxy] = useState<PDFPageProxy | null>(null);
  const [paragraphRegistry, setParagraphRegistry] = useState<Record<string, TextParagraph>>({});
  const [discoveredFonts, setDiscoveredFonts] = useState<Record<string, DiscoveredFont>>({});
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasInit = useRef(false);

  // ── Init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;

    const init = async () => {
      try {
        const pages = await pdfManager.load(file);
        setNumPages(pages);

        // Try to initialize remote session for precision editing quietly
        // (Loading UX is now handled by the separate LoadingScreen component)
        try {
          const res = await pdfManager.loadRemote(file);
          setSessionId(res.sessionId);
          setRemoteParagraphs(res.paragraphs);
        } catch (err) {
          console.warn("[PrecisionEngine] Remote init failed, local fallback:", err);
        }
      } catch (err) {
        console.error("PDF Load Error:", err);
        toast.error("Failed to load PDF");
        onExit();
      }
    };
    init();
  }, [file, onExit]);

  // ── Load page ─────────────────────────────────────────────────────────
  const loadPage = useCallback(async (pageNo: number) => {
    if (!canvasRef.current) return;
    toast.loading(`Rendering page ${pageNo}…`, { id: "page-load" });

    await pdfManager.renderPage(pageNo, canvasRef.current, scale);
    const [proxy, paras] = await Promise.all([
      pdfManager.getPage(pageNo),
      pdfManager.getParagraphs(pageNo),
    ]);
    setCurrentPageProxy(proxy);
    setParagraphs(paras);
    
    // Register these paragraphs so we don't lose their metadata when changing pages
    setParagraphRegistry(prev => {
      const next = { ...prev };
      paras.forEach(p => { next[p.id] = p; });
      return next;
    });

    setDiscoveredFonts({}); // reset until TextOverlay re-discovers
    toast.dismiss("page-load");
  }, [scale]);

  useEffect(() => {
    if (numPages > 0) loadPage(currentPage);
  }, [currentPage, scale, numPages, loadPage]);

  // Helper actions
  const goToNextPage = () => setCurrentPage(p => Math.min(numPages, p + 1));
  const goToPrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const zoomIn = () => setScale(s => Math.min(3, +(s + 0.25).toFixed(2)));
  const zoomOut = () => setScale(s => Math.max(0.5, +(s - 0.25).toFixed(2)));

  return {
    canvasRef,
    numPages,
    currentPage,
    setCurrentPage,
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
  };
}
