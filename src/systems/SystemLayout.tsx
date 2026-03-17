import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { SystemDef } from '../data/systems';

const diffColors = {
  Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  Hard: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
};

interface SectionProps {
  step: number;
  title: string;
  children: ReactNode;
  note?: string;
}

export function Section({ step, title, children, note }: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
          {step}
        </span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {note && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 ml-9">{note}</p>
      )}
      {children}
    </motion.section>
  );
}

interface TheoryBoxProps {
  title: string;
  children: ReactNode;
  icon?: string;
}
export function TheoryBox({ title, children, icon = '🧠' }: TheoryBoxProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-3">
      <h3 className="font-bold text-gray-900 dark:text-white">{icon} {title}</h3>
      {children}
    </div>
  );
}

interface KeyValueProps {
  items: { label: string; value: string; color?: string }[];
}
export function KeyValueGrid({ items }: KeyValueProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map(it => (
        <div key={it.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{it.label}</div>
          <div className={`font-mono font-bold text-sm ${it.color ?? 'text-indigo-600 dark:text-indigo-400'}`}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

export function InterviewTips({ tips }: { tips: string[] }) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
      <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h3>
      <ul className="space-y-2">
        {tips.map((t, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="text-indigo-500 flex-shrink-0">→</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface TableProps {
  headers: string[];
  rows: string[][];
}
export function CompareTable({ headers, rows }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-700">
            {headers.map(h => (
              <th key={h} className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
          {rows.map((row, i) => (
            <tr key={i} className="text-gray-600 dark:text-gray-400 text-xs">
              {row.map((cell, j) => (
                <td key={j} className={`py-2 pr-4 ${j === 0 ? 'font-semibold text-gray-700 dark:text-gray-300' : ''}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SystemHeader({ sys }: { sys: SystemDef }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{sys.emoji}</span>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs font-mono text-indigo-500 uppercase tracking-wider">Solved System</div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${diffColors[sys.difficulty as keyof typeof diffColors]}`}>
              {sys.difficulty}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Design {sys.title}</h1>
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed mb-3">{sys.description}</p>
      <div className="flex flex-wrap gap-2">
        {sys.tags.map((tag: string) => (
          <span key={tag} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-700">
            {tag}
          </span>
        ))}
        {sys.companies.map((c: string) => (
          <span key={c} className="text-xs bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full">
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
