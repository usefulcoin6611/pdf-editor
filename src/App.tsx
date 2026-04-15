import { useState, useEffect } from "react";
import { pdfStorage } from "./lib/storage";
import { Navbar } from "./components/layout/Navbar";
import { UploadArea } from "./components/upload/UploadArea";
import { PDFEditor } from "./components/editor/PDFEditor";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Layout, Type, ShieldCheck } from "lucide-react";

import { LoadingScreen } from "./components/upload/LoadingScreen";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [initialEdits, setInitialEdits] = useState<Record<string, string>>({});
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check for drafts on mount
  useEffect(() => {
    const checkDraft = async () => {
      try {
        const draft = await pdfStorage.getDraft();
        if (draft) {
          toast("Draf kerja ditemukan", {
            description: `Pulihkan progres terakhir pada "${draft.fileName}"?`,
            action: {
              label: "Pulihkan",
              onClick: () => {
                const recoveredFile = new File([draft.fileData as any], draft.fileName, { type: "application/pdf" });
                setFile(recoveredFile);
                setInitialEdits(draft.edits);
                setIsEditorActive(true);
                toast.success("Draf berhasil dipulihkan!");
              }
            },
            duration: 10000,
          });
        }
      } catch (err) {
        console.error("Failed to check for draft:", err);
      }
    };
    checkDraft();
  }, []);

  const handleUpload = (uploadedFile: File) => {
    setInitialEdits({}); 
    setFile(uploadedFile);
    setIsLoading(true);
    
    // Engine load sequence simulation 2 seconds total
    setTimeout(() => {
      setIsLoading(false);
      setIsEditorActive(true);
    }, 2800); // 4 steps * 500ms + some buffer
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {!isEditorActive && !isLoading && <Navbar />}
      
      <main className="container mx-auto flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
             <LoadingScreen key="loading" />
          ) : !isEditorActive ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex w-full flex-col items-center gap-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
                  Edit PDFs with <span className="text-primary italic">Precision</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Modify text without breaking the layout. Purely local, secure, and fast.
                </p>
              </div>
              
              <UploadArea onUpload={handleUpload} />
              
              <div className="flex flex-wrap justify-center gap-8 mt-12 opacity-70 transition-all duration-500">
                <div className="flex items-center gap-2.5">
                  <Layout size={18} className="text-green-500" />
                  <span className="text-sm font-semibold">100% Layout Preserved</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Type size={18} className="text-blue-500" />
                  <span className="text-sm font-semibold">Auto-Font Matching</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-purple-500" />
                  <span className="text-sm font-semibold">Encryption Secure</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 overflow-hidden"
            >
              {file && (
                <PDFEditor 
                  file={file} 
                  initialEdits={initialEdits}
                  onExit={() => setIsEditorActive(false)} 
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
