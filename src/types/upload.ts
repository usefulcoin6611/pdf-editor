import React from "react";

export interface UploadAreaProps {
  onUpload: (file: File) => void;
}

export interface UploadActionButtonProps {
  file: File | null;
  onUpload: () => void;
}

export interface FileUploadHook {
  // States
  isDragging: boolean;
  file: File | null;
  
  // Logic Triggers
  clearFile: () => void;
  handleUpload: () => void;
  
  // Headless Props Getters
  getRootProps: () => React.HTMLAttributes<HTMLDivElement>;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement> & { ref: React.RefObject<HTMLInputElement | null> };
}
