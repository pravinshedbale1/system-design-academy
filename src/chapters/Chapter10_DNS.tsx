import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps { onProgress: (id: number) => void; onComplete: (id: number) => void; }

/* ── DNS Resolution Animation ── */
function DNSResolver() {
  const [step, setStep] = useState(0);
  const steps = [
    { from: 'Browser', to: 'Local Cache', label: '1. Check browser/OS cache', color: '#6366f1', found: false },
    { from: 'Browser', to: 'Recursive Resolver', label: '2. Query ISP\'s recursive resolver', color: '#8b5cf6', found: false },
    { from: 'Resolver', to: 'Root Server', label: '3. Ask root server: "Who handles .com?"', color: '#ef4444', found: false },
    { from: 'Resolver', to: 'TLD Server (.com)', label: '4. Ask .com TLD: "Who handles google.com?"', color: '#f59e0b', found: false },
    { from: 'Resolver', to: 'Auth NS (Google)', label: '5. Ask Google\'s nameserver: "What is google.com?"', color: '#10b981', found: true },
    { from: 'Resolver', to: 'Browser', label: '6. Return IP: 142.250.190.46 (cached with TTL)', color: '#0ea5e9', found: true },
  ];
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 7), 1400); return () => clearInterval(t); }, []);

  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <motion.div key={i}
          animate={{ opacity: i <= step ? 1 : 0.15, x: i <= step ? 0 : -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg"
          style={{ backgroundColor: i <= step ? `${s.color}11` : 'transparent' }}>
          <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: s.color }}>{i + 1}</span>
          <div className="flex-1 text-xs text-gray-700 dark:text-gray-300">{s.label}</div>
          {i <= step && s.found && <span className="text-emerald-500 text-xs font-semibold">✅ Found</span>}
        </motion.div>
      ))}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        Full resolution takes ~100ms uncached. With caching at each layer, most queries resolve in &lt;1ms.
      </div>
    </div>
  );
}

export default function Chapter10_DNS({ onProgress, onComplete }: ChapterProps) {
  useEffect(() => { onProgress(10); const t = setTimeout(() => onComplete(10), 12000); return () => clearTimeout(t); }, []);
  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-14">
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 9</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🗺️ DNS Deep Dive</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">How domain names resolve to IP addresses — the backbone of every internet request.</p>
      </motion.div>

      {/* DNS Resolution */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          DNS Resolution Flow
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">When you type google.com, here's what happens before a single byte of HTML is fetched:</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <DNSResolver />
        </div>
      </motion.section>

      {/* DNS Record Types */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          DNS Record Types
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Record</th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Purpose</th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Example</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
                <tr><td className="py-2 pr-4 font-mono font-semibold text-indigo-600">A</td><td className="py-2 pr-4">Maps domain to IPv4</td><td className="py-2 pr-4 font-mono">google.com → 142.250.190.46</td></tr>
                <tr><td className="py-2 pr-4 font-mono font-semibold text-indigo-600">AAAA</td><td className="py-2 pr-4">Maps domain to IPv6</td><td className="py-2 pr-4 font-mono">google.com → 2607:f8b0:4004</td></tr>
                <tr><td className="py-2 pr-4 font-mono font-semibold text-indigo-600">CNAME</td><td className="py-2 pr-4">Alias to another domain</td><td className="py-2 pr-4 font-mono">www.google.com → google.com</td></tr>
                <tr><td className="py-2 pr-4 font-mono font-semibold text-indigo-600">MX</td><td className="py-2 pr-4">Mail server</td><td className="py-2 pr-4 font-mono">google.com → alt1.gmail-smtp-in</td></tr>
                <tr><td className="py-2 pr-4 font-mono font-semibold text-indigo-600">NS</td><td className="py-2 pr-4">Authoritative nameserver</td><td className="py-2 pr-4 font-mono">google.com → ns1.google.com</td></tr>
                <tr><td className="py-2 pr-4 font-mono font-semibold text-indigo-600">TXT</td><td className="py-2 pr-4">Metadata (SPF, DKIM, etc.)</td><td className="py-2 pr-4 font-mono">v=spf1 include:_spf.google.com</td></tr>
                <tr><td className="py-2 pr-4 font-mono font-semibold text-indigo-600">SRV</td><td className="py-2 pr-4">Service discovery</td><td className="py-2 pr-4 font-mono">_grpc._tcp.api.example.com</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>

      {/* TTL & Caching */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          TTL & DNS Caching
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-gray-800 dark:text-gray-200">TTL (Time To Live)</strong> controls how long a DNS response is cached. Setting it correctly is a critical operational decision:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
              <div className="font-semibold text-amber-700 dark:text-amber-400 text-sm mb-1">High TTL (24h–72h)</div>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                <li>✅ Fewer DNS lookups → faster page loads</li>
                <li>✅ Less load on nameservers</li>
                <li>❌ Slow failover if server IP changes</li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
              <div className="font-semibold text-blue-700 dark:text-blue-400 text-sm mb-1">Low TTL (30s–300s)</div>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                <li>✅ Fast failover — switch IPs in seconds</li>
                <li>✅ Enables blue-green deployments</li>
                <li>❌ More DNS queries → higher latency</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Pro tip:</strong> Before a migration, lower TTL to 60s a week in advance. After migration completes, raise it back to 3600s (1h).
          </p>
        </div>
      </motion.section>

      {/* GeoDNS */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          GeoDNS & DNS-Based Load Balancing
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white">🧠 How GeoDNS Works</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            GeoDNS returns different IP addresses based on the client's geographic location. This routes users to the nearest data center for lower latency.
          </p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { region: '🇺🇸 US East', ip: '34.102.136.104', dc: 'us-east-1' },
              { region: '🇪🇺 Europe', ip: '35.190.247.13', dc: 'eu-west-1' },
              { region: '🇯🇵 Asia-Pacific', ip: '35.186.168.28', dc: 'ap-northeast-1' },
            ].map(r => (
              <div key={r.region} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="font-semibold text-gray-800 dark:text-gray-200">{r.region}</div>
                <div className="font-mono text-indigo-600 dark:text-indigo-400">{r.ip}</div>
                <div className="text-gray-500 dark:text-gray-400">→ {r.dc}</div>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-3 border border-indigo-200 dark:border-indigo-800">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              <strong>DNS-based load balancing</strong> methods: Round-robin (rotate IPs), Weighted (e.g., 70% to primary, 30% to secondary), Latency-based (Route 53), Failover (health check → switch to backup IP).
            </p>
          </div>
        </div>
      </motion.section>

      {/* Interview Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h3>
        <ul className="space-y-2">
          {[
            'DNS is hierarchical: Browser cache → OS cache → Resolver → Root → TLD → Authoritative. Each layer caches with TTL.',
            'Use CNAME records to alias subdomains to load balancers or CDNs (e.g., cdn.example.com → d1234.cloudfront.net).',
            'GeoDNS routes users to the nearest data center. Combined with Anycast (same IP announced from multiple locations), this is how CDNs achieve <50ms latency globally.',
            'Pre-migration checklist: Lower TTL to 60s → Wait for old TTL to expire → Make the change → Verify → Raise TTL back.',
            'DNS is a single point of failure. Use multiple NS providers (e.g., Route 53 + Cloudflare). Always have at least 2 NS records.',
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
