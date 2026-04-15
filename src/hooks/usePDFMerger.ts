import { useState, useCallback } from "react";
import { toast } from "sonner";
import { pdfManager } from "@/lib/pdf-manager";

export function usePDFMerger(initialFiles: File[]) {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [isMerging, setIsMerging] = useState(false);

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setFiles(prev => {
      const newFiles = [...prev];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      return newFiles;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setFiles(prev => {
      if (index === prev.length - 1) return prev;
      const newFiles = [...prev];
      [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
      return newFiles;
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      if (prev.length <= 2) {
        toast.error("At least 2 files are required for merging");
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleMerge = async () => {
    setIsMerging(true);
    try {
      const blob = await pdfManager.mergeRemote(files);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged_documents.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDFs successfully merged!");
    } catch (err: any) {
      toast.error(err.message || "Failed to merge PDFs");
    } finally {
      setIsMerging(false);
    }
  };

  return {
    files,
    setFiles,
    isMerging,
    moveUp,
    moveDown,
    removeFile,
    handleMerge
  };
}
