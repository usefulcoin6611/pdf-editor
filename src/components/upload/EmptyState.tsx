import { motion } from "framer-motion";
import { Upload, Files } from "lucide-react";

export function EmptyState({ multiple = false }: { multiple?: boolean }) {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center gap-4 text-center"
    >
      <div className={`rounded-full p-4 ${multiple ? 'bg-purple-500/10 text-purple-500' : 'bg-primary/10 text-primary'}`}>
        {multiple ? <Files size={32} /> : <Upload size={32} />}
      </div>
      <div>
        <p className="text-lg font-semibold">Drop your {multiple ? 'PDFs' : 'PDF'} here</p>
        <p className="text-sm text-muted-foreground">or click to browse from your computer</p>
      </div>
    </motion.div>
  );
}
