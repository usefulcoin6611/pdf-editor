import { useState, useCallback } from "react";
import { toast } from "sonner";
import { pdfManager } from "@/lib/pdf-manager";

export interface MergerFile {
  id: string;
  file: File;
}

export function usePDFMerger(initialFiles: File[]) {
  const [files, setFiles] = useState<MergerFile[]>(
    initialFiles.map(f => ({ id: crypto.randomUUID(), file: f }))
  );
  const [mergedFileName, setMergedFileName] = useState("merged_documents");
  const [isMerging, setIsMerging] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles(prev => [
      ...prev, 
      ...newFiles.map(f => ({ id: crypto.randomUUID(), file: f }))
    ]);
  }, []);

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
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("At least 2 files are required for merging");
      return;
    }
    setIsMerging(true);
    try {
      const blob = await pdfManager.mergeRemote(files.map(f => f.file));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Ensure .pdf extension
      const safeName = mergedFileName.toLowerCase().endsWith(".pdf") 
        ? mergedFileName 
        : `${mergedFileName}.pdf`;
        
      a.download = safeName;
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
    mergedFileName,
    setMergedFileName,
    addFiles,
    isMerging,
    moveUp,
    moveDown,
    removeFile,
    handleMerge
  };
}
