import { motion } from "framer-motion";
import { X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MultiFilePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function MultiFilePreview({ files, onRemove }: MultiFilePreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className="w-full space-y-3 max-h-[220px] overflow-y-auto px-2 py-1 scrollbar-thin scrollbar-thumb-muted">
      {files.map((file, index) => (
        <motion.div
          key={`${file.name}-${index}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-muted-foreground/10 group hover:border-primary/20 transition-colors"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-background rounded-lg shadow-sm group-hover:bg-primary/5 transition-colors">
              <FileText className="w-5 h-5 text-primary/70" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="w-8 h-8 rounded-full hover:bg-destructive/10 hover:text-destructive text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"
          >
            <X size={14} />
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
