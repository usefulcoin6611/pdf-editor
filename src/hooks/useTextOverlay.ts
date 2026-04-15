import { useEffect, useRef, useState, useCallback } from "react";
import { TextLayer } from "pdfjs-dist";
import type { PDFPageProxy } from "pdfjs-dist";
import type { TextParagraph } from "@/lib/pdf-manager";
import { discoverPdfJsFonts } from "@/lib/pdf/font-discovery";
import type { DiscoveredFont } from "@/types/editor";

export interface UseTextOverlayProps {
  page: PDFPageProxy;
  scale: number;
  paragraphs: TextParagraph[];
  onParagraphEdit: (paragraphId: string, newText: string) => void;
  onFontsDiscovered?: (fontMap: Record<string, DiscoveredFont>) => void;
  onActiveChange?: (paraId: string | null) => void;
}

export interface TextOverlayHook {
  nativeRef: React.RefObject<HTMLDivElement>;
  activeParagraphId: string | null;
  setActiveParagraphId: (id: string | null) => void;
  discoveredFonts: Record<string, DiscoveredFont>;
  handleBlur: (paraId: string, el: HTMLDivElement) => void;
}

export function useTextOverlay({
  page,
  scale,
  paragraphs,
  onParagraphEdit,
  onFontsDiscovered,
  onActiveChange,
}: UseTextOverlayProps): TextOverlayHook {
  const nativeRef = useRef<HTMLDivElement>(null);
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const [discoveredFonts, setDiscoveredFonts] = useState<Record<string, DiscoveredFont>>({});

  // ── Sync Active State ───────────────────────────────────────────────
  
  useEffect(() => {
    onActiveChange?.(activeParagraphId);
  }, [activeParagraphId, onActiveChange]);

  useEffect(() => {
    setActiveParagraphId(null);
  }, [page]);

  // ── Render & Discovery Logic ─────────────────────────────────────────

  const renderAndDiscover = useCallback(async (signal: { cancelled: boolean }) => {
    if (!page || !nativeRef.current) return;

    const container = nativeRef.current;
    container.innerHTML = ""; // Clear previous layer
    
    const viewport = page.getViewport({ scale });
    container.style.width = `${viewport.width}px`;
    container.style.height = `${viewport.height}px`;

    try {
      // 1. Fetch text content from PDF
      const textContentSource = await page.getTextContent();
      if (signal.cancelled) return;

      // 2. Initialize and render TextLayer
      const task = new TextLayer({
        textContentSource,
        container,
        viewport,
      });

      await task.render();
      if (signal.cancelled) return;

      // 3. Wait for browser to register @font-face rules
      await document.fonts.ready;
      if (signal.cancelled) return;
      
      // 4. Scrape the rendered DOM spans for font metadata
      const fontMap = await discoverPdfJsFonts(container, paragraphs, scale);
      
      if (!signal.cancelled) {
        setDiscoveredFonts(fontMap);
        onFontsDiscovered?.(fontMap);
      }
    } catch (err: any) {
      if (err.name !== "RenderingCancelledException") {
        console.error("[useTextOverlay] Render failed:", err);
      }
    }
  }, [page, scale, paragraphs, onFontsDiscovered]);

  useEffect(() => {
    const signal = { cancelled: false };
    renderAndDiscover(signal);
    
    return () => {
      signal.cancelled = true;
    };
  }, [renderAndDiscover]);

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleBlur = useCallback((paraId: string, el: HTMLDivElement) => {
    const newText = el.innerText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
    onParagraphEdit(paraId, newText);
    setActiveParagraphId(null);
  }, [onParagraphEdit]);

  return {
    nativeRef,
    activeParagraphId,
    setActiveParagraphId,
    discoveredFonts,
    handleBlur,
  };
}
