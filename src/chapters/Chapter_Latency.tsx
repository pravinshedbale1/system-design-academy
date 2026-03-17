import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

interface ChapterProps {
  onProgress: (id: number) => void;
}

const latencyData = [
  { name: 'L1 Cache', ns: 1, display: '1 ns', tip: 'Registers and L1 cache are the fastest memory accessible to a CPU.' },
  { name: 'RAM Access', ns: 100, display: '100 ns', tip: 'RAM is ~100x slower than L1 cache. Still considered "fast".' },
  { name: 'SSD Read', ns: 100_000, display: '100 μs', tip: 'SSDs are fast but still ~1000x slower than RAM. Use RAM for hot data.' },
  { name: 'Network (same DC)', ns: 500_000, display: '500 μs', tip: 'Round-trip in the same data center. Keep inter-service calls minimal.' },
  { name: 'HDD Seek', ns: 10_000_000, display: '10 ms', tip: 'Mechanical hard drives are shockingly slow due to rotational latency.' },
  { name: 'DB Query', ns: 10_000_000, display: '10 ms', tip: 'Unindexed/complex queries can be much worse. Always index foreign keys.' },
  { name: 'Cross-continent', ns: 150_000_000, display: '150 ms', tip: 'Speed of light across the globe. CDNs help reduce this for static content.' },
];


function LatencyChart() {
  const [hovered, setHovered] = useState<typeof latencyData[0] | null>(null);

  return (
    <div className="space-y-3">
      {latencyData.map((item, i) => {
        const pct = (Math.log10(item.ns) / Math.log10(150_000_000)) * 100;
        return (
          <div
            key={item.name}
            className="relative"
            onMouseEnter={() => setHovered(item)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-36 text-right font-medium">{item.name}</span>
              <div className="flex-1 h-7 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center pl-3"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                  viewport={{ once: true }}
                >
                  <span className="text-xs font-mono text-white font-bold whitespace-nowrap">{item.display}</span>
                </motion.div>
              </div>
            </div>
          </div>
        );
      })}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 text-white text-sm rounded-xl px-4 py-3 shadow-lg max-w-sm"
        >
          <div className="font-bold text-indigo-300 mb-1">{hovered.name} — {hovered.display}</div>
          <div className="text-gray-300 text-xs">{hovered.tip}</div>
        </motion.div>
      )}
    </div>
  );
}

function ThroughputCalculator() {
  const [servers, setServers] = useState(3);
  const [rps, setRps] = useState(500);
  const [avgMs, setAvgMs] = useState(50);
  const [targetRps, setTargetRps] = useState(1000);

  const totalRps = servers * rps;
  const p99 = Math.round(avgMs * 2.5);
  const canHandle = totalRps >= targetRps;

  const chartData = Array.from({ length: 10 }, (_, i) => ({
    servers: i + 1,
    rps: (i + 1) * rps,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Number of Servers', value: servers, set: setServers, min: 1, max: 20 },
          { label: 'RPS per Server', value: rps, set: setRps, min: 50, max: 2000 },
          { label: 'Avg Response (ms)', value: avgMs, set: setAvgMs, min: 1, max: 500 },
        ].map(({ label, value, set, min, max }) => (
          <div key={label} className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</label>
            <input
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={e => set(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="text-lg font-bold font-mono text-gray-900 dark:text-white">{value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{totalRps.toLocaleString()}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total RPS</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{p99}ms</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">P99 Latency (est.)</div>
        </div>
        <div className={`rounded-xl p-4 text-center ${canHandle ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
          <div className={`text-2xl font-bold ${canHandle ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {canHandle ? '✓' : '✗'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Target: {targetRps.toLocaleString()} RPS
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Target RPS</label>
        <input
          type="range"
          min={100}
          max={10000}
          step={100}
          value={targetRps}
          onChange={e => setTargetRps(Number(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="text-sm font-mono font-bold text-gray-900 dark:text-white">{targetRps.toLocaleString()} RPS</div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.2)" />
          <XAxis dataKey="servers" label={{ value: 'Servers', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => [`${Number(v).toLocaleString()} RPS`, 'Throughput']} />
          <Line type="monotone" dataKey="rps" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Chapter3({ onProgress }: ChapterProps) {
  useEffect(() => {
    onProgress(3);  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-14">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">⚡</span>
          <div>
            <div className="text-xs font-mono text-indigo-500 uppercase tracking-wider mb-1">Chapter 03</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Latency & Throughput</h1>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
          Two of the most misunderstood metrics in distributed systems. Every design decision is ultimately a trade-off between them.
        </p>
      </div>

      {/* Core Theory */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 Latency vs Throughput — Not the Same Thing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
            <div className="font-bold text-indigo-700 dark:text-indigo-300 text-lg mb-1">Latency</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Time for a single request to complete. Measured as: <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">time_response - time_request</code>. Usually expressed in ms. Represents the user experience.</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="font-bold text-purple-700 dark:text-purple-300 text-lg mb-1">Throughput</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Number of requests the system can handle per second (RPS/QPS). Represents system capacity. You can have high throughput + high latency simultaneously.</p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
          <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">The critical insight: Optimizing for throughput can hurt latency, and vice versa.</div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>→ Batching requests increases throughput (fewer roundtrips) but increases per-request latency.</li>
            <li>→ Prefetching reduces latency for the user but wastes throughput on requests that may not be needed.</li>
            <li>→ Connection pooling improves throughput by reusing connections but may add queuing latency under load.</li>
          </ul>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Percentile Latency — Why Averages Lie</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Average latency is almost meaningless in distributed systems. If 99% of requests take 10ms and 1% take 10 seconds, your average might be 110ms — hiding a severe problem. Always measure percentiles:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { p: 'P50', name: 'Median', desc: 'Half of requests are faster. Your "typical" user experience.' },
              { p: 'P90', name: '90th Percentile', desc: '10% of users see this or worse. Often the SLO target.' },
              { p: 'P99', name: '99th Percentile', desc: '1% of users (the "tail"). Critical at scale — at 100M users this is 1M unhappy users.' },
              { p: 'P999', name: '99.9th Percentile', desc: 'The worst 0.1%. Often caused by GC pauses, cold queries, disk seeks.' },
            ].map(item => (
              <div key={item.p} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-lg">{item.p}</div>
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{item.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Latency Numbers Every Engineer Must Know</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          These numbers — originally from Jeff Dean at Google — form the mental model that guides every system design decision. Gaps of 1000x between levels mean architectural choices matter enormously. Bars use a logarithmic scale. Hover for context.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <LatencyChart />
        </div>
      </section>

      {/* Little's Law */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Little's Law — The Fundamental Queueing Equation</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Little's Law states that in a stable system, the average number of items in the system (L) equals the arrival rate (λ) times the average time spent in the system (W):
        </p>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 font-mono text-center text-lg">
          <span className="text-indigo-600 dark:text-indigo-400">L = λ × W</span>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-sans">
            L = concurrent requests in system &nbsp;|&nbsp; λ = arrival rate (RPS) &nbsp;|&nbsp; W = latency per request
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
            <div className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Practical example</div>
            <p className="text-gray-600 dark:text-gray-400">If your service handles 1,000 RPS and each request takes 50ms, you have L = 1000 × 0.05 = <strong>50 concurrent requests</strong> in flight at any moment. Size your thread pools accordingly.</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
            <div className="font-semibold text-amber-700 dark:text-amber-300 mb-1">The danger zone</div>
            <p className="text-gray-600 dark:text-gray-400">As latency increases (e.g., a slow DB query), L grows. More requests pile up, consuming more threads/connections. This can cascade into a full outage even with modest RPS.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Throughput Calculator</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Adjust the sliders to model your system's capacity. The P99 estimate assumes ~2.5x the mean latency under load — a common rule of thumb for well-tuned web services.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <ThroughputCalculator />
        </div>
      </section>

      {/* Interview Tips */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h2 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Always quote P99 in interviews, not averages: "We'd target P99 &lt; 100ms, not average &lt; 100ms."</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Use latency numbers to justify decisions: "We can't use HDD for session storage — 10ms seek time at 100K RPS is catastrophic. Redis at 0.1ms is the answer."</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Network calls are expensive. Each cross-service call adds ~0.5ms in the same DC. Calling 20 microservices in series = 10ms just in network overhead before any processing.</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>The 100ms rule: Research shows users perceive responses under 100ms as "instant." Above 300ms feels sluggish. Above 1000ms they start abandoning requests.</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Throughput scales linearly with servers (for stateless services). Latency does not — it's bounded by the slowest component in the request path (usually the database).</li>
        </ul>
      </section>
    </div>
  );
}
