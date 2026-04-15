import type { PDFPageProxy } from "pdfjs-dist";
import type { TextParagraph } from "@/lib/pdf-manager";

export interface DiscoveredFont {
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  fontSize: string;
  scaleX: number;
}

export interface TextOverlayProps {
  page: PDFPageProxy;
  scale: number;
  paragraphs: TextParagraph[];
  edits: Record<string, string>;
  onParagraphEdit: (paragraphId: string, newText: string) => void;
  /** Called when font discovery is complete (paraId → CSS fontFamily) */
  onFontsDiscovered?: (fontMap: Record<string, DiscoveredFont>) => void;
  /** Called when the active paragraph changes */
  onActiveChange?: (paraId: string | null) => void;
}

export interface PDFEditorProps {
  file: File;
  initialEdits?: Record<string, string>;
  onExit: () => void;
}

export interface ParagraphBlockProps {
  para: TextParagraph;
  scale: number;
  isActive: boolean;
  editedText: string | undefined;
  discoveredFont: DiscoveredFont | undefined;
  onClick: () => void;
  onBlur: (el: HTMLDivElement) => void;
}
