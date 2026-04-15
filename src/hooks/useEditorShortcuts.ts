import { useEffect } from "react";

interface UseEditorShortcutsProps {
  undo: () => void;
  redo: () => void;
  onSave: () => void;
}

export function useEditorShortcuts({ undo, redo, onSave }: UseEditorShortcutsProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Check for Ctrl (Windows) or Meta (Mac)
      if (!e.ctrlKey && !e.metaKey) return;

      const key = e.key.toLowerCase();

      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      } else if (key === "s") {
        e.preventDefault();
        onSave();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, onSave]);
}
