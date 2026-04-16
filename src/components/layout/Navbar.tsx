import { FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex h-20 items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-foreground">
            <FileText size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight uppercase tracking-[0.1em] text-foreground/80">Workshop</span>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" asChild>
            <a href="https://github.com" target="_blank" rel="noreferrer" title="Github Repository">
              <Globe size={18} />
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
