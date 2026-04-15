import { Reorder } from "framer-motion";
import { Files, GripVertical, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type { MergeListItemProps } from "@/types/merger";

export function MergeListItem({ file, index, isFirst, isLast, onMoveUp, onMoveDown, onRemove }: MergeListItemProps) {
  return (
    <Reorder.Item
      value={file}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative group mt-4"
    >
      <Card className="p-4 flex items-center gap-4 hover:border-green-500/50 transition-all duration-300 bg-background shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-3 text-muted-foreground">
           <GripVertical size={20} className="opacity-30 group-hover:opacity-100 transition-opacity" />
           <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs font-bold">
             {index + 1}
           </div>
        </div>

        <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
          <Files size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{file.name}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }} 
            disabled={isFirst}
            className="rounded-full w-8 h-8"
          >
            <ArrowUp size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }} 
            disabled={isLast}
            className="rounded-full w-8 h-8"
          >
            <ArrowDown size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => { e.stopPropagation(); onRemove(); }} 
            className="rounded-full w-8 h-8 text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </Card>
    </Reorder.Item>
  );
}
