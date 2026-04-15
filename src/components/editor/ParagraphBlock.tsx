import { useEffect, useRef, useState } from "react";
import type { ParagraphBlockProps } from "@/types/editor";

export function ParagraphBlock({
  para,
  scale,
  isActive,
  editedText,
  discoveredFont,
  onClick,
  onBlur,
}: ParagraphBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const isEdited = editedText !== undefined && editedText !== para.text;
  const displayText = editedText ?? para.text;

  // The key trick: use the full styling discovered from pdf.js computed styles
  const effectiveFontFamily = discoveredFont?.fontFamily || `"${para.fontFamily}", serif`;
  
  // Weights: Try to match exactly if discovered, otherwise use PDF metadata
  const effectiveFontWeight = discoveredFont?.fontWeight || (para.bold ? "700" : "400");
  const effectiveFontStyle = discoveredFont?.fontStyle || (para.italic ? "italic" : "normal");
  
  // Heuristic: If it's likely a header but discovery says 'normal', prefer 'bold'
  const finalWeight = (para.fontSize > 18 && effectiveFontWeight === "400") ? "700" : effectiveFontWeight;


  useEffect(() => {
    if (!isActive || !ref.current) return;
    const el = ref.current;

    // Set cursor at end
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    el.focus();

    const handleBlurEv = () => {
      onBlur(el);
    };

    el.addEventListener("blur", handleBlurEv, { once: true });

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        el.innerText = para.text;
        el.blur();
      }
    };

    el.addEventListener("keydown", handleKey);
    return () => el.removeEventListener("keydown", handleKey);
  }, [isActive, para.text, onBlur]);

  return (
    <div
      ref={ref}
      suppressContentEditableWarning
      className="absolute"
      contentEditable={isActive}
      data-para-id={para.id}
      data-is-active={isActive}
      style={{
        left: `${para.vx * scale}px`,
        top: `${para.vy * scale}px`,
        minHeight: `${para.vh * scale}px`,

        // Visibility logic: hide with transparency, show with solid color
        backgroundColor: isActive || isEdited ? "white" : hovered ? "rgba(79,70,229,0.06)" : "transparent",
        color: isActive || isEdited ? (para.color ? `#${para.color}` : "black") : "transparent",
        opacity: 1,

        // Visual cues: only show borders when interacting
        outline: isActive
          ? "1px solid #4F46E5"
          : isEdited && hovered
          ? "1px dashed rgba(79,70,229,0.3)"
          : "none",
        outlineOffset: "2px",
        boxShadow: "none",

        cursor: "text",
        pointerEvents: "auto",
        display: "block",
        contain: "layout",

        // Critical: use the pdf.js-discovered font attributes for EXACT visual match
        fontFamily: effectiveFontFamily,
        fontSize: discoveredFont?.fontSize || `${para.fontSize * scale}px`,
        fontWeight: finalWeight,
        fontStyle: effectiveFontStyle || "normal",
        textAlign: (para.alignment as any) || "left",
        
        transform: `scaleX(${discoveredFont?.scaleX || 1})`,
        transformOrigin: "0 0",
        width: `${para.vw * scale}px`,

        lineHeight: para.lines.length > 0
            ? `${(para.vh / para.lines.length) * scale}px`
            : "1.2",
            
        letterSpacing: para.letterSpacing !== 0 ? `${para.letterSpacing * scale}px` : "normal",

        // Add high-fidelity text rendering properties
        textRendering: "optimizeLegibility",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",

        whiteSpace: "pre-wrap",
        wordBreak: "normal",
        overflow: "visible",
        borderRadius: "2px",
        padding: 0,
        margin: 0,

        transition: "background-color 0.15s, outline 0.15s",
        userSelect: isActive ? "text" : "none",
        zIndex: isActive ? 100 : 10,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isActive) onClick();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {displayText}
    </div>
  );
}
