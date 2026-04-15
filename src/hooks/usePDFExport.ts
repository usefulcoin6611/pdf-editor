import { useState, useCallback } from "react";
import { pdfManager } from "@/lib/pdf-manager";
import { toast } from "sonner";
import type { ExportEdit, RemoteParagraph, TextParagraph } from "@/lib/pdf-manager";
import type { DiscoveredFont } from "@/types/editor";

interface UsePDFExportProps {
  file: File;
  sessionId: string | null;
  edits: Record<string, string>;
  remoteParagraphs: RemoteParagraph[];
  paragraphRegistry: Record<string, TextParagraph>;
  discoveredFonts: Record<string, DiscoveredFont>;
}

export function usePDFExport({
  file,
  sessionId,
  edits,
  remoteParagraphs,
  paragraphRegistry,
  discoveredFonts,
}: UsePDFExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const performExport = useCallback(async () => {
    if (Object.keys(edits).length === 0) {
      toast.info("No edits to export");
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Preparing high-fidelity export...");

    try {
      let resultData: Uint8Array;

      if (sessionId) {
        // --- Path A: Hybrid Precision Export (Backend/DOCX Engine) ---
        const exportEdits = Object.entries(edits).map(([id, newText]) => {
          let runId = id;
          
          // Map Canvas Visual ID to Backend DOCX ID if necessary
          if (paragraphRegistry[id]) {
             const originalText = paragraphRegistry[id].text.replace(/\s+/g, '').trim();
             const matchedPara = remoteParagraphs.find(rp => 
               rp.text.replace(/\s+/g, '').trim() === originalText || 
               rp.runs.some(r => r.text.replace(/\s+/g, '').trim() === originalText)
             );
             if (matchedPara) {
               const matchedRun = matchedPara.runs.find(r => r.text.replace(/\s+/g, '').trim() === originalText);
               runId = matchedRun ? matchedRun.id : matchedPara.id;
             }
          }

          return { runId, newText };
        });
        resultData = await pdfManager.exportRemote(sessionId, exportEdits);
      } else {
        // --- Path B: Local Canvas Masking Export (Frontend/Native PDF) ---
        const exportEdits: ExportEdit[] = Object.keys(edits).map(id => {
          const visualPara = paragraphRegistry[id];
          const match = remoteParagraphs.find(rp => rp.runs.some(run => run.id === id));
          
          return {
            paragraphId: id,
            pageNumber: visualPara?.pageNumber || 1,
            newText: edits[id],
            originalText: visualPara?.text || match?.text || "",
            lines: visualPara?.lines || [],
            fontSize: visualPara?.fontSize || 12,
            fontFamily: visualPara?.fontFamily || "serif",
            bold: visualPara?.bold || false,
            italic: visualPara?.italic || false,
            fontWeight: visualPara?.fontWeight || 400,
            letterSpacing: visualPara?.letterSpacing || 0,
            discoveredFontFamily: discoveredFonts[id]?.fontFamily,
          };
        });

        resultData = await pdfManager.exportWithEdits(exportEdits);
      }

      // Download result
      const blob = new Blob([resultData as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      link.href = url;
      link.download = `edited_${file.name.replace(".pdf", "")}_${timestamp}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("PDF Exported successfully!", { id: toastId });
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export PDF", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  }, [file, sessionId, edits, remoteParagraphs, paragraphRegistry, discoveredFonts]);

  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const performExportDocx = useCallback(async () => {
    if (!sessionId) {
      toast.error("DOCX export requires backend processing.");
      return;
    }

    setIsExportingDocx(true);
    const toastId = toast.loading("Preparing DOCX export...");

    try {
      const exportEdits = Object.entries(edits).map(([id, newText]) => {
          let runId = id;
          if (paragraphRegistry[id]) {
             const originalText = paragraphRegistry[id].text.replace(/\s+/g, '').trim();
             const matchedPara = remoteParagraphs.find(rp => 
               rp.text.replace(/\s+/g, '').trim() === originalText || 
               rp.runs.some(r => r.text.replace(/\s+/g, '').trim() === originalText)
             );
             if (matchedPara) {
               const matchedRun = matchedPara.runs.find(r => r.text.replace(/\s+/g, '').trim() === originalText);
               runId = matchedRun ? matchedRun.id : matchedPara.id;
             }
          }
          return { runId, newText };
      });
      const resultData = await pdfManager.exportRemoteDocx(sessionId, exportEdits);

      // Download result
      const blob = new Blob([resultData as any], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      link.href = url;
      link.download = `edited_${file.name.replace(".pdf", "")}_${timestamp}.docx`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("DOCX Exported successfully!", { id: toastId });
    } catch (err) {
      console.error("DOCX Export error:", err);
      toast.error("Failed to export DOCX", { id: toastId });
    } finally {
      setIsExportingDocx(false);
    }
  }, [file, sessionId, edits]);

  return {
    isExporting,
    performExport,
    isExportingDocx,
    performExportDocx,
  };
}
