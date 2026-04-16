export interface MergerFile {
  id: string;
  file: File;
}

export interface PDFMergerProps {
  files: File[];
  onExit: () => void;
}

export interface MergeListItemProps {
  item: MergerFile;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}
