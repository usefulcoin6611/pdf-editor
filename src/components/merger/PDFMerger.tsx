import { useRef, useState } from "react";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import { Files, Download, ChevronLeft, Loader2, Plus, UploadCloud, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePDFMerger } from "@/hooks/usePDFMerger";
import { MergeListItem } from "./MergeListItem";
import type { PDFMergerProps } from "@/types/merger";

export function PDFMerger({ files: initialFiles, onExit }: PDFMergerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    files,
    setFiles,
    mergedFileName,
    setMergedFileName,
    addFiles,
    isMerging,
    moveUp,
    moveDown,
    removeFile,
    handleMerge
  } = usePDFMerger(initialFiles);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files).filter(f => f.type === "application/pdf") : [];
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="flex flex-col h-full bg-background overflow-hidden w-full relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        multiple 
        accept=".pdf" 
        className="hidden" 
      />

      {/* Drag Overlay UI */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-green-500/10 backdrop-blur-[2px] border-4 border-dashed border-green-500/50 flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="p-8 bg-background rounded-[40px] shadow-2xl flex flex-col items-center gap-4">
              <UploadCloud size={64} className="text-green-500 animate-bounce" />
              <p className="text-2xl font-bold text-foreground">Lepaskan untuk Menambah PDF</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 bg-background z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onExit} className="gap-2 rounded-full text-muted-foreground hover:text-foreground">
            <ChevronLeft size={16} /> Back to Menu
          </Button>
          <div className="h-8 w-[1px] bg-border hidden md:block mx-2" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-500 rounded-xl text-white">
              <Files size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">PDF Merger</h2>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{files.length} files in queue</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleMerge} 
            disabled={isMerging || files.length < 2}
            size="lg"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8 rounded-full h-11"
          >
            {isMerging ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download size={18} />
            )}
            {isMerging ? "Merging..." : "Merge & Download"}
          </Button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-3xl mx-auto space-y-6">
          {files.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 px-8 text-center bg-muted/20 rounded-[40px] border-2 border-dashed border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer"
              onClick={triggerUpload}
            >
              <div className="p-6 bg-green-500/10 rounded-full mb-6 text-green-600">
                 <UploadCloud size={48} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">Combine your PDFs</h1>
              <p className="text-muted-foreground max-w-sm mb-8">
                Seret dan lepas file PDF Anda di sini, atau klik untuk memilih file dari komputer.
              </p>
              <Button 
                size="xl"
                className="gap-3 bg-green-600 hover:bg-green-700 text-white rounded-full px-10 h-16 pointer-events-none"
              >
                <Plus size={20} /> Select PDF Files
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div className="space-y-1">
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90 leading-none">Organize documents</h1>
                  <p className="text-sm text-muted-foreground">
                    Rearrange by dragging your files. Order is top to bottom.
                  </p>
                </div>
                
                <div className="flex flex-col gap-1.5 min-w-[280px]">
                   <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                    Output Filename
                  </label>
                  <div className="relative group">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-green-600 transition-colors" />
                    <Input 
                      value={mergedFileName}
                      onChange={(e) => setMergedFileName(e.target.value)}
                      placeholder="Enter filename..."
                      className="pl-10 h-12 bg-muted/40 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-green-500/30 text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>

              <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-2">
                <AnimatePresence initial={false} mode="popLayout">
                  {files.map((item, index) => (
                    <MergeListItem 
                      key={item.id}
                      item={item}
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

              <Button
                variant="ghost"
                onClick={triggerUpload}
                className="w-full h-16 bg-muted/30 gap-4 hover:bg-muted/50 text-foreground transition-all rounded-[24px] mt-6 border-2 border-dashed border-green-500/20 hover:border-green-500/40"
              >
                <div className="p-1.5 rounded-lg bg-green-500/10 text-green-600">
                  <Plus size={18} />
                </div>
                <span className="font-semibold">Add more documents</span>
              </Button>
            </>
          )}
        </div>
      </main>

      {/* Visual background details */}
      <div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px]" />
    </div>
  );
}
