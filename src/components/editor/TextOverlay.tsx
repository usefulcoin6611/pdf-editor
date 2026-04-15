import { useTextOverlay } from "@/hooks/useTextOverlay";
import { ParagraphBlock } from "./ParagraphBlock";
import type { TextOverlayProps } from "@/types/editor";


export function TextOverlay({
  page, scale, paragraphs, edits, onParagraphEdit, onFontsDiscovered, onActiveChange
}: TextOverlayProps) {
  const {
    nativeRef,
    activeParagraphId,
    setActiveParagraphId,
    discoveredFonts,
    handleBlur,
  } = useTextOverlay({
    page,
    scale,
    paragraphs,
    onParagraphEdit,
    onFontsDiscovered,
    onActiveChange,
  });

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Native PDF.js TextLayer — opacity 0, used ONLY for font loading and accessibility */}
      <div
        ref={nativeRef}
        className="textLayer absolute inset-0 pointer-events-none"
        style={{ "--scale-factor": scale, opacity: 0 } as any}
      />

      {/* Interactive paragraph blocks */}
      {paragraphs.map(para => (
        <ParagraphBlock
          key={para.id}
          para={para}
          scale={scale}
          isActive={activeParagraphId === para.id}
          editedText={edits[para.id]}
          discoveredFont={discoveredFonts[para.id]}
          onClick={() => setActiveParagraphId(para.id)}
          onBlur={(el) => handleBlur(para.id, el)}
        />
      ))}
    </div>
  );
}
