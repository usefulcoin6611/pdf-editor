import { motion } from "framer-motion";
import { Upload } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center gap-4 text-center"
    >
      <div className="rounded-full bg-primary/10 p-4 text-primary">
        <Upload size={32} />
      </div>
      <div>
        <p className="text-lg font-semibold">Drop your PDF here</p>
        <p className="text-sm text-muted-foreground">or click to browse from files</p>
      </div>
    </motion.div>
  );
}
