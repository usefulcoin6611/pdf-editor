import { AnimatePresence, Reorder } from "framer-motion";
import { Files, Download, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePDFMerger } from "@/hooks/usePDFMerger";
import { MergeListItem } from "./MergeListItem";

import type { PDFMergerProps } from "@/types/merger";

export function PDFMerger({ files: initialFiles, onExit }: PDFMergerProps) {
  const {
    files,
    setFiles,
    isMerging,
    moveUp,
    moveDown,
    removeFile,
    handleMerge
  } = usePDFMerger(initialFiles);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden w-full">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full">
            <ChevronLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-2xl text-white shadow-lg shadow-green-500/20">
              <Files size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">PDF Merger</h2>
              <p className="text-xs text-muted-foreground mt-1">{files.length} files selected</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleMerge} 
          disabled={isMerging}
          size="lg"
          className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/20 px-8 rounded-full h-12"
        >
          {isMerging ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download size={18} />
          )}
          {isMerging ? "Merging..." : "Merge & Download"}
        </Button>
      </header>

      {/* Main Grid */}
      <main className="flex-1 overflow-y-auto p-8 bg-muted/5">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Organize your files</h1>
            <p className="text-muted-foreground">
              Rearrange the documents in the order you want them to appear in the final PDF.
            </p>
          </div>

          <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-4">
            <AnimatePresence initial={false}>
              {files.map((file, index) => (
                <MergeListItem 
                  key={file.name + file.size + index}
                  file={file}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === files.length - 1}
                  onMoveUp={() => moveUp(index)}
                  onMoveDown={() => moveDown(index)}
                  onRemove={() => removeFile(index)}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      </main>

      {/* Visual background details */}
      <div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px]" />
      <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
    </div>
  );
}
