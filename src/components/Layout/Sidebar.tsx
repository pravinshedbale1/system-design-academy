import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { chapters } from '../../data/chapters';
import { systems } from '../../data/systems';
import type { ChapterStatus } from '../../hooks/useProgress';
import { CheckCircle, Circle, BookOpen, Cpu, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  progress: Record<number, ChapterStatus>;
}

function StatusDot({ status }: { status: ChapterStatus }) {
  if (status === 'completed')
    return <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />;
  if (status === 'in-progress')
    return (
      <motion.div
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-3.5 h-3.5 rounded-full bg-indigo-500 flex-shrink-0"
      />
    );
  return <Circle size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />;
}

const diffColors = {
  Easy: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
  Medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30',
  Hard: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30',
};

export default function Sidebar({ progress }: SidebarProps) {
  const location = useLocation();
  const [conceptsOpen, setConceptsOpen] = useState(true);
  const [systemsOpen, setSystemsOpen] = useState(true);

  return (
    <aside className="fixed top-14 left-0 w-60 h-[calc(100vh-3.5rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto z-30">
      <div className="py-3 px-3 space-y-1">

        {/* ── Concepts Section */}
        <button
          onClick={() => setConceptsOpen(v => !v)}
          className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <BookOpen size={11} />
          <span className="flex-1 text-left">Concepts</span>
          {conceptsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        </button>
        <AnimatePresence initial={false}>
          {conceptsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {chapters.map((chapter) => {
                const status = progress[chapter.id] ?? 'not-started';
                const isActive = location.pathname === `/chapter/${chapter.id}`;
                return (
                  <NavLink
                    key={chapter.id}
                    to={`/chapter/${chapter.id}`}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm mb-0.5 transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <StatusDot status={status} />
                    <span className="text-base leading-none">{chapter.emoji}</span>
                    <span className="truncate text-xs leading-tight">{chapter.title}</span>
                  </NavLink>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Systems Section */}
        <div className="pt-2">
          <button
            onClick={() => setSystemsOpen(v => !v)}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Cpu size={11} />
            <span className="flex-1 text-left">Solved Systems</span>
            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-bold">
              {systems.length}
            </span>
            {systemsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          <AnimatePresence initial={false}>
            {systemsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {systems.map((sys) => {
                  const status = progress[70 + sys.id] ?? 'not-started';
                  const isActive = location.pathname === `/system/${sys.id}`;
                  return (
                    <NavLink
                      key={sys.id}
                      to={`/system/${sys.id}`}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm mb-0.5 transition-all ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <StatusDot status={status} />
                      <span className="text-sm leading-none">{sys.emoji}</span>
                      <span className="truncate text-xs leading-tight flex-1">{sys.title}</span>
                      <span className={`text-[9px] px-1 rounded font-semibold flex-shrink-0 ${diffColors[sys.difficulty]}`}>
                        {sys.difficulty[0]}
                      </span>
                    </NavLink>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </aside>
  );
}
