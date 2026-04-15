import type { TextParagraph } from "@/lib/pdf-manager";

interface DiscoveredFont {
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  fontSize: string;
  scaleX: number;
}

/**
 * Discovers the full visual styling that pdf.js used for each paragraph.
 */
export function discoverPdfJsFonts(
  container: HTMLDivElement,
  paragraphs: TextParagraph[],
  scale: number
): Record<string, DiscoveredFont> {
  const containerRect = container.getBoundingClientRect();
  const spans = container.querySelectorAll("span");
  if (!spans.length) return {};

  type SpanEntry = { x: number; y: number; font: string; weight: string; style: string; fontSize: string; transform: string; width: number; text: string };
  const entries: SpanEntry[] = [];

  spans.forEach(span => {
    const rect = span.getBoundingClientRect();
    const computed = window.getComputedStyle(span);
    const text = span.textContent?.trim() || "";
    if (text === "") return;

    entries.push({
      x: (rect.left - containerRect.left) / scale,
      y: (rect.top - containerRect.top) / scale,
      font: computed.fontFamily,
      weight: computed.fontWeight,
      style: computed.fontStyle,
      fontSize: computed.fontSize,
      transform: computed.transform,
      width: rect.width / scale,
      text: text,
    });
  });

  const fontMap: Record<string, DiscoveredFont> = {};
  for (const para of paragraphs) {
    const inBounds = entries.filter(e =>
      e.x >= para.vx - 8 &&
      e.x <= para.vx + para.vw + 8 &&
      e.y >= para.vy - 8 &&
      e.y <= para.vy + para.vh + 8
    );

    if (inBounds.length > 0) {
      const families: Record<string, number> = {};
      const weights: Record<string, number> = {};
      const styles: Record<string, number> = {};
      const sizes: Record<string, number> = {};
      const scaleXs: number[] = [];
      
      inBounds.forEach(e => {
        families[e.font] = (families[e.font] ?? 0) + 1;
        weights[e.weight] = (weights[e.weight] ?? 0) + 1;
        styles[e.style] = (styles[e.style] ?? 0) + 1;
        sizes[e.fontSize] = (sizes[e.fontSize] ?? 0) + 1;
        
        // Extract scaleX from matrix(a, b, c, d, tx, ty)
        if (e.transform && e.transform.startsWith("matrix")) {
           const parts = e.transform.match(/matrix\(([^)]+)\)/);
           if (parts && parts[1]) {
             const m = parts[1].split(',').map(s => parseFloat(s.trim()));
             if (!isNaN(m[0])) {
               scaleXs.push(m[0]);
             }
           }
        }
      });

      const getTop = (map: Record<string, number>) => Object.entries(map).sort((a, b) => b[1] - a[1])[0][0];
      const avgScaleX = scaleXs.length ? scaleXs.reduce((a, b) => a + b, 0) / scaleXs.length : 1;

      fontMap[para.id] = {
        fontFamily: getTop(families),
        fontWeight: getTop(weights),
        fontStyle: getTop(styles),
        fontSize: getTop(sizes),
        scaleX: avgScaleX,
      };
    }
  }

  return fontMap;
}
