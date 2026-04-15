import { useState, useEffect } from "react";
import { pdfStorage } from "./lib/storage";
import { Navbar } from "./components/layout/Navbar";
import { UploadArea } from "./components/upload/UploadArea";
import { PDFEditor } from "./components/editor/PDFEditor";
import { PDFSplitter } from "./components/splitter/PDFSplitter";
import { PDFMerger } from "./components/merger/PDFMerger";
import { ToolSelector } from "./components/home/ToolSelector";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Layout, Type, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

import { LoadingScreen } from "./components/upload/LoadingScreen";

type Mode = "landing" | "upload" | "editor" | "splitter" | "merger";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [initialEdits, setInitialEdits] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<Mode>("landing");
  const [selectedTool, setSelectedTool] = useState<"editor" | "splitter" | "merger" | null>(null);
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
                setFiles([recoveredFile]);
                setInitialEdits(draft.edits);
                setMode("editor");
                setSelectedTool("editor");
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

  const handleToolSelect = (tool: "editor" | "splitter" | "merger") => {
    setSelectedTool(tool);
    setMode("upload");
  };

  const handleUpload = (uploaded: File | File[]) => {
    setInitialEdits({}); 
    
    if (Array.isArray(uploaded)) {
      setFiles(uploaded);
      setFile(uploaded[0]);
    } else {
      setFile(uploaded);
      setFiles([uploaded]);
    }
    
    if (selectedTool === "editor") {
      setIsLoading(true);
      // Engine load sequence simulation 2 seconds total for editor
      setTimeout(() => {
        setIsLoading(false);
        setMode("editor");
      }, 2800);
    } else if (selectedTool === "splitter") {
      setMode("splitter");
    } else if (selectedTool === "merger") {
      setMode("merger");
    }
  };

  const reset = () => {
    setMode("landing");
    setFile(null);
    setFiles([]);
    setSelectedTool(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {mode === "landing" || mode === "upload" ? <Navbar /> : null}
      
      <main className="container mx-auto flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
             <LoadingScreen key="loading" />
          ) : mode === "landing" ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex w-full flex-col items-center gap-8 py-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
                   PDF <span className="text-primary italic">Workshop</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  The most precise tools to manage your PDFs. All processing is kept secure and fast.
                </p>
              </div>

              <ToolSelector onSelect={handleToolSelect} />

              <div className="flex flex-wrap justify-center gap-8 mt-12 opacity-50">
                <div className="flex items-center gap-2.5">
                  <Layout size={18} className="text-green-500" />
                  <span className="text-sm font-semibold">Legacy Compatible</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Type size={18} className="text-blue-500" />
                  <span className="text-sm font-semibold">AI Powered</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-purple-500" />
                  <span className="text-sm font-semibold">100% Secure</span>
                </div>
              </div>
            </motion.div>
          ) : mode === "upload" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex w-full flex-col items-center gap-8"
            >
              <div className="text-center space-y-2">
                <Button variant="ghost" onClick={reset} className="mb-4 text-muted-foreground hover:text-foreground">
                   ← Back to tools
                </Button>
                <h2 className="text-4xl font-extrabold tracking-tight">
                  Upload your <span className="text-primary">{selectedTool === "editor" ? "Document" : "PDF"}</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {selectedTool === "editor" 
                    ? "We'll prepare the workspace for high-precision editing." 
                    : "Select the PDF you want to process."}
                </p>
              </div>
              
              <UploadArea 
                onUpload={handleUpload} 
                multiple={selectedTool === "splitter" || selectedTool === "merger"} 
              />
            </motion.div>
          ) : mode === "editor" ? (
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
                  onExit={reset} 
                />
              )}
            </motion.div>
          ) : mode === "splitter" ? (
            <motion.div
              key="splitter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 overflow-hidden bg-background"
            >
              <PDFSplitter 
                files={files} 
                onExit={reset} 
              />
            </motion.div>
          ) : mode === "merger" ? (
            <motion.div
              key="merger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 overflow-hidden bg-background"
            >
              <PDFMerger 
                files={files} 
                onExit={reset} 
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
      
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
