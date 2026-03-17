import { useEffect } from 'react';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems.find(s => s.id === 14)!;

export default function S14_SearchEngine({ onProgress, onComplete }: SystemPageProps) {
  useEffect(() => { onProgress(84); }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Architecture Overview" note="A search engine has 3 stages: Crawl → Index → Serve.">
        <div className="grid grid-cols-3 gap-3 text-xs">
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
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
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
