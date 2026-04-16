import { Reorder, useDragControls } from "framer-motion";
import { Files, GripVertical, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MergeListItemProps } from "@/types/merger";

export function MergeListItem({ item, index, isFirst, isLast, onMoveUp, onMoveDown, onRemove }: MergeListItemProps) {
  const controls = useDragControls();
  const { file } = item;

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      layout
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 35, 
        mass: 0.5 
      }}
      className="relative select-none"
    >
      <Card className="p-4 flex items-center gap-4 border-none transition-colors duration-200 bg-muted/40 hover:bg-muted/60 cursor-default rounded-2xl">
        <div 
          className="flex items-center gap-3 text-muted-foreground cursor-grab active:cursor-grabbing p-2 -ml-2 hover:text-foreground touch-none"
          onPointerDown={(e) => controls.start(e)}
        >
           <GripVertical size={18} />
           <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted-foreground/10 text-[10px] font-bold">
             {index + 1}
           </div>
        </div>

        <div className="p-2.5 rounded-xl bg-green-500/10 text-green-600 shrink-0">
          <Files size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-foreground/90">{file.name}</p>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>

        <div className="flex items-center gap-1">
          <div className="hidden md:flex items-center gap-1 mr-2 border-r pr-2 border-muted-foreground/10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMoveUp} 
              disabled={isFirst}
              className="rounded-full w-8 h-8 hover:bg-background"
            >
              <ArrowUp size={14} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMoveDown} 
              disabled={isLast}
              className="rounded-full w-8 h-8 hover:bg-background"
            >
              <ArrowDown size={14} />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRemove} 
            className="rounded-full w-8 h-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </Card>
    </Reorder.Item>
  );
}
