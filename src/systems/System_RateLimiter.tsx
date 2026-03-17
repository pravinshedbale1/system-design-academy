import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems[4]; // Rate Limiter

const ALGORITHMS = ['Token Bucket', 'Leaky Bucket', 'Fixed Window', 'Sliding Window Log'];

/* ── Token Bucket Simulation ── */
function TokenBucketSim() {
  const [tokens, setTokens] = useState(10);
  const [requests, setRequests] = useState<{id: number; allowed: boolean}[]>([]);
  const [reqId, setReqId] = useState(0);
  const CAPACITY = 10;

  useEffect(() => {
    const t = setInterval(() => setTokens(prev => Math.min(prev + 1, CAPACITY)), 1000);
    return () => clearInterval(t);
  }, []);

  function sendRequest() {
    const allowed = tokens > 0;
    if (allowed) setTokens(t => t - 1);
    const id = reqId + 1;
    setReqId(id);
    setRequests(prev => [...prev.slice(-6), { id, allowed }]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1 h-16 mb-2">
        {Array.from({ length: CAPACITY }).map((_, i) => (
          <motion.div key={i} className="flex-1 rounded-t"
            animate={{ height: i < tokens ? '100%' : '8px', backgroundColor: i < tokens ? '#6366f1' : '#e5e7eb' }}
            transition={{ duration: 0.3 }} />
        ))}
      </div>
      <div className="text-sm text-center text-gray-600 dark:text-gray-400">
        Tokens: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{tokens}</span> / {CAPACITY} <span className="text-xs">(refills 1/sec)</span>
      </div>
      <button onClick={sendRequest}
        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors text-sm">
        Send Request
      </button>
      <div className="flex gap-1.5 flex-wrap">
        <AnimatePresence>
          {requests.map(r => (
            <motion.div key={r.id} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className={`px-2 py-1 rounded-lg text-xs font-semibold ${r.allowed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
              {r.allowed ? '✓ 200' : '✗ 429'}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Leaky Bucket Simulation ── */
function LeakyBucketSim() {
  const [queue, setQueue] = useState<number[]>([]);
  const [processed, setProcessed] = useState<{id: number; status: 'ok' | 'dropped'}[]>([]);
  const [nextId, setNextId] = useState(1);
  const CAPACITY = 6;
  const queueRef = useRef(queue);
  queueRef.current = queue;

  // Drain at fixed rate (1 per second)
  useEffect(() => {
    const t = setInterval(() => {
      if (queueRef.current.length > 0) {
        const id = queueRef.current[0];
        setQueue(q => q.slice(1));
        setProcessed(p => [...p.slice(-6), { id, status: 'ok' }]);
      }
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const addRequest = useCallback(() => {
    const id = nextId;
    setNextId(n => n + 1);
    if (queueRef.current.length >= CAPACITY) {
      setProcessed(p => [...p.slice(-6), { id, status: 'dropped' }]);
    } else {
      setQueue(q => [...q, id]);
    }
  }, [nextId]);

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Queue ({queue.length}/{CAPACITY}) — drains 1 request/sec at constant rate</div>
      <div className="flex items-center gap-1 h-12">
        {Array.from({ length: CAPACITY }).map((_, i) => (
          <motion.div key={i} className="flex-1 rounded-lg border-2 flex items-center justify-center text-xs font-mono font-bold"
            animate={{
              borderColor: i < queue.length ? '#0ea5e9' : '#e5e7eb',
              backgroundColor: i < queue.length ? '#e0f2fe' : 'transparent',
              color: i < queue.length ? '#0284c7' : '#d1d5db',
            }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%' }}>
            {i < queue.length ? `#${queue[i]}` : '·'}
          </motion.div>
        ))}
        <div className="flex items-center text-gray-400 px-2">
          <motion.div animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-lg">💧</motion.div>
        </div>
      </div>
      <button onClick={addRequest}
        className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold transition-colors text-sm">
        Add Request to Queue
      </button>
      <div className="flex gap-1.5 flex-wrap">
        <AnimatePresence>
          {processed.map(r => (
            <motion.div key={r.id} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className={`px-2 py-1 rounded-lg text-xs font-semibold ${r.status === 'ok' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
              {r.status === 'ok' ? `✓ #${r.id} processed` : `✗ #${r.id} dropped`}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Fixed Window Simulation ── */
function FixedWindowSim() {
  const [count, setCount] = useState(0);
  const [windowTime, setWindowTime] = useState(10);
  const [results, setResults] = useState<{id: number; allowed: boolean}[]>([]);
  const [reqId, setReqId] = useState(0);
  const LIMIT = 5;
  const WINDOW_SECS = 10;

  // Window countdown & reset
  useEffect(() => {
    const t = setInterval(() => {
      setWindowTime(prev => {
        if (prev <= 1) {
          setCount(0); // reset counter on new window
          return WINDOW_SECS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  function sendRequest() {
    const id = reqId + 1;
    setReqId(id);
    const allowed = count < LIMIT;
    if (allowed) setCount(c => c + 1);
    setResults(prev => [...prev.slice(-6), { id, allowed }]);
  }

  const pct = (windowTime / WINDOW_SECS) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-1">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Window resets in: <span className="font-mono font-bold text-amber-600">{windowTime}s</span></span>
            <span>Requests: <span className={`font-mono font-bold ${count >= LIMIT ? 'text-red-500' : 'text-emerald-600'}`}>{count}/{LIMIT}</span></span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" animate={{ width: `${pct}%`, backgroundColor: windowTime <= 3 ? '#ef4444' : '#f59e0b' }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: LIMIT }).map((_, i) => (
          <motion.div key={i} className="flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            animate={{
              backgroundColor: i < count ? '#dcfce7' : '#f9fafb',
              borderColor: i < count ? '#86efac' : '#e5e7eb',
              color: i < count ? '#16a34a' : '#d1d5db',
            }}
            style={{ border: '2px solid' }}
            transition={{ duration: 0.2 }}>
            {i < count ? '✓' : '·'}
          </motion.div>
        ))}
      </div>
      <button onClick={sendRequest}
        className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors text-sm">
        Send Request
      </button>
      <div className="flex gap-1.5 flex-wrap">
        <AnimatePresence>
          {results.map(r => (
            <motion.div key={r.id} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className={`px-2 py-1 rounded-lg text-xs font-semibold ${r.allowed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
              {r.allowed ? '✓ 200' : '✗ 429'}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Sliding Window Log Simulation ── */
function SlidingWindowSim() {
  const [log, setLog] = useState<{id: number; time: number}[]>([]);
  const [results, setResults] = useState<{id: number; allowed: boolean}[]>([]);
  const [reqId, setReqId] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const LIMIT = 5;
  const WINDOW_MS = 10000; // 10 seconds

  // Update "now" every 100ms for smooth visual
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, []);

  // Clean old entries
  const activeLog = log.filter(e => now - e.time < WINDOW_MS);

  function sendRequest() {
    const id = reqId + 1;
    setReqId(id);
    const currentActive = log.filter(e => Date.now() - e.time < WINDOW_MS);
    const allowed = currentActive.length < LIMIT;
    if (allowed) {
      setLog(prev => [...prev, { id, time: Date.now() }]);
    }
    setResults(prev => [...prev.slice(-6), { id, allowed }]);
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Sliding window: last <span className="font-mono font-bold text-purple-600">10 seconds</span> — Limit: <span className={`font-mono font-bold ${activeLog.length >= LIMIT ? 'text-red-500' : 'text-emerald-600'}`}>{activeLog.length}/{LIMIT}</span>
      </div>
      <div className="relative h-16 bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Time ruler */}
        <div className="absolute inset-0 flex items-end px-2 pb-1">
          {[0, 2, 4, 6, 8, 10].map(s => (
            <div key={s} className="absolute text-[9px] text-gray-400 font-mono" style={{ left: `${(s / 10) * 100}%` }}>
              {s}s ago
            </div>
          ))}
        </div>
        {/* Log entries as dots */}
        <AnimatePresence>
          {activeLog.map(entry => {
            const age = (now - entry.time) / WINDOW_MS;
            const opacity = 1 - age * 0.7;
            return (
              <motion.div key={entry.id}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0, left: `${(1 - age) * 95 + 2}%`, opacity }}
                exit={{ scale: 0 }}
                className="absolute top-3 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-[9px] font-bold text-white shadow-md"
                style={{ left: `${(1 - age) * 95 + 2}%` }}>
                {entry.id}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <button onClick={sendRequest}
        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors text-sm">
        Send Request
      </button>
      <div className="flex gap-1.5 flex-wrap">
        <AnimatePresence>
          {results.map(r => (
            <motion.div key={r.id} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className={`px-2 py-1 rounded-lg text-xs font-semibold ${r.allowed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
              {r.allowed ? '✓ 200' : '✗ 429'}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Main Algorithm Simulator ── */
function AlgorithmSimulator() {
  const [algo, setAlgo] = useState(0);

  const algoDescriptions = [
    'Token Bucket: Refill N tokens/second. Each request consumes 1 token. If empty → reject. Allows bursts up to bucket capacity.',
    'Leaky Bucket: Requests enter a FIFO queue. Processed at a fixed rate — no bursts. Overflow drops requests. Smooths traffic like a funnel.',
    'Fixed Window: Count requests in current time window (e.g., 10 sec). Reset on new window. Edge case: 2x limit possible at window boundary.',
    'Sliding Window Log: Track exact timestamps of recent requests. Check if count in sliding window exceeds limit. Most accurate, uses more memory.',
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ALGORITHMS.map((a, i) => (
          <button key={a} onClick={() => setAlgo(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${algo === i ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-indigo-300'}`}>
            {a}
          </button>
        ))}
      </div>

      {algo === 0 && <TokenBucketSim />}
      {algo === 1 && <LeakyBucketSim />}
      {algo === 2 && <FixedWindowSim />}
      {algo === 3 && <SlidingWindowSim />}

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-sm text-gray-600 dark:text-gray-400">
        {algoDescriptions[algo]}
      </div>
    </div>
  );
}

export default function S05_RateLimiter({ onProgress }: SystemPageProps) {
  useEffect(() => {
    onProgress(75);  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Why Rate Limiting?"
        note="Without rate limiting: a single bad actor can exhaust your server resources, causing downtime for all users.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: '🐛', t: 'DDoS Prevention', d: 'Stop malicious floods of requests from overwhelming servers' },
            { icon: '💸', t: 'Cost Control', d: 'Prevent runaway API costs — each request costs compute' },
            { icon: '⚖️', t: 'Fair Usage', d: 'Ensure one user can\'t monopolize shared infrastructure' },
          ].map(c => (
            <div key={c.t} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm">
              <div className="text-2xl mb-1">{c.icon}</div>
              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1 text-xs">{c.t}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{c.d}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section step={2} title="Interactive: Algorithm Simulator"
        note="Switch between algorithms and click 'Send Request' to see how each one handles traffic differently.">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <AlgorithmSimulator />
        </div>
      </Section>

      <Section step={3} title="Distributed Rate Limiting with Redis">
        <TheoryBox title="Redis as the Shared Counter" icon="🔴">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            In a single-server setup, you can track counts in memory. With multiple servers, each server tracks a different subset of requests. Solution: use Redis as a centralized, atomic counter.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 font-mono text-xs space-y-1">
            <div className="text-indigo-600 dark:text-indigo-400">-- Sliding Window Counter in Redis (Lua script)</div>
            <div className="text-gray-600 dark:text-gray-400">local key = "rl:" .. user_id .. ":" .. minute</div>
            <div className="text-gray-600 dark:text-gray-400">local count = redis.call("INCR", key)</div>
            <div className="text-gray-600 dark:text-gray-400">if count == 1 then redis.call("EXPIRE", key, 60) end</div>
            <div className="text-gray-600 dark:text-gray-400">if count &gt; limit then return 0 -- reject</div>
            <div className="text-gray-600 dark:text-gray-400">else return 1 -- allow end</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Lua scripts run atomically in Redis — no race conditions. This is how Stripe and Cloudflare implement distributed rate limiting.
          </p>
        </TheoryBox>
      </Section>

      <Section step={4} title="Where to Place the Rate Limiter">
        <CompareTable
          headers={['Location', 'Pros', 'Cons']}
          rows={[
            ['Client-side', 'Zero latency, no round-trip', 'Easily bypassed by malicious clients'],
            ['API Gateway (recommended)', 'Centralized before any service', 'Single point to configure and scale'],
            ['Application middleware', 'Per-service limits', 'Duplicated logic across services'],
            ['Load Balancer (L7)', 'Handles HTTP floods before hitting app', 'Limited to IP-based rules'],
          ]}
        />
      </Section>

      <InterviewTips tips={[
        'Always return 429 Too Many Requests with a Retry-After header so clients know when to retry.',
        'Token Bucket is generally the best algorithm: it handles bursts (within capacity), smooths sustained load, and is easy to implement in Redis.',
        'Rate limit on multiple dimensions: by IP, by user_id, by API key, and by endpoint. Stricter limits on write endpoints than read.',
        'Cloudflare uses a sliding window algorithm with a centralized Redis cluster that handles 10M+ requests/second.',
        'Race condition alert: INCR + EXPIRE must be atomic. Use a Lua script or Redis transactions to prevent a user from making unlimited requests if INCR succeeds but EXPIRE fails.',
      ]} />
    </div>
  );
}
