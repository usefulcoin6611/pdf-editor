import { motion } from "framer-motion";
import { FileUp, X } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface FilePreviewProps {
  file: File;
  onClear: () => void;
}

export function FilePreview({ file, onClear }: FilePreviewProps) {
  return (
    <motion.div
      key="file"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="relative rounded-2xl bg-primary/10 p-6 text-primary">
        <FileUp size={48} />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-lg hover:scale-110 transition-transform"
        >
          <X size={16} />
        </button>
      </div>
      <div className="text-center">
        <p className="max-w-[200px] truncate text-lg font-semibold">{file.name}</p>
        <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>
    </motion.div>
  );
}
