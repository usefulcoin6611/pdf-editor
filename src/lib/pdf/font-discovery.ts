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
        e.x >= para.vx - 20 &&
        e.x <= para.vx + para.vw + 20 &&
        e.y >= para.vy - 20 &&
        e.y <= para.vy + para.vh + 20
      );

    if (inBounds.length > 0) {
      const families: Record<string, number> = {};
      const weights: Record<string, number> = {};
      const styles: Record<string, number> = {};
      const sizes: Record<string, number> = {};
      const scaleXs: number[] = [];
      
      inBounds.forEach(e => {
        families[e.font.replace(/['"]/g, "")] = (families[e.font.replace(/['"]/g, "")] ?? 0) + 1;
        weights[e.weight] = (weights[e.weight] ?? 0) + 1;
        styles[e.style] = (styles[e.style] ?? 0) + 1;
        
        // Extract scale from matrix to compute REAL visual font size
        let effectiveSize = e.fontSize;
        let scaleX = 1;
        if (e.transform && e.transform.startsWith("matrix")) {
           const parts = e.transform.match(/matrix\(([^)]+)\)/);
           if (parts && parts[1]) {
             const m = parts[1].split(',').map(s => parseFloat(s.trim()));
             if (!isNaN(m[0])) scaleX = Math.abs(m[0]);
             if (!isNaN(m[3])) {
               const val = parseFloat(e.fontSize);
               effectiveSize = `${(val * Math.abs(m[3])).toFixed(1)}px`;
             }
           }
        }
        
        sizes[effectiveSize] = (sizes[effectiveSize] ?? 0) + 1;
        scaleXs.push(scaleX);
      });

      const mostFrequent = (map: Record<string, number>) => 
        Object.entries(map).sort((a, b) => b[1] - a[1])[0][0];

      fontMap[para.id] = {
        fontFamily: mostFrequent(families),
        fontWeight: mostFrequent(weights),
        fontStyle: mostFrequent(styles),
        fontSize: mostFrequent(sizes),
        scaleX: scaleXs.length > 0 ? scaleXs.reduce((a, b) => a + b, 0) / scaleXs.length : 1,
      };
    }
  }

  return fontMap;
}
