import { motion } from "framer-motion";
import { Edit3, Scissors, ArrowRight, Files } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ToolSelectorProps {
  onSelect: (tool: "editor" | "splitter" | "merger") => void;
}

export function ToolSelector({ onSelect }: ToolSelectorProps) {
  const tools = [
    {
      id: "editor" as const,
      title: "PDF Editor",
      description: "Edit text and modify layouts with pixel-perfect precision.",
      icon: <Edit3 className="w-6 h-6 text-blue-500" />,
      color: "bg-blue-50/50 hover:bg-blue-50",
      iconBg: "bg-blue-100/50",
    },
    {
      id: "merger" as const,
      title: "PDF Merger",
      description: "Combine multiple PDF documents into a single professional file.",
      icon: <Files className="w-6 h-6 text-green-500" />,
      color: "bg-green-50/50 hover:bg-green-50",
      iconBg: "bg-green-100/50",
    },
    {
      id: "splitter" as const,
      title: "PDF Splitter",
      description: "Extract pages or split your PDF into multiple documents.",
      icon: <Scissors className="w-6 h-6 text-purple-500" />,
      color: "bg-purple-50/50 hover:bg-purple-50",
      iconBg: "bg-purple-100/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl mt-16 px-4">
      {tools.map((tool, index) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.5 }}
          className="group cursor-pointer"
          onClick={() => onSelect(tool.id)}
        >
          <div className={`p-8 h-full rounded-[32px] transition-all duration-300 ${tool.color}`}>
            <div className="flex flex-col h-full gap-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${tool.iconBg}`}>
                  {tool.icon}
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-muted-foreground" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold tracking-tight text-foreground/90">{tool.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
