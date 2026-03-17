import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Step {
  title: string;
  content: ReactNode;
}

interface StepperWidgetProps {
  steps: Step[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
}

export default function StepperWidget({ steps, currentStep, onNext, onBack }: StepperWidgetProps) {
  return (
    <div className="space-y-4">
      {/* Dot indicators */}
      <div className="flex items-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentStep
                ? 'w-8 bg-indigo-500'
                : i < currentStep
                ? 'w-2 bg-emerald-500'
                : 'w-2 bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
        <span className="ml-2 text-xs text-gray-400 font-mono">
          {currentStep + 1} / {steps.length}
        </span>
      </div>

      {/* Step content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
        className="min-h-[200px]"
      >
        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Step {currentStep + 1}: {steps[currentStep].title}
        </h4>
        {steps[currentStep].content}
      </motion.div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          disabled={currentStep === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={currentStep === steps.length - 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
