import { AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";


import { useFileUpload } from "@/hooks/useFileUpload";
import type { UploadAreaProps } from "@/types/upload";
import { EmptyState } from "./EmptyState";
import { FilePreview } from "./FilePreview";
import { UploadActionButton } from "./UploadActionButton";

export function UploadArea({ onUpload }: UploadAreaProps) {
  const {
    isDragging,
    file,
    clearFile,
    handleUpload,
    getRootProps,
    getInputProps,
  } = useFileUpload(onUpload);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
      <Card
        variant="dropzone"
        state={isDragging ? "active" : "inactive"}
        {...getRootProps()}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {!file ? (
            <EmptyState />
          ) : (
            <FilePreview file={file} onClear={clearFile} />
          )}
        </AnimatePresence>
      </Card>

      <UploadActionButton file={file} onUpload={handleUpload} />
    </div>
  );
}
