import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StepperWidget from '../components/UI/StepperWidget';
import FlowCard from '../components/UI/FlowCard';

interface ChapterProps {
  onProgress: (id: number) => void;
  onComplete: (id: number) => void;
}

// ── Cache-aside SVG Diagram (per step)
function CacheDiagram({ step }: { step: number }) {
  const appActive = step >= 0;
  const redisHit = step === 4;
  const redisMiss = step === 1;
  const dbActive = step === 2 || step === 3;
  const arrowToRedis = step === 0 || step === 4;
  const arrowToDB = step === 2;
  const arrowDBtoApp = step === 3;

  return (
    <svg viewBox="0 0 400 160" className="w-full max-w-lg mx-auto">
      <rect x="20" y="60" width="90" height="40" rx="8"
        fill={appActive ? '#eef2ff' : '#f9fafb'}
        stroke={appActive ? '#6366f1' : '#d1d5db'} strokeWidth="2" />
      <text x="65" y="84" textAnchor="middle" fontSize="12" fontWeight="600" fill={appActive ? '#4338ca' : '#6b7280'}>App Server</text>

      <rect x="155" y="60" width="90" height="40" rx="8"
        fill={redisHit ? '#d1fae5' : redisMiss ? '#fee2e2' : '#f9fafb'}
        stroke={redisHit ? '#10b981' : redisMiss ? '#ef4444' : '#d1d5db'} strokeWidth="2" />
      <text x="200" y="84" textAnchor="middle" fontSize="12" fontWeight="600" fill={redisHit ? '#065f46' : redisMiss ? '#dc2626' : '#6b7280'}>Redis</text>
      {redisMiss && <text x="200" y="115" textAnchor="middle" fontSize="10" fill="#dc2626">nil ✗</text>}
      {redisHit && <text x="200" y="115" textAnchor="middle" fontSize="10" fill="#10b981">HIT ✓</text>}

      <rect x="290" y="60" width="90" height="40" rx="8"
        fill={dbActive ? '#fef3c7' : '#f9fafb'}
        stroke={dbActive ? '#d97706' : '#d1d5db'} strokeWidth="2" />
      <text x="335" y="84" textAnchor="middle" fontSize="12" fontWeight="600" fill={dbActive ? '#92400e' : '#6b7280'}>Database</text>

      {arrowToRedis && (
        <motion.line x1="110" y1="80" x2="153" y2="80" stroke="#6366f1" strokeWidth="2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} />
      )}
      {arrowToDB && (
        <motion.path d="M 110 70 Q 200 20 288 70" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="5,3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
      )}
      {arrowDBtoApp && (
        <motion.path d="M 290 90 Q 200 130 110 90" fill="none" stroke="#10b981" strokeWidth="2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
      )}
      <defs>
        <marker id="arr4" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" />
        </marker>
      </defs>
    </svg>
  );
}

const cacheStepDefs = [
  { title: 'App checks Redis', step: 0, note: 'GET "user:42" — App always checks cache first. This is the "lazy loading" approach — only fetch from DB when the cache misses.' },
  { title: 'Cache Miss — Redis returns nil', step: 1, note: 'The key doesn\'t exist in Redis. This happens on first access, or after TTL expiry. Now the app must fetch from the source of truth.' },
  { title: 'App queries database', step: 2, note: 'The app falls back to PostgreSQL. This query takes ~10ms vs 0.1ms for a cache hit — 100x slower. Minimize how often this happens.' },
  { title: 'DB returns row — app populates cache', step: 3, note: 'SET "user:42" TTL=3600 — The app caches the result for 1 hour. Future reads will be served from Redis without ever touching the database.' },
  { title: 'Cache hit — DB never touched', step: 4, note: 'Subsequent requests return in ~0.1ms from Redis. At scale, 99% of reads should be cache hits. Database load drops dramatically.' },
];

function CacheStampedeDiagram() {
  return (
    <svg viewBox="0 0 320 120" className="w-full max-w-sm mx-auto">
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i}>
          <motion.circle cx={20} cy={20 + i * 20} r={6} fill="#6366f1"
            animate={{ cx: [20, 160] }} transition={{ duration: 1.2, delay: i * 0.1, repeat: Infinity, repeatDelay: 1 }} />
        </g>
      ))}
      <text x={160} y={65} textAnchor="middle" fontSize="10" fill="#6b7280">TTL Expired</text>
      <rect x={150} y={40} width={80} height={40} rx="6" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
      <text x={190} y={64} textAnchor="middle" fontSize="11" fill="#dc2626">Database</text>
      <text x={190} y={95} textAnchor="middle" fontSize="9" fill="#ef4444">🔥 Overloaded</text>
    </svg>
  );
}

const cachingPatterns = [
  {
    title: 'Cache-Aside (Lazy Loading)',
    description: 'App manages cache explicitly. On miss → fetch from DB → write to cache.',
    tags: [
      { label: 'Only caches what\'s read', type: 'pro' as const },
      { label: 'Cache miss penalty on first read', type: 'con' as const },
      { label: 'Resilient to cache failure', type: 'pro' as const },
    ],
  },
  {
    title: 'Write-Through',
    description: 'Every write goes to cache AND database simultaneously. Cache is always consistent.',
    tags: [
      { label: 'Always consistent', type: 'pro' as const },
      { label: 'Write latency increases', type: 'con' as const },
      { label: 'Cache may hold rarely-read data', type: 'con' as const },
    ],
  },
  {
    title: 'Write-Behind (Write-Back)',
    description: 'Write to cache only; batch-flush to database asynchronously later.',
    tags: [
      { label: 'Very fast writes', type: 'pro' as const },
      { label: 'Risk of data loss on crash', type: 'con' as const },
      { label: 'Complex implementation', type: 'con' as const },
    ],
  },
  {
    title: 'Read-Through',
    description: 'Cache sits transparently in front of DB. On miss, the cache itself fetches from DB.',
    tags: [
      { label: 'Simplified app logic', type: 'pro' as const },
      { label: 'First miss is always slow', type: 'con' as const },
      { label: 'Pre-warming needed', type: 'info' as const },
    ],
  },
];

export default function Chapter4({ onProgress, onComplete }: ChapterProps) {
  const [cacheStep, setCacheStep] = useState(0);

  useEffect(() => {
    onProgress(4);
    const t = setTimeout(() => onComplete(4), 5000);
    return () => clearTimeout(t);
  }, []);

  const stepperSteps = cacheStepDefs.map(s => ({
    title: s.title,
    content: (
      <div>
        <CacheDiagram step={s.step} />
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-3 px-2">{s.note}</p>
      </div>
    ),
  }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🗄️</span>
          <div>
            <div className="text-xs font-mono text-indigo-500 uppercase tracking-wider mb-1">Chapter 04</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Caching Deep Dive</h1>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
          Caching is the single most impactful optimization in distributed systems. A well-designed cache layer can reduce database load by 90%+ and cut response times from 10ms to 0.1ms.
        </p>
      </div>

      {/* Theory */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 Why Caching Works — The Locality Principle</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Caching exploits two fundamental patterns in real-world traffic:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
            <div className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Temporal Locality</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">If data is accessed once, it's likely to be accessed again soon. A user who loads their profile will reload it many times in a session.</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <div className="font-semibold text-purple-700 dark:text-purple-300 mb-1">Zipf Distribution</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">In most systems, ~80% of traffic hits only ~20% of content. On Twitter, the top 1% of tweets get 90% of views — making them perfect cache candidates.</p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Cache Metrics to Know</div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Cache Hit Rate', desc: 'Hits / (Hits + Misses). Healthy is >90%. Below 70% means your caching strategy is wrong.' },
              { label: 'Eviction Policy', desc: 'LRU (Least Recently Used) is the most common. LFU helps when access frequency matters more than recency.' },
              { label: 'TTL (Time-to-Live)', desc: 'How long a key stays cached. Too short = too many misses. Too long = stale data served to users.' },
            ].map(m => (
              <div key={m.label}>
                <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">{m.label}</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cache-Aside Stepper */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cache-Aside Pattern — Step by Step</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Cache-aside is the most common pattern. The app code explicitly manages both the cache and the database. Follow each step to see what happens on first and subsequent requests.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <StepperWidget
            steps={stepperSteps}
            currentStep={cacheStep}
            onNext={() => setCacheStep(s => Math.min(s + 1, stepperSteps.length - 1))}
            onBack={() => setCacheStep(s => Math.max(s - 1, 0))}
          />
        </div>
      </section>

      {/* Cache Hit vs Miss */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cache Hit vs Miss — Why It Matters</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 text-center">
            <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">~0.1ms</div>
            <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mt-1">Cache Hit</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Client → App → Redis → App → Client</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-5 text-center">
            <div className="text-3xl font-bold font-mono text-red-600 dark:text-red-400">~10ms</div>
            <div className="text-sm font-semibold text-red-700 dark:text-red-300 mt-1">Cache Miss</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">Client → App → Redis → DB → App → Cache → Client</div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          At 10,000 RPS, a drop from 90% to 80% hit rate means 1,000 extra database queries per second. At that scale, your database will collapse. This is why engineers obsess over hit rates in production monitoring.
        </p>
      </section>

      {/* Four Caching Patterns */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Four Caching Patterns</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Each pattern makes a different trade-off between consistency, complexity, and write performance. Most production systems use <strong>cache-aside for reads</strong> and one of the write strategies below.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {cachingPatterns.map((p) => (
            <FlowCard key={p.title} {...p} />
          ))}
        </div>
      </section>

      {/* Danger Zones */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">⚠️ Three Danger Zones</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          These failure modes have taken down production systems at scale. Every engineer working with a cache needs to know these by heart.
        </p>
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">🌊</span>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Cache Stampede (Thundering Herd)</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Imagine 10,000 users all hit the same page at the same second. The cache TTL for that page's data just expired. Every single request goes straight to the database simultaneously — which immediately crashes under 10,000 concurrent queries.
                </p>
              </div>
            </div>
            <CacheStampedeDiagram />
            <div className="mt-3 space-y-2">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Fix 1 — Mutex/Lock:</span>
                <span className="text-gray-600 dark:text-gray-400"> Use <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">SETNX</code> (Set if Not eXists) in Redis as a distributed lock. Only one process rebuilds the cache; all others wait or return stale data.</span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Fix 2 — Probabilistic Early Recompute:</span>
                <span className="text-gray-600 dark:text-gray-400"> Before a key expires, occasionally recompute it early (with some random probability as expiry approaches). No thundering herd because regeneration is spread out.</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-200 dark:border-amber-800 p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">👤</span>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Cache Penetration</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  An attacker (or bug) repeatedly queries for keys that don't exist — like <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">GET user:-1</code>. These always miss cache (no key to cache!) and hammer the database on every request. This is a common DDoS vector.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-sm">
                <span className="font-semibold text-amber-700 dark:text-amber-400">Fix 1 — Cache Null Results:</span>
                <span className="text-gray-600 dark:text-gray-400"> When DB returns empty, cache that emptiness: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">SET user:-1 "" TTL=30s</code>. Subsequent requests for that key return fast.</span>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-sm">
                <span className="font-semibold text-amber-700 dark:text-amber-400">Fix 2 — Bloom Filter:</span>
                <span className="text-gray-600 dark:text-gray-400"> A probabilistic data structure that remembers which keys exist. Query the Bloom Filter first; if it says "doesn't exist", skip the DB entirely. Zero false negatives.</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-orange-200 dark:border-orange-800 p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">❄️</span>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Cache Avalanche</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  All keys were populated at the same time (e.g., during a cache warm-up or weekly batch job), so they all expire simultaneously. The database gets a massive spike every hour on the hour. In the worst case, the DB crashes, which clears nothing — so the next request also misses, crashing again.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-sm font-mono mb-3">
              <div className="text-indigo-600 dark:text-indigo-400 mb-1">{'// ❌ Same TTL = synchronized expiry'}</div>
              <div className="text-red-500 mb-2">TTL = 3600 <span className="text-gray-400">{'// all expire together'}</span></div>
              <div className="text-indigo-600 dark:text-indigo-400 mb-1">{'// ✅ Jittered TTL = staggered expiry'}</div>
              <div className="text-emerald-400">TTL = 3600 + random(0, 300)</div>
            </div>
            <div className="space-y-2">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-sm">
                <span className="font-semibold text-orange-700 dark:text-orange-400">Fix 1 — TTL Jitter:</span>
                <span className="text-gray-600 dark:text-gray-400"> Add random offset to every TTL (±10%). Keys now expire uniformly spread over time, not in synchronized bursts.</span>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-sm">
                <span className="font-semibold text-orange-700 dark:text-orange-400">Fix 2 — Circuit Breaker:</span>
                <span className="text-gray-600 dark:text-gray-400"> If DB query failure rate spikes above a threshold, briefly reject all cache-miss requests with a 503 instead of cascading to DB. This gives the DB time to recover.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Redis vs Memcached */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Redis vs Memcached — Which to Choose?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Feature</th>
                <th className="text-left py-2 pr-4 font-semibold text-red-600">Redis</th>
                <th className="text-left py-2 font-semibold text-blue-600">Memcached</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {[
                ['Data Types', 'String, List, Set, Hash, ZSet, HLL, Stream', 'String only'],
                ['Persistence', 'RDB snapshots + AOF log', 'None (pure memory)'],
                ['Pub/Sub', '✅ Yes', '✗ No'],
                ['Lua Scripting', '✅ Yes', '✗ No'],
                ['Multi-threading', 'Single-threaded (mostly)', 'Multi-threaded'],
                ['Cluster Mode', '✅ Redis Cluster', '✅ Client-side hashing'],
                ['Best For', 'Feature-rich cache, queues, leaderboards', 'Pure high-speed key-value'],
              ].map(([feat, redis, mem]) => (
                <tr key={feat} className="text-gray-600 dark:text-gray-400">
                  <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">{feat}</td>
                  <td className="py-2 pr-4">{redis}</td>
                  <td className="py-2">{mem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          <strong className="text-gray-700 dark:text-gray-300">Rule of thumb:</strong> Choose Redis unless you have an extremely simple caching use case and maximum raw throughput is your only requirement. Redis's richer feature set almost always outweighs Memcached's marginal speed advantage.
        </p>
      </section>
    </div>
  );
}
