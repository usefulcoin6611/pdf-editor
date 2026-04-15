import { AnimatePresence } from "framer-motion";
import { Download, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PDFSplitterProps } from "@/types/splitter";
import { usePDFSplitter } from "@/hooks/usePDFSplitter";
import { FileSidebar } from "./FileSidebar";
import { SplitRangeCard } from "./SplitRangeCard";

export function PDFSplitter({ files, onExit }: PDFSplitterProps) {
  const {
    configs,
    activeFileIndex,
    setActiveFileIndex,
    isSplitting,
    currentConfig,
    addRange,
    removeRange,
    updateRange,
    handleSplitAll
  } = usePDFSplitter(files);

  return (
    <div className="flex h-full bg-background overflow-hidden w-full">
      <FileSidebar 
        configs={configs}
        activeFileIndex={activeFileIndex}
        onSelect={setActiveFileIndex}
        onExit={onExit}
      />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header Section */}
        <header className="flex items-center justify-between px-8 py-6 z-10 border-b md:border-none">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Configure Split</h2>
            <p className="text-muted-foreground text-sm truncate max-w-md hidden md:block">
              Currently editing: {currentConfig.file.name}
            </p>
          </div>

          <Button 
            onClick={handleSplitAll} 
            disabled={isSplitting}
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-500/20 px-8 h-12 rounded-full"
          >
            {isSplitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download size={18} />
            )}
            {isSplitting ? "Processing..." : `Split All Documents`}
          </Button>
        </header>

        {/* Range Editor Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-0">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {currentConfig.ranges.map((range) => (
                  <SplitRangeCard 
                    key={range.id}
                    range={range}
                    onUpdate={(id, field, val) => updateRange(activeFileIndex, id, field, val)}
                    onRemove={(id) => removeRange(activeFileIndex, id)}
                  />
                ))}
              </AnimatePresence>
            </div>

            <Button
              variant="outline"
              onClick={() => addRange(activeFileIndex)}
              className="w-full h-16 border-dashed border-2 bg-background/50 gap-3 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 group transition-all"
            >
              <div className="p-1 rounded-md bg-purple-500/10 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Plus size={16} />
              </div>
              Add Another PDF Part
            </Button>
          </div>
        </main>

        <div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
