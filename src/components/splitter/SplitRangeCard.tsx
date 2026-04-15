import { motion } from "framer-motion";
import { FileText, Scissors, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SplitRangeCardProps } from "@/types/splitter";

export function SplitRangeCard({ range, onUpdate, onRemove }: SplitRangeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 border-none shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
              New Filename
            </label>
            <div className="relative group">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
              <Input
                placeholder="e.g. Chapter 1"
                value={range.label}
                onChange={(e) => onUpdate(range.id, "label", e.target.value)}
                className="pl-12 h-12 bg-background border-transparent focus-visible:ring-2 focus-visible:ring-purple-500/50 shadow-sm"
              />
            </div>
          </div>

          <div className="flex-1 space-y-2 w-full">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">
              Page Selection
            </label>
            <div className="relative group">
              <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
              <Input
                placeholder="e.g. 1-5, 8"
                value={range.pages}
                onChange={(e) => onUpdate(range.id, "pages", e.target.value)}
                className="pl-12 h-12 bg-background border-transparent focus-visible:ring-2 focus-visible:ring-purple-500/50 shadow-sm"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(range.id)}
            className="hover:bg-destructive/10 hover:text-destructive w-12 h-12 shrink-0 rounded-xl"
          >
            <Trash2 size={20} />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
