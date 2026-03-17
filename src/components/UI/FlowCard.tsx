import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Tag {
  label: string;
  type: 'pro' | 'con' | 'info';
}

interface FlowCardProps {
  title: string;
  description: string;
  tags?: Tag[];
  children?: ReactNode;
  onClick?: () => void;
  isExpanded?: boolean;
  expandedContent?: ReactNode;
}

export default function FlowCard({
  title,
  description,
  tags,
  children,
  onClick,
  isExpanded,
  expandedContent,
}: FlowCardProps) {
  const tagColor = (type: Tag['type']) => {
    if (type === 'pro') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
    if (type === 'con') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
    return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400';
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{description}</p>
      {tags && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag) => (
            <span key={tag.label} className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColor(tag.type)}`}>
              {tag.label}
            </span>
          ))}
        </div>
      )}
      {children}
      {isExpanded && expandedContent && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400"
        >
          {expandedContent}
        </motion.div>
      )}
    </motion.div>
  );
}
