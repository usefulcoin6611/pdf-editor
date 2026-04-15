export interface Range {
  id: string;
  label: string;
  pages: string;
}

export interface FileConfig {
  file: File;
  ranges: Range[];
}

export interface PDFSplitterProps {
  files: File[];
  onExit: () => void;
}

export interface FileSidebarProps {
  configs: FileConfig[];
  activeFileIndex: number;
  onSelect: (index: number) => void;
  onExit: () => void;
}

export interface SplitRangeCardProps {
  range: Range;
  onUpdate: (id: string, field: keyof Range, value: string) => void;
  onRemove: (id: string) => void;
}
