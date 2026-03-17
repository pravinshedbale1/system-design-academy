import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps { onProgress: (id: number) => void; }

/* ── Quorum Calculator ── */
function QuorumCalc() {
  const [n, setN] = useState(5);
  const [w, setW] = useState(3);
  const [r, setR] = useState(3);
  const consistent = w + r > n;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'N (replicas)', val: n, set: setN, min: 1, max: 9 },
          { label: 'W (write quorum)', val: w, set: setW, min: 1, max: n },
          { label: 'R (read quorum)', val: r, set: setR, min: 1, max: n },
        ].map(s => (
          <div key={s.label} className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{s.label}</label>
            <input type="range" min={s.min} max={s.max} value={s.val} onChange={e => s.set(Number(e.target.value))}
              className="w-full accent-indigo-500" />
            <div className="text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.val}</div>
          </div>
        ))}
      </div>
      <div className={`rounded-xl p-3 text-sm font-semibold text-center ${consistent ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
        W + R = {w + r} {consistent ? '>' : '≤'} N = {n} → {consistent ? '✅ Strong consistency guaranteed (read & write quorums overlap)' : '❌ Eventual consistency — stale reads possible (no overlap)'}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Rule: W + R {'>'} N ensures every read quorum overlaps with every write quorum — at least one node has the latest data.
      </div>
    </div>
  );
}

/* ── Replication Lag Visualizer ── */
function ReplicationLagDemo() {
  const [writes, setWrites] = useState(0);
  const [leaderVal, setLeaderVal] = useState('Alice');
  const [followerVal, setFollowerVal] = useState('Alice');
  const [syncing, setSyncing] = useState(false);

  const doWrite = () => {
    const names = ['Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
    const newName = names[writes % names.length];
    setLeaderVal(newName);
    setWrites(w => w + 1);
    setSyncing(true);
    // Simulate replication lag
    setTimeout(() => {
      setFollowerVal(newName);
      setSyncing(false);
    }, 1500);
  };

  return (
    <div className="space-y-3">
      <button onClick={doWrite} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all">
        ✏️ Write to Leader
      </button>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">👑 Leader</div>
          <div className="font-mono text-lg text-gray-800 dark:text-gray-200">name = "{leaderVal}"</div>
        </div>
        <div className={`rounded-xl p-4 border-2 transition-all ${syncing ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'}`}>
          <div className="text-xs font-semibold mb-1" style={{ color: syncing ? '#f59e0b' : '#10b981' }}>
            📋 Follower {syncing ? '(syncing... 🔄)' : '(up to date ✅)'}
          </div>
          <div className="font-mono text-lg text-gray-800 dark:text-gray-200">name = "{followerVal}"</div>
        </div>
      </div>
      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
        {syncing
          ? '⚠️ Replication lag! If you read from the follower now, you get STALE data.'
          : 'Follower is caught up. Reads from either node return the same value.'}
      </div>
    </div>
  );
}

export default function Chapter13_Replication({ onProgress }: ChapterProps) {
  useEffect(() => { onProgress(13); }, []);
  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 12</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🔄 Replication</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Keeping copies of data across multiple machines for fault tolerance and read scalability.</p>
      </motion.div>

      {/* Why Replication */}
      <motion.section {...fadeUp} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 Why Replicate Data?</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          A single database server is a <strong className="text-gray-800 dark:text-gray-200">single point of failure</strong>. If that server's disk dies, your data is gone. If it can't keep up with read load, your app slows to a crawl. Replication solves both problems by keeping <strong className="text-gray-800 dark:text-gray-200">multiple copies of the same data</strong> on different machines.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Think of it like keeping <strong className="text-gray-800 dark:text-gray-200">photocopies of an important document</strong> in different locations — one at home, one at the office, one in a safe deposit box. If any one copy is destroyed, the data survives. And if multiple people need to read the document simultaneously, each can read from a different copy.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          The central challenge of replication is: <strong className="text-gray-800 dark:text-gray-200">how do you keep all copies in sync when data changes?</strong> The answer depends on your tolerance for stale reads, write latency, and failure modes.
        </p>
      </motion.section>

      {/* Replication Models */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          Replication Topologies
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          There are three fundamental approaches, each with different tradeoffs around consistency, availability, and complexity. Most production systems use leader-follower. Multi-leader is for multi-datacenter. Leaderless is for specific high-availability use cases.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Leader-Follower', icon: '👑', desc: 'One node (leader) handles ALL writes. Followers replicate the leader\'s write log (WAL) and serve read queries. If the leader dies, a follower is promoted.', pros: 'Simple, strong consistency from leader, easy to reason about', cons: 'Leader is bottleneck/SPOF. Failover can lose data (async) or block writes (sync)', ex: 'PostgreSQL, MySQL, MongoDB replica sets, Redis Sentinel' },
            { name: 'Multi-Leader', icon: '👥', desc: 'Multiple nodes accept writes, often one per datacenter. They replicate to each other asynchronously. Write conflicts must be detected and resolved (LWW, CRDTs, or app logic).', pros: 'Write availability across DCs, tolerates datacenter failure', cons: 'Write conflicts are inevitable, complex conflict resolution logic', ex: 'CockroachDB, Cassandra, Google Docs (OT/CRDT)' },
            { name: 'Leaderless', icon: '🌐', desc: 'ANY node accepts reads and writes. Uses quorum protocol (W+R > N) to ensure consistency. Failed nodes use "hinted handoff" + anti-entropy (Merkle trees) to catch up.', pros: 'No SPOF, highly available, excellent write throughput', cons: 'Eventual consistency by default, vector clocks add complexity', ex: 'DynamoDB, Cassandra, Riak, Voldemort' },
          ].map(m => (
            <div key={m.name} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">{m.icon} {m.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{m.desc}</p>
              <div className="text-xs text-emerald-600">✅ {m.pros}</div>
              <div className="text-xs text-red-500">❌ {m.cons}</div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{m.ex}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Sync vs Async */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          Synchronous vs Asynchronous Replication
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          This choice is a fundamental tradeoff between <strong className="text-gray-800 dark:text-gray-200">data safety and write speed</strong>. Synchronous = safe but slow. Asynchronous = fast but risky. Most production systems use a hybrid approach.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">🔒 Synchronous</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>→ Write is blocked until ≥1 follower confirms receipt</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Zero data loss</strong> — follower always has the latest data</li>
              <li>→ Higher write latency (network round trip to follower)</li>
              <li>→ If ALL followers are down, writes are blocked entirely</li>
              <li className="text-indigo-600 dark:text-indigo-400 font-semibold pt-1">Use: Financial systems, payment ledgers, inventory counts</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">⚡ Asynchronous</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>→ Write returns immediately after leader persists locally</li>
              <li>→ Followers replicate in the background (replication lag)</li>
              <li>→ <strong className="text-amber-600">Possible data loss</strong> if leader crashes before replication</li>
              <li>→ Followers can fall behind by seconds to minutes</li>
              <li className="text-indigo-600 dark:text-indigo-400 font-semibold pt-1">Use: Social feeds, search indexes, analytics, non-critical reads</li>
            </ul>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <strong>Semi-synchronous (practical choice):</strong> Leader waits for exactly 1 follower (out of many) to confirm. If that follower is slow, another is promoted to synchronous. This gives strong consistency with minimal latency impact. Used by PostgreSQL with <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">synchronous_standby_names</code>.
          </p>
        </div>
      </motion.section>

      {/* Replication Lag Demo */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          Interactive: Replication Lag Demo
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          Click "Write to Leader" and watch the follower lag behind. This is the core problem with async replication — reads from the follower return stale data until it catches up.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <ReplicationLagDemo />
        </div>
      </motion.section>

      {/* Quorum Calculator */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Interactive: Quorum Calculator
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">Adjust N, W, R to see if your quorum configuration guarantees strong consistency. The rule is simple: when read and write quorums overlap, there's always at least one node with the latest data.</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <QuorumCalc />
        </div>
      </motion.section>

      {/* Conflict Resolution */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          Conflict Resolution Strategies
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          When two nodes accept conflicting writes (multi-leader or leaderless), you need a strategy to determine which write "wins." There is no universally correct answer — the right choice depends on your domain.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Last Write Wins (LWW)', desc: 'Use wall-clock timestamp; latest write wins. Simple but dangerous — silently drops concurrent writes. Causes data loss if clocks are skewed. Acceptable for non-critical data (session data, caches).', color: '#f59e0b' },
              { name: 'Version Vectors', desc: 'Track causality with per-node counters. Detects true conflicts (concurrent writes) vs. sequential ones. Can surface conflicts to the application for resolution. Used by Riak.', color: '#8b5cf6' },
              { name: 'CRDTs', desc: 'Conflict-free Replicated Data Types. Data structures that mathematically guarantee convergence without coordination. G-Counter, OR-Set, LWW-Register. Used by Redis, Figma, SoundCloud.', color: '#10b981' },
              { name: 'Application-Level Merge', desc: 'Present conflicts to the user or application logic. Like Git merge conflicts — let the human or business logic decide. Used by Google Docs (OT), Notion, collaborative editors.', color: '#6366f1' },
            ].map(c => (
              <div key={c.name} className="rounded-xl p-3 border" style={{ borderColor: `${c.color}33`, backgroundColor: `${c.color}08` }}>
                <div className="font-semibold text-sm" style={{ color: c.color }}>{c.name}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{c.desc}</p>
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
            'Default to leader-follower replication for most systems. It\'s the simplest model and used by 90% of production databases (PostgreSQL, MySQL, MongoDB).',
            'Multi-leader is primarily for multi-datacenter setups where single-leader cross-DC latency (50-100ms per write) is unacceptable. Avoid if you can.',
            'Quorum formula: W + R > N guarantees strong consistency. Common configs: (N=3, W=2, R=2) for balanced, or (N=3, W=3, R=1) for write-heavy with strong reads.',
            'Replication lag causes stale reads. Three solutions: read-your-writes consistency (read from leader after write), monotonic reads (pin user to same replica), bounded staleness (lag monitored).',
            'CRDTs are the future of conflict resolution — they guarantee convergence without coordination. Know G-Counter (grow-only counter) and OR-Set (observed-remove set).',
            'Leader failover: Automatic promotion of a follower. Risk: if async, the new leader might be behind, losing recent writes. This is why semi-synchronous replication is preferred for critical data.',
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
