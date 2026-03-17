import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps { onProgress: (id: number) => void; }

/* ── Consistency Demo — Stale Read Visualization ── */
function ConsistencyDemo() {
  const [model, setModel] = useState<'strong' | 'eventual'>('strong');
  const [writeStep, setWriteStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setWriteStep(s => (s + 1) % 5), 1200);
    return () => clearInterval(t);
  }, [model]);

  const strongSteps = [
    { leader: 'balance = $100', r1: 'balance = $100', r2: 'balance = $100', event: 'Initial state' },
    { leader: 'balance = $50 ✏️', r1: 'balance = $100', r2: 'balance = $100', event: 'Write: withdraw $50' },
    { leader: 'balance = $50', r1: 'balance = $50 🔄', r2: 'balance = $100', event: 'Sync to Replica 1...' },
    { leader: 'balance = $50', r1: 'balance = $50', r2: 'balance = $50 🔄', event: 'Sync to Replica 2...' },
    { leader: 'balance = $50', r1: 'balance = $50 ✅', r2: 'balance = $50 ✅', event: 'All replicas consistent → ACK to client' },
  ];
  const eventualSteps = [
    { leader: 'balance = $100', r1: 'balance = $100', r2: 'balance = $100', event: 'Initial state' },
    { leader: 'balance = $50 ✏️', r1: 'balance = $100', r2: 'balance = $100', event: 'Write: withdraw $50 → ACK immediately!' },
    { leader: 'balance = $50', r1: 'balance = $100 ⚠️', r2: 'balance = $100 ⚠️', event: '⚠️ Client reads from Replica 2: sees STALE $100!' },
    { leader: 'balance = $50', r1: 'balance = $50 🔄', r2: 'balance = $100', event: 'Background sync propagating...' },
    { leader: 'balance = $50', r1: 'balance = $50', r2: 'balance = $50 🔄', event: 'Eventually all replicas converge ✅' },
  ];
  const steps = model === 'strong' ? strongSteps : eventualSteps;
  const current = steps[writeStep];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['strong', 'eventual'] as const).map(m => (
          <button key={m} onClick={() => { setModel(m); setWriteStep(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${model === m ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
            {m === 'strong' ? '🔒 Strong Consistency' : '⚡ Eventual Consistency'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
        {[
          { label: 'Leader', value: current.leader, color: '#6366f1' },
          { label: 'Replica 1', value: current.r1, color: '#10b981' },
          { label: 'Replica 2', value: current.r2, color: '#0ea5e9' },
        ].map(n => (
          <div key={n.label} className="rounded-xl p-3 border-2 transition-all" style={{ borderColor: n.color, backgroundColor: `${n.color}08` }}>
            <div className="text-xs font-semibold mb-1" style={{ color: n.color }}>{n.label}</div>
            <div className="font-mono text-sm text-gray-800 dark:text-gray-200">{n.value}</div>
          </div>
        ))}
      </div>
      <div className={`text-center text-xs font-semibold rounded-lg py-2 ${model === 'eventual' && (writeStep === 1 || writeStep === 2)
        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'}`}>
        Step {writeStep + 1}/5: {current.event}
      </div>
    </div>
  );
}

export default function Chapter15_ConsistencyModels({ onProgress }: ChapterProps) {
  useEffect(() => { onProgress(15); }, []);
  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-14">
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 14</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🎯 Consistency Models</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">From linearizability to eventual consistency — understanding the spectrum and real-world tradeoffs.</p>
      </motion.div>

      {/* Why Consistency Matters */}
      <motion.section {...fadeUp} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 Why Consistency Is the Hardest Problem in Distributed Systems</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          When you have a single database on a single server, consistency is trivial — there's one copy of the truth. But the moment you <strong className="text-gray-800 dark:text-gray-200">replicate data across multiple nodes</strong> (which every production system does for reliability), you face a fundamental question: <em>when one node updates the data, how quickly must other nodes reflect that change?</em>
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Think of it like a <strong className="text-gray-800 dark:text-gray-200">team sharing a Google Doc</strong>. In real-time mode (strong consistency), everyone sees every keystroke instantly — but it requires constant internet. In offline mode (eventual consistency), you can edit without internet, but when you reconnect, you might see conflicting changes that need merging. Neither is "better" — they serve different needs.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          In system design interviews, the interviewer is testing whether you understand <strong className="text-gray-800 dark:text-gray-200">that consistency is a spectrum, not a binary choice</strong>, and whether you can pick the right point on that spectrum for the system you're designing.
        </p>
      </motion.section>

      {/* Interactive Demo */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          Interactive: Strong vs Eventual Consistency
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          Watch how a bank balance update propagates differently under strong vs eventual consistency. In strong mode, the client waits until ALL replicas are updated. In eventual mode, the client gets an immediate response, but replicas lag behind.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <ConsistencyDemo />
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>⚠️ The danger of eventual consistency:</strong> In the demo above, if a user reads from Replica 2 right after the write, they see a stale balance of $100 instead of $50. For a bank, this means the user could withdraw money they don't have. For a social media like count, it's harmless. <em>The risk tolerance of your domain determines your consistency model.</em>
          </p>
        </div>
      </motion.section>

      {/* Consistency Spectrum */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          The Consistency Spectrum
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">Consistency isn't binary — it's a spectrum. Stronger consistency costs more latency and throughput. Each level provides a different guarantee about what readers see.</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-1">
            {[
              { level: 'Linearizability', desc: 'Every read returns the most recent write globally. As if there\'s a single copy of data. Requires coordination on every operation.', perf: 'Slowest', example: 'Zookeeper, etcd, Google Spanner', color: '#ef4444', analogy: 'Like a single whiteboard everyone stares at — instant updates, but slow because everyone waits.' },
              { level: 'Sequential Consistency', desc: 'All nodes see operations in the same order, but that order may not match wall-clock time. Weaker than linearizable.', perf: 'Slow', example: 'Raft consensus', color: '#f59e0b', analogy: 'Like a recorded lecture — everyone watches the same sequence, but it might be delayed.' },
              { level: 'Causal Consistency', desc: 'Causally related operations are ordered (if A causes B, everyone sees A before B). Concurrent operations may be in any order.', perf: 'Moderate', example: 'MongoDB (causal sessions)', color: '#8b5cf6', analogy: 'Like a threaded conversation — replies always appear after the post they reply to.' },
              { level: 'Read-Your-Writes', desc: 'You always see your own writes immediately. Other users may see stale data temporarily.', perf: 'Fast', example: 'DynamoDB (consistent reads)', color: '#0ea5e9', analogy: 'Like editing your profile — you see changes instantly, but friends might see the old version for a few seconds.' },
              { level: 'Eventual Consistency', desc: 'Given enough time with no new writes, all replicas converge to the same value. No guarantee on how long.', perf: 'Fastest', example: 'DNS, Cassandra, S3', color: '#10b981', analogy: 'Like gossip spreading through a village — everyone eventually hears the news, but at different times.' },
            ].map((l, i) => (
              <motion.div key={l.level} className="flex items-start gap-3 rounded-lg px-3 py-2.5"
                style={{ backgroundColor: `${l.color}09` }}
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: l.color }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm" style={{ color: l.color }}>{l.level}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{l.perf}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{l.desc}</p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 italic mt-0.5">💡 {l.analogy}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">Examples: {l.example}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 px-3">
            <span className="text-xs text-red-500 font-semibold">← Strongest (high latency, low throughput)</span>
            <span className="text-xs text-emerald-500 font-semibold">Weakest (low latency, high throughput) →</span>
          </div>
        </div>
      </motion.section>

      {/* ACID vs BASE */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          ACID vs BASE — Two Philosophies
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          ACID and BASE represent two fundamental approaches to data management. ACID prioritizes <strong className="text-gray-800 dark:text-gray-200">correctness</strong> (the data is always right). BASE prioritizes <strong className="text-gray-800 dark:text-gray-200">availability</strong> (the system is always up). Most real-world systems use a combination — ACID for the transaction core (payments, inventory), BASE for everything else (feeds, analytics, recommendations).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-200 dark:border-blue-800 p-5 space-y-2">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">🔒 ACID (Pessimistic)</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <li><strong className="text-gray-800 dark:text-gray-200">Atomicity</strong> — All or nothing. If any step in a transaction fails, everything rolls back. Withdrawing $50 and depositing $50 either both happen or neither does.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Consistency</strong> — Database moves between valid states. Constraints (foreign keys, unique indexes, check constraints) are always enforced.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Isolation</strong> — Concurrent transactions don't see each other's uncommitted changes. As if they ran one after another.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Durability</strong> — Once a transaction is committed, it survives crashes. Implemented via Write-Ahead Log (WAL) and fsync.</li>
              <li className="text-indigo-600 dark:text-indigo-400 font-semibold pt-1">Used by: PostgreSQL, MySQL, Oracle, SQL Server</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 space-y-2">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">⚡ BASE (Optimistic)</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
              <li><strong className="text-gray-800 dark:text-gray-200">Basically Available</strong> — System always responds, even if some nodes are down. May return stale or approximate data rather than failing.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Soft state</strong> — Data may change over time without explicit input, due to background convergence and replication.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Eventually consistent</strong> — Given enough time with no new writes, all replicas will converge to the same value. No guarantee on timing.</li>
              <li className="mt-2 text-gray-500">Trades consistency for availability and partition tolerance. Works by accepting that temporary inconsistency is okay.</li>
              <li className="text-indigo-600 dark:text-indigo-400 font-semibold pt-1">Used by: DynamoDB, Cassandra, CouchDB, Riak, S3</li>
            </ul>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>🎯 Modern reality:</strong> The ACID vs BASE divide is blurring. CockroachDB, Google Spanner, and YugabyteDB offer <strong>ACID guarantees across globally distributed nodes</strong>. This is the holy grail — but it comes with latency costs due to consensus protocols.
          </p>
        </div>
      </motion.section>

      {/* Isolation Levels */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Transaction Isolation Levels — Deep Dive
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          Isolation is the "I" in ACID and determines what happens when two transactions run at the same time. Think of it like two people editing the same spreadsheet — isolation determines how much of each other's changes they can see. Higher isolation = safer but slower.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300 text-xs">Level</th>
              <th className="text-left py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300 text-xs">Dirty Read</th>
              <th className="text-left py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300 text-xs">Non-Repeatable Read</th>
              <th className="text-left py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300 text-xs">Phantom Read</th>
              <th className="text-left py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300 text-xs">Perf</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
              <tr><td className="py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300">Read Uncommitted</td><td className="text-red-500">Possible</td><td className="text-red-500">Possible</td><td className="text-red-500">Possible</td><td className="text-emerald-500">Fastest</td></tr>
              <tr><td className="py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300">Read Committed</td><td className="text-emerald-500">Prevented</td><td className="text-red-500">Possible</td><td className="text-red-500">Possible</td><td>Fast</td></tr>
              <tr><td className="py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300">Repeatable Read</td><td className="text-emerald-500">Prevented</td><td className="text-emerald-500">Prevented</td><td className="text-red-500">Possible</td><td>Moderate</td></tr>
              <tr><td className="py-2 pr-3 font-semibold text-gray-700 dark:text-gray-300">Serializable</td><td className="text-emerald-500">Prevented</td><td className="text-emerald-500">Prevented</td><td className="text-emerald-500">Prevented</td><td className="text-red-500">Slowest</td></tr>
            </tbody>
          </table>
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <p><strong className="text-gray-800 dark:text-gray-200">Dirty Read:</strong> Reading uncommitted data from another transaction. Like seeing someone's draft email before they send it. Dangerous because the draft might be discarded.</p>
            <p><strong className="text-gray-800 dark:text-gray-200">Non-Repeatable Read:</strong> Reading the same row twice within one transaction and getting different values because another transaction modified it in between.</p>
            <p><strong className="text-gray-800 dark:text-gray-200">Phantom Read:</strong> Running the same query twice and getting different rows because another transaction inserted/deleted rows in between.</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <strong>PostgreSQL default:</strong> Read Committed. <strong>MySQL InnoDB default:</strong> Repeatable Read. Most apps work fine with Read Committed — only use Serializable for critical financial transactions where correctness trumps performance.
          </p>
        </div>
      </motion.section>

      {/* Real-world system mappings */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          Real-World Consistency Choices
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          Here's how real companies pick consistency models. Notice the pattern: <strong className="text-gray-800 dark:text-gray-200">money → strong, content → eventual, user-facing state → read-your-writes</strong>.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {[
              { system: '💰 Bank Transfers', consistency: 'Strong (Serializable)', reason: 'Money must never be double-spent. A failed transfer that shows as "completed" is catastrophic. ACID transactions mandatory.' },
              { system: '📱 Social Media Feed', consistency: 'Eventual', reason: 'A tweet showing 2 seconds late won\'t cause harm. Availability > consistency. Users don\'t notice small delays.' },
              { system: '🛒 Shopping Cart', consistency: 'Read-Your-Writes', reason: 'User must see their own additions immediately. Other users seeing a stale cart is acceptable.' },
              { system: '🌍 Google Spanner', consistency: 'Linearizable (global)', reason: 'TrueTime API uses GPS + atomic clocks to provide global ordering across continents. The gold standard.' },
              { system: '🌐 DNS', consistency: 'Eventual (TTL-based)', reason: 'Domain changes propagate over hours via cache TTL expiry. This is by design — availability and performance are paramount.' },
              { system: '📝 Collaborative Editing (Google Docs)', consistency: 'Causal', reason: 'Users see their edits + causally dependent edits. Operational Transformation (OT) and CRDTs handle merge conflicts.' },
            ].map(s => (
              <div key={s.system} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="font-semibold text-gray-800 dark:text-gray-200">{s.system}</div>
                <div className="text-indigo-600 dark:text-indigo-400 font-semibold">{s.consistency}</div>
                <div className="text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{s.reason}</div>
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
            'Strong consistency (linearizability) requires consensus protocols (Paxos, Raft). These add latency — typically 2+ network round trips per write across replicas.',
            'Eventual consistency is the default for NoSQL databases. It\'s acceptable for 80% of use cases. Only reach for stronger guarantees when data correctness is critical (money, inventory).',
            'Read-your-writes is the minimum acceptable level for user-facing apps. Implement by routing reads-after-writes to the leader node, or using session stickiness.',
            'ACID for SQL, BASE for NoSQL is an oversimplification. Modern databases like CockroachDB and Spanner offer ACID guarantees over distributed, NoSQL-like architectures.',
            'Google Spanner achieves global linearizability using TrueTime (GPS + atomic clocks). This is the gold standard — but requires specialized hardware that only Google has at datacenter scale.',
            'In interviews, always state your consistency requirement upfront: "For this system, I\'ll use eventual consistency for feed data, but strong consistency for payment processing." This shows design maturity.',
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
