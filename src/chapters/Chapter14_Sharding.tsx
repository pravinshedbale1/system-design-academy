import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps { onProgress: (id: number) => void; onComplete: (id: number) => void; }

/* ── Consistent Hashing Ring Visualizer ── */
function HashRing() {
  const [nodes, setNodes] = useState(['A', 'B', 'C']);
  const [keys] = useState(['user:1', 'user:2', 'user:3', 'user:4', 'user:5']);

  const hash = useCallback((s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
    return ((h % 360) + 360) % 360;
  }, []);

  const nodePositions = nodes.map(n => ({ name: n, angle: hash(n) })).sort((a, b) => a.angle - b.angle);
  const keyPositions = keys.map(k => {
    const angle = hash(k);
    const node = nodePositions.find(n => n.angle >= angle) || nodePositions[0];
    return { key: k, angle, assignedTo: node.name };
  });

  const colors: Record<string, string> = { A: '#6366f1', B: '#10b981', C: '#f59e0b', D: '#ef4444', E: '#8b5cf6' };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <button onClick={() => { const next = String.fromCharCode(65 + nodes.length); if (nodes.length < 5) setNodes([...nodes, next]); }}
          className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 transition-colors">+ Add Node</button>
        <button onClick={() => { if (nodes.length > 2) setNodes(nodes.slice(0, -1)); }}
          className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors">− Remove Node</button>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{nodes.length} nodes, {keys.length} keys</span>
      </div>
      <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
        <circle cx="150" cy="150" r="120" fill="none" stroke="#e5e7eb" strokeWidth="2" className="dark:stroke-gray-700" />
        {nodePositions.map(n => {
          const rad = (n.angle - 90) * Math.PI / 180;
          const x = 150 + 120 * Math.cos(rad);
          const y = 150 + 120 * Math.sin(rad);
          return (
            <g key={n.name}>
              <circle cx={x} cy={y} r="14" fill={colors[n.name] || '#6366f1'} />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">{n.name}</text>
            </g>
          );
        })}
        {keyPositions.map(k => {
          const rad = (k.angle - 90) * Math.PI / 180;
          const x = 150 + 100 * Math.cos(rad);
          const y = 150 + 100 * Math.sin(rad);
          return (
            <g key={k.key}>
              <circle cx={x} cy={y} r="5" fill={colors[k.assignedTo] || '#6366f1'} opacity={0.7} />
              <text x={x} y={y - 8} textAnchor="middle" fontSize="7" fill="#6b7280">{k.key}</text>
            </g>
          );
        })}
      </svg>
      <div className="grid grid-cols-5 gap-1 text-xs">
        {keyPositions.map(k => (
          <div key={k.key} className="rounded-lg px-2 py-1 text-center" style={{ backgroundColor: `${colors[k.assignedTo]}15`, color: colors[k.assignedTo] }}>
            <div className="font-mono font-semibold">{k.key}</div>
            <div className="text-[10px]">→ Node {k.assignedTo}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Chapter14_Sharding({ onProgress, onComplete }: ChapterProps) {
  useEffect(() => { onProgress(14); const t = setTimeout(() => onComplete(14), 12000); return () => clearTimeout(t); }, []);
  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 13</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🧩 Sharding & Partitioning</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Splitting data across machines — consistent hashing, shard keys, and hot-spot mitigation.</p>
      </motion.div>

      {/* Why Shard */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          Why Sharding?
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            When a single database server can't handle the load (CPU, memory, disk I/O, or storage capacity), you <strong className="text-gray-800 dark:text-gray-200">horizontally partition</strong> data across multiple machines. Each machine holds a <strong className="text-gray-800 dark:text-gray-200">shard</strong> — a subset of the total data.
          </p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { metric: 'Disk Full', limit: '> 2TB single node', icon: '💾' },
              { metric: 'Write Throughput', limit: '> 10K writes/sec', icon: '✍️' },
              { metric: 'Read Latency', limit: 'Index too large for RAM', icon: '⚡' },
            ].map(m => (
              <div key={m.metric} className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-200 dark:border-red-800">
                <div className="font-semibold text-red-700 dark:text-red-400">{m.icon} {m.metric}</div>
                <div className="text-gray-600 dark:text-gray-400 mt-0.5">{m.limit}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Sharding Strategies */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          Sharding Strategies
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">🔢 Hash-Based Sharding</h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 font-mono text-xs text-gray-600 dark:text-gray-400 mb-2">
              shard = hash(user_id) % num_shards
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>✅ Uniform distribution — evenly splits data</li>
              <li>✅ Any key gets deterministic shard assignment</li>
              <li>❌ Range queries impossible (data is scattered)</li>
              <li>❌ Adding/removing shards remaps all keys (unless consistent hashing)</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">📊 Range-Based Sharding</h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 font-mono text-xs text-gray-600 dark:text-gray-400 mb-2">
              Shard 1: A-M, Shard 2: N-Z
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>✅ Range queries efficient (scan within one shard)</li>
              <li>✅ Easy to understand and implement</li>
              <li>❌ Hot spots if range distribution is uneven</li>
              <li>❌ Needs periodic rebalancing as data grows</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Consistent Hashing */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          Interactive: Consistent Hashing Ring
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">Add/remove nodes and watch how keys are reassigned. Only keys between the removed node and its predecessor need to move — O(K/N) instead of O(K).</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <HashRing />
        </div>
      </motion.section>

      {/* Shard Key Selection */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Shard Key Selection
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">The shard key determines data distribution. A bad choice creates hot spots and cross-shard queries.</p>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">System</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Good Shard Key</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Bad Shard Key</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Why</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Twitter</td><td className="py-2 pr-4 text-emerald-600 font-mono">user_id</td><td className="py-2 pr-4 text-red-500 font-mono">timestamp</td><td className="py-2 pr-4">Hot shard for celebrity users, but user's data stays together</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">E-commerce</td><td className="py-2 pr-4 text-emerald-600 font-mono">customer_id</td><td className="py-2 pr-4 text-red-500 font-mono">product_id</td><td className="py-2 pr-4">Customer queries (orders, profile) stay in one shard</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Chat</td><td className="py-2 pr-4 text-emerald-600 font-mono">channel_id</td><td className="py-2 pr-4 text-red-500 font-mono">message_id</td><td className="py-2 pr-4">All messages in a channel on same shard for ordered reads</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Analytics</td><td className="py-2 pr-4 text-emerald-600 font-mono">date + tenant</td><td className="py-2 pr-4 text-red-500 font-mono">event_id</td><td className="py-2 pr-4">Time-range queries within tenant stay local</td></tr>
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Interview Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h3>
        <ul className="space-y-2">
          {[
            'Consistent hashing minimizes key movement when nodes are added/removed. With virtual nodes (150-200 per physical node), load distribution becomes very even.',
            'Always shard by the key you query most often. If you query by user_id, shard by user_id — this avoids scatter-gather queries across all shards.',
            'Hot spot mitigation: For celebrity users, add a random suffix to the shard key (user_id:0, user_id:1, ..., user_id:N) to spread across N shards. Read from all N and merge.',
            'Cross-shard joins are expensive. Design your schema so related data lives on the same shard (co-location). This is why DynamoDB doesn\'t support joins.',
            'Resharding is painful. Over-provision initially (start with 2x the shards you think you need). Auto-sharding databases (CockroachDB, Vitess) can split/merge ranges automatically.',
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
