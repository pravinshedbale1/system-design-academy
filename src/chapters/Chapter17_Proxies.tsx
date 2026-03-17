import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps { onProgress: (id: number) => void; }

/* ── Interactive Proxy Flow Diagram ── */
function ProxyFlowDiagram() {
  const [mode, setMode] = useState<'forward' | 'reverse'>('reverse');
  const forwardSteps = [
    { label: '👤 Client', x: 30, color: '#6366f1' },
    { label: '🛡️ Forward Proxy', x: 200, color: '#f59e0b' },
    { label: '🌐 Internet', x: 370, color: '#10b981' },
    { label: '🖥️ Server', x: 530, color: '#ef4444' },
  ];
  const reverseSteps = [
    { label: '👤 Client', x: 30, color: '#6366f1' },
    { label: '🌐 Internet', x: 170, color: '#10b981' },
    { label: '🛡️ Reverse Proxy', x: 330, color: '#f59e0b' },
    { label: '🖥️ Servers', x: 510, color: '#0ea5e9' },
  ];
  const steps = mode === 'forward' ? forwardSteps : reverseSteps;
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['forward', 'reverse'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${mode === m ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
            {m === 'forward' ? '➡️ Forward Proxy' : '⬅️ Reverse Proxy'}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 620 70" className="w-full">
        {steps.slice(0, -1).map((s, i) => (
          <motion.line key={i} x1={s.x + 55} y1={35} x2={steps[i + 1].x - 5} y2={35}
            stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4,3"
            markerEnd="url(#arrow)"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: i * 0.2, duration: 0.4 }} />
        ))}
        <defs><marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#9ca3af" /></marker></defs>
        {steps.map((s, i) => (
          <g key={i}>
            <motion.rect x={s.x} y={12} width={mode === 'forward' ? 100 : (i === 3 ? 90 : 100)} height={36} rx="8"
              fill={`${s.color}18`} stroke={s.color} strokeWidth="1.5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.15 }} />
            <motion.text x={s.x + (i === 3 && mode === 'reverse' ? 45 : 50)} y={35} textAnchor="middle" fontSize="10" fontWeight="600" fill={s.color}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.15 + 0.1 }}>
              {s.label}
            </motion.text>
          </g>
        ))}
      </svg>
      <div className="text-xs text-center text-gray-500 dark:text-gray-400 leading-relaxed">
        {mode === 'forward'
          ? 'Forward proxy: Client sends requests TO the proxy. The proxy forwards them to the internet. Server sees the proxy\'s IP, not the client\'s. Used for anonymity, content filtering, and corporate firewalls.'
          : 'Reverse proxy: Client sends requests to what it thinks is the server. The reverse proxy intercepts and routes to the actual backend servers. Client never knows about the internal topology.'}
      </div>
    </div>
  );
}

export default function Chapter17_Proxies({ onProgress }: ChapterProps) {
  useEffect(() => { onProgress(17); }, []);
  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 16</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🛡️ Proxies & API Gateway</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Forward vs reverse proxy, API gateway patterns, service mesh, and the sidecar model.</p>
      </motion.div>

      {/* What is a Proxy */}
      <motion.section {...fadeUp} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 What Is a Proxy?</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          A proxy is a <strong className="text-gray-800 dark:text-gray-200">middleman</strong> that sits between two parties (client and server) and intercepts traffic between them. Think of it like a receptionist at an office: visitors (clients) don't walk directly to the employee (server) — they check in at the front desk (proxy) first. The receptionist can verify identity, redirect visitors, or even answer simple questions without bothering the employee.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          In system design, proxies are <strong className="text-gray-800 dark:text-gray-200">everywhere</strong>. Every production system uses at least one. They handle security (TLS termination, authentication), performance (caching, compression), reliability (load balancing, retries), and observability (logging, metrics). A reverse proxy like Nginx or AWS ALB is the first thing drawn in any architecture diagram.
        </p>
      </motion.section>

      {/* Forward vs Reverse */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          Forward vs Reverse Proxy
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          The key difference is <strong className="text-gray-800 dark:text-gray-200">who the proxy is protecting</strong>. A forward proxy protects <em>clients</em> (hides their identity from servers). A reverse proxy protects <em>servers</em> (hides their identity from clients). In system design interviews, you'll almost always be talking about reverse proxies.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <ProxyFlowDiagram />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">➡️ Forward Proxy</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Sits between <strong>client</strong> and internet. The client explicitly configures its traffic to go through the proxy. The destination server only sees the proxy's IP address.</p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Anonymity:</strong> Hides client identity (VPN, Tor)</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Content filtering:</strong> Corporate firewalls block social media</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Caching:</strong> Caches frequently accessed websites for the whole office</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Geo-bypass:</strong> Access region-locked content</li>
              <li className="text-indigo-600 dark:text-indigo-400 font-semibold pt-1">Examples: Squid, corporate proxy, VPN services</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">⬅️ Reverse Proxy</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Sits between internet and <strong>servers</strong>. The client doesn't know it exists — it thinks it's talking directly to the server. This is the standard in production systems.</p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Load balancing:</strong> Distributes requests across backend servers</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">TLS termination:</strong> Decrypts HTTPS. Backends receive plain HTTP</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">DDoS protection:</strong> Rate limiting, IP blocking</li>
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Response caching:</strong> Serves cached responses for static content</li>
              <li className="text-indigo-600 dark:text-indigo-400 font-semibold pt-1">Examples: Nginx, HAProxy, Cloudflare, AWS ALB/NLB</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* API Gateway */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          API Gateway — The Microservices Front Door
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          An API Gateway is a <strong className="text-gray-800 dark:text-gray-200">specialized reverse proxy</strong> designed specifically for microservices architectures. Without a gateway, mobile/web clients would need to know about every internal service URL, handle authentication independently, and make multiple requests to different services for a single page load. The gateway centralizes all these concerns.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Think of it this way: without a gateway, a mobile app loading a product page might need to call <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">users.internal:8080</code>, <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">products.internal:8081</code>, and <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">reviews.internal:8082</code> separately. With a gateway, the app calls one endpoint: <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">api.myapp.com/product/123</code> — the gateway fans out internally, aggregates, and returns one response.
          </p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { name: '🔐 Authentication', desc: 'Validates JWT/OAuth tokens before forwarding to services. Centralizes auth logic — services don\'t need to verify tokens.' },
              { name: '⚡ Rate Limiting', desc: 'Throttles per-user, per-IP, or per-API-key requests. Protects downstream services from abuse and denial-of-service.' },
              { name: '🔀 Request Routing', desc: 'Routes /users to User Service, /orders to Order Service based on URL path, headers, or query parameters.' },
              { name: '🔄 Protocol Translation', desc: 'External: REST/HTTP (for web/mobile clients). Internal: gRPC (for efficiency). Gateway handles the conversion seamlessly.' },
              { name: '📊 Observability', desc: 'Centralized access logging, request metrics, latency tracking, and distributed tracing ID injection (X-Request-ID).' },
              { name: '📦 Response Aggregation', desc: 'Calls multiple backend services in parallel, combines responses into a single payload for the client (BFF pattern).' },
            ].map(f => (
              <div key={f.name} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="font-semibold text-gray-800 dark:text-gray-200">{f.name}</div>
                <p className="text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Popular tools: </strong>Kong (open-source, plugin-based), AWS API Gateway (managed, serverless), Apigee (Google, enterprise), Nginx + Lua, Envoy, Traefik (K8s-native)
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>⚠️ Anti-pattern — Smart Gateway:</strong> Don't put business logic in the gateway. It should only handle cross-cutting concerns (auth, rate limiting, routing). If you start writing "if product type is X, then call service Y" logic in the gateway, you've created a <em>monolith gateway</em> that becomes a bottleneck and deployment risk.
          </p>
        </div>
      </motion.section>

      {/* Service Mesh */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          Service Mesh & Sidecar Pattern
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          An API Gateway handles <strong className="text-gray-800 dark:text-gray-200">north-south traffic</strong> (client → server). But what about <strong className="text-gray-800 dark:text-gray-200">east-west traffic</strong> (service → service)? When you have 50+ microservices calling each other, you need mutual TLS, retries, circuit breaking, and tracing between every pair. A service mesh handles this transparently by deploying a <strong className="text-gray-800 dark:text-gray-200">sidecar proxy</strong> alongside every service.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The "sidecar" analogy: imagine a motorcycle (your service) with a sidecar attached (proxy). The passenger in the sidecar handles all communication — answering the phone, checking maps, negotiating with toll booths — while the driver focuses purely on driving (business logic). The sidecar proxy (typically Envoy) intercepts ALL incoming and outgoing traffic from the service, handling networking concerns without the service code being aware.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">What the Sidecar Handles:</h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                <li>→ <strong className="text-gray-800 dark:text-gray-200">mTLS</strong> — Mutual TLS between every service pair. Zero-trust networking.</li>
                <li>→ <strong className="text-gray-800 dark:text-gray-200">Load balancing</strong> — Client-side LB with retries, timeouts, circuit breaking</li>
                <li>→ <strong className="text-gray-800 dark:text-gray-200">Observability</strong> — Automatic distributed tracing, request metrics, access logs</li>
                <li>→ <strong className="text-gray-800 dark:text-gray-200">Traffic management</strong> — Canary deployments (send 5% to v2), blue-green routing</li>
                <li>→ <strong className="text-gray-800 dark:text-gray-200">Access control</strong> — Policy: "Only Order Service can call Payment Service"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Two-Layer Architecture:</h4>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Data Plane', desc: 'Sidecar proxies (Envoy) deployed alongside each service instance. Handles actual traffic. Runs per-pod in Kubernetes.', color: '#0ea5e9' },
                  { label: 'Control Plane', desc: 'Central brain (e.g., Istiod) that configures all sidecars. Pushes routing rules, certificates, and policies to every Envoy instance.', color: '#8b5cf6' },
                ].map(p => (
                  <div key={p.label} className="rounded-lg p-3" style={{ backgroundColor: `${p.color}11` }}>
                    <span className="font-bold" style={{ color: p.color }}>{p.label}: </span>
                    <span className="text-gray-600 dark:text-gray-400">{p.desc}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <strong>Tools:</strong> Istio (most popular, uses Envoy), Linkerd (simpler, Rust-based proxy), Consul Connect (HashiCorp), AWS App Mesh
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>🎯 When NOT to use a service mesh:</strong> If you have fewer than ~10 microservices, a service mesh adds unnecessary complexity. Start with simple HTTP clients with retry logic. Consider a mesh when you need mTLS everywhere, canary deployments, or deep observability across many services.
          </p>
        </div>
      </motion.section>

      {/* Nginx vs Envoy */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Nginx vs Envoy — When to Use Which
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          These are the two most common proxy choices. Nginx dominates simple setups and static serving. Envoy dominates service mesh and cloud-native environments.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Feature</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Nginx</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Envoy</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Config model</td><td>Static files (nginx.conf), reload needed</td><td className="text-emerald-600 font-semibold">Dynamic — hot-reload via xDS API</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">gRPC support</td><td>Basic</td><td className="text-emerald-600 font-semibold">Native, first-class</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Observability</td><td>Access logs only</td><td className="text-emerald-600 font-semibold">Built-in metrics, tracing, access logs</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Service discovery</td><td className="text-red-500">❌ Manual upstream config</td><td className="text-emerald-600 font-semibold">✅ Dynamic via EDS API</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Best for</td><td className="font-semibold">Simple web serving, edge proxy</td><td className="font-semibold text-indigo-600">Service mesh sidecar, cloud-native</td></tr>
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* When to use what */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          Decision Framework
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">Use this mental model to pick the right tool for the traffic pattern:</p>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>→ <strong className="text-gray-800 dark:text-gray-200">"I have a monolith and need TLS + static serving"</strong> → <strong className="text-indigo-600">Nginx</strong></p>
            <p>→ <strong className="text-gray-800 dark:text-gray-200">"I need to distribute traffic across servers"</strong> → <strong className="text-indigo-600">Load Balancer (ALB/NLB)</strong></p>
            <p>→ <strong className="text-gray-800 dark:text-gray-200">"I have microservices with external clients"</strong> → <strong className="text-indigo-600">API Gateway</strong></p>
            <p>→ <strong className="text-gray-800 dark:text-gray-200">"I have 50+ services calling each other and need mTLS + canary"</strong> → <strong className="text-indigo-600">Service Mesh</strong></p>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">⚠️ Don't over-engineer: Start with Nginx → add API Gateway when you go microservices → add Service Mesh when you have scale.</p>
        </div>
      </motion.section>

      {/* TLS Termination */}
      <motion.section {...fadeUp} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">🔐 TLS Termination — A Critical Pattern</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          In production, you <strong className="text-gray-800 dark:text-gray-200">terminate TLS at the reverse proxy</strong>, not at each application server. This means the proxy handles decryption (HTTPS → HTTP) and forwards plain HTTP internally. Why? Three reasons:
        </p>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">🔑 Simplified cert management</div>
            <p className="text-gray-600 dark:text-gray-400">Manage certificates in ONE place (the proxy) instead of on every application server.</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">⚡ Reduced CPU load</div>
            <p className="text-gray-600 dark:text-gray-400">TLS encryption/decryption is CPU-intensive. Offloading it to the proxy frees app servers to handle business logic.</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">🔍 L7 inspection</div>
            <p className="text-gray-600 dark:text-gray-400">The proxy can inspect HTTP headers (for routing, rate limiting) only if it terminates TLS.</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">Note: Internal traffic is plain HTTP, which is acceptable within a secure VPC/network. For zero-trust networks, use mTLS between all services (this is what service mesh provides).</p>
      </motion.section>

      {/* Interview Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h3>
        <ul className="space-y-2">
          {[
            'Always draw a reverse proxy / load balancer between clients and your application servers in any architecture diagram. This is the default starting point.',
            'API Gateway = reverse proxy + auth + rate limiting + routing + aggregation. Use it when you adopt microservices and need a single external entry point.',
            'Service mesh adds a sidecar proxy to every service pod. It solves cross-cutting concerns (mTLS, retries, tracing, canary routing) without changing application code. Consider it at 50+ services.',
            'TLS termination at the edge: Clients → HTTPS → Reverse Proxy → HTTP → Internal services. This simplifies cert management and reduces CPU load on app servers.',
            'Nginx for simple setups and static content. Envoy for cloud-native environments with gRPC, dynamic config, and service mesh. Don\'t over-engineer — start simple and evolve.',
            'North-south traffic (client ↔ server) goes through the API Gateway. East-west traffic (service ↔ service) goes through the service mesh. Both are proxies, different scope.',
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
