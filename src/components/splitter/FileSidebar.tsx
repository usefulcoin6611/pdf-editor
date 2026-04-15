import { ChevronLeft, Files, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FileSidebarProps } from "@/types/splitter";

export function FileSidebar({ configs, activeFileIndex, onSelect, onExit }: FileSidebarProps) {
  return (
    <aside className="w-80 border-r bg-muted/20 flex flex-col h-full hidden md:flex">
      <div className="p-6 border-b bg-background">
        <Button variant="ghost" className="mb-4 -ml-4 gap-2 text-muted-foreground hover:bg-transparent hover:text-foreground" onClick={onExit}>
          <ChevronLeft size={16} /> Back
        </Button>
        <h3 className="font-bold flex items-center gap-2">
          <Files className="w-4 h-4 text-purple-500" />
          Documents ({configs.length})
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {configs.map((cfg, idx) => (
          <button
            key={cfg.file.name + idx}
            onClick={() => onSelect(idx)}
            className={`w-full text-left p-4 rounded-xl transition-all duration-200 border-2 ${
              activeFileIndex === idx 
              ? "bg-background border-purple-500 shadow-md scale-[1.02]" 
              : "bg-transparent border-transparent hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className={`w-5 h-5 ${activeFileIndex === idx ? "text-purple-500" : ""}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{cfg.file.name}</p>
                <p className="text-[10px] uppercase opacity-60 font-bold tracking-tight">
                  {cfg.ranges.length} split parts
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
