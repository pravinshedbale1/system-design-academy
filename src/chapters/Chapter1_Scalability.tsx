import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MetricBar from '../components/UI/MetricBar';

interface ChapterProps {
  onProgress: (id: number) => void;
}

// ── Traffic Load Simulator
function TrafficSimulator() {
  const [load, setLoad] = useState(30);

  const cpu = Math.min(load * 0.95, 100);
  const memory = Math.min(load * 0.75, 100);
  const responseTime = load < 60
    ? 40 + load * 0.8
    : 40 + 48 + Math.exp((load - 60) / 13) * 100;
  const errorRate = load > 70 ? Math.min(((load - 70) / 30) * 100, 100) : 0;

  const getStatus = () => {
    if (load < 60) return { text: '✅ System healthy', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' };
    if (load < 75) return { text: '⚠️ CPU saturating — consider scaling', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' };
    if (load < 88) return { text: '🔴 Server overwhelmed — users experiencing timeouts', cls: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' };
    return { text: '💀 System down — 503 errors', cls: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300 dark:border-red-700' };
  };

  const status = getStatus();

  const formatMs = (ms: number) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.round(ms)}ms`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          Traffic Load
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={load}
          onChange={e => setLoad(Number(e.target.value))}
          className="flex-1 accent-indigo-500"
        />
        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 w-12 text-right">{load}%</span>
      </div>
      <MetricBar label="CPU Usage" value={cpu} color="indigo" />
      <MetricBar label="Memory Usage" value={memory} color="indigo" />
      <MetricBar
        label="Response Time"
        value={Math.min((responseTime / 3000) * 100, 100)}
        color="indigo"
        displayValue={formatMs(responseTime)}
      />
      <MetricBar
        label="Error Rate"
        value={errorRate}
        color="indigo"
        displayValue={`${errorRate.toFixed(1)}%`}
      />
      <div className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300 ${status.cls}`}>
        {status.text}
      </div>
    </div>
  );
}

// ── Scaling Diagram
function ScalingDiagram() {
  const ServerIcon = ({ scale = 1 }: { scale?: number }) => (
    <div
      className="flex flex-col items-center justify-center rounded-xl border-2 border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 transition-all text-center"
      style={{ width: 72, height: 72 * scale + 'px', fontSize: 28 }}
    >
      🖥️
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Vertical Scaling */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h4 className="font-semibold text-center mb-4 text-gray-900 dark:text-white">⬆️ Vertical Scaling</h4>
        <div className="flex flex-col items-center gap-3 mb-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Before</p>
          <ServerIcon scale={1} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl"
          >↓</motion.div>
          <p className="text-xs text-gray-500 dark:text-gray-400">After (bigger server)</p>
          <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 1.5 }}
            transition={{ duration: 1, delay: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            style={{ transformOrigin: 'bottom' }}
          >
            <ServerIcon scale={1.5} />
          </motion.div>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex gap-1.5"><span className="text-emerald-500">✓</span><span className="text-gray-600 dark:text-gray-400">Simple — no code changes</span></div>
          <div className="flex gap-1.5"><span className="text-emerald-500">✓</span><span className="text-gray-600 dark:text-gray-400">Works for stateful apps</span></div>
          <div className="flex gap-1.5"><span className="text-red-500">✗</span><span className="text-gray-600 dark:text-gray-400">Hardware limit (max ~128 cores)</span></div>
          <div className="flex gap-1.5"><span className="text-red-500">✗</span><span className="text-gray-600 dark:text-gray-400">Single point of failure</span></div>
        </div>
      </div>

      {/* Horizontal Scaling */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <h4 className="font-semibold text-center mb-4 text-gray-900 dark:text-white">↔️ Horizontal Scaling</h4>
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg font-mono">Load Balancer</div>
          <div className="text-gray-400">↙ ↓ ↘</div>
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.3 + 0.5 }}
              >
                <ServerIcon />
              </motion.div>
            ))}
          </div>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex gap-1.5"><span className="text-emerald-500">✓</span><span className="text-gray-600 dark:text-gray-400">Scales to millions of users</span></div>
          <div className="flex gap-1.5"><span className="text-emerald-500">✓</span><span className="text-gray-600 dark:text-gray-400">Fault tolerant (no SPOF)</span></div>
          <div className="flex gap-1.5"><span className="text-red-500">✗</span><span className="text-gray-600 dark:text-gray-400">Requires stateless design</span></div>
          <div className="flex gap-1.5"><span className="text-red-500">✗</span><span className="text-gray-600 dark:text-gray-400">More operational complexity</span></div>
        </div>
      </div>
    </div>
  );
}

// ── Stateless vs Stateful Diagram
function StatelessDiagram() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Stateful (bad) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-red-500 text-lg">✗</span>
          <h4 className="font-semibold text-gray-900 dark:text-white">Stateful (Bad)</h4>
        </div>
        <svg viewBox="0 0 260 180" className="w-full text-current">
          <text x="10" y="20" fontSize="12" fill="currentColor" opacity="0.7">👤 User</text>

          {/* Arrow to Server 1 */}
          <line x1="50" y1="18" x2="70" y2="55" stroke="#6366f1" strokeWidth="1.5" />
          <rect x="70" y="45" width="100" height="30" rx="6" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
          <text x="120" y="64" fontSize="11" textAnchor="middle" fill="#4338ca">Server 1</text>
          <text x="120" y="92" fontSize="9" textAnchor="middle" fill="#64748b">session: user42</text>

          {/* Arrow to Server 2 */}
          <line x1="50" y1="18" x2="70" y2="115" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5,3" />
          <rect x="70" y="110" width="100" height="30" rx="6" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
          <text x="120" y="129" fontSize="11" textAnchor="middle" fill="#dc2626">Server 2</text>

          {/* Error */}
          <rect x="55" y="150" width="150" height="22" rx="4" fill="#fef2f2" stroke="#fca5a5" strokeWidth="1" />
          <text x="130" y="165" fontSize="9" textAnchor="middle" fill="#dc2626">401 — session not found</text>
        </svg>
      </div>

      {/* Stateless (good) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-emerald-500 text-lg">✓</span>
          <h4 className="font-semibold text-gray-900 dark:text-white">Stateless (Good)</h4>
        </div>
        <svg viewBox="0 0 260 180" className="w-full text-current">
          <text x="10" y="20" fontSize="12" fill="currentColor" opacity="0.7">👤 User</text>

          <line x1="50" y1="18" x2="70" y2="55" stroke="#6366f1" strokeWidth="1.5" />
          <rect x="70" y="45" width="100" height="30" rx="6" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
          <text x="120" y="64" fontSize="11" textAnchor="middle" fill="#4338ca">Server 1</text>

          <line x1="50" y1="18" x2="70" y2="115" stroke="#6366f1" strokeWidth="1.5" />
          <rect x="70" y="110" width="100" height="30" rx="6" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
          <text x="120" y="129" fontSize="11" textAnchor="middle" fill="#4338ca">Server 2</text>

          {/* Both point to Redis */}
          <line x1="170" y1="60" x2="195" y2="85" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,2" />
          <line x1="170" y1="125" x2="195" y2="110" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,2" />

          <rect x="195" y="82" width="50" height="30" rx="6" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5" />
          <text x="220" y="101" fontSize="9" textAnchor="middle" fill="#065f46">Redis</text>

          {/* Checkmarks */}
          <text x="175" y="70" fontSize="12" fill="#10b981">✓</text>
          <text x="175" y="140" fontSize="12" fill="#10b981">✓</text>
        </svg>
      </div>
    </div>
  );
}

// ── Main Chapter 1
export default function Chapter1({ onProgress }: ChapterProps) {
  useEffect(() => {
    onProgress(1);  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">📈</span>
          <div>
            <div className="text-xs font-mono text-indigo-500 uppercase tracking-wider mb-1">Chapter 01</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Introduction to Scalability</h1>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
          Scalability is the ability of a system to handle growth — in users, data, or requests — without a proportional increase in cost or a reduction in performance.
        </p>
      </div>

      {/* Core Theory */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 What Does Scalability Actually Mean?</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          A system is scalable if adding more resources (servers, CPUs, memory) produces a proportional improvement in capacity. Perfect linear scalability is the goal but rarely achieved in practice due to coordination overhead, database bottlenecks, and shared state.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Performance Scalability', icon: '⚡', desc: 'System gets faster (lower latency) as you add resources. Rare — most systems get slower due to coordination.' },
            { label: 'Load Scalability', icon: '📦', desc: 'System handles more concurrent users without degradation. This is the most common goal — handled by horizontal scaling.' },
            { label: 'Geographic Scalability', icon: '🌍', desc: 'System serves users globally with low latency. Achieved via CDNs, multi-region deployments, and global load balancers.' },
          ].map(c => (
            <div key={c.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="text-xl mb-1">{c.icon}</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">{c.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{c.desc}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">SLA, SLO, and SLI — The Three Reliability Metrics</h3>
          <div className="space-y-2">
            {[
              { term: 'SLI (Service Level Indicator)', def: 'A measurable metric — e.g., "99.2% of requests in the last hour returned in < 200ms". Raw numbers from your monitoring.' },
              { term: 'SLO (Service Level Objective)', def: 'An internal target — e.g., "99.9% of requests must complete in < 200ms". The engineering team owns meeting this.' },
              { term: 'SLA (Service Level Agreement)', def: 'A contractual commitment to customers — e.g., "99.9% uptime or you get a credit". Violating an SLA has financial consequences.' },
            ].map(s => (
              <div key={s.term} className="flex gap-3">
                <span className="text-indigo-500 font-mono text-xs font-bold mt-0.5 whitespace-nowrap">{s.term}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">— {s.def}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
          <div className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">The Nine Nines — What "Uptime" Actually Means</div>
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400">
                  <th className="text-left py-1 pr-4">Uptime</th>
                  <th className="text-left py-1 pr-4">Downtime/year</th>
                  <th className="text-left py-1">Downtime/month</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100 dark:divide-indigo-900">
                {[
                  ['99% (two nines)', '3.65 days', '7.3 hours'],
                  ['99.9% (three nines)', '8.77 hours', '43.8 min'],
                  ['99.99% (four nines)', '52.6 min', '4.4 min'],
                  ['99.999% (five nines)', '5.26 min', '26.3 sec'],
                ].map(([u, y, m]) => (
                  <tr key={u} className="text-gray-600 dark:text-gray-400">
                    <td className="py-1 pr-4 font-mono">{u}</td>
                    <td className="py-1 pr-4 text-red-500">{y}</td>
                    <td className="py-1">{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Traffic Simulator */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">⚡ Interactive: Traffic Load Simulator</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Drag the slider to see how metrics degrade under load. Note how response time stays flat until ~60% load, then spikes exponentially — this is the "knee of the curve" every system has.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <TrafficSimulator />
        </div>
      </section>

      {/* Scaling Theory */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Amdahl's Law — The Ceiling on Parallelism</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Amdahl's Law states that the speedup from adding more processors is limited by the <em>serial fraction</em> of your program. If 30% of your code is inherently sequential (e.g., a single-threaded database write), you can never get more than ~3.3x speedup regardless of how many cores you add.
        </p>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 font-mono text-sm">
          <div className="text-indigo-600 dark:text-indigo-400 mb-1">{'// Amdahl\'s Law'}</div>
          <div className="text-gray-700 dark:text-gray-300">{'Speedup = 1 / (S + (1-S)/N)'}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{'// S = serial fraction, N = number of processors'}</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs">{'// Example: S=0.3, N=∞ → max speedup = 1/0.3 ≈ 3.3x'}</div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          This is why you can't just throw more servers at a problem. You have to identify and eliminate serial bottlenecks first — usually the database, a global lock, or a synchronous queue.
        </p>
      </section>

      {/* Scaling Diagram */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Vertical vs Horizontal Scaling</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          In early startup phases, vertical scaling is fine. As you approach millions of users, you hit hardware limits and must switch to horizontal scaling with a stateless architecture.
        </p>
        <ScalingDiagram />
        <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-300">
          <strong>Real-world example:</strong> Stack Overflow runs primarily on vertical scaling — a handful of powerful servers serving 1.5 billion page views/month. YouTube and Netflix use extreme horizontal scaling with thousands of commodity servers. The right choice depends on your traffic patterns, team size, and operational maturity.
        </div>
      </section>

      {/* Stateless/Stateful */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Stateless vs Stateful Servers</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          The fundamental rule of horizontal scaling: <strong className="text-gray-700 dark:text-gray-200">servers must be stateless</strong>. If a server stores session data locally, requests from the same user <em>must</em> always hit the same server (sticky sessions) — which breaks load balancing and prevents fault tolerance.
        </p>
        <StatelessDiagram />
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">What to offload from servers:</div>
            <ul className="space-y-1 text-gray-500 dark:text-gray-400">
              <li>→ Sessions & auth tokens → Redis</li>
              <li>→ File uploads → S3/Blob Storage</li>
              <li>→ Persistent data → Database</li>
              <li>→ Queued jobs → Redis/SQS/RabbitMQ</li>
            </ul>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
            <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Result: true statelessness</div>
            <ul className="space-y-1 text-gray-500 dark:text-gray-400">
              <li>✓ Any server can handle any request</li>
              <li>✓ Servers can crash without data loss</li>
              <li>✓ Deploy new versions with zero downtime</li>
              <li>✓ Auto-scale up and down freely</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interview Tips */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h2 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Always start a system design with: "Is this read-heavy or write-heavy?" — it determines your entire architecture.</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>The interviewer expects you to mention <strong>stateless servers</strong> + <strong>load balancer</strong> + <strong>external session store</strong> as your base horizontal scaling setup.</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Response time doesn't degrade linearly — it spikes exponentially past ~70% capacity. Design for 50–60% average utilization to have headroom.</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Mention SLOs explicitly: "We'd need 99.9% uptime, which gives us 8.7 hours of downtime budget per year."</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Distinguish between <em>throughput</em> (requests/second the system can handle) vs <em>scalability</em> (how gracefully capacity grows with resources).</li>
        </ul>
      </section>
    </div>
  );
}
