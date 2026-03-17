import { useState, useMemo } from 'react';
import { glossaryData } from '../data/glossary';
import { BookA, Search, Filter } from 'lucide-react';

export default function Glossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(glossaryData.map(item => item.category)))];

  const filteredData = useMemo(() => {
    return glossaryData
      .filter(item => activeCategory === 'All' || item.category === activeCategory)
      .filter(item => 
        item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.definition.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [searchTerm, activeCategory]);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl text-indigo-500"><BookA size={40} /></span>
          <div>
            <div className="text-xs font-mono text-indigo-500 uppercase tracking-wider mb-1">Reference</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Design Glossary</h1>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-3xl">
          Plain-English, layman explanations for the most common technical jargon used in system design interviews and architecture discussions. No confusing academic definitions here.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sticky top-[4.5rem] z-30 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search terms or definitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
            />
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 md:pb-0 items-center">
            <Filter size={16} className="text-gray-400 mr-1 flex-shrink-0" />
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredData.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No terms found matching "{searchTerm}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredData.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="flex justify-between flex-wrap gap-2 items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.term}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                  {item.category}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {item.definition}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
