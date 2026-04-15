import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Range, FileConfig } from "@/types/splitter";
import { pdfManager } from "@/lib/pdf-manager";

export function usePDFSplitter(files: File[]) {
  const [configs, setConfigs] = useState<FileConfig[]>(
    files.map(f => ({
      file: f,
      ranges: [{ id: crypto.randomUUID(), label: f.name.replace(".pdf", "") + " Part 1", pages: "1" }]
    }))
  );
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isSplitting, setIsSplitting] = useState(false);

  const currentConfig = configs[activeFileIndex];

  const addRange = useCallback((fileIdx: number) => {
    setConfigs(prev => prev.map((cfg, i) => {
      if (i !== fileIdx) return cfg;
      return {
        ...cfg,
        ranges: [
          ...cfg.ranges,
          { id: crypto.randomUUID(), label: `${cfg.file.name.replace(".pdf", "")} Part ${cfg.ranges.length + 1}`, pages: "" }
        ]
      };
    }));
  }, []);

  const removeRange = useCallback((fileIdx: number, rangeId: string) => {
    setConfigs(prev => prev.map((cfg, i) => {
      if (i !== fileIdx) return cfg;
      if (cfg.ranges.length === 1) {
        toast.error("At least one range is required");
        return cfg;
      }
      return {
        ...cfg,
        ranges: cfg.ranges.filter(r => r.id !== rangeId)
      };
    }));
  }, []);

  const updateRange = useCallback((fileIdx: number, rangeId: string, field: keyof Range, value: string) => {
    setConfigs(prev => prev.map((cfg, i) => {
      if (i !== fileIdx) return cfg;
      return {
        ...cfg,
        ranges: cfg.ranges.map(r => r.id === rangeId ? { ...r, [field]: value } : r)
      };
    }));
  }, []);

  const handleSplitAll = async () => {
    setIsSplitting(true);
    try {
      for (const config of configs) {
        const invalid = config.ranges.some(r => !r.label.trim() || !r.pages.trim());
        if (invalid) {
          toast.error(`Please fill in settings for ${config.file.name}`);
          continue;
        }

        const blob = await pdfManager.splitRemote(
          config.file,
          config.ranges.map(r => ({ label: r.label, pages: r.pages }))
        );
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `split_${config.file.name.replace(".pdf", "")}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast.success("All PDFs successfully split!");
    } catch (err: any) {
      toast.error(err.message || "Failed to split some PDFs");
    } finally {
      setIsSplitting(false);
    }
  };

  return {
    configs,
    activeFileIndex,
    setActiveFileIndex,
    isSplitting,
    currentConfig,
    addRange,
    removeRange,
    updateRange,
    handleSplitAll
  };
}
