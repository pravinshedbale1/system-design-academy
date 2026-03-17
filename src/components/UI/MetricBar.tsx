import { motion } from 'framer-motion';

interface MetricBarProps {
  label: string;
  value: number; // 0-100
  color: string; // Tailwind class or hex
  unit?: string;
  displayValue?: string;
}

export default function MetricBar({ label, value, unit = '%', displayValue }: MetricBarProps) {
  const getbarColor = () => {
    if (value < 60) return 'from-emerald-400 to-emerald-500';
    if (value < 75) return 'from-amber-400 to-amber-500';
    return 'from-red-400 to-red-500';
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
          {displayValue ?? `${Math.round(value)}${unit}`}
        </span>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${getbarColor()} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
