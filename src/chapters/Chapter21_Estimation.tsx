import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps { onProgress: (id: number) => void; onComplete: (id: number) => void; }

function EstimationCalc() {
  const [dau, setDau] = useState(10);
  const rps = Math.round(dau * 1e6 / 86400);
  const peakRps = rps * 3;
  const storagePerDay = Math.round(dau * 1e6 * 0.5 / 1024);
  const storagePerYear = Math.round(storagePerDay * 365 / 1024);
  const bandwidth = Math.round(peakRps * 50 / 1024);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Daily Active Users</label>
        <input type="range" min={1} max={1000} value={dau} onChange={e => setDau(Number(e.target.value))} className="flex-1 accent-indigo-500" />
        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 w-16 text-right">{dau}M</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Avg QPS', value: `${rps.toLocaleString()} req/s`, note: `${dau}M ÷ 86,400 sec` },
          { label: 'Peak QPS (3x)', value: `${peakRps.toLocaleString()} req/s`, note: 'Assume 3x peak factor' },
          { label: 'Storage/day', value: `${storagePerDay.toLocaleString()} GB`, note: '0.5 KB avg per request' },
          { label: 'Storage/year', value: `${storagePerYear.toLocaleString()} TB`, note: `${storagePerDay} GB × 365` },
          { label: 'Peak Bandwidth', value: `${bandwidth} MB/s`, note: `${peakRps} × 50KB avg response` },
          { label: 'Memory (cache 20%)', value: `${Math.round(storagePerDay * 0.2)} GB`, note: '20% of daily data in Redis' },
        ].map(m => (
          <div key={m.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">{m.label}</div>
            <div className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">{m.value}</div>
            <div className="text-[10px] text-gray-400">{m.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Chapter21_Estimation({ onProgress, onComplete }: ChapterProps) {
  useEffect(() => { onProgress(21); }, []);
  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 20</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🧮 Back-of-Envelope Estimation</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Powers of 2, latency numbers, QPS math, and estimation drills every engineer should know.</p>
      </motion.div>

      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          Powers of 2
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[
              { pow: '2¹⁰', val: '1 KB', bytes: '1,024' },
              { pow: '2²⁰', val: '1 MB', bytes: '1,048,576' },
              { pow: '2³⁰', val: '1 GB', bytes: '~1 billion' },
              { pow: '2⁴⁰', val: '1 TB', bytes: '~1 trillion' },
            ].map(p => (
              <div key={p.pow} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
                <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{p.pow}</div>
                <div className="font-semibold text-gray-800 dark:text-gray-200">{p.val}</div>
                <div className="text-gray-500">{p.bytes}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          Latency Numbers Every Programmer Should Know
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-1">
            {[
              { op: 'L1 cache reference', time: '0.5 ns', bar: 1, color: '#10b981' },
              { op: 'L2 cache reference', time: '7 ns', bar: 3, color: '#10b981' },
              { op: 'Main memory reference', time: '100 ns', bar: 8, color: '#0ea5e9' },
              { op: 'SSD random read', time: '150 μs', bar: 20, color: '#6366f1' },
              { op: 'HDD seek', time: '10 ms', bar: 40, color: '#8b5cf6' },
              { op: 'Send 1 MB over 1 Gbps', time: '10 ms', bar: 40, color: '#f59e0b' },
              { op: 'Read 1 MB from SSD', time: '1 ms', bar: 30, color: '#6366f1' },
              { op: 'Read 1 MB from HDD', time: '20 ms', bar: 50, color: '#8b5cf6' },
              { op: 'Round trip same datacenter', time: '0.5 ms', bar: 25, color: '#ef4444' },
              { op: 'Round trip CA → Netherlands', time: '150 ms', bar: 80, color: '#ef4444' },
            ].map((l, i) => (
              <motion.div key={i} className="flex items-center gap-2 text-xs"
                initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                <span className="w-48 text-gray-700 dark:text-gray-300 flex-shrink-0">{l.op}</span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: l.color, width: `${l.bar}%` }}
                    initial={{ width: 0 }} whileInView={{ width: `${l.bar}%` }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} />
                </div>
                <span className="font-mono text-gray-500 dark:text-gray-400 w-16 text-right">{l.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          Interactive: Estimation Calculator
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">Drag the slider to estimate QPS, storage, bandwidth, and cache requirements for any scale.</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <EstimationCalc />
        </div>
      </motion.section>

      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Quick Estimation Formulas
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-2 font-mono text-xs">
          {[
            { formula: 'QPS = DAU × avg_requests_per_user / 86,400', note: '86,400 = seconds in a day' },
            { formula: 'Peak QPS = QPS × 2~3', note: 'Peak is typically 2-3x average' },
            { formula: 'Storage = QPS × data_per_request × seconds × retention', note: 'Don\'t forget retention period!' },
            { formula: 'Bandwidth = Peak QPS × avg_response_size', note: 'In bytes/second' },
            { formula: 'Servers = Peak QPS / single_server_capacity', note: 'Typical: 1K-10K QPS per server depending on workload' },
            { formula: 'Cache = storage_per_day × 0.2', note: '80/20 rule: 20% of data serves 80% of reads' },
          ].map(f => (
            <div key={f.formula} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <code className="text-indigo-600 dark:text-indigo-400 flex-shrink-0">{f.formula}</code>
              <span className="text-gray-500 dark:text-gray-400 text-[10px]">{f.note}</span>
            </div>
          ))}
        </div>
      </motion.section>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h3>
        <ul className="space-y-2">
          {[
            'Always start design interviews with estimation. It shows structured thinking and helps size your system.',
            '1 day ≈ 100K seconds (86,400 rounded). Use this for quick QPS math.',
            'Memory is fast (100ns), SSD is OK (150μs), HDD is slow (10ms), network varies (0.5ms same-DC, 150ms cross-continent).',
            'The 80/20 rule: cache the 20% most-accessed data to serve 80% of reads. This gives you cache size estimates.',
            'Always state your assumptions clearly. "Assuming 10M DAU, 5 requests/user/day, 1KB per request..." Interviewers care about your process, not exact numbers.',
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
