import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { chapters } from '../../data/chapters';
import { Moon, Sun, Layers } from 'lucide-react';

interface NavbarProps {
  overallPercent: number;
}

export default function Navbar({ overallPercent }: NavbarProps) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('sda-theme') === 'dark' ||
      (!localStorage.getItem('sda-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sda-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sda-theme', 'light');
    }
  }, [dark]);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 z-40 flex items-center px-6 gap-4">
      <Link to="/chapter/1" className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900 dark:text-white leading-tight">System Design</div>
          <div className="text-xs text-indigo-500 font-semibold leading-tight">Academy</div>
        </div>
      </Link>

      <div className="flex-1 flex items-center gap-3 ml-4">
        <div className="flex-1 max-w-xs">
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {overallPercent}% complete
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {Object.values({}).length}/{chapters.length} chapters
        </span>
      </div>

      <button
        onClick={() => setDark(d => !d)}
        className="ml-auto w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle dark mode"
      >
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </header>
  );
}
