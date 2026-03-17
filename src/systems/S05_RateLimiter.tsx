import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems[4]; // Rate Limiter

const ALGORITHMS = ['Token Bucket', 'Leaky Bucket', 'Fixed Window', 'Sliding Window Log'];

function TokenBucketSim() {
  const [algo, setAlgo] = useState(0);
  const [tokens, setTokens] = useState(10);
  const [requests, setRequests] = useState<{id: number; allowed: boolean}[]>([]);
  const [reqId, setReqId] = useState(0);
  const CAPACITY = 10;

  useEffect(() => {
    const t = setInterval(() => {
      setTokens(prev => Math.min(prev + 1, CAPACITY));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  function sendRequest() {
    const allowed = tokens > 0;
    if (allowed) setTokens(t => t - 1);
    const id = reqId + 1;
    setReqId(id);
    setRequests(prev => [...prev.slice(-6), { id, allowed }]);
  }

  const algoDescriptions = [
    'Token Bucket: Refill N tokens/second. Each request consumes 1 token. If empty → reject. Allows bursts up to bucket capacity.',
    'Leaky Bucket: Requests enter a FIFO queue (bucket). Processed at fixed rate. No bursts — smooths traffic. Good for API rate normalization.',
    'Fixed Window: Count requests in current time window (e.g., 1 minute). Reset on new window. Edge case: 2x limit at window boundary.',
    'Sliding Window Log: Track exact timestamps of recent requests in Redis ZSET. Check if count in last N seconds exceeds limit. Most accurate, most memory.',
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ALGORITHMS.map((a, i) => (
          <button key={a} onClick={() => setAlgo(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${algo === i ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>
            {a}
          </button>
        ))}
      </div>

      {algo === 0 && (
        <>
          {/* Token Bucket Visual */}
          <div className="flex items-end gap-1 h-16 mb-2">
            {Array.from({ length: CAPACITY }).map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t"
                animate={{ height: i < tokens ? '100%' : '8px', backgroundColor: i < tokens ? '#6366f1' : '#e5e7eb' }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
          <div className="text-sm text-center text-gray-600 dark:text-gray-400 mb-2">
            Tokens: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{tokens}</span> / {CAPACITY} (refills 1/sec)
          </div>
          <button onClick={sendRequest}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors text-sm">
            Send Request
          </button>
          <div className="flex gap-1.5 flex-wrap">
            <AnimatePresence>
              {requests.map(r => (
                <motion.div
                  key={r.id}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold ${r.allowed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}
                >
                  {r.allowed ? '✓ 200' : '✗ 429'}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-sm text-gray-600 dark:text-gray-400">
        {algoDescriptions[algo]}
      </div>
    </div>
  );
}

export default function S05_RateLimiter({ onProgress, onComplete }: SystemPageProps) {
  useEffect(() => {
    onProgress(75);
    const t = setTimeout(() => onComplete(75), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Why Rate Limiting?"
        note="Without rate limiting: a single bad actor can exhaust your server resources, causing downtime for all users.">
        <div className="grid grid-cols-3 gap-3">
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
        note="Click 'Send Request' to consume tokens. Watch them refill automatically (1/sec). Burst through all tokens quickly to trigger 429 responses.">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <TokenBucketSim />
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
