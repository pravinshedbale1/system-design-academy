import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CodeBlock from '../components/UI/CodeBlock';
import StepperWidget from '../components/UI/StepperWidget';

interface ChapterProps {
  systemId?: number;
  onProgress: (id: number) => void;
}

function formatBytes(bytes: number) {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`;
  return `${bytes} B`;
}

function formatNum(n: number) {
  return Math.round(n).toLocaleString();
}

// ── Step 1: Requirements
function RequirementsSection() {
  const functional = [
    'Shorten a long URL to a unique short code',
    'Redirect short URL to original with <10ms',
    'Support custom slugs (optional)',
    'Track click analytics',
  ];
  const nonFunctional = [
    '100M URLs stored total',
    'High availability — 99.99% uptime',
    'Low latency reads — cache-first',
    '10:1 read/write ratio',
  ];

  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5">
        <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-3">✅ Functional Requirements</h4>
        <div className="space-y-2">
          {functional.map((req, i) => (
            <motion.div
              key={req}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="text-emerald-500 mt-0.5 flex-shrink-0">→</span> {req}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-5">
        <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-3">⚙️ Non-Functional Requirements</h4>
        <div className="space-y-2">
          {nonFunctional.map((req, i) => (
            <motion.div
              key={req}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 + 0.3 }}
              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="text-indigo-500 mt-0.5 flex-shrink-0">→</span> {req}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Back-of-envelope Calculator
function BackOfEnvelope() {
  const [writesPerDay, setWritesPerDay] = useState(1_000_000);
  const [readsPerDay, setReadsPerDay] = useState(10_000_000);
  const [urlSizeBytes, setUrlSizeBytes] = useState(500);

  const writeRps = writesPerDay / 86400;
  const readRps = readsPerDay / 86400;
  const storagePerYear = writesPerDay * 365 * urlSizeBytes;
  const cacheMemory = readsPerDay * urlSizeBytes * 0.2; // 20% hot data

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Writes / Day', value: writesPerDay, set: setWritesPerDay, min: 100_000, max: 10_000_000, step: 100_000 },
          { label: 'Reads / Day', value: readsPerDay, set: setReadsPerDay, min: 1_000_000, max: 100_000_000, step: 1_000_000 },
          { label: 'URL Size (bytes)', value: urlSizeBytes, set: setUrlSizeBytes, min: 100, max: 2000, step: 50 },
        ].map(({ label, value, set, min, max, step }) => (
          <div key={label}>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={e => set(Number(e.target.value))}
              className="w-full mt-1 accent-indigo-500"
            />
            <div className="text-base font-bold font-mono text-gray-900 dark:text-white mt-1">{formatNum(value)}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Write RPS', value: `${writeRps.toFixed(1)} req/s`, color: 'indigo' },
          { label: 'Read RPS', value: `${readRps.toFixed(0)} req/s`, color: 'purple' },
          { label: 'Storage / Year', value: formatBytes(storagePerYear), color: 'amber' },
          { label: 'Cache Memory (20% hot)', value: formatBytes(cacheMemory), color: 'emerald' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-${color}-50 dark:bg-${color}-900/20 rounded-xl p-4 border border-${color}-200 dark:border-${color}-800`}>
            <div className={`text-xl font-bold font-mono text-${color}-600 dark:text-${color}-400`}>{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Step 4: Architecture Diagram (animated stagger)
function ArchDiagram() {
  const components = [
    { id: 'client', label: '🌐 Client', x: 20, y: 80, w: 80, h: 36, color: '#6366f1' },
    { id: 'cdn', label: '⚡ CDN', x: 130, y: 80, w: 80, h: 36, color: '#8b5cf6' },
    { id: 'lb', label: '⚖️ Load Balancer', x: 240, y: 80, w: 100, h: 36, color: '#0ea5e9' },
    { id: 'app', label: '🖥️ App Servers', x: 370, y: 80, w: 100, h: 36, color: '#10b981' },
    { id: 'redis', label: '🗄️ Redis Cache', x: 500, y: 20, w: 100, h: 36, color: '#f59e0b' },
    { id: 'pg', label: '🗃️ PostgreSQL', x: 500, y: 140, w: 100, h: 36, color: '#3b82f6' },
  ];

  const arrows = [
    { x1: 100, y1: 98, x2: 128, y2: 98 },
    { x1: 210, y1: 98, x2: 238, y2: 98 },
    { x1: 340, y1: 98, x2: 368, y2: 98 },
    { x1: 470, y1: 90, x2: 498, y2: 42 },
    { x1: 470, y1: 106, x2: 498, y2: 150 },
  ];

  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 620 210" className="w-full max-w-2xl mx-auto">
        {arrows.map((a, i) => (
          <motion.line
            key={i}
            x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
            stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4,3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: (i + 1) * 0.2 + 0.3 }}
          />
        ))}
        {components.map((c, i) => (
          <g key={c.id}>
            <motion.rect
              x={c.x} y={c.y} width={c.w} height={c.h} rx="8"
              fill={`${c.color}22`} stroke={c.color} strokeWidth="2"
              initial={{ opacity: 0, scale: 0.8, originX: `${c.x + c.w / 2}px`, originY: `${c.y + c.h / 2}px` }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.2, duration: 0.3 }}
            />
            <motion.text
              x={c.x + c.w / 2} y={c.y + c.h / 2 + 4}
              textAnchor="middle" fontSize="9" fontWeight="600"
              fill={c.color}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: i * 0.2 + 0.15 }}
            >
              {c.label}
            </motion.text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Step 5: Redirect Flow Stepper
const redirectSteps = [
  { title: 'Request hits CDN', content: <p className="text-sm text-gray-600 dark:text-gray-400">User visits <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">bit.ly/abc123</code>. CDN checks if the redirect is cached at the edge node nearest to the user.</p> },
  { title: 'CDN Miss → Load Balancer → App Server', content: <p className="text-sm text-gray-600 dark:text-gray-400">The CDN doesn't have this code. It forwards the request to the Load Balancer, which routes to one of the App Servers.</p> },
  { title: 'App checks Redis cache', content: <p className="text-sm text-gray-600 dark:text-gray-400"><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">GET "abc123"</code> — App queries Redis in ~0.1ms before touching the database.</p> },
  { title: 'Cache Hit → 301 redirect', content: <p className="text-sm text-gray-600 dark:text-gray-400">Redis returns the original URL. App immediately responds with <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">301 Moved Permanently</code>. Total time: ~1ms.</p> },
  { title: 'Cache Miss → DB → Cache → 301', content: <p className="text-sm text-gray-600 dark:text-gray-400">On miss, query PostgreSQL (~10ms), store result in Redis (<code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">SET "abc123" TTL=86400</code>), then return 301.</p> },
];

// ── Step 6: Scaling Decisions cards
function ScalingDecisions() {
  const decisions = [
    {
      q: 'Why Redis (not Memcached)?',
      a: 'Redis supports persistent storage, richer data types (sorted sets for leaderboards), pub/sub, and Lua scripting. Memcached is simpler but less capable.',
      color: 'indigo',
    },
    {
      q: 'Why PostgreSQL (not NoSQL)?',
      a: 'URL shorteners need ACID guarantees for writes — we can\'t have two users get the same short code. PostgreSQL\'s unique constraints and transactions handle this cleanly.',
      color: 'blue',
    },
    {
      q: 'Why 301 (not 302) redirect?',
      a: '301 is permanent — browsers cache it locally. Future visits don\'t hit our servers at all. 302 (temporary) re-requests our server every time. 301 reduces load by ~40%.',
      color: 'emerald',
    },
  ];

  return (
    <div className="space-y-4">
      {decisions.map(({ q, a, color }, i) => (
        <motion.div
          key={q}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15 }}
          viewport={{ once: true }}
          className={`bg-${color}-50 dark:bg-${color}-900/20 rounded-2xl border border-${color}-200 dark:border-${color}-800 p-5`}
        >
          <div className={`font-bold text-${color}-700 dark:text-${color}-400 mb-2`}>{q}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{a}</div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Chapter7({ onProgress }: ChapterProps) {
  const [redirectStep, setRedirectStep] = useState(0);

  useEffect(() => {
    onProgress(82);  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🔗</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-xs font-mono text-indigo-500 uppercase tracking-wider">Solved System</div>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Medium</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Design URL Shortener</h1>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
          Walk through designing bit.ly from scratch: requirements → estimation → API → architecture → scaling. This is one of the most common system design interview questions.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {['Hashing', 'Base62', 'Read-Heavy', 'Cache'].map(tag => (
            <span key={tag} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-700">{tag}</span>
          ))}
          {['Google', 'Meta', 'Amazon', 'Atlassian'].map(c => (
            <span key={c} className="text-xs bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full">{c}</span>
          ))}
        </div>
      </div>

      {/* How to approach a system design interview */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 How to Approach Any System Design Interview</h2>
        <p className="text-gray-600 dark:text-gray-400">Every system design interview follows roughly the same structure. The URL shortener is a perfect template for this process:</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          {[
            { step: '~5 min', label: 'Clarify Requirements', desc: 'Never start designing without agreeing on scope. Functional vs non-functional requirements. What\'s in scope? Expected scale?' },
            { step: '~5 min', label: 'Estimate Scale', desc: 'Back-of-envelope calculations: QPS, storage, bandwidth. These numbers drive architectural decisions.' },
            { step: '~35 min', label: 'Design & Deep Dive', desc: 'High-level architecture, then deep dive on 2–3 components the interviewer cares about. Show trade-offs, not just answers.' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 mb-1">{s.step}</div>
              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{s.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Step 1 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Requirements Gathering</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Always split requirements into <strong className="text-gray-600 dark:text-gray-300">Functional</strong> (what the system does) and <strong className="text-gray-600 dark:text-gray-300">Non-Functional</strong> (how well it does it). Non-functional requirements are often more design-critical and are what interviewers are really testing.
        </p>
        <RequirementsSection />
      </section>

      {/* Step 2 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Back-of-Envelope Estimation</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Estimation reveals the architecture. 100M daily redirects = 1,160 RPS average but 10,000+ RPS at peak (assume 10x spike factor). This tells you: you need caching, you cannot query Postgres per redirect. These numbers determine whether you need sharding, CDN, etc.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <BackOfEnvelope />
        </div>
      </section>

      {/* Step 3 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Design</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Two notes worth discussing in an interview: (1) Use <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">301 Permanent Redirect</code> if you want browsers to cache the redirect (reduces server load). Use <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">302 Temporary Redirect</code> if you need to count every click for analytics. (2) Rate-limit the shorten endpoint per user to prevent abuse.
        </p>
        <CodeBlock
          language="REST API"
          code={`POST /api/shorten
  Body: { url: "https://example.com/very-long-article-path?ref=twitter" }
  → 201 { short_url: "https://bit.ly/abc123", code: "abc123" }
  // Rate limit: 100 per user per day

GET /:code
  // e.g. GET /abc123
  → 301 Location: https://example.com/very-long-article-path?ref=twitter
  // 301 = browsers cache; 302 = server sees every click (analytics)

GET /api/analytics/:code
  → 200 { clicks: 14823, countries: [...], devices: [...] }`}
        />
      </section>

      {/* Step 4 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">System Architecture</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          The key insight: this is a <strong className="text-gray-600 dark:text-gray-300">read-heavy</strong> system. The redirect path (GET /:code) will be hit 100x more than the create path. So we optimize the read path aggressively: CDN → Redis → DB, with most requests never reaching the database.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <ArchDiagram />
          <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-center text-gray-500 dark:text-gray-400">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">CDN caches popular redirects at the edge — eliminates server round-trip for top 10% of URLs</div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">Redis serves 99% of redirect lookups in ~0.1ms — PostgreSQL never touched</div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">PostgreSQL is source of truth — only hit on cache miss or URL creation</div>
          </div>
        </div>
      </section>

      {/* Step 5 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">The Redirect Flow</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Walk through what happens on a redirect request — this is what interviewers want you to trace end-to-end. Note that at scale, step 1 (CDN) handles popular URLs so the rest never runs.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <StepperWidget
            steps={redirectSteps}
            currentStep={redirectStep}
            onNext={() => setRedirectStep(s => Math.min(s + 1, redirectSteps.length - 1))}
            onBack={() => setRedirectStep(s => Math.max(s - 1, 0))}
          />
        </div>
      </section>

      {/* Step 6 — URL encoding */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">6</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">URL Encoding — The Core Algorithm</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          How do you generate a short, collision-free 7-character code? This is a key technical question in the interview. There are three main approaches:
        </p>
        <div className="space-y-3 text-sm">
          {[
            {
              name: 'MD5/SHA256 + truncate',
              desc: 'Hash the long URL, take the first 7 characters. Problem: hash collisions are likely at scale (birthday problem). Requires a collision check on every create — expensive.',
              verdict: '⚠️ Simple but has collision issues at scale',
              color: 'amber',
            },
            {
              name: 'Auto-increment ID + Base62 encode',
              desc: 'Use a database auto-increment ID. Encode it in Base62 (a–z, A–Z, 0–9). Base62^7 = 3.5 trillion possible URLs — never runs out. The ID is your unique key.',
              verdict: '✅ Best for most systems — simple, guaranteed unique',
              color: 'emerald',
            },
            {
              name: 'Pre-generated keys (key generation service)',
              desc: 'A separate service pre-generates and stores millions of unused 7-char codes. On each create request, pop one and mark it used. No DB lock contention, but adds service complexity.',
              verdict: '✅ Best for extreme scale (bit.ly approach)',
              color: 'indigo',
            },
          ].map(a => (
            <div key={a.name} className={`bg-${a.color}-50 dark:bg-${a.color}-900/20 rounded-xl p-4 border border-${a.color}-200 dark:border-${a.color}-800`}>
              <div className={`font-semibold text-${a.color}-700 dark:text-${a.color}-300 mb-1`}>{a.name}</div>
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">{a.desc}</p>
              <div className="text-xs font-semibold">{a.verdict}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Step 7 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">7</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Key Scaling Decisions</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          These are the talking points that demonstrate senior-level thinking. Each decision has a clear rationale tied to the estimated numbers from Step 2.
        </p>
        <ScalingDecisions />
      </section>

    </div>
  );
}
