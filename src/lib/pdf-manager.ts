import { getDocument, GlobalWorkerOptions, Util } from "pdfjs-dist";
import type { PDFDocumentProxy, RenderTask, PDFPageProxy } from "pdfjs-dist";
import { PDFDocument, rgb, StandardFonts, PDFName, PDFDict, PDFStream } from "pdf-lib";

import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
// Set worker source for pdf.js
GlobalWorkerOptions.workerSrc = pdfjsWorker;

const API_URL = "http://localhost:8000/api";

export interface RemoteRun {
  id: string;
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number | null;
  fontName: string | null;
  color: string | null;
}

export interface RemoteParagraph {
  id: string;
  text: string;
  alignment?: string;
  runs: RemoteRun[];
}

export interface RemoteLoadResponse {
  sessionId: string;
  paragraphs: RemoteParagraph[];
  pageCount: number;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RawTextItem {
  text: string;
  pdfX: number;  // PDF-space baseline X (pts)
  pdfY: number;  // PDF-space baseline Y (pts, bottom-left origin)
  pdfWidth: number;
  fontSize: number; // pts
  fontName: string; // internal PDF font key
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  fontWeight: number;
  letterSpacing: number;
  vx: number;  // viewport X at scale=1
  vy: number;  // viewport top-of-glyph at scale=1
  vh: number;  // viewport glyph height at scale=1
}

export interface TextLine {
  items: RawTextItem[];
  text: string;
  vx: number; vy: number; vw: number; vh: number;
  pdfX: number; pdfY: number; pdfWidth: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  fontWeight: number;
  letterSpacing: number;
}

export interface TextParagraph {
  id: string;
  pageNumber: number;
  lines: TextLine[];
  text: string;
  vx: number; vy: number; vw: number; vh: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  fontWeight: number;
  letterSpacing: number;
  alignment?: string;
  color?: string;
  /** PDF font resource key (e.g. "F1") for advanced font embedding */
  pdfFontKey?: string;
}

export interface ExportEdit {
  paragraphId: string;
  pageNumber: number;
  newText: string;
  originalText: string;
  lines: TextLine[];
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  fontWeight: number;
  letterSpacing: number;
  /** CSS font-family discovered from pdf.js TextLayer spans */
  discoveredFontFamily?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectWeight(name: string, family: string): number {
  const n = (name + family).toLowerCase();
  if (n.includes("black") || n.includes("heavy")) return 900;
  if (n.includes("bold")) return 700;
  if (n.includes("semibold") || n.includes("demibold")) return 600;
  if (n.includes("medium")) return 500;
  return 400;
}
function detectItalic(name: string, family: string) {
  return /italic|oblique/i.test(name) || /italic|oblique/i.test(family);
}

function buildLines(items: RawTextItem[]): TextLine[] {
  if (!items.length) return [];

  // Sort top → bottom, then left → right
  const sorted = [...items].sort((a, b) =>
    Math.abs(a.vy - b.vy) < 2 ? a.vx - b.vx : a.vy - b.vy
  );

  const groups: RawTextItem[][] = [];
  let current: RawTextItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].vy - current[0].vy) <= 2) {
      current.push(sorted[i]);
    } else {
      groups.push(current);
      current = [sorted[i]];
    }
  }
  groups.push(current);

  return groups.map((grp): TextLine => {
    const bx = [...grp].sort((a, b) => a.vx - b.vx);
    const rep = bx.reduce((a, b) => b.fontSize > a.fontSize ? b : a, bx[0]);
    
    // Join text with precision space detection (for columns/monospace alignment)
    let fullText = bx[0].text;
    for (let i = 1; i < bx.length; i++) {
      const prev = bx[i-1];
      const curr = bx[i];
      const gap = curr.vx - (prev.vx + prev.pdfWidth);
      
      // Calculate how many spaces fit in this physical gap
      // Monospace ratio: ~0.55-0.6 of fontSize. We'll use 0.55 as a safe baseline.
      if (gap > prev.fontSize * 0.2) {
        const spaceCount = Math.max(1, Math.round(gap / (prev.fontSize * 0.55)));
        fullText += " ".repeat(spaceCount);
      }
      fullText += curr.text;
    }

    return {
      items: bx,
      text: fullText,
      vx: Math.min(...bx.map(i => i.vx)),
      vy: Math.min(...bx.map(i => i.vy)),
      vw: Math.max(...bx.map(i => i.vx + i.pdfWidth)) - Math.min(...bx.map(i => i.vx)),
      vh: Math.max(...bx.map(i => i.vh)),
      pdfX: Math.min(...bx.map(i => i.pdfX)),
      pdfY: rep.pdfY,
      pdfWidth: bx.reduce((s, i) => s + i.pdfWidth, 0),
      fontSize: rep.fontSize,
      fontFamily: rep.fontFamily,
      bold: rep.bold,
      italic: rep.italic,
      fontWeight: rep.fontWeight,
      letterSpacing: rep.letterSpacing,
    };
  });
}

function buildParagraphs(lines: TextLine[], pageNumber: number): TextParagraph[] {
  if (!lines.length) return [];

  const paras: TextLine[][] = [];
  let current: TextLine[] = [lines[0]];

  const sameStyle = (a: TextLine, b: TextLine) =>
    a.fontFamily === b.fontFamily &&
    a.bold === b.bold &&
    a.italic === b.italic &&
    Math.abs(a.fontSize - b.fontSize) < 1.5;

  for (let i = 1; i < lines.length; i++) {
    const prev = current[current.length - 1];
    const curr = lines[i];
    const gap = curr.vy - (prev.vy + prev.vh);
    // New paragraph if there's a blank-line gap OR font style changes
    if (gap > prev.vh * 1.0 || !sameStyle(prev, curr)) {
      paras.push(current);
      current = [curr];
    } else {
      current.push(curr);
    }
  }
  paras.push(current);

  return paras.map((grpLines, idx): TextParagraph => {
    const rep = grpLines[0];
    const vx = Math.min(...grpLines.map(l => l.vx));
    const vy = Math.min(...grpLines.map(l => l.vy));
    const vRight = Math.max(...grpLines.map(l => l.vx + l.vw));
    const vBottom = Math.max(...grpLines.map(l => l.vy + l.vh));
    const pdfY = Math.min(...grpLines.map(l => l.pdfY));

    return {
      id: `${pageNumber}-p${idx}-${pdfY.toFixed(2)}`,
      pageNumber,
      lines: grpLines,
      text: grpLines.map(l => l.text).join("\n"),
      vx, vy, vw: vRight - vx, vh: vBottom - vy,
      fontSize: rep.fontSize,
      fontFamily: rep.fontFamily,
      bold: rep.bold,
      italic: rep.italic,
      fontWeight: rep.fontWeight,
      letterSpacing: rep.letterSpacing,
      pdfFontKey: rep.items[0]?.fontName,
    };
  });
}

// ─── Font Byte Extraction ─────────────────────────────────────────────────────

/**
 * Attempt to extract raw font bytes from the PDF's internal object stream.
 * Returns a Map of pdfFontName → Uint8Array (raw font bytes).
 * This allows re-embedding the EXACT same font in the exported PDF.
 */
async function extractEmbeddedFonts(
  rawData: Uint8Array
): Promise<Map<string, Uint8Array>> {
  const result = new Map<string, Uint8Array>();
  try {
    // Load a fresh copy just for font inspection
    const doc = await PDFDocument.load(rawData.slice());

    for (let pageIdx = 0; pageIdx < doc.getPageCount(); pageIdx++) {
      const page = doc.getPage(pageIdx);
      try {
        const resources = page.node.get(PDFName.of("Resources"));
        if (!resources || !(resources instanceof PDFDict)) continue;

        const fontDict = resources.get(PDFName.of("Font"));
        if (!fontDict || !(fontDict instanceof PDFDict)) continue;

        for (const [, fontRef] of fontDict.entries()) {
          const fontObj = (fontRef as any).value?.();
          if (!fontObj || !(fontObj instanceof PDFDict)) continue;

          const baseFont = fontObj.get(PDFName.of("BaseFont"));
          const fontName = (baseFont as any)?.asString?.() ?? (baseFont as any)?.encodedName ?? "unknown";

          const descriptor = fontObj.get(PDFName.of("FontDescriptor"));
          if (!descriptor || !(descriptor instanceof PDFDict)) continue;

          // Try TrueType (FontFile2) or OpenType/CFF (FontFile3)
          for (const key of ["FontFile", "FontFile2", "FontFile3"]) {
            const fontFileRef = descriptor.get(PDFName.of(key));
            if (!fontFileRef) continue;

            const fontStream = (fontFileRef as any).value?.();
            if (!fontStream || !(fontStream instanceof PDFStream)) continue;

            const bytes = fontStream.getContents?.();
            if (bytes && bytes.length > 0) {
              result.set(fontName, bytes);
              break;
            }
          }
        }
      } catch (e) {
        // Skip this page's fonts on error
      }
    }
  } catch (e) {
    console.warn("Font extraction failed (non-critical):", e);
  }
  return result;
}

// ─── PDFManager Class ─────────────────────────────────────────────────────────

export class PDFManager {
  private pdfDoc: PDFDocumentProxy | null = null;
  private originalData: Uint8Array | null = null;
  private currentRenderTask: RenderTask | null = null;
  private embeddedFonts: Map<string, Uint8Array> = new Map();

  async load(file: File): Promise<number> {
    const arrayBuffer = await file.arrayBuffer();
    this.originalData = Uint8Array.from(new Uint8Array(arrayBuffer));
    const header = new TextDecoder().decode(this.originalData.slice(0, 5));
    if (header !== "%PDF-") throw new Error(`Not a valid PDF file`);

    // Load for rendering
    this.pdfDoc = await getDocument({ data: this.originalData.slice() }).promise;

    // Extract embedded fonts in background (non-blocking)
    extractEmbeddedFonts(this.originalData).then(fonts => {
      this.embeddedFonts = fonts;
      console.log(`Extracted ${fonts.size} embedded fonts`);
    });

    return this.pdfDoc.numPages;
  }

  async getPage(pageNumber: number): Promise<PDFPageProxy | null> {
    if (!this.pdfDoc) return null;
    return this.pdfDoc.getPage(pageNumber);
  }

  async renderPage(pageNumber: number, canvas: HTMLCanvasElement, scale = 1.5): Promise<void> {
    if (!this.pdfDoc) return;
    if (this.currentRenderTask) {
      try { this.currentRenderTask.cancel(); } catch (_) { /* */ }
      this.currentRenderTask = null;
    }
    const page = await this.pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const ctx = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    this.currentRenderTask = page.render({ canvasContext: ctx, canvas, viewport });
    try {
      await this.currentRenderTask.promise;
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") throw err;
    } finally {
      this.currentRenderTask = null;
    }
  }

  async getParagraphs(pageNumber: number): Promise<TextParagraph[]> {
    if (!this.pdfDoc) return [];
    const page = await this.pdfDoc.getPage(pageNumber);
    const tc = await page.getTextContent();
    const vp = page.getViewport({ scale: 1 });

    const rawItems: RawTextItem[] = (tc.items as any[])
      .filter(item => item.str?.trim().length > 0)
      .map(item => {
        const [, , , , tx, ty] = item.transform as number[];
        const vpt = Util.transform(vp.transform, item.transform);
        const vx = vpt[4];
        const vy = vpt[5] - Math.abs(vpt[3]);
        const vh = Math.abs(vpt[3]);
        // vh represents the true visual height in viewport pixels (at scale=1)
        const fontSize = vh; 
        const style = (tc.styles as any)[item.fontName] ?? {};
        const fontFamily: string = style.fontFamily || "serif";
        return {
          text: item.str as string,
          pdfX: tx, pdfY: ty,
          pdfWidth: item.width as number,
          fontSize, fontName: item.fontName, fontFamily,
          bold: detectWeight(item.fontName, fontFamily) >= 600,
          italic: detectItalic(item.fontName, fontFamily),
          fontWeight: detectWeight(item.fontName, fontFamily),
          // Calculate letter spacing if the item has multiple characters
          letterSpacing: item.str.length > 1 
            ? Math.max(0, (item.width - (item.str.length * fontSize * 0.6)) / (item.str.length - 1)) 
            : 0,
          vx, vy, vh,
        };
      });

    return buildParagraphs(buildLines(rawItems), pageNumber);
  }

  /**
   * Export the PDF with edits applied.
   *
   * Strategy (in order of preference):
   * 1. Try to use the extracted embedded font bytes (exact match)
   * 2. Fall back to the closest standard Helvetica variant
   *
   * Masking: Draw white rectangles over each original line, then draw new text
   * at the EXACT same baseline using the original transform coordinates.
   */
  async exportWithEdits(edits: ExportEdit[]): Promise<Uint8Array> {
    if (!this.originalData) throw new Error("No PDF loaded");
    const docCopy = await PDFDocument.load(this.originalData.slice());
    const pages = docCopy.getPages();

    // Prepare fallback standard fonts
    const fallback = {
      regular: await docCopy.embedFont(StandardFonts.Helvetica),
      bold: await docCopy.embedFont(StandardFonts.HelveticaBold),
      italic: await docCopy.embedFont(StandardFonts.HelveticaOblique),
      boldItalic: await docCopy.embedFont(StandardFonts.HelveticaBoldOblique),
    };

    // Try to embed extracted fonts
    const embeddedFontCache = new Map<string, any>();
    for (const [name, bytes] of this.embeddedFonts) {
      try {
        const font = await docCopy.embedFont(bytes);
        embeddedFontCache.set(name, font);
      } catch (_) {
        // Font may be a subset or in unsupported format — skip
      }
    }

    const pickFont = (edit: ExportEdit) => {
      // Try extracted embedded fonts by matching font family name heuristic
      if (embeddedFontCache.size > 0) {
        // Match by bold/italic flags from font metadata
        for (const [name, font] of embeddedFontCache) {
          if (name.toLowerCase().includes("bold") === edit.bold &&
              name.toLowerCase().includes("italic") === edit.italic) {
            return font;
          }
        }
      }
      // Fallback to standard font
      if (edit.bold && edit.italic) return fallback.boldItalic;
      if (edit.bold) return fallback.bold;
      if (edit.italic) return fallback.italic;
      return fallback.regular;
    };

    for (const edit of edits) {
      if (edit.newText === edit.originalText) continue;
      const page = pages[edit.pageNumber - 1];
      const font = pickFont(edit);

      // Step 1: White-mask each original line precisely
      for (const line of edit.lines) {
        const ascent = line.fontSize * 0.88;
        const descent = line.fontSize * 0.22;
        page.drawRectangle({
          x: line.pdfX - 1,
          y: line.pdfY - descent,
          width: line.pdfWidth + 2,
          height: ascent + descent,
          color: rgb(1, 1, 1),
          opacity: 1,
        });
      }

      // Step 2: Draw user's new text at exact same baseline position
      const newLines = edit.newText.split("\n");
      const firstLine = edit.lines[0];
      // Line height in PDF pts = fontSize * 1.2 (standard PDF line-height)
      const lineHeightPts = firstLine.fontSize * 1.2;

      newLines.forEach((lineText, idx) => {
        if (!lineText.trim()) return;
        page.drawText(lineText, {
          x: firstLine.pdfX,
          y: firstLine.pdfY - idx * lineHeightPts,
          size: firstLine.fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      });
    }

    return docCopy.save();
  }

  getOriginalData(): Uint8Array | null {
    return this.originalData;
  }

  getEmbeddedFonts(): Map<string, Uint8Array> {
    return this.embeddedFonts;
  }

  // ─── Remote API (Hybrid DOCX Workflow) ───────────────────────────────

  async loadRemote(file: File): Promise<RemoteLoadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/load-pdf`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to load via remote engine");
    }

    return await response.json();
  }

  async exportRemote(sessionId: string, edits: { runId: string, newText: string }[]): Promise<Uint8Array> {
    const response = await fetch(`${API_URL}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, edits }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to export via remote engine");
    }

    const blob = await response.blob();
    return new Uint8Array(await blob.arrayBuffer());
  }

  async exportRemoteDocx(sessionId: string, edits: { runId: string, newText: string }[]): Promise<Uint8Array> {
    const response = await fetch(`${API_URL}/export-docx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, edits }),
    });

    if (!response.ok) {
      // Because /export-docx returns a file or a JSON error
      const txt = await response.text();
      throw new Error(`Failed to export DOCX: ${response.status} ${txt}`);
    }

    const blob = await response.blob();
    return new Uint8Array(await blob.arrayBuffer());
  }

  async splitRemote(file: File, ranges: { label: string, pages: string }[]): Promise<Blob> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("ranges", JSON.stringify(ranges));

    const response = await fetch(`${API_URL}/split-pdf`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to split PDF");
    }

    return await response.blob();
  }

  async mergeRemote(files: File[]): Promise<Blob> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append("files", file);
    });

    const response = await fetch(`${API_URL}/merge-pdf`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to merge PDFs");
    }

    return await response.blob();
  }
}

export const pdfManager = new PDFManager();
