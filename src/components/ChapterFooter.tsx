import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Props {
  isCompleted: boolean;
  onComplete: () => void;
  prevPath?: string;
  prevLabel?: string;
  nextPath?: string;
  nextLabel?: string;
}

export default function ChapterFooter({ isCompleted, onComplete, prevPath, prevLabel, nextPath, nextLabel }: Props) {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-6 pb-10 pt-6">
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex items-center justify-between">
        {/* Previous */}
        {prevPath ? (
          <button onClick={() => navigate(prevPath)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="text-lg">←</span>
            <div className="text-left">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Previous</div>
              <div className="text-gray-700 dark:text-gray-300">{prevLabel}</div>
            </div>
          </button>
        ) : <div />}

        {/* Mark Complete */}
        <motion.button
          onClick={onComplete}
          disabled={isCompleted}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isCompleted
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 cursor-default'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isCompleted ? '✓ Completed' : '✓ Mark as Completed'}
        </motion.button>

        {/* Next */}
        {nextPath ? (
          <button onClick={() => navigate(nextPath)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="text-right">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Next</div>
              <div className="text-gray-700 dark:text-gray-300">{nextLabel}</div>
            </div>
            <span className="text-lg">→</span>
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
