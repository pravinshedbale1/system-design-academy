import { useState, useEffect } from 'react';
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
      <div className="grid grid-cols-2 gap-3">
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

export default function S12_TinyURL({ onProgress }: SystemPageProps) {
  useEffect(() => { onProgress(82); }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Requirements & Scale" note="500M new URLs/month, 50B redirects/month (100:1 read/write ratio).">
        <div className="grid grid-cols-3 gap-3 text-xs">
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

      <Section step={4} title="System Architecture">
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
