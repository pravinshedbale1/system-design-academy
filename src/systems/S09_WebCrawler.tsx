import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable, KeyValueGrid } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems[8]; // Web Crawler

function CrawlerAnimation() {
  const urls = [
    { id: 1, url: 'google.com', depth: 0, x: 240, y: 20, color: '#6366f1' },
    { id: 2, url: 'google.com/search', depth: 1, x: 100, y: 100, color: '#0ea5e9' },
    { id: 3, url: 'google.com/maps', depth: 1, x: 380, y: 100, color: '#0ea5e9' },
    { id: 4, url: 'maps/api', depth: 2, x: 320, y: 190, color: '#10b981' },
    { id: 5, url: 'maps/embed', depth: 2, x: 440, y: 190, color: '#10b981' },
    { id: 6, url: 'search/images', depth: 2, x: 40, y: 190, color: '#10b981' },
    { id: 7, url: 'search/news', depth: 2, x: 160, y: 190, color: '#10b981' },
  ];
  const edges = [[1,2],[1,3],[2,6],[2,7],[3,4],[3,5]];
  const [visited, setVisited] = useState<Set<number>>(new Set([1]));
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrent(prev => {
        const next = prev < 7 ? prev + 1 : 1;
        if (next === 1) {
          setVisited(new Set([1]));
        } else {
          setVisited(v => new Set([...v, next]));
        }
        return next;
      });
    }, 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 520 250" className="w-full">
        {edges.map(([a, b]) => {
          const na = urls.find(u => u.id === a)!;
          const nb = urls.find(u => u.id === b)!;
          return (
            <motion.line key={`${a}-${b}`}
              x1={na.x + 30} y1={na.y + 12} x2={nb.x + 30} y2={nb.y + 12}
              stroke={visited.has(b) ? '#6366f1' : '#e5e7eb'} strokeWidth="1.5"
              animate={{ stroke: visited.has(b) ? '#6366f1' : '#e5e7eb' }}
            />
          );
        })}
        {urls.map(u => (
          <g key={u.id}>
            <motion.rect x={u.x} y={u.y} width={60} height={24} rx="6"
              fill={current === u.id ? `${u.color}44` : visited.has(u.id) ? `${u.color}22` : '#f3f4f6'}
              stroke={visited.has(u.id) ? u.color : '#e5e7eb'} strokeWidth={current === u.id ? 2 : 1}
              animate={{ scale: current === u.id ? 1.08 : 1 }}
            />
            <text x={u.x + 30} y={u.y + 16} textAnchor="middle" fontSize="7" fill={u.color} fontWeight="600">
              {u.url.split('/').pop() || u.url}
            </text>
          </g>
        ))}
        {/* Spider */}
        {(() => {
          const cu = urls.find(u => u.id === current)!;
          return <text x={cu.x + 30} y={cu.y - 4} textAnchor="middle" fontSize="14">🕷️</text>;
        })()}
      </svg>
      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
        BFS traversal: crawling <span className="font-mono text-indigo-600 dark:text-indigo-400">{urls.find(u => u.id === current)?.url}</span>
      </div>
    </div>
  );
}

export default function S09_WebCrawler({ onProgress }: SystemPageProps) {
  useEffect(() => {
    onProgress(79);  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Scale Estimation">
        <KeyValueGrid items={[
          { label: 'Pages to crawl', value: '1 billion (monthly refresh)' },
          { label: 'QPS needed', value: '400 pages/sec' },
          { label: 'Avg page size', value: '500KB HTML' },
          { label: 'Storage/month', value: '500TB content', color: 'text-red-500' },
        ]} />
      </Section>

      <Section step={2} title="BFS Traversal Animation"
        note="A web crawler is BFS over the hyperlink graph. The URL Frontier is the BFS queue. Visited set prevents re-crawling.">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <CrawlerAnimation />
        </div>
      </Section>

      <Section step={3} title="Architecture Components">
        <TheoryBox title="URL Frontier — The Core Data Structure" icon="📋">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            The URL Frontier is not just a queue — it's a priority queue with politeness constraints:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>→ <strong className="text-gray-800 dark:text-gray-200">Priority:</strong> High-PageRank pages crawled more frequently</li>
            <li>→ <strong className="text-gray-800 dark:text-gray-200">Politeness:</strong> Wait 1+ second between requests to the same domain (robots.txt)</li>
            <li>→ <strong className="text-gray-800 dark:text-gray-200">Freshness:</strong> Frequently updated pages (news) re-crawled every hour; static pages monthly</li>
          </ul>
        </TheoryBox>
        <CompareTable
          headers={['Component', 'Function', 'Technology']}
          rows={[
            ['URL Frontier', 'Priority queue of URLs to crawl', 'Kafka (partitioned by domain)'],
            ['DNS Resolver', 'High-performance cached DNS lookup', 'Local cache + 1000-core DNS pool'],
            ['Content Store', 'Raw HTML deduplicated by hash', 'S3 / HDFS'],
            ['URL Dedup Store', 'Seen-URL bloom filter', 'Redis bloom filter (~50GB for 1B URLs)'],
            ['Link Extractor', 'Parse HTML, extract hrefs', 'Distributed workers in Java/Go'],
            ['Content Parser', 'Extract structured data, language, entities', 'ML pipeline → Elasticsearch index'],
          ]}
        />
      </Section>

      <Section step={4} title="Politeness & robots.txt">
        <TheoryBox title="Being a Good Citizen" icon="🤝">
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>→ Always fetch and respect <code className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">robots.txt</code> before crawling any site</li>
            <li>→ Implement per-domain rate limiting: max 1 request/second per domain by default</li>
            <li>→ Set a descriptive User-Agent header: <code className="font-mono text-xs">Googlebot/2.1 (+http://google.com/bot.html)</code></li>
            <li>→ Respect Crawl-delay directive in robots.txt</li>
          </ul>
        </TheoryBox>
      </Section>

      <InterviewTips tips={[
        'URL deduplication uses a Bloom filter for O(1) lookups at massive scale. A 50GB Bloom filter handles 1B URLs with < 0.1% false positive rate.',
        'Distributed crawling: partition the URL Frontier by domain hash. Each crawler worker owns specific domains — prevents concurrent crawling of the same domain.',
        'Content deduplication: hash the body content (SHA-256). If hash already exists in the store, skip — this is how near-duplicate pages are handled.',
        'DNS is a bottleneck at scale. Pre-fetch and cache DNS responses in a local resolver to avoid external DNS round-trips per URL.',
        'The "spider trap" problem: infinite pages like ?id=1, ?id=2... Use URL depth limit (max 10 hops) and per-domain page count limits.',
      ]} />
    </div>
  );
}
