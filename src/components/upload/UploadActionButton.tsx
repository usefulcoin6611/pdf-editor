import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { UploadActionButtonProps } from "@/types/upload";

export function UploadActionButton({ file, onUpload }: UploadActionButtonProps) {
  return (
    <motion.div
      animate={{ opacity: file ? 1 : 0, y: file ? 0 : 20 }}
      className="flex w-full justify-center"
    >
      <Button
        variant="cta"
        size="xl"
        disabled={!file}
        onClick={onUpload}
      >
        Edit PDF
      </Button>
    </motion.div>
  );
}
