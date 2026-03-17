import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps { onProgress: (id: number) => void; onComplete: (id: number) => void; }

/* ── Interactive Storage Latency Comparison ── */
function StorageLatencyCompare() {
  const tiers = [
    { name: 'L1 Cache', latency: '~1ns', bar: 1, color: '#6366f1', note: 'On-CPU register, fastest possible' },
    { name: 'L2 Cache', latency: '~4ns', bar: 2, color: '#818cf8', note: 'Still on-CPU, slightly larger' },
    { name: 'RAM', latency: '~100ns', bar: 8, color: '#10b981', note: 'Main memory (DRAM)' },
    { name: 'NVMe SSD', latency: '~20μs', bar: 25, color: '#f59e0b', note: '1000x faster than HDD' },
    { name: 'SATA SSD', latency: '~100μs', bar: 35, color: '#f97316', note: 'Consumer-grade SSD' },
    { name: 'HDD', latency: '~5ms', bar: 65, color: '#ef4444', note: 'Mechanical seek + rotation' },
    { name: 'Network (S3)', latency: '~50ms', bar: 90, color: '#dc2626', note: 'HTTP round-trip + processing' },
  ];
  return (
    <div className="space-y-2">
      {tiers.map((t, i) => (
        <motion.div key={t.name} className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-24 text-right">{t.name}</span>
          <div className="flex-1 bg-gray-100 dark:bg-gray-700/50 rounded-full h-5 overflow-hidden">
            <motion.div className="h-full rounded-full flex items-center justify-end pr-2"
              style={{ backgroundColor: t.color }} initial={{ width: 0 }}
              whileInView={{ width: `${t.bar}%` }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.06 }}>
              <span className="text-[10px] font-mono text-white font-bold">{t.latency}</span>
            </motion.div>
          </div>
          <span className="text-[10px] text-gray-400 w-36 hidden lg:block">{t.note}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Erasure Coding Visual ── */
function ErasureCodingVisual() {
  const [failed, setFailed] = useState<number | null>(null);
  const fragments = [
    { label: 'D1', type: 'data' }, { label: 'D2', type: 'data' },
    { label: 'D3', type: 'data' }, { label: 'D4', type: 'data' },
    { label: 'P1', type: 'parity' }, { label: 'P2', type: 'parity' },
  ];
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">Click a fragment to simulate failure. The data can be reconstructed from remaining fragments.</p>
      <div className="flex gap-2 justify-center">
        {fragments.map((f, i) => (
          <button key={i} onClick={() => setFailed(failed === i ? null : i)}
            className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all border-2 ${failed === i
              ? 'bg-red-100 dark:bg-red-900/30 border-red-400 text-red-600 line-through opacity-50'
              : f.type === 'data'
                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 text-indigo-600'
                : 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 text-amber-600'
            }`}>
            {failed === i ? '💥' : f.type === 'data' ? '📦' : '🔒'}
            <span className="mt-0.5">{f.label}</span>
          </button>
        ))}
      </div>
      <div className={`text-center text-xs font-semibold rounded-lg py-2 ${failed !== null
        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-500'
      }`}>
        {failed !== null
          ? `✅ Fragment ${fragments[failed].label} lost! Data recovered using ${fragments[failed].type === 'data' ? 'parity' : 'remaining data'} fragments. No data loss.`
          : 'All fragments healthy. Click one to simulate failure.'}
      </div>
    </div>
  );
}

export default function Chapter12_StorageSystems({ onProgress, onComplete }: ChapterProps) {
  useEffect(() => { onProgress(12); const t = setTimeout(() => onComplete(12), 12000); return () => clearTimeout(t); }, []);
  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-14">
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 11</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">💾 Storage Systems</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Block, file, and object storage — understanding when to use each and how they power every modern system.</p>
      </motion.div>

      {/* Why Storage Matters */}
      <motion.section {...fadeUp} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 Why Storage Is a Core Design Decision</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Every system design interview boils down to <strong className="text-gray-800 dark:text-gray-200">where you store data</strong> and <strong className="text-gray-800 dark:text-gray-200">how fast you can retrieve it</strong>. Storage isn't just "save it to a database" — it's a spectrum from nanosecond CPU caches to cold archival tapes.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Think of it like a kitchen: your <strong className="text-gray-800 dark:text-gray-200">countertop</strong> (RAM) holds what you're cooking right now — fast access, limited space. Your <strong className="text-gray-800 dark:text-gray-200">fridge</strong> (SSD) stores ingredients for the week — slower but more capacity. Your <strong className="text-gray-800 dark:text-gray-200">pantry</strong> (HDD) holds bulk supplies. And a <strong className="text-gray-800 dark:text-gray-200">warehouse</strong> (S3/Glacier) stores everything you rarely need but can't throw away. Good system design means putting data in the right "room."
        </p>
      </motion.section>

      {/* Storage Latency Hierarchy */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          Storage Latency Hierarchy
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          The single most important concept in storage: <strong className="text-gray-800 dark:text-gray-200">there is a direct tradeoff between speed and capacity</strong>. Faster storage costs more per GB and holds less. This hierarchy drives every architectural decision — from caching strategies to data tiering.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <StorageLatencyCompare />
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>🎯 Key insight:</strong> RAM is ~100,000x faster than an HDD and ~500x faster than an SSD. This is why caching exists — it promotes hot data from slow tiers to fast tiers. When an interviewer asks "how would you make this faster?", the answer is almost always "cache it one tier higher."
          </p>
        </div>
      </motion.section>

      {/* Three Types of Storage */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          Three Types of Storage
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          At the infrastructure level, there are three fundamental ways to organize and access stored data. Each is designed for a fundamentally different access pattern: random I/O (block), hierarchical browsing (file), or key-value retrieval (object).
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Block Storage', icon: '🧱', desc: 'Data is stored as fixed-size blocks (typically 4KB-64KB) on raw disk. The operating system builds a filesystem on top. Think of it like a blank notebook — you decide how to organize pages.', examples: 'AWS EBS, Azure Managed Disk, SAN/iSCSI', use: 'Databases (PostgreSQL, MySQL), boot volumes, VM disks', perf: '< 1ms latency, 64K IOPS', analogy: 'Like a hard drive attached to your laptop — lowest latency, but only one machine can use it.' },
            { name: 'File Storage', icon: '📂', desc: 'Data is organized in a hierarchical directory tree with paths like /home/user/file.txt. Multiple machines can share access via network protocols (NFS, SMB/CIFS).', examples: 'AWS EFS, Azure Files, NFS, GlusterFS', use: 'Shared configs, CMS content, legacy apps, home directories', perf: '1-5ms latency, shared access', analogy: 'Like a shared network drive at an office — everyone can browse folders, but it\'s slower than local storage.' },
            { name: 'Object Storage', icon: '📦', desc: 'Data is stored as objects (blob + metadata + unique key) in a flat namespace. No directories, no hierarchy — just keys. Accessed via HTTP API (PUT/GET). Infinitely scalable.', examples: 'AWS S3, Google Cloud Storage, Azure Blob', use: 'Images, videos, backups, logs, ML training data, data lakes', perf: '10-100ms, 11 nines durability', analogy: 'Like a massive warehouse with labeled boxes — you find things by label (key), not by walking through aisles.' },
          ].map(s => (
            <div key={s.name} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">{s.icon} {s.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-[11px] text-blue-700 dark:text-blue-400 italic">💡 {s.analogy}</div>
              <div className="text-xs"><span className="text-indigo-600 dark:text-indigo-400 font-semibold">Examples: </span><span className="text-gray-500 dark:text-gray-400">{s.examples}</span></div>
              <div className="text-xs"><span className="text-emerald-600 dark:text-emerald-400 font-semibold">Use for: </span><span className="text-gray-500 dark:text-gray-400">{s.use}</span></div>
              <div className="text-xs font-mono text-amber-600 dark:text-amber-400">{s.perf}</div>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">📏 When to Use What — Decision Framework</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>→ Need <strong className="text-gray-800 dark:text-gray-200">sub-millisecond random reads</strong> (database, OLTP)? → <strong className="text-indigo-600">Block storage</strong></p>
            <p>→ Need <strong className="text-gray-800 dark:text-gray-200">multiple servers to share files</strong> (config, media editing)? → <strong className="text-indigo-600">File storage</strong></p>
            <p>→ Need to <strong className="text-gray-800 dark:text-gray-200">store billions of objects cheaply</strong> (images, logs, backups)? → <strong className="text-indigo-600">Object storage</strong></p>
            <p className="text-amber-600 dark:text-amber-400 font-semibold text-xs mt-2">⚠️ Never put a database on object storage. The latency (50-100ms per read) would make queries unusable.</p>
          </div>
        </div>
      </motion.section>

      {/* S3 Architecture */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          How S3 Achieves 11 Nines of Durability
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          Amazon S3 promises <strong className="text-gray-800 dark:text-gray-200">99.999999999% durability</strong> — if you stored 10 million objects, you'd statistically lose one every 10,000 years. Here's the engineering behind this guarantee:
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { step: '1', title: 'PUT Object', desc: 'Client uploads via HTTPS. Object is received by the S3 frontend and a unique key is assigned. Metadata (content-type, custom headers, ACL) is stored separately from the blob.' },
              { step: '2', title: 'Erasure Coding', desc: 'Instead of storing 3 full copies (3x storage cost), S3 uses Reed-Solomon erasure coding — the object is split into data fragments + parity fragments. This achieves the same fault tolerance at ~1.5x storage cost.' },
              { step: '3', title: 'Multi-AZ Distribution', desc: 'Fragments are distributed across at least 3 Availability Zones (physically separate data centers). The write is acknowledged only after a quorum of AZs confirm the data is durably written to disk.' },
              { step: '4', title: 'Continuous Verification', desc: 'Background processes continuously checksum every fragment. If corruption or disk failure is detected, the fragment is automatically regenerated from remaining healthy fragments and placed on a new disk.' },
            ].map(s => (
              <div key={s.step} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">{s.step}</span>
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{s.title}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mt-4">🔧 Interactive: Erasure Coding Simulation</h3>
          <ErasureCodingVisual />
        </div>
      </motion.section>

      {/* RAID */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          RAID — Redundancy at the Disk Level
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          RAID (Redundant Array of Independent Disks) combines multiple physical disks into a single logical unit for performance, redundancy, or both. Think of it as "erasure coding for a single server" — it protects against disk failure at the hardware level. In interviews, the most important levels to know are RAID 1 (mirroring), RAID 5 (striping with parity), and RAID 10 (striping + mirroring — the go-to choice for database servers).
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Level</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Strategy</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Min Disks</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Fault Tolerance</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Use Case</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
              <tr><td className="py-2 pr-4 font-semibold text-indigo-600">RAID 0</td><td>Striping (no redundancy)</td><td>2</td><td className="text-red-500">None — any disk fails, all data lost</td><td>Temp data, benchmarks</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-indigo-600">RAID 1</td><td>Mirroring (full copy on another disk)</td><td>2</td><td className="text-emerald-500">1 disk can fail</td><td>OS boot drives, critical logs</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-indigo-600">RAID 5</td><td>Striping + distributed parity</td><td>3</td><td className="text-emerald-500">1 disk can fail</td><td>General file servers</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-indigo-600">RAID 6</td><td>Striping + double parity</td><td>4</td><td className="text-emerald-500">2 disks can fail</td><td>Large arrays, NAS</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-indigo-600">RAID 10</td><td>Mirror + stripe combined</td><td>4</td><td className="text-emerald-500">1 per mirror pair</td><td className="font-semibold text-amber-600">Databases — best perf + safety</td></tr>
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Data Lake vs Warehouse */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          Data Lake vs Data Warehouse
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          Both store large amounts of data, but they solve fundamentally different problems. A <strong className="text-gray-800 dark:text-gray-200">data lake</strong> is like dumping all your photos, documents, and receipts into a giant storage bin — cheap and flexible, but you need to organize them when you want to find something. A <strong className="text-gray-800 dark:text-gray-200">data warehouse</strong> is like a neatly organized filing cabinet — everything is pre-sorted and labeled, so queries are fast, but loading data requires upfront effort (ETL).
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">🏞️ Data Lake</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>→ <strong>Raw data</strong> in original format (JSON, CSV, Parquet, images, video)</li>
              <li>→ <strong>Schema-on-read</strong> — structure applied at query time, not when stored</li>
              <li>→ Cheap storage (object storage — $0.023/GB/month)</li>
              <li>→ Stores ALL data types: structured, semi-structured, unstructured</li>
              <li>→ Great for ML training, exploratory analysis, and log aggregation</li>
              <li className="text-indigo-600 dark:text-indigo-400 font-semibold">Tools: S3 + Spark, Databricks, AWS Athena, Delta Lake</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">🏢 Data Warehouse</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>→ <strong>Processed, curated</strong> data in structured tables</li>
              <li>→ <strong>Schema-on-write</strong> — ETL pipeline cleans + structures data before loading</li>
              <li>→ Expensive but very fast queries (columnar storage, pre-built indexes)</li>
              <li>→ Structured data only — SQL-queryable, optimized for analytics</li>
              <li>→ Great for business dashboards, reporting, and ad-hoc analytics</li>
              <li className="text-indigo-600 dark:text-indigo-400 font-semibold">Tools: Snowflake, BigQuery, Redshift, ClickHouse</li>
            </ul>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>🎯 Modern trend — Lakehouse:</strong> Combines the best of both. Store raw data in object storage (lake), but add a metadata/catalog layer (e.g., Delta Lake, Apache Iceberg) that enables ACID transactions and fast SQL queries directly on the lake. This is what Databricks and most modern data platforms use.
          </p>
        </div>
      </motion.section>

      {/* Storage Cost Tiers */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">6</span>
          Cloud Storage Cost Tiers
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          In interviews, mentioning that you would tier data by access frequency demonstrates cost-awareness — a trait senior engineers value. Hot data stays on fast, expensive storage; cold data moves to cheap archival tiers automatically.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="space-y-2">
            {[
              { tier: 'S3 Standard', cost: '$0.023/GB', access: 'Frequent (hot)', retrieval: 'Instant', color: '#6366f1' },
              { tier: 'S3 Infrequent Access', cost: '$0.0125/GB', access: 'Monthly', retrieval: 'Instant (but per-request fee)', color: '#10b981' },
              { tier: 'S3 Glacier Instant', cost: '$0.004/GB', access: 'Quarterly', retrieval: 'Milliseconds', color: '#f59e0b' },
              { tier: 'S3 Glacier Deep Archive', cost: '$0.00099/GB', access: 'Yearly/Compliance', retrieval: '12-48 hours', color: '#ef4444' },
            ].map(t => (
              <div key={t.tier} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ backgroundColor: `${t.color}11` }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                <span className="text-xs font-semibold w-44 text-gray-800 dark:text-gray-200">{t.tier}</span>
                <span className="text-xs font-mono w-24" style={{ color: t.color }}>{t.cost}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-1">{t.access} → retrieval: {t.retrieval}</span>
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
            'Use object storage (S3) for anything that\'s WORM (Write Once Read Many): images, videos, logs, backups. It\'s the cheapest and most durable option at any scale.',
            'Databases need block storage (EBS/SSD) for low-latency random reads/writes. Never put a transactional database on S3 — the ~50ms latency per read would make queries unusable.',
            'RAID 10 for production databases — best read/write performance with redundancy. RAID 5/6 for archival or read-heavy storage.',
            'S3 achieves 11 nines durability through erasure coding + multi-AZ distribution + continuous integrity verification. This is higher than any other storage system.',
            'Always mention data tiering in interviews: hot data on SSDs/Redis, warm data on S3 Standard, cold data on Glacier. Use lifecycle policies to automatically move data between tiers.',
            'Object storage is not a filesystem — no rename, no append, no partial update. Every change creates a new version. This is why it\'s not suitable for databases but perfect for immutable data.',
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
