import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChapterProps {
  onProgress: (id: number) => void;
  onComplete: (id: number) => void;
}

// Decision Tree
const questions = [
  { id: 1, text: 'Do you need complex joins or transactions?', yes: { label: 'SQL (PostgreSQL, MySQL)', final: true, color: 'indigo' }, no: 2 },
  { id: 2, text: 'Is your schema flexible / evolving?', yes: 3, no: { label: 'SQL (rigid schema is fine)', final: true, color: 'indigo' } },
  { id: 3, text: 'Is read speed the top priority?', yes: { label: 'Key-Value: Redis / DynamoDB', final: true, color: 'emerald' }, no: 4 },
  { id: 4, text: 'Do you need full-text search?', yes: { label: 'Elasticsearch / OpenSearch', final: true, color: 'amber' }, no: 5 },
  { id: 5, text: 'Is it graph-shaped data (social network, recommendations)?', yes: { label: 'Graph DB: Neo4j', final: true, color: 'purple' }, no: { label: 'Document DB: MongoDB / Firestore', final: true, color: 'rose' } },
];

function DecisionTree() {
  const [current, setCurrent] = useState<number | { label: string; final: boolean; color: string }>(1);
  const [path, setPath] = useState<string[]>([]);

  const q = typeof current === 'number' ? questions.find(q => q.id === current) : null;
  const result = typeof current === 'object' ? current : null;

  const answer = (yes: boolean) => {
    if (!q) return;
    const next = yes ? q.yes : q.no;
    setPath(p => [...p, `${q.text} → ${yes ? 'Yes' : 'No'}`]);
    setCurrent(next as any);
  };

  const reset = () => { setCurrent(1); setPath([]); };

  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-300 dark:border-amber-700',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border-purple-300 dark:border-purple-700',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 border-rose-300 dark:border-rose-700',
  };

  return (
    <div className="space-y-4">
      {path.length > 0 && (
        <div className="space-y-1">
          {path.map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
              {step}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {q && (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5"
          >
            <p className="text-base font-semibold text-gray-900 dark:text-white mb-4">{q.text}</p>
            <div className="flex gap-3">
              <button
                onClick={() => answer(true)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Yes ✓
              </button>
              <button
                onClick={() => answer(false)}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
              >
                No ✗
              </button>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl border-2 p-6 text-center ${colorMap[result.color]}`}
          >
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-lg font-bold">{result.label}</div>
            <button onClick={reset} className="mt-4 text-xs underline opacity-60 hover:opacity-100">Start over</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Replication Diagram
function ReplicationDiagram() {
  const [leaderDown, setLeaderDown] = useState(false);

  return (
    <div className="text-center">
      <svg viewBox="0 0 380 200" className="w-full max-w-lg mx-auto">
        {/* Leader */}
        <motion.rect
          x="155" y="10" width="70" height="50" rx="8"
          fill={leaderDown ? '#fee2e2' : '#e0e7ff'}
          stroke={leaderDown ? '#ef4444' : '#6366f1'}
          strokeWidth="2"
          animate={{ opacity: leaderDown ? 0.3 : 1 }}
        />
        <text x="190" y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill={leaderDown ? '#dc2626' : '#4338ca'}>
          {leaderDown ? '💀 Dead' : '👑 Leader'}
        </text>
        <text x="190" y="50" textAnchor="middle" fontSize="9" fill="#6b7280">Accepts Writes</text>

        {/* Arrows down to followers */}
        {[80, 300].map((x, i) => (
          <motion.line
            key={i}
            x1="190" y1="60" x2={x + 35} y2="120"
            stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3"
            animate={{ opacity: leaderDown ? 0 : 1 }}
          />
        ))}

        {/* Followers */}
        {[80, 300].map((x, i) => (
          <g key={i}>
            <motion.rect
              x={x} y="120" width="70" height="50" rx="8"
              fill="#d1fae5" stroke="#10b981" strokeWidth="2"
              animate={{
                fill: leaderDown && i === 0 ? '#e0e7ff' : '#d1fae5',
                stroke: leaderDown && i === 0 ? '#6366f1' : '#10b981',
              }}
            />
            <text x={x + 35} y="140" textAnchor="middle" fontSize="11" fontWeight="600" fill={leaderDown && i === 0 ? '#4338ca' : '#065f46'}>
              {leaderDown && i === 0 ? '👑 Promoted' : `Follower ${i + 1}`}
            </text>
            <text x={x + 35} y="158" textAnchor="middle" fontSize="9" fill="#6b7280">
              {leaderDown && i === 0 ? 'New Leader' : 'Serves Reads'}
            </text>
          </g>
        ))}

        {/* Read arrows → followers */}
        <text x="20" y="150" fontSize="10" fill="#6b7280">Read →</text>
        <text x="315" y="150" fontSize="10" fill="#6b7280">Read →</text>
      </svg>
      <button
        onClick={() => setLeaderDown(d => !d)}
        className={`mt-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          leaderDown
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'bg-red-500 text-white hover:bg-red-600'
        }`}
      >
        {leaderDown ? '🔁 Restore Leader' : '💥 Kill Leader'}
      </button>
    </div>
  );
}

// Sharding Diagram
function ShardingDiagram() {
  const [userId, setUserId] = useState(42);
  const shard = userId % 3;
  const shardColors = ['#6366f1', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">User ID:</label>
        <input
          type="number"
          value={userId}
          onChange={e => setUserId(Number(e.target.value) || 0)}
          className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
        />
        <div className="text-sm text-gray-500 dark:text-gray-400">
          hash({userId}) % 3 =
          <span className="ml-1 font-mono font-bold" style={{ color: shardColors[shard] }}>{shard}</span>
          → Shard {shard + 1}
        </div>
      </div>
      <svg viewBox="0 0 380 140" className="w-full max-w-lg mx-auto">
        {/* Shard Router */}
        <rect x="155" y="10" width="70" height="40" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
        <text x="190" y="34" textAnchor="middle" fontSize="10" fontWeight="600" fill="#a5b4fc">Shard Router</text>

        {/* Shards */}
        {[0, 1, 2].map((i) => {
          const x = [40, 155, 270][i];
          const isActive = i === shard;
          return (
            <g key={i}>
              <line x1="190" y1="50" x2={x + 35} y2="90" stroke={isActive ? shardColors[i] : '#d1d5db'} strokeWidth={isActive ? 2 : 1} />
              <motion.rect
                x={x} y="90" width="70" height="40" rx="8"
                animate={{ fill: isActive ? `${shardColors[i]}22` : '#f9fafb' }}
                stroke={isActive ? shardColors[i] : '#d1d5db'}
                strokeWidth={isActive ? 2.5 : 1}
              />
              <text x={x + 35} y="112" textAnchor="middle" fontSize="11" fontWeight={isActive ? '700' : '400'}
                fill={isActive ? shardColors[i] : '#9ca3af'}>
                Shard {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function Chapter6({ onProgress, onComplete }: ChapterProps) {
  useEffect(() => {
    onProgress(6);
    const t = setTimeout(() => onComplete(6), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🗃️</span>
          <div>
            <div className="text-xs font-mono text-indigo-500 uppercase tracking-wider mb-1">Chapter 06</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Databases</h1>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
          The database is almost always the bottleneck. Choosing the right database, replication strategy, and sharding approach determines whether your system survives at scale.
        </p>
      </div>

      {/* ACID vs BASE */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 ACID vs BASE — The Fundamental Trade-off</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          SQL databases follow ACID guarantees. NoSQL databases typically follow BASE semantics — a deliberate trade-off that enables massive horizontal scaling at the cost of strict consistency.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="font-bold text-indigo-600 dark:text-indigo-400 text-center py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">ACID (SQL)</div>
            {[
              { letter: 'A', term: 'Atomicity', desc: 'A transaction either fully completes or fully rolls back. You can\'t have a half-executed transfer where money left account A but didn\'t reach account B.' },
              { letter: 'C', term: 'Consistency', desc: 'Every transaction brings the database from one valid state to another. Foreign key constraints, unique constraints, etc. are always enforced.' },
              { letter: 'I', term: 'Isolation', desc: 'Concurrent transactions don\'t interfere. Multiple users booking the last seat in a plane will result in only one success. Levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable.' },
              { letter: 'D', term: 'Durability', desc: 'Once a transaction is committed, it\'s persisted even if the server crashes. Achieved via write-ahead logs (WAL).' },
            ].map(a => (
              <div key={a.letter} className="flex gap-3 text-sm">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 w-4 flex-shrink-0">{a.letter}</span>
                <div><strong className="text-gray-700 dark:text-gray-300">{a.term}:</strong> <span className="text-gray-600 dark:text-gray-400">{a.desc}</span></div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-center py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">BASE (NoSQL)</div>
            {[
              { term: 'Basically Available', desc: 'The system guarantees availability — though the data returned may be stale during a partition.' },
              { term: 'Soft State', desc: 'State may change over time, even without input. Replicas sync asynchronously; there are periods where they disagree.' },
              { term: 'Eventually Consistent', desc: 'Given enough time with no new updates, all nodes will converge to the same value. Not "always wrong" — just not instantly consistent.' },
            ].map(b => (
              <div key={b.term} className="flex gap-3 text-sm">
                <div><strong className="text-gray-700 dark:text-gray-300">{b.term}:</strong> <span className="text-gray-600 dark:text-gray-400">{b.desc}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SQL vs NoSQL Decision Tree */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Interactive: SQL vs NoSQL Decision Tree</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          There's no universal answer. The decision depends on your data model, consistency requirements, and scale. Answer a few questions to get a recommendation.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <DecisionTree />
        </div>
      </section>

      {/* Replication */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Replication — Leader/Follower</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          In leader-follower replication, all writes go to the leader. The leader asynchronously replicates changes to follower nodes. Followers serve read traffic, reducing load on the leader by 3–10x.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
          {[
            { label: 'Sync Replication', desc: 'Leader waits for at least one follower to confirm before acknowledging the write. No data loss, but higher write latency.' },
            { label: 'Async Replication', desc: 'Leader acknowledges immediately. Followers catch up eventually. Faster writes, but a crash during the lag can lose committed data.' },
            { label: 'Semi-sync', desc: 'Middle ground: leader waits for one follower (durability guarantee) but not all. Used by MySQL semi-sync replication.' },
          ].map(r => (
            <div key={r.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <div className="font-semibold text-gray-700 dark:text-gray-300 text-xs mb-1">{r.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{r.desc}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Click "Kill Leader" to simulate failover and watch a follower get promoted.</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <ReplicationDiagram />
        </div>
        <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-300">
          <strong>Replication Lag:</strong> The time delay between a write on the leader and it appearing on followers. During high write throughput or large transactions, lag can reach seconds or minutes. This means reads from followers may return slightly outdated data — always route critical reads (e.g., "did my payment go through?") to the leader.
        </div>
      </section>

      {/* Sharding */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Database Sharding</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Sharding horizontally partitions data across multiple database servers. Each server (shard) owns a subset of the data. Change the User ID to see how hash-based routing works.
        </p>
        <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
          {[
            { label: 'Hash Sharding', desc: 'shard = hash(key) % N. Even distribution but makes range queries impossible — you\'d have to query all shards.' },
            { label: 'Range Sharding', desc: 'Users 1–1M go to Shard 1, 1M–2M to Shard 2. Range queries are fast, but uneven distribution causes "hot shards."' },
            { label: 'Directory Sharding', desc: 'A lookup service maps keys to shards. Most flexible, but the directory becomes a bottleneck and single point of failure.' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <div className="font-semibold text-indigo-600 dark:text-indigo-400 text-xs mb-1">{s.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <ShardingDiagram />
        </div>
        <div className="mt-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4 text-sm text-red-800 dark:text-red-300">
          <strong>Sharding Pitfalls:</strong> Cross-shard joins and transactions are extremely difficult — each shard is a separate database. Avoid operations that touch multiple shards. Resharding (changing the number of shards) requires a migration of potentially terabytes of data.
        </div>
      </section>

      {/* Interview Tips */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h2 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Default to PostgreSQL for most systems. Only switch to NoSQL when you have a specific need: massive write throughput (Cassandra), flexible schema with nested docs (MongoDB), low-latency key-value (DynamoDB/Redis).</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Sharding is a last resort. Before sharding: add read replicas, optimize queries with indexes, add a cache layer, archive old data. Sharding adds enormous operational complexity.</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>For a 1M-user system in an interview, you likely need: 1 leader + 2 replicas + a cache layer. Sharding is typically needed at 100M+ users with very high write volume.</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Always discuss the N+1 query problem — fetching a list and then making N individual DB calls for related data. Solution: JOINs, eager loading (ORM), or a denormalized document model.</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Mention write-ahead logging (WAL): every DB write is first appended to an ordered log file, then applied to the data file. This enables crash recovery, replication, and point-in-time recovery.</li>
        </ul>
      </section>
    </div>
  );
}
