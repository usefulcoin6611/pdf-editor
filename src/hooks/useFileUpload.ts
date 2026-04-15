import React, { useState, useCallback, useRef } from "react";
import type { FileUploadHook } from "@/types/upload";

const ACCEPTED_TYPE = "application/pdf";
const ACCEPTED_EXT = ".pdf";

export function useFileUpload(onUpload: (files: File | File[]) => void, multiple = false): FileUploadHook {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === ACCEPTED_TYPE);
    if (droppedFiles.length > 0) {
      if (multiple) {
        setFiles(prev => [...prev, ...droppedFiles]);
      } else {
        setFiles([droppedFiles[0]]);
      }
    }
  }, [multiple]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files).filter(f => f.type === ACCEPTED_TYPE) : [];
    if (selectedFiles.length > 0) {
      if (multiple) {
        setFiles(prev => [...prev, ...selectedFiles]);
      } else {
        setFiles([selectedFiles[0]]);
      }
    }
  }, [multiple]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const handleUpload = useCallback(() => {
    if (files.length > 0) {
      onUpload(multiple ? files : files[0]);
    }
  }, [files, onUpload, multiple]);

  const onBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const getRootProps = useCallback(() => ({
    onDragOver,
    onDragLeave,
    onDrop,
    onClick: () => files.length === 0 && onBrowse(),
    role: "button",
    "aria-label": "File upload area",
  }), [onDragOver, onDragLeave, onDrop, onBrowse, files]);

  const getInputProps = useCallback(() => ({
    ref: inputRef,
    type: "file" as const,
    accept: ACCEPTED_EXT,
    multiple,
    className: "hidden",
    onChange: handleFileChange,
  }), [handleFileChange, multiple]);

  return {
    isDragging,
    files,
    file: files[0] || null, // Backward compatibility
    clearFile: clearFiles,
    removeFile,
    handleUpload,
    getRootProps,
    getInputProps,
  };
}
