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
      icon: <Edit3 className="w-8 h-8 text-blue-500" />,
      color: "from-blue-500/10 to-blue-600/5",
      borderColor: "group-hover:border-blue-500/50",
    },
    {
      id: "merger" as const,
      title: "PDF Merger",
      description: "Combine multiple PDF documents into a single professional file.",
      icon: <Files className="w-8 h-8 text-green-500" />,
      color: "from-green-500/10 to-green-600/5",
      borderColor: "group-hover:border-green-500/50",
    },
    {
      id: "splitter" as const,
      title: "PDF Splitter",
      description: "Extract pages or split your PDF into multiple documents.",
      icon: <Scissors className="w-8 h-8 text-purple-500" />,
      color: "from-purple-500/10 to-purple-600/5",
      borderColor: "group-hover:border-purple-500/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mt-12">
      {tools.map((tool, index) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.5 }}
          whileHover={{ y: -5 }}
          className="group"
          onClick={() => onSelect(tool.id)}
        >
          <Card className={`relative overflow-hidden border-2 transition-all duration-300 cursor-pointer p-8 h-full bg-gradient-to-br ${tool.color} ${tool.borderColor}`}>
            <div className="flex flex-col h-full gap-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-background shadow-sm">
                  {tool.icon}
                </div>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">{tool.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </div>
            
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl transform translate-x-16 translate-y-16" />
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
