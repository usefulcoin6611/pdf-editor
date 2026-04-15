import React from "react";

export interface UploadAreaProps {
  onUpload: (files: File | File[]) => void;
}

export interface UploadActionButtonProps {
  file: File | File[] | null;
  onUpload: () => void;
  label?: string;
}

export interface FileUploadHook {
  // States
  isDragging: boolean;
  files: File[];
  file: File | null;
  
  // Logic Triggers
  clearFile: () => void;
  removeFile: (index: number) => void;
  handleUpload: () => void;
  
  // Headless Props Getters
  getRootProps: () => React.HTMLAttributes<HTMLDivElement>;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement> & { ref: React.RefObject<HTMLInputElement | null> };
}
