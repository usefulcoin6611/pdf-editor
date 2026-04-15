import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout, Type, ShieldCheck } from "lucide-react";

export function LoadingScreen() {
  const steps = [
    { label: "Validating document schema...", icon: <ShieldCheck size={18} className="text-zinc-600" /> },
    { label: "Extracting embedded fonts...", icon: <Type size={18} className="text-zinc-600" /> },
    { label: "Initializing Hybrid Layout Engine...", icon: <Layout size={18} className="text-zinc-600" /> },
    { label: "Booting up canvas...", icon: <div className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /> },
  ];
  
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Progress through steps one by one
    const interval = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }, 500);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] flex flex-col gap-6"
    >
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 relative overflow-hidden">
             <div className="absolute inset-0 border-2 border-indigo-500 rounded-full animate-[spin_3s_linear_infinite] border-r-transparent border-t-transparent" />
             <Layout className="h-5 w-5 text-indigo-600 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Precision Engine Loading</h2>
        <p className="text-sm text-zinc-500 mt-1">Please wait while we parse the internal document structures.</p>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          
          return (
             <div key={idx} className={`flex items-center gap-3 transition-opacity duration-300 ${isActive || isCompleted ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${isCompleted ? 'bg-green-50 border-green-200 text-green-600' : isActive ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                   {isCompleted ? <ShieldCheck size={14} /> : isActive ? step.icon : <div className="h-1.5 w-1.5 rounded-full bg-currentColor opacity-50" />}
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`}>
                   {step.label}
                </span>
             </div>
          );
        })}
      </div>
      
      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden mt-6">
         <motion.div 
           className="h-full bg-indigo-600 rounded-full"
           initial={{ width: "0%" }}
           animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
           transition={{ ease: "linear" }}
         />
      </div>
    </motion.div>
  );
}
