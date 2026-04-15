import { AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";


import { useFileUpload } from "@/hooks/useFileUpload";
import type { UploadAreaProps } from "@/types/upload";
import { EmptyState } from "./EmptyState";
import { FilePreview } from "./FilePreview";
import { MultiFilePreview } from "./MultiFilePreview";
import { UploadActionButton } from "./UploadActionButton";

export function UploadArea({ onUpload, multiple = false }: UploadAreaProps & { multiple?: boolean }) {
  const {
    isDragging,
    files,
    file,
    clearFile,
    removeFile,
    handleUpload,
    getRootProps,
    getInputProps,
  } = useFileUpload(onUpload, multiple);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
      <Card
        variant="dropzone"
        state={isDragging ? "active" : "inactive"}
        {...getRootProps()}
        className={multiple && files.length > 0 ? "h-auto py-8" : ""}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {files.length === 0 ? (
            <EmptyState key="empty" multiple={multiple} />
          ) : multiple ? (
            <MultiFilePreview key="multi" files={files} onRemove={removeFile} />
          ) : (
            <FilePreview key="single" file={file} onClear={clearFile} />
          )}
        </AnimatePresence>
      </Card>

      <UploadActionButton 
        file={multiple ? (files.length > 0 ? files : null) : file} 
        onUpload={handleUpload} 
        label={multiple ? `Process ${files.length} Document${files.length > 1 ? 's' : ''}` : undefined}
      />
    </div>
  );
}
