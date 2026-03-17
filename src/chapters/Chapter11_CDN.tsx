import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps { onProgress: (id: number) => void; }

/* ── CDN Request Flow Animation ── */
function CDNFlow() {
  const [step, setStep] = useState(0);
  const [cacheHit, setCacheHit] = useState(true);
  const hSteps = [
    { label: 'User requests image.jpg', node: '👤 User', color: '#6366f1' },
    { label: 'DNS resolves to nearest edge (Anycast)', node: '🗺️ DNS', color: '#8b5cf6' },
    { label: 'Edge server checks local cache', node: '🏢 Edge PoP', color: '#0ea5e9' },
    { label: '✅ Cache HIT — return image in 12ms', node: '📡 Response', color: '#10b981' },
  ];
  const mSteps = [
    { label: 'User requests image.jpg', node: '👤 User', color: '#6366f1' },
    { label: 'DNS resolves to nearest edge (Anycast)', node: '🗺️ DNS', color: '#8b5cf6' },
    { label: 'Edge server checks local cache', node: '🏢 Edge PoP', color: '#0ea5e9' },
    { label: '❌ Cache MISS — fetch from origin', node: '🌍 Origin', color: '#ef4444' },
    { label: 'Origin returns image + cache headers', node: '📦 Response', color: '#f59e0b' },
    { label: 'Edge caches + serves to user (180ms)', node: '📡 Cached', color: '#10b981' },
  ];
  const steps_list = cacheHit ? hSteps : mSteps;
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % (steps_list.length + 1)), 1200); return () => clearInterval(t); }, [cacheHit]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button onClick={() => { setCacheHit(true); setStep(0); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${cacheHit ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>✅ Cache Hit</button>
        <button onClick={() => { setCacheHit(false); setStep(0); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!cacheHit ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>❌ Cache Miss</button>
      </div>
      <div className="space-y-1.5">
        {steps_list.map((s, i) => (
          <motion.div key={`${cacheHit}-${i}`}
            animate={{ opacity: i < step ? 1 : 0.15, x: i < step ? 0 : -8 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ backgroundColor: i < step ? `${s.color}11` : 'transparent' }}>
            <span className="text-sm">{s.node}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Chapter11_CDN({ onProgress }: ChapterProps) {
  useEffect(() => { onProgress(11); }, []);
  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 10</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🚀 Content Delivery Networks</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">How CDNs serve 60% of internet traffic within 50ms by caching content at the edge.</p>
      </motion.div>

      {/* CDN Flow */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          CDN Request Flow
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">CDNs proxy requests to geo-distributed edge servers. A cache hit avoids the origin entirely — saving 100-200ms.</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <CDNFlow />
        </div>
      </motion.section>

      {/* Push vs Pull */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          Push CDN vs Pull CDN
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">📤 Push CDN</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">You upload content to CDN proactively. Content is available at all edges before any user requests it.</p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>→ Origin pushes new content to CDN on publish</li>
              <li>→ CDN stores it until you explicitly invalidate or update</li>
              <li>✅ First request is always fast (pre-populated)</li>
              <li>✅ Predictable — you control what's cached</li>
              <li>❌ More complex deployment pipeline</li>
              <li>❌ Wastes storage if content is rarely accessed</li>
              <li className="text-indigo-600 dark:text-indigo-400 font-semibold pt-1">Best for: Static assets, JS bundles, firmware updates</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">📥 Pull CDN</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">CDN fetches from origin on first request, then caches. Most CDNs work this way by default.</p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>→ First request: CDN fetches from origin (cold start)</li>
              <li>→ Subsequent: served from edge cache (hot)</li>
              <li>✅ Zero setup — just point DNS to CDN</li>
              <li>✅ Only caches what's actually requested</li>
              <li>❌ First request is slow (cold start penalty)</li>
              <li>❌ Origin can be overwhelmed on cache-storm (thundering herd)</li>
              <li className="text-indigo-600 dark:text-indigo-400 font-semibold pt-1">Best for: Dynamic assets, API responses, user-generated content</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Cache Headers */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          Cache-Control Headers
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="space-y-2 font-mono text-xs">
            {[
              { header: 'Cache-Control: public, max-age=31536000', desc: 'Cache for 1 year (immutable assets with hash in filename)' },
              { header: 'Cache-Control: private, no-cache', desc: 'Revalidate on every request (user-specific data)' },
              { header: 'Cache-Control: no-store', desc: 'Never cache (sensitive data, banking)' },
              { header: 'Cache-Control: s-maxage=3600', desc: 'CDN-specific: cache 1h at edge, different from browser max-age' },
              { header: 'ETag: "abc123"', desc: 'Content fingerprint for conditional requests (If-None-Match → 304)' },
              { header: 'Vary: Accept-Encoding', desc: 'Cache separate versions for gzip vs brotli vs uncompressed' },
            ].map(h => (
              <div key={h.header} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                <code className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 whitespace-nowrap">{h.header}</code>
                <span className="text-gray-500 dark:text-gray-400">{h.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CDN Invalidation */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Cache Invalidation Strategies
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">"There are only two hard things in CS: cache invalidation and naming things." — Phil Karlton</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Versioned URLs', desc: 'app.v2.1.js or app.abc123.js — new filename = new cache entry. Old versions expire naturally.', icon: '🏷️' },
              { name: 'Purge API', desc: 'POST /purge?url=/image.jpg — CDN deletes cached copy. Takes seconds to propagate globally.', icon: '🗑️' },
              { name: 'Stale-While-Revalidate', desc: 'Serve stale content while fetching fresh copy in background. User never sees loading state.', icon: '♻️' },
            ].map(s => (
              <div key={s.name} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{s.icon} {s.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Edge Computing */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          Edge Computing & Modern CDNs
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Modern CDNs go beyond static file caching. They run <strong className="text-gray-800 dark:text-gray-200">compute at the edge</strong> — executing code in 300+ locations worldwide.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Cloudflare Workers', desc: 'JavaScript/WASM at 300+ PoPs. Cold start <5ms. No containers.' },
              { name: 'AWS Lambda@Edge', desc: 'Runs Lambda functions at CloudFront edge. Modifies requests/responses.' },
              { name: 'Vercel Edge Functions', desc: 'Server-side rendering at the edge for Next.js pages.' },
              { name: 'Akamai EdgeWorkers', desc: 'Enterprise edge compute with 4,100 PoPs across 134 countries.' },
            ].map(e => (
              <div key={e.name} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-xs">
                <div className="font-semibold text-indigo-600 dark:text-indigo-400">{e.name}</div>
                <div className="text-gray-600 dark:text-gray-400 mt-0.5">{e.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Interview Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h3>
        <ul className="space-y-2">
          {[
            'CDNs reduce latency by serving from geographically close edge PoPs. Typical cache hit ratio: 90-95%. Always mention CDN early in any design that serves static or media content.',
            'Pull CDN is the default choice. Use Push CDN only for predictable, critical content that must be available everywhere before the first request.',
            'Use versioned URLs (app.abc123.js) for immutable caching (max-age=1yr). This is the gold standard — no invalidation needed.',
            'Thundering herd problem: When cache expires, thousands of requests hit origin simultaneously. Solution: request coalescing (edge groups concurrent misses into one origin fetch).',
            'For system design, pair CDN with: DNS (GeoDNS routes to nearest PoP) + Load Balancer (origin protection) + Object Storage (S3 as origin server).',
          ].map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-indigo-500 flex-shrink-0">→</span><span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
