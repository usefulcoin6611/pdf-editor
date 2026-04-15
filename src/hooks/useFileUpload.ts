import React, { useState, useCallback, useRef } from "react";
import type { FileUploadHook } from "@/types/upload";

const ACCEPTED_TYPE = "application/pdf";
const ACCEPTED_EXT = ".pdf";

export function useFileUpload(onUpload: (file: File) => void): FileUploadHook {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
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
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === ACCEPTED_TYPE) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === ACCEPTED_TYPE) {
      setFile(selectedFile);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
  }, []);

  const handleUpload = useCallback(() => {
    if (file) {
      onUpload(file);
    }
  }, [file, onUpload]);

  const onBrowse = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const getRootProps = useCallback(() => ({
    onDragOver,
    onDragLeave,
    onDrop,
    onClick: () => !file && onBrowse(),
    role: "button",
    "aria-label": "File upload area",
  }), [onDragOver, onDragLeave, onDrop, onBrowse, file]);

  const getInputProps = useCallback(() => ({
    ref: inputRef,
    type: "file" as const,
    accept: ACCEPTED_EXT,
    className: "hidden",
    onChange: handleFileChange,
  }), [handleFileChange]);

  return {
    isDragging,
    file,
    clearFile,
    handleUpload,
    getRootProps,
    getInputProps,
  };
}
