import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChapterProps {
  onProgress: (id: number) => void;
}

const databases: Record<string, { dbs: string[]; description: string }> = {
  CA: {
    dbs: ['PostgreSQL', 'MySQL'],
    description: 'Sacrifices Partition Tolerance. Works well in single-datacenter setups where network partitions are rare.'
  },
  CP: {
    dbs: ['MongoDB', 'HBase', 'Redis (cluster)'],
    description: 'Sacrifices Availability. During a partition, the system goes offline rather than serve stale data.'
  },
  AP: {
    dbs: ['Cassandra', 'DynamoDB', 'CouchDB'],
    description: 'Sacrifices Consistency. During a partition, nodes serve potentially stale data to remain available.'
  }
};

function CAPCards() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const cards = [
    {
      key: 'C',
      label: 'Consistency',
      emoji: '🔒',
      color: 'from-indigo-500 to-indigo-600',
      desc: 'Every read receives the most recent write or an error. All nodes see the same data at any point in time.',
      detail: 'Consistency means no client ever sees stale data. In distributed databases, achieving this often requires a consensus protocol like Raft or Paxos that adds latency.'
    },
    {
      key: 'A',
      label: 'Availability',
      emoji: '🟢',
      color: 'from-emerald-500 to-emerald-600',
      desc: 'Every request receives a (non-error) response, even if that data might be stale.',
      detail: 'Availability means the system always responds. High-availability systems use replication across multiple nodes so there is no single point of failure.'
    },
    {
      key: 'P',
      label: 'Partition Tolerance',
      emoji: '🌐',
      color: 'from-amber-500 to-amber-600',
      desc: 'The system continues to operate despite message loss or partitioning between nodes.',
      detail: 'A network partition is when nodes cannot communicate. Since partitions are inevitable in distributed systems, you must choose: sacrifice C or A when a partition occurs.'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card) => (
        <motion.div
          key={card.key}
          layout
          whileHover={{ y: -3 }}
          onClick={() => setExpanded(expanded === card.key ? null : card.key)}
          className="cursor-pointer rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
        >
          <div className={`bg-gradient-to-br ${card.color} p-4 text-white`}>
            <div className="text-2xl mb-1">{card.emoji}</div>
            <div className="font-bold text-lg">{card.label}</div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">{card.desc}</p>
            <AnimatePresence>
              {expanded === card.key && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 leading-relaxed"
                >
                  {card.detail}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CAPToggle() {
  const PROPS = ['C', 'A', 'P'] as const;
  type Prop = typeof PROPS[number];
  const [enabled, setEnabled] = useState<Prop[]>(['C', 'A']);
  const [order, setOrder] = useState<Prop[]>(['C', 'A']);

  const toggle = (prop: Prop) => {
    if (enabled.includes(prop)) {
      setEnabled(e => e.filter(p => p !== prop));
      setOrder(o => o.filter(p => p !== prop));
    } else {
      let newEnabled = [...enabled, prop];
      let newOrder = [...order, prop];
      if (newEnabled.length > 2) {
        const toRemove = newOrder[0];
        newEnabled = newEnabled.filter(p => p !== toRemove);
        newOrder = newOrder.filter(p => p !== toRemove);
      }
      setEnabled(newEnabled);
      setOrder(newOrder);
    }
  };

  const key = [...PROPS].filter(p => enabled.includes(p)).sort().join('') as keyof typeof databases;
  const db = databases[key];

  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-center">
        {PROPS.map((prop) => {
          const isOn = enabled.includes(prop);
          return (
            <button
              key={prop}
              onClick={() => toggle(prop)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 font-semibold text-lg transition-all ${
                isOn
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-6 rounded-full transition-colors relative ${isOn ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow ${isOn ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
              {prop}
            </button>
          );
        })}
      </div>

      {db && (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5"
        >
          <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
            Selecting <span className="font-mono text-indigo-600 dark:text-indigo-400">{key}</span> systems:
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {db.dbs.map(db => (
              <span key={db} className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                {db}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{db.description}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function Chapter2({ onProgress }: ChapterProps) {
  useEffect(() => {
    onProgress(2);  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🔺</span>
          <div>
            <div className="text-xs font-mono text-indigo-500 uppercase tracking-wider mb-1">Chapter 02</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">The CAP Theorem</h1>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
          CAP Theorem (proved by Eric Brewer in 2000) states that in a distributed system, you can only fully guarantee two of three properties: Consistency, Availability, and Partition Tolerance.
        </p>
      </div>

      {/* Background theory */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 Why Does CAP Exist?</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          In a distributed system, nodes communicate over a network. Networks are unreliable — cables get cut, switches fail, datacenters flood. A <strong className="text-gray-800 dark:text-gray-200">network partition</strong> is when one group of nodes can no longer communicate with another.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          The critical insight: <em>Partition Tolerance is not optional.</em> You cannot build a distributed system that never partitions — that would require a perfect network, which doesn't exist in the real world. So in practice, every distributed system must choose: <strong className="text-gray-800 dark:text-gray-200">when a partition happens, do you sacrifice Consistency or Availability?</strong>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="font-semibold text-amber-700 dark:text-amber-300 mb-2">Choosing CP (like MongoDB)</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">During a partition, the system goes <em>offline</em> on the minority side rather than serve stale data. Users in the partitioned region can't read or write. When the partition heals, data is guaranteed consistent.</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Choosing AP (like Cassandra)</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">During a partition, all nodes remain available and accept reads/writes. But nodes may diverge — different nodes can have different values. Eventual consistency: all nodes converge once the partition heals.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">The Three Properties — Click to Expand</h2>
        <CAPCards />
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Interactive: CAP Trade-off Picker</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Toggle any two properties to see which real-world databases match your selection. Only 2 of 3 can be active simultaneously.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <CAPToggle />
        </div>
      </section>

      {/* Eventual Consistency */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Eventual Consistency — What It Really Means</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          "Eventually consistent" does NOT mean "sometimes correct." It means: <em>if no new updates are made, all replicas will eventually converge to the same value.</em> The key parameters are:
        </p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          {[
            { label: 'Convergence Time', desc: 'How long until all replicas agree. In well-designed AP systems this is typically milliseconds to seconds, not hours.' },
            { label: 'Conflict Resolution', desc: 'When two nodes update the same key during a partition, who wins? Options: Last-Write-Wins (LWW), vector clocks, CRDTs, or application-level merge.' },
            { label: 'Read-Your-Writes', desc: 'After you write something, you should always see your own write. This is a session-level guarantee, not a global one. Many AP systems offer this via sticky sessions.' },
          ].map(c => (
            <div key={c.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1 text-xs">{c.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PACELC */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Beyond CAP: The PACELC Model</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          CAP only describes behavior <em>during partitions</em>. But partitions are rare — what about the 99.9% of the time when the network is healthy? The <strong className="text-gray-800 dark:text-gray-200">PACELC model</strong> (Daniel Abadi, 2012) extends CAP:
        </p>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 font-mono text-sm">
          <div className="text-indigo-600 dark:text-indigo-400">If Partition → choose (A)vailability or (C)onsistency</div>
          <div className="text-indigo-600 dark:text-indigo-400 mt-1">Else → choose (L)atency or (C)onsistency</div>
        </div>
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                <th className="text-left py-2 pr-4">Database</th>
                <th className="text-left py-2 pr-4">During Partition</th>
                <th className="text-left py-2">Normal Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-gray-600 dark:text-gray-400">
              {[
                ['DynamoDB', 'PA — stays available', 'EL — low latency, eventual consistency'],
                ['Cassandra', 'PA — stays available', 'EL — low latency, tunable consistency'],
                ['PostgreSQL', 'PC — goes offline on minority', 'EC — strong consistency, higher latency'],
                ['MongoDB (primary)', 'PC — primary stays up', 'EC — strong reads from primary'],
                ['Spanner (Google)', 'PC — consistency first', 'EC — uses TrueTime for global consistency'],
              ].map(([db, part, norm]) => (
                <tr key={db}>
                  <td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">{db}</td>
                  <td className="py-2 pr-4">{part}</td>
                  <td className="py-2">{norm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Interview tips */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h2 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>In practice, <strong>CA systems don't really exist</strong> in distributed form. CA just means "I assume no partition," which only applies to single-node systems or within a single datacenter using synchronous replication.</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>When an interviewer asks "why did you choose Cassandra?", the CAP answer is: "AP — we prioritize availability, and our business can tolerate briefly showing stale recommendation data after a partition."</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Don't say "Cassandra has eventual consistency." Say: "Cassandra offers tunable consistency — you can configure reads/writes to use QUORUM (strong) or ONE (fast) at the query level."</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Financial systems (banking, payments) always pick CP — a user submitting a payment twice is worse than a brief outage.</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Social media (likes, follower counts) often picks AP — showing "1,234 likes" vs "1,235 likes" for a split second doesn't matter.</li>
        </ul>
      </section>
    </div>
  );
}
