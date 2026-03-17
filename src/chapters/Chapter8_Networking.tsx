import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps {
  onProgress: (id: number) => void;
  onComplete: (id: number) => void;
}

/* ── Protocol Comparison Animation ── */
function ProtocolComparison() {
  const [proto, setProto] = useState<'http1' | 'http2' | 'ws'>('http1');
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 6), 800);
    return () => clearInterval(t);
  }, [proto]);

  const labels = {
    http1: ['GET /page', 'Response', 'GET /style.css', 'Response', 'GET /app.js', 'Response'],
    http2: ['Stream 1: /page', 'Stream 2: /style.css', 'Stream 3: /app.js', 'Response 1', 'Response 2', 'Response 3'],
    ws: ['Handshake ↑', 'Upgrade 101 ↓', 'Message ↑', 'Message ↓', 'Message ↑', 'Message ↓'],
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['http1', 'http2', 'ws'] as const).map(p => (
          <button key={p} onClick={() => { setProto(p); setStep(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${proto === p ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}>
            {p === 'http1' ? 'HTTP/1.1' : p === 'http2' ? 'HTTP/2' : 'WebSocket'}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 500 200" className="w-full">
        <rect x="30" y="30" width="80" height="35" rx="6" fill="#6366f122" stroke="#6366f1" strokeWidth="1.5" />
        <text x="70" y="52" textAnchor="middle" fontSize="10" fontWeight="600" fill="#6366f1">Client</text>
        <rect x="390" y="30" width="80" height="35" rx="6" fill="#10b98122" stroke="#10b981" strokeWidth="1.5" />
        <text x="430" y="52" textAnchor="middle" fontSize="10" fontWeight="600" fill="#10b981">Server</text>
        {labels[proto].slice(0, step + 1).map((label, i) => {
          const isClient = proto === 'ws' ? i % 2 === 0 : (proto === 'http1' ? i % 2 === 0 : i < 3);
          const yPos = 85 + i * 17;
          return (
            <g key={i}>
              <motion.line
                x1={isClient ? 70 : 430} y1={yPos} x2={isClient ? 430 : 70} y2={yPos}
                stroke={isClient ? '#6366f1' : '#10b981'} strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />
              <text x="250" y={yPos - 3} textAnchor="middle" fontSize="8" fill="#6b7280">{label}</text>
            </g>
          );
        })}
      </svg>
      <div className="text-xs text-center text-gray-500 dark:text-gray-400">
        {proto === 'http1' && 'HTTP/1.1: Sequential request-response pairs. Each request blocks until response arrives (head-of-line blocking).'}
        {proto === 'http2' && 'HTTP/2: Multiplexed streams over one TCP connection. All requests sent concurrently, responses arrive in any order.'}
        {proto === 'ws' && 'WebSocket: Full-duplex channel after initial handshake. Both sides push messages without polling.'}
      </div>
    </div>
  );
}

/* ── TLS Handshake Flow ── */
function TLSHandshake() {
  const [step, setStep] = useState(0);
  const steps = [
    { from: 'Client', to: 'Server', msg: 'Client Hello (TLS version, cipher suites, random)', color: '#6366f1' },
    { from: 'Server', to: 'Client', msg: 'Server Hello (chosen cipher, certificate, random)', color: '#10b981' },
    { from: 'Client', to: 'Server', msg: 'Key Exchange (pre-master secret encrypted with server pub key)', color: '#f59e0b' },
    { from: 'Both', to: 'Both', msg: '🔒 Session keys derived → Encrypted channel established', color: '#8b5cf6' },
  ];
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 5), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: i <= step ? 1 : 0.2, x: 0 }}
          className="flex items-center gap-3 p-2 rounded-lg"
          style={{ backgroundColor: i <= step ? `${s.color}11` : 'transparent' }}>
          <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: s.color }}>{i + 1}</span>
          <div className="text-xs">
            <span className="font-semibold" style={{ color: s.color }}>{s.from} → {s.to}</span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">{s.msg}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Chapter8_Networking({ onProgress, onComplete }: ChapterProps) {
  useEffect(() => {
    onProgress(8);
    const t = setTimeout(() => onComplete(8), 12000);
    return () => clearTimeout(t);
  }, []);

  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      {/* Header */}
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 7</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🌐 Networking Fundamentals</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">TCP vs UDP, HTTP evolution, TLS handshakes, and real-time communication protocols.</p>
      </motion.div>

      {/* TCP vs UDP */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          TCP vs UDP
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">Two transport layer protocols that underpin all internet communication. The choice between them is a fundamental design decision.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">📦 TCP (Transmission Control Protocol)</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Connection-oriented</strong> — 3-way handshake (SYN, SYN-ACK, ACK)</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Reliable delivery</strong> — retransmits lost packets, guarantees order</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Flow control</strong> — receiver advertises window size</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Congestion control</strong> — slow start, AIMD (Additive Increase Multiplicative Decrease)</li>
              <li className="text-indigo-600 dark:text-indigo-400 font-semibold mt-2">Use: HTTP, databases, file transfer, email</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">⚡ UDP (User Datagram Protocol)</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Connectionless</strong> — no handshake, fire-and-forget</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">No guarantees</strong> — packets can be lost, duplicated, or arrive out of order</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Low overhead</strong> — 8-byte header vs TCP's 20-byte header</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">No congestion control</strong> — app decides the sending rate</li>
              <li className="text-indigo-600 dark:text-indigo-400 font-semibold mt-2">Use: Video streaming, VoIP, DNS, gaming, IoT</li>
            </ul>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>🎯 Interview shortcut:</strong> "If I need <em>every byte to arrive in order</em> (e.g. bank transactions), TCP. If I need <em>speed over correctness</em> (e.g. live video — a dropped frame is fine), UDP."
          </p>
        </div>
      </motion.section>

      {/* HTTP Evolution */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          HTTP/1.1 → HTTP/2 → HTTP/3
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">The web's protocol has evolved dramatically. Each version solves a specific performance problem.</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <ProtocolComparison />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Feature</th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">HTTP/1.1</th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">HTTP/2</th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">HTTP/3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Transport</td><td className="py-2 pr-4">TCP</td><td className="py-2 pr-4">TCP</td><td className="py-2 pr-4 text-emerald-600 font-semibold">QUIC (UDP)</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Multiplexing</td><td className="py-2 pr-4 text-red-500">❌ No</td><td className="py-2 pr-4 text-emerald-500">✅ Yes</td><td className="py-2 pr-4 text-emerald-500">✅ Yes</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Head-of-line blocking</td><td className="py-2 pr-4 text-red-500">App + TCP level</td><td className="py-2 pr-4 text-amber-500">TCP level only</td><td className="py-2 pr-4 text-emerald-500">None</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Header compression</td><td className="py-2 pr-4 text-red-500">None</td><td className="py-2 pr-4">HPACK</td><td className="py-2 pr-4">QPACK</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Connection setup</td><td className="py-2 pr-4">1-3 RTT</td><td className="py-2 pr-4">1-3 RTT</td><td className="py-2 pr-4 text-emerald-600 font-semibold">0-1 RTT</td></tr>
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* TLS Handshake */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          TLS Handshake
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">Transport Layer Security (TLS) establishes an encrypted channel. TLS 1.3 reduces this to a single round trip.</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <TLSHandshake />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">🧠 Key Concepts</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>→ <strong className="text-gray-800 dark:text-gray-200">Asymmetric encryption</strong> (RSA/ECDH) used only for key exchange — too slow for data</li>
            <li>→ <strong className="text-gray-800 dark:text-gray-200">Symmetric encryption</strong> (AES-256-GCM) used for actual data — fast</li>
            <li>→ <strong className="text-gray-800 dark:text-gray-200">Certificate chain</strong>: Server cert → Intermediate CA → Root CA (trusted by browser)</li>
            <li>→ <strong className="text-gray-800 dark:text-gray-200">TLS 1.3</strong>: 1-RTT handshake (vs 2-RTT in TLS 1.2), removed insecure ciphers</li>
            <li>→ <strong className="text-gray-800 dark:text-gray-200">0-RTT resumption</strong>: Returning connections skip handshake using cached session tickets</li>
          </ul>
        </div>
      </motion.section>

      {/* Real-time Protocols */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Real-Time Communication
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">Three approaches to push data to clients. The right choice depends on your latency requirements and connection count.</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Long Polling', icon: '🔄', desc: 'Client makes HTTP request, server holds it open until data is available or timeout. Client immediately re-connects.', pros: 'Simple to implement, works everywhere', cons: 'Connection overhead per user, not truly real-time', use: 'Simple notifications, chat (fallback)' },
            { name: 'Server-Sent Events', icon: '📡', desc: 'Server pushes events over a single long-lived HTTP connection. One-directional: server → client only.', pros: 'Auto-reconnect, event IDs, simple', cons: 'Unidirectional, max ~6 connections/domain in HTTP/1.1', use: 'Live feeds, stock tickers, CI/CD logs' },
            { name: 'WebSocket', icon: '🔌', desc: 'Full-duplex bidirectional channel upgraded from HTTP. Both sides can push at any time.', pros: 'Bidirectional, low latency, binary frames', cons: 'Stateful connections, harder to scale (sticky sessions)', use: 'Chat, gaming, collaborative editing, trading' },
          ].map(p => (
            <div key={p.name} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 text-sm space-y-2">
              <h3 className="font-bold text-gray-900 dark:text-white">{p.icon} {p.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs">{p.desc}</p>
              <div className="text-xs"><span className="text-emerald-600 font-semibold">✅ </span><span className="text-gray-600 dark:text-gray-400">{p.pros}</span></div>
              <div className="text-xs"><span className="text-red-500 font-semibold">❌ </span><span className="text-gray-600 dark:text-gray-400">{p.cons}</span></div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Use: {p.use}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* OSI Quick Reference */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          OSI Model Quick Reference
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="space-y-1">
            {[
              { layer: '7 — Application', proto: 'HTTP, SMTP, DNS, FTP', color: '#6366f1' },
              { layer: '6 — Presentation', proto: 'TLS/SSL, JPEG, gzip', color: '#8b5cf6' },
              { layer: '5 — Session', proto: 'Sockets, session management', color: '#a855f7' },
              { layer: '4 — Transport', proto: 'TCP, UDP, QUIC', color: '#0ea5e9' },
              { layer: '3 — Network', proto: 'IP, ICMP, BGP', color: '#10b981' },
              { layer: '2 — Data Link', proto: 'Ethernet, Wi-Fi (802.11)', color: '#f59e0b' },
              { layer: '1 — Physical', proto: 'Cables, fiber, radio signals', color: '#ef4444' },
            ].map((l, i) => (
              <motion.div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2"
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                style={{ backgroundColor: `${l.color}11` }}>
                <span className="text-xs font-bold w-32" style={{ color: l.color }}>{l.layer}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">{l.proto}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>🎯 Interview tip:</strong> "In system design, you mainly operate at layers 4 (TCP/UDP choice) and 7 (HTTP, WebSocket, gRPC). Load balancers can operate at L4 (packet-level) or L7 (HTTP-aware) — the choice affects routing capabilities and performance."
          </p>
        </div>
      </motion.section>

      {/* Interview Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h3>
        <ul className="space-y-2">
          {[
            'TCP guarantees delivery and ordering (3-way handshake → data → FIN). Use for anything transactional.',
            'UDP is fire-and-forget: lower latency, no head-of-line blocking. Perfect for real-time audio/video where a dropped packet beats a delayed one.',
            'HTTP/2 multiplexing eliminates HTTP/1.1 head-of-line blocking at the application layer, but TCP head-of-line blocking remains. HTTP/3 (QUIC over UDP) solves both.',
            'WebSocket for bidirectional real-time (chat, gaming). SSE for server-push only (news feeds, dashboards). Long polling as a fallback where SSE/WS aren\'t supported.',
            'TLS 1.3 reduces handshake to 1 RTT and supports 0-RTT resumption. Always mention you\'d terminate TLS at the load balancer, not at each app server.',
          ].map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-indigo-500 flex-shrink-0">→</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
