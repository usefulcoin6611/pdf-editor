import { useEffect } from "react";
import { pdfStorage } from "@/lib/storage";

interface UseAutoSaveProps {
  fileName: string;
  edits: Record<string, string>;
}

export function useAutoSave({ fileName, edits }: UseAutoSaveProps) {
  useEffect(() => {
    const editCount = Object.keys(edits).length;
    
    if (editCount > 0) {
      // We use a small debounced-like approach could be added here, 
      // but for now, we follow the current logic of saving on every edit count change.
      pdfStorage.saveEdits(fileName, edits).catch((err) => {
        console.error("[useAutoSave] Failed to persist edits:", err);
      });
    }
  }, [edits, fileName]);
}
