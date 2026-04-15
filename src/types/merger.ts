export interface PDFMergerProps {
  files: File[];
  onExit: () => void;
}

export interface MergeListItemProps {
  file: File;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}
