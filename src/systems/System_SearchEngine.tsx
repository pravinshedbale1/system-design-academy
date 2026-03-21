import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems.find(s => s.id === 14)!;

function SearchArchDiagram() {
  const [activeStage, setActiveStage] = useState(0);
  const nodes = [
    { id: 'crawler', label: 'Web Crawler', x: 20, y: 90, color: '#6366f1', w: 80 },
    { id: 'frontier', label: 'URL Frontier', x: 140, y: 90, color: '#8b5cf6', w: 80 },
    { id: 'content', label: 'Content Store', x: 140, y: 180, color: '#64748b', w: 80 },
    { id: 'indexer', label: 'Indexer', x: 270, y: 90, color: '#0ea5e9', w: 70 },
    { id: 'inverted', label: 'Inverted Index', x: 380, y: 90, color: '#f59e0b', w: 90 },
    { id: 'query', label: 'Query Service', x: 510, y: 40, color: '#10b981', w: 85 },
    { id: 'ranking', label: 'Ranking (ML)', x: 510, y: 140, color: '#ef4444', w: 85 },
    { id: 'user', label: 'User', x: 630, y: 90, color: '#ec4899', w: 60 },
  ];
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  const stages = [
    { name: '🕷️ Crawl', highlight: ['crawler', 'frontier', 'content'], color: '#6366f1' },
    { name: '📑 Index', highlight: ['content', 'indexer', 'inverted'], color: '#0ea5e9' },
    { name: '🔍 Serve', highlight: ['user', 'query', 'inverted', 'ranking'], color: '#10b981' },
  ];

  const edges: [string, string][] = [
    ['crawler', 'frontier'], ['frontier', 'indexer'], ['crawler', 'content'],
    ['content', 'indexer'], ['indexer', 'inverted'],
    ['user', 'query'], ['query', 'inverted'], ['inverted', 'ranking'], ['ranking', 'user'],
  ];

  const hl = stages[activeStage].highlight;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-2">
        {stages.map((s, i) => (
          <button key={s.name} onClick={() => setActiveStage(i)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${activeStage === i ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
            style={{ backgroundColor: activeStage === i ? s.color : undefined }}>
            {s.name}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <svg viewBox="0 0 720 230" className="w-full">
          <defs>
            <marker id="se-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={stages[activeStage].color} />
            </marker>
          </defs>
          {/* Stage separators */}
          <line x1="230" y1="20" x2="230" y2="210" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <line x1="470" y1="20" x2="470" y2="210" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <text x="115" y="18" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600">CRAWL</text>
          <text x="350" y="18" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600">INDEX</text>
          <text x="590" y="18" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600">SERVE</text>

          {edges.map(([a, b]) => {
            const na = nodeMap[a]; const nb = nodeMap[b];
            const inPath = hl.includes(a) && hl.includes(b);
            return (
              <motion.line key={`${a}-${b}`}
                x1={na.x + na.w / 2} y1={na.y + 20} x2={nb.x + nb.w / 2} y2={nb.y + 20}
                stroke={inPath ? stages[activeStage].color : '#e5e7eb'} strokeWidth={inPath ? 2 : 1}
                strokeDasharray="5 3" opacity={inPath ? 0.8 : 0.2}
                markerEnd={inPath ? 'url(#se-ar)' : undefined}
                animate={inPath ? { strokeDashoffset: [0, -16] } : {}}
                transition={inPath ? { duration: 1.5, repeat: Infinity, ease: 'linear' } : {}}
              />
            );
          })}
          {nodes.map(n => {
            const active = hl.includes(n.id);
            return (
              <g key={n.id}>
                <rect x={n.x} y={n.y} width={n.w} height={40} rx="8"
                  fill={active ? `${n.color}22` : '#f9fafb'} stroke={active ? n.color : '#e5e7eb'}
                  strokeWidth={active ? 2 : 1} style={{ transition: 'all 0.4s ease' }}
                />
                <text x={n.x + n.w / 2} y={n.y + 24} textAnchor="middle" fontSize="9"
                  fontWeight="600" fill={active ? n.color : '#9ca3af'}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {activeStage === 0 ? 'Crawl: Spider discovers URLs via BFS, fetches content, stores in Content Store'
          : activeStage === 1 ? 'Index: Parse documents → tokenize → build inverted index mapping words → document IDs'
          : 'Serve: User query → lookup inverted index → ML ranking → return top results'}
      </div>
    </div>
  );
}

export default function S14_SearchEngine({ onProgress }: SystemPageProps) {
  useEffect(() => { onProgress(84); }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Architecture Overview" note="A search engine has 3 stages: Crawl → Index → Serve. Click each stage to see data flow.">
        <SearchArchDiagram />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-4">
          {[
            { name: '🕷️ Crawling', desc: 'Discover and download web pages. BFS traversal of URLs. Respect robots.txt. Politeness: max 1 req/sec per domain.' },
            { name: '📑 Indexing', desc: 'Parse HTML → extract text → build inverted index. Map each word to list of document IDs + positions.' },
            { name: '🔍 Serving', desc: 'User query → tokenize → look up inverted index → rank results → return top 10. <200ms latency target.' },
          ].map(s => (
            <div key={s.name} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{s.name}</div>
              <p className="text-gray-600 dark:text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section step={2} title="Inverted Index">
        <TheoryBox title="How an Inverted Index Works" icon="📖">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Instead of mapping documents → words (forward index), map words → documents (inverted index). This makes keyword lookup O(1).
          </p>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 font-mono text-xs space-y-1">
            <div className="text-indigo-600 dark:text-indigo-400">// Forward Index (bad for search)</div>
            <div className="text-gray-600 dark:text-gray-400">doc1 → ["system", "design", "interview"]</div>
            <div className="text-gray-600 dark:text-gray-400">doc2 → ["system", "architecture", "scale"]</div>
            <div className="text-indigo-600 dark:text-indigo-400 mt-2">// Inverted Index (good for search)</div>
            <div className="text-emerald-600">"system"  → [doc1:pos1, doc2:pos1]</div>
            <div className="text-emerald-600">"design"  → [doc1:pos2]</div>
            <div className="text-emerald-600">"scale"   → [doc2:pos3]</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Each posting list is sorted by doc_id for efficient intersection. Query "system design" = intersect posting lists for "system" and "design".
          </p>
        </TheoryBox>
      </Section>

      <Section step={3} title="Ranking Algorithms">
        <CompareTable
          headers={['Algorithm', 'How It Works', 'Used By']}
          rows={[
            ['TF-IDF', 'Term Frequency × Inverse Doc Frequency. Common words get low weight.', 'Basic IR systems, Elasticsearch default'],
            ['BM25', 'Improved TF-IDF with document length normalization and saturation.', 'Elasticsearch, Solr, Lucene'],
            ['PageRank', 'Link analysis: pages linked by many important pages rank higher.', 'Google (original algorithm)'],
            ['ML Ranking (LTR)', 'Learn-to-Rank: ML model trained on click data to rank results.', 'Google (current), Bing'],
          ]}
        />
      </Section>

      <Section step={4} title="Autocomplete & Suggestions">
        <TheoryBox title="Trie-Based Autocomplete" icon="🔤">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Store popular queries in a Trie (prefix tree). Each node stores the top-K completions by frequency. On each keystroke, traverse trie to the prefix node and return pre-computed top-K suggestions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <div className="font-semibold text-gray-800 dark:text-gray-200">Requirements</div>
              <p>P99 latency {'<'} 50ms. Update trie weekly from query logs. Shard trie by prefix range (a-m, n-z).</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <div className="font-semibold text-gray-800 dark:text-gray-200">Optimization</div>
              <p>Client-side debounce (300ms). Pre-fetch top suggestions on page load. Cache popular prefixes in CDN edge.</p>
            </div>
          </div>
        </TheoryBox>
      </Section>

      <InterviewTips tips={[
        'The inverted index is the core data structure. Know how to build one, intersect posting lists, and rank results with TF-IDF or BM25.',
        'Crawling at scale: distributed URL frontier (priority queue), politeness policy (1 req/sec/domain), dedup (URL fingerprinting).',
        'PageRank treats the web as a graph. Each link is a "vote". Pages with more votes from important pages rank higher. Converges via iterative computation.',
        'Autocomplete: Trie with pre-computed top-K at each node. Shard by prefix range. Update asynchronously from query logs.',
        'Google processes 8.5B queries/day. The index is sharded across thousands of machines. Each query fans out to all shards, results are merged and ranked.',
      ]} />
    </div>
  );
}
