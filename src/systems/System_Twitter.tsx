import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable, KeyValueGrid } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems[0]; // Twitter

// ── Fan-out Animation (CSS-only rects to avoid Framer y-axis ghost boxes)
function FanOutAnimation() {
  const [mode, setMode] = useState<'push' | 'pull'>('push');
  const [step, setStep] = useState(0);
  const followers = [
    { id: 1, name: 'User A', x: 80, y: 200 },
    { id: 2, name: 'User B', x: 220, y: 280 },
    { id: 3, name: 'User C', x: 360, y: 200 },
    { id: 4, name: 'User D', x: 440, y: 310 },
    { id: 5, name: 'User E', x: 500, y: 170 },
  ];

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 4), 1400);
    return () => clearInterval(t);
  }, [mode]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 mb-2">
        {(['push', 'pull'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setStep(0); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${mode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-indigo-400'}`}
          >
            {m === 'push' ? '📤 Fan-out on Write' : '📥 Fan-out on Read'}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 600 370" className="w-full">
        {/* Author node */}
        <circle cx="300" cy="70" r="32" fill="#6366f1" opacity={0.95} />
        <text x="300" y="75" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">Author</text>
        <text x="300" y="88" textAnchor="middle" fontSize="9" fill="#c7d2fe">@elonmusk</text>

        {/* Lines to followers */}
        {followers.map((f, i) => (
          <line
            key={f.id}
            x1="300" y1="102" x2={f.x + 30} y2={f.y}
            stroke={step > i ? '#6366f1' : '#e5e7eb'}
            strokeWidth={step > i ? 2 : 1}
            strokeDasharray="4 3"
            opacity={step > i ? 1 : 0.3}
            style={{ transition: 'all 0.3s ease' }}
          />
        ))}

        {/* Follower nodes */}
        {followers.map((f, i) => (
          <g key={f.id}>
            <circle
              cx={f.x + 30} cy={f.y} r="26"
              fill={step > i ? '#10b981' : '#f3f4f6'}
              stroke={step > i ? '#10b981' : '#d1d5db'}
              strokeWidth="1.5"
              style={{ transition: 'all 0.3s ease' }}
            />
            <text x={f.x + 30} y={f.y + 4} textAnchor="middle" fontSize="9" fill={step > i ? 'white' : '#6b7280'} fontWeight="600">{f.name}</text>
          </g>
        ))}

        {/* Tweet bubble — plain rect, no framer-motion y animation */}
        <rect
          x="240" y="115" width="120" height="34" rx="8"
          fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5"
          opacity={step > 0 ? 0.85 : 1}
          className="animate-float"
        />
        <text x="300" y="133" textAnchor="middle" fontSize="10" fill="#a5b4fc" fontWeight="600">
          New Tweet
        </text>
        <text x="300" y="143" textAnchor="middle" fontSize="8" fill="#818cf8">
          {mode === 'push' ? 'written to all timelines' : 'added to posting queue'}
        </text>
      </svg>
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {mode === 'push'
          ? 'Fan-out on Write: Tweet immediately written to all followers\' home timelines → fast reads, expensive writes'
          : 'Fan-out on Read: Tweet stored once; when followers load feed, pull + merge → cheap writes, slow reads'}
      </div>
    </div>
  );
}

// ── Timeline Architecture Diagram (all plain SVG, no motion.rect)
function TimelineArch() {
  const nodes = [
    { id: 'client', label: 'Client', x: 40, y: 130, color: '#6366f1', w: 70 },
    { id: 'lb', label: 'Load Balancer', x: 150, y: 130, color: '#8b5cf6', w: 95 },
    { id: 'feed', label: 'Feed Service', x: 290, y: 60, color: '#0ea5e9', w: 90 },
    { id: 'write', label: 'Write Service', x: 290, y: 200, color: '#f59e0b', w: 95 },
    { id: 'redis', label: 'Redis Cache', x: 440, y: 60, color: '#10b981', w: 90 },
    { id: 'fanout', label: 'Fan-out Workers', x: 440, y: 200, color: '#ef4444', w: 100 },
    { id: 'cassandra', label: 'Cassandra', x: 580, y: 130, color: '#6366f1', w: 80 },
  ];
  const edges: [string, string][] = [
    ['client', 'lb'], ['lb', 'feed'], ['lb', 'write'],
    ['feed', 'redis'], ['write', 'fanout'], ['fanout', 'redis'], ['fanout', 'cassandra'],
  ];
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
      <svg viewBox="0 0 700 280" className="w-full">
        <defs>
          <marker id="ar1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#6366f1" />
          </marker>
        </defs>
        {edges.map(([a, b]) => {
          const na = nodeMap[a]; const nb = nodeMap[b];
          return (
            <motion.line
              key={`${a}-${b}`}
              x1={na.x + na.w / 2} y1={na.y + 20} x2={nb.x + nb.w / 2} y2={nb.y + 20}
              stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6"
              markerEnd="url(#ar1)"
              animate={{ strokeDashoffset: [0, -12] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          );
        })}
        {nodes.map((n, idx) => (
          <g key={n.id} className="animate-float" style={{ animationDelay: `${idx * 0.4}s` }}>
            <rect
              x={n.x} y={n.y} width={n.w} height={40} rx="8"
              fill={`${n.color}22`} stroke={n.color} strokeWidth="1.5"
            />
            <text x={n.x + n.w / 2} y={n.y + 24} textAnchor="middle" fontSize="9"
              fontWeight="600" fill={n.color}>
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function S01_Twitter({ onProgress }: SystemPageProps) {
  useEffect(() => {
    onProgress(71);  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-14">
      <SystemHeader sys={sys} />

      {/* Estimation */}
      <Section step={1} title="Scale & Requirements"
        note="Clarify before designing: Twitter serves ~500M active users. The feed is read 100x more than it's written.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TheoryBox title="Functional Requirements" icon="📋">
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>→ Post tweets (280 chars, images, video)</li>
              <li>→ Follow / unfollow users</li>
              <li>→ View home timeline (latest 200 tweets from followed accounts)</li>
              <li>→ Like, retweet, reply</li>
              <li>→ Search & trending topics</li>
            </ul>
          </TheoryBox>
          <TheoryBox title="Non-Functional Requirements" icon="⚡">
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>→ Timeline load: <strong className="text-indigo-600 dark:text-indigo-400">&lt; 200ms P99</strong></li>
              <li>→ Post delivery to followers: <strong className="text-indigo-600 dark:text-indigo-400">&lt; 5 seconds</strong></li>
              <li>→ 99.99% availability</li>
              <li>→ Eventual consistency on read (we don't care if a tweet takes 2s to appear)</li>
            </ul>
          </TheoryBox>
        </div>
        <div className="mt-4">
        <KeyValueGrid items={[
          { label: 'Daily Active Users', value: '300M' },
          { label: 'Tweets/day', value: '500M (5,800 QPS)' },
          { label: 'Read:Write ratio', value: '100:1' },
          { label: 'Timeline reads/day', value: '28B (~325K QPS)', color: 'text-red-500' },
        ]} />
        </div>
      </Section>

      <Section step={2} title="The Core Problem: Fan-out"
        note="When a celebrity with 100M followers tweets, you can't just write to 100M timelines synchronously. This is the hard problem.">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <FanOutAnimation />
        </div>
      </Section>

      <Section step={3} title="System Architecture" note="Two-tier cache: Redis for hot timelines, Cassandra for tweet storage.">
        <TimelineArch />
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
          {[
            { n: 'Feed Service', d: 'Reads timeline from Redis. Falls back to recomputing from Cassandra on miss.' },
            { n: 'Write Service', d: 'Persists tweet to Cassandra, then enqueues fan-out job.' },
            { n: 'Fan-out Workers', d: 'Async workers that push tweet IDs into all followers\' Redis timeline lists.' },
          ].map(n => (
            <div key={n.n} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
              <div className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{n.n}</div>
              <div className="text-gray-500 dark:text-gray-400">{n.d}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section step={4} title="The Celebrity Problem">
        <TheoryBox title="Hybrid Fan-out Strategy" icon="⚡">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Pure fan-out on write breaks for celebrities (100M followers = 100M Redis writes per tweet). Twitter uses a <strong className="text-gray-800 dark:text-gray-200">hybrid model</strong>:
          </p>
          <CompareTable
            headers={['User Type', 'Strategy', 'Rationale']}
            rows={[
              ['Normal user (<10K followers)', 'Fan-out on Write', 'Fast, manageable number of writes'],
              ['Celebrity (100M+ followers)', 'Fan-out on Read', 'Pulled and merged at read time'],
              ['Hybrid threshold', '~10K followers', 'Twitter\'s actual cutoff'],
            ]}
          />
        </TheoryBox>
      </Section>

      <Section step={5} title="Data Schema">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <div className="text-indigo-600 dark:text-indigo-400 font-bold mb-2">tweets table (Cassandra)</div>
              <div className="space-y-0.5 text-gray-600 dark:text-gray-400">
                <div><span className="text-amber-600">tweet_id</span> UUID (snowflake ID)</div>
                <div><span className="text-amber-600">user_id</span> UUID</div>
                <div><span className="text-amber-600">content</span> TEXT</div>
                <div><span className="text-amber-600">media_url</span> TEXT[]</div>
                <div><span className="text-amber-600">created_at</span> TIMESTAMP</div>
                <div><span className="text-amber-600">likes_count</span> COUNTER</div>
              </div>
            </div>
            <div>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold mb-2">timelines (Redis)</div>
              <div className="space-y-0.5 text-gray-600 dark:text-gray-400">
                <div>ZADD timeline:{'{'}user_id{'}'} score tweet_id</div>
                <div className="text-gray-400">// score = tweet timestamp</div>
                <div className="mt-2">ZRANGE timeline:{'{'}user_id{'}'}</div>
                <div className="text-gray-400">// returns latest 200 tweet IDs</div>
                <div className="mt-2">TTL: 7 days (inactive users</div>
                <div className="text-gray-400">// computed lazily on first read)</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <InterviewTips tips={[
        'Always start with the fan-out problem — it\'s the central challenge of any social feed.',
        'The hybrid threshold (~10K followers) is the key architectural decision. Celebrity tweets = pull; normal tweets = push.',
        'Use Snowflake IDs (timestamp + machine ID + sequence) for tweet_id — they are time-sortable without a separate timestamp column.',
        'Cassandra for tweets: partition key = user_id, clustering key = tweet_id (time-sorted). Enables "get all tweets by user" queries efficiently.',
        'Don\'t forget rate limiting on the POST /tweet endpoint — 1 tweet/second per user maximum.',
      ]} />
    </div>
  );
}
