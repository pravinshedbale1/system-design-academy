import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems.find(s => s.id === 12)!;

function Base62Demo() {
  const [counter, setCounter] = useState(1000000);
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const toBase62 = (n: number) => {
    if (n === 0) return '0';
    let result = '';
    let num = n;
    while (num > 0) { result = chars[num % 62] + result; num = Math.floor(num / 62); }
    return result;
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Counter ID:</label>
        <input type="range" min={1} max={99999999} value={counter} onChange={e => setCounter(Number(e.target.value))} className="flex-1 accent-indigo-500" />
        <span className="font-mono text-indigo-600 dark:text-indigo-400 text-sm w-24 text-right">{counter}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
          <div className="text-xs text-gray-500">Short URL</div>
          <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">tiny.url/<span className="text-emerald-600">{toBase62(counter)}</span></div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
          <div className="text-xs text-gray-500">Key length</div>
          <div className="font-mono font-bold text-amber-600">{toBase62(counter).length} chars → 62^{toBase62(counter).length} = {Math.pow(62, toBase62(counter).length).toLocaleString()} possible URLs</div>
        </div>
      </div>
    </div>
  );
}

function URLShortenerArchDiagram() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'write' | 'read'>('write');

  const nodes = [
    { id: 'client', label: 'Client', x: 20, y: 100, color: '#6366f1', w: 70 },
    { id: 'lb', label: 'Load Balancer', x: 130, y: 100, color: '#8b5cf6', w: 90 },
    { id: 'api', label: 'URL Service', x: 270, y: 100, color: '#0ea5e9', w: 80 },
    { id: 'cache', label: 'Redis Cache', x: 400, y: 40, color: '#10b981', w: 80 },
    { id: 'db', label: 'Cassandra', x: 400, y: 160, color: '#f59e0b', w: 80 },
    { id: 'kgs', label: 'Key Gen Svc', x: 530, y: 100, color: '#ef4444', w: 80 },
  ];
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  const writeSteps = [
    { label: 'POST /shorten {long_url}', from: 'client', to: 'lb', color: '#6366f1' },
    { label: 'Forward to URL Service', from: 'lb', to: 'api', color: '#8b5cf6' },
    { label: 'Request unique short key', from: 'api', to: 'kgs', color: '#ef4444' },
    { label: 'Store mapping in DB', from: 'api', to: 'db', color: '#f59e0b' },
    { label: 'Cache URL → Redis', from: 'api', to: 'cache', color: '#10b981' },
  ];
  const readSteps = [
    { label: 'GET /abc123 (redirect)', from: 'client', to: 'lb', color: '#6366f1' },
    { label: 'Route to URL Service', from: 'lb', to: 'api', color: '#8b5cf6' },
    { label: 'Check Redis cache (99% hit)', from: 'api', to: 'cache', color: '#10b981' },
    { label: 'Cache miss → query DB', from: 'api', to: 'db', color: '#f59e0b' },
    { label: 'Return 302 redirect', from: 'api', to: 'client', color: '#0ea5e9' },
  ];
  const steps = mode === 'write' ? writeSteps : readSteps;

  useEffect(() => {
    setStep(0);
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 1600);
    return () => clearInterval(t);
  }, [mode]);

  const activeEdges = steps.slice(0, step + 1).map(s => [s.from, s.to]);
  const activeNodes = new Set(activeEdges.flat());

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-2">
        {([['write', '✏️ Write Path (Shorten)'], ['read', '⚡ Read Path (Redirect)']] as const).map(([m, label]) => (
          <button key={m} onClick={() => setMode(m as any)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${mode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-indigo-400'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <svg viewBox="0 0 640 220" className="w-full">
          <defs>
            <marker id="url-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={steps[step].color} />
            </marker>
          </defs>
          {/* Draw all edges that have been activated */}
          {activeEdges.map(([a, b], i) => {
            const na = nodeMap[a]; const nb = nodeMap[b];
            return (
              <motion.line key={`${a}-${b}-${i}`}
                x1={na.x + na.w / 2} y1={na.y + 20} x2={nb.x + nb.w / 2} y2={nb.y + 20}
                stroke={steps[i].color} strokeWidth={i === step ? 2.5 : 1.5}
                strokeDasharray="5 3" opacity={i === step ? 0.9 : 0.4}
                markerEnd={i === step ? 'url(#url-ar)' : undefined}
                animate={{ strokeDashoffset: [0, -16] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
            );
          })}
          {/* Nodes */}
          {nodes.map(n => {
            const active = activeNodes.has(n.id);
            return (
              <g key={n.id}>
                <rect x={n.x} y={n.y} width={n.w} height={40} rx="8"
                  fill={active ? `${n.color}22` : '#f9fafb'} stroke={active ? n.color : '#e5e7eb'}
                  strokeWidth={active ? 2 : 1} style={{ transition: 'all 0.3s ease' }}
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
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-sm text-center text-gray-600 dark:text-gray-400">
        <span style={{ color: steps[step].color }}>Step {step + 1}:</span> {steps[step].label}
      </div>
    </div>
  );
}

export default function S12_TinyURL({ onProgress }: SystemPageProps) {
  useEffect(() => { onProgress(82); }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Requirements & Scale" note="500M new URLs/month, 50B redirects/month (100:1 read/write ratio).">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {[
            { label: 'Write QPS', val: '~200/s', note: '500M / 30 days / 86400' },
            { label: 'Read QPS', val: '~20K/s', note: '100:1 read-to-write' },
            { label: 'Storage (5yr)', val: '~15TB', note: '500B URLs × 30 bytes avg' },
          ].map(m => (
            <div key={m.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <div className="text-gray-500">{m.label}</div>
              <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{m.val}</div>
              <div className="text-[10px] text-gray-400">{m.note}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section step={2} title="Interactive: Base62 Encoding">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <Base62Demo />
        </div>
      </Section>

      <Section step={3} title="Key Generation Strategies">
        <CompareTable
          headers={['Strategy', 'How', 'Pros', 'Cons']}
          rows={[
            ['MD5/SHA256 hash', 'Hash long URL, take first 7 chars', 'Simple, deterministic', 'Collisions require retry'],
            ['Counter + Base62', 'Auto-increment ID → Base62 encode', 'No collisions, predictable', 'Sequential = guessable'],
            ['Pre-generated keys', 'Background worker pre-generates unique keys in KGS DB', 'No collision at write time', 'Extra service to maintain'],
            ['Snowflake ID', 'Distributed unique ID (timestamp + worker + seq)', 'Globally unique, sortable', 'Slightly longer keys'],
          ]}
        />
      </Section>

      <Section step={4} title="System Architecture"
        note="Watch the animated data flow — toggle between Write (shorten) and Read (redirect) paths.">
        <URLShortenerArchDiagram />
        <TheoryBox title="Read Path (Redirect)" icon="⚡">
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>1. User hits <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">GET /abc123</code></p>
            <p>2. Check <strong>Redis/Memcached</strong> cache (99% hit rate for popular URLs)</p>
            <p>3. Cache miss → query <strong>Cassandra/DynamoDB</strong> (partition key = short_code)</p>
            <p>4. Return <strong>301 Redirect</strong> (permanent) or <strong>302</strong> (temporary, for analytics)</p>
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold">Use 302 if you need analytics (click tracking). 301 if you want browser caching.</p>
          </div>
        </TheoryBox>
      </Section>

      <InterviewTips tips={[
        '7-character Base62 key gives 62^7 = 3.5 trillion unique URLs. More than enough for decades.',
        'Use 302 (not 301) if you need analytics. 301 is cached by browser — you won\'t see subsequent clicks.',
        'Cache aggressively: top 20% of URLs serve 80% of traffic. Redis with LRU eviction.',
        'Custom aliases: check availability in DB first, reserve atomically. Rate limit custom alias creation.',
        'Expiration: store created_at + TTL. Background job deletes expired entries and recycles short codes.',
      ]} />
    </div>
  );
}
