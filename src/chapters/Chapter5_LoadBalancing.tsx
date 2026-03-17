import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps {
  onProgress: (id: number) => void;
  onComplete: (id: number) => void;
}

const algorithms = [
  {
    id: 'round-robin',
    name: 'Round Robin',
    description: 'Requests are distributed sequentially across servers in order. Simple and effective when servers have similar capacity.',
    when: 'Best for stateless services with uniform request costs.',
    pros: ['Simple to implement', 'Even distribution over time'],
    cons: ['Ignores server load', 'Bad for long-lived sessions'],
  },
  {
    id: 'least-connections',
    name: 'Least Connections',
    description: 'New requests go to the server with the fewest active connections. Adapts dynamically to server load.',
    when: 'Best when requests have highly variable processing times.',
    pros: ['Adapts to real load', 'Prevents server overload'],
    cons: ['Requires connection tracking', 'More complex'],
  },
  {
    id: 'ip-hash',
    name: 'IP Hash',
    description: 'Client IP is hashed to always route to the same server. Enables sticky sessions without shared state.',
    when: 'Best for apps that aren\'t fully stateless yet.',
    pros: ['Session affinity', 'Consistent routing'],
    cons: ['Uneven if IPs are concentrated', 'Fails if server goes down'],
  },
  {
    id: 'weighted',
    name: 'Weighted Round Robin',
    description: 'Each server gets a weight. Higher-weight servers receive proportionally more requests.',
    when: 'Best when servers have different hardware capacities.',
    pros: ['Accounts for capacity differences', 'Flexible'],
    cons: ['Requires manual weight tuning'],
  },
];

function RequestAnimation({ algorithm }: { algorithm: string }) {
  const [active, setActive] = useState(0); // which server the current request hits
  const [requestIdx, setRequestIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [loads, setLoads] = useState([0, 0, 0]);

  const numServers = 3;

  const getTarget = () => {
    if (algorithm === 'round-robin' || algorithm === 'weighted') {
      return requestIdx % numServers;
    }
    if (algorithm === 'least-connections') {
      return loads.indexOf(Math.min(...loads));
    }
    if (algorithm === 'ip-hash') {
      return requestIdx % 2 === 0 ? 0 : 2; // simulate same IP always hits same server
    }
    return 0;
  };

  const fireRequest = () => {
    if (animating) return;
    const target = getTarget();
    setActive(target);
    setAnimating(true);
    setRequestIdx(r => r + 1);
    const newLoads = [...loads];
    newLoads[target] = Math.min(newLoads[target] + 1, 10);
    setLoads(newLoads);
    setTimeout(() => setAnimating(false), 800);
    setTimeout(() => {
      setLoads(prev => {
        const l = [...prev];
        l[target] = Math.max(l[target] - 1, 0);
        return l;
      });
    }, 2000);
  };

  useEffect(() => {
    const interval = setInterval(fireRequest, 1000);
    return () => clearInterval(interval);
  }, [algorithm, loads, requestIdx, animating]);

  return (
    <div className="relative flex items-center justify-between gap-4 py-4">
      {/* Users */}
      <div className="flex flex-col gap-3">
        {['👤', '👤', '👤', '👤'].map((u, i) => (
          <div key={i} className="text-xl w-8 text-center">{u}</div>
        ))}
      </div>

      {/* Animated dot */}
      {animating && (
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50 z-10"
          initial={{ left: '10%', top: '50%' }}
          animate={{ left: '55%', top: `${20 + active * 30}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      )}

      {/* Load Balancer */}
      <div className="bg-indigo-600 text-white rounded-xl px-4 py-6 text-center text-xs font-bold flex-shrink-0">
        <div className="text-xl mb-1">⚖️</div>
        Load<br />Balancer
      </div>

      {/* Second dot segment */}
      {animating && (
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 z-10"
          initial={{ left: '55%', top: `${20 + active * 30}%` }}
          animate={{ left: '75%', top: `${20 + active * 30}%` }}
          transition={{ duration: 0.3, delay: 0.5, ease: 'easeOut' }}
        />
      )}

      {/* Servers */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: numServers }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: animating && active === i ? 1.08 : 1,
              borderColor: animating && active === i ? '#10b981' : '#d1d5db',
            }}
            transition={{ duration: 0.2 }}
            className="border-2 rounded-xl px-4 py-2 text-center text-xs font-medium dark:border-gray-700 bg-white dark:bg-gray-800 transition-all"
          >
            <div className="text-base">🖥️</div>
            <div className="text-gray-600 dark:text-gray-400">Server {i + 1}</div>
            <div className={`text-xs font-mono mt-0.5 ${loads[i] > 5 ? 'text-red-500' : 'text-emerald-500'}`}>
              {loads[i]} conn
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function L4vsL7() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="text-indigo-600 dark:text-indigo-400 font-bold text-lg mb-1">L4 — Transport Layer</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">Routes based on IP + TCP/UDP port</div>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-emerald-500">✓</span>
            <span className="text-gray-600 dark:text-gray-400">Extremely fast (no packet inspection)</span>
          </div>
          <div className="flex gap-2">
            <span className="text-emerald-500">✓</span>
            <span className="text-gray-600 dark:text-gray-400">Works for any TCP/UDP protocol</span>
          </div>
          <div className="flex gap-2">
            <span className="text-red-500">✗</span>
            <span className="text-gray-600 dark:text-gray-400">Blind to content (URL, headers, cookies)</span>
          </div>
          <div className="flex gap-2">
            <span className="text-red-500">✗</span>
            <span className="text-gray-600 dark:text-gray-400">Cannot do path-based routing</span>
          </div>
        </div>
        <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-xs font-mono text-gray-600 dark:text-gray-400">
          Route: *.example.com:443 → Server Pool
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="text-purple-600 dark:text-purple-400 font-bold text-lg mb-1">L7 — Application Layer</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">Routes based on URL, headers, cookies</div>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-emerald-500">✓</span>
            <span className="text-gray-600 dark:text-gray-400">Path-based routing (/api vs /static)</span>
          </div>
          <div className="flex gap-2">
            <span className="text-emerald-500">✓</span>
            <span className="text-gray-600 dark:text-gray-400">Sticky sessions via cookie</span>
          </div>
          <div className="flex gap-2">
            <span className="text-emerald-500">✓</span>
            <span className="text-gray-600 dark:text-gray-400">SSL termination</span>
          </div>
          <div className="flex gap-2">
            <span className="text-red-500">✗</span>
            <span className="text-gray-600 dark:text-gray-400">More resource-intensive</span>
          </div>
        </div>
        <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-xs font-mono text-gray-600 dark:text-gray-400 space-y-1">
          <div>/api/* → API Servers</div>
          <div>/static/* → CDN</div>
        </div>
      </div>
    </div>
  );
}

export default function Chapter5({ onProgress, onComplete }: ChapterProps) {
  const [selectedAlgo, setSelectedAlgo] = useState(algorithms[0]);

  useEffect(() => {
    onProgress(5);  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">⚖️</span>
          <div>
            <div className="text-xs font-mono text-indigo-500 uppercase tracking-wider mb-1">Chapter 05</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Load Balancing</h1>
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
          A load balancer is the entry point of every horizontally scaled system. It distributes incoming requests across servers, provides fault tolerance, and enables zero-downtime deployments.
        </p>
      </div>

      {/* Core Theory */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 How Load Balancers Work</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Without a load balancer, you have a single server — a Single Point of Failure (SPOF). With a load balancer, you can run N servers and the LB distributes traffic, monitors health, and automatically removes failed servers from rotation.
        </p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            { step: '1', title: 'Request arrives', desc: 'Client sends request to your domain. DNS resolves to the load balancer\'s IP, not your server\'s IP.' },
            { step: '2', title: 'LB selects a server', desc: 'Based on the chosen algorithm (Round Robin, Least Connections, etc.) the LB forwards the request to a healthy backend server.' },
            { step: '3', title: 'Response returns', desc: 'The backend server sends its response back through the LB (or directly to the client with DSR). LB updates connection counts.' },
          ].map(s => (
            <div key={s.step} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center mb-2">{s.step}</div>
              <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-1">{s.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Health Checks — How the LB Knows a Server is Dead</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {[
              { type: 'TCP Health Check', desc: 'Simply checks that the port is open. Fast, but doesn\'t verify the app is actually working. Good for basic availability.' },
              { type: 'HTTP Health Check', desc: 'Makes an HTTP request to /health and checks for a 200 response. The /health endpoint should verify DB connectivity, memory pressure, etc.' },
              { type: 'Active Health Check', desc: 'LB actively probes each server every N seconds. If 3 consecutive probes fail, the server is marked unhealthy and removed from rotation.' },
            ].map(h => (
              <div key={h.type} className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                <div className="font-semibold text-indigo-700 dark:text-indigo-300 text-xs mb-1">{h.type}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{h.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <div className="font-semibold text-amber-700 dark:text-amber-300 mb-1">The Sticky Sessions Problem</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sticky sessions (routing a user always to the same server) seem convenient for stateful apps, but they break load balancing (one server gets overloaded) and fail spectacularly when that server dies — all users on it lose their sessions. The correct solution is always to externalize state to Redis/a database and make servers stateless.
          </p>
        </div>
      </section>

      {/* Algorithm Comparison */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Interactive: Algorithm Comparison</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Each algorithm has different trade-offs. Round Robin is the default for homogeneous servers. Least Connections is better for workloads with variable request durations. IP Hash enables soft sticky sessions without state.
        </p>
        <div className="flex flex-wrap gap-2 mb-5">
          {algorithms.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedAlgo(a)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                selectedAlgo.id === a.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <RequestAnimation algorithm={selectedAlgo.id} />
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAlgo.description}</p>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{selectedAlgo.when}</p>
            <div className="flex gap-6">
              <div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Pros</div>
                {selectedAlgo.pros.map(p => <div key={p} className="text-xs text-gray-500 dark:text-gray-400">✓ {p}</div>)}
              </div>
              <div>
                <div className="text-xs font-semibold text-red-500 mb-1">Cons</div>
                {selectedAlgo.cons.map(c => <div key={c} className="text-xs text-gray-500 dark:text-gray-400">✗ {c}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* L4 vs L7 */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">L4 vs L7 Load Balancing</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          L4 operates at the Transport Layer (TCP/UDP) — it routes packets without inspecting content. L7 operates at the Application Layer (HTTP) — it understands URLs, headers, and cookies, enabling intelligent routing decisions.
        </p>
        <L4vsL7 />
        <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-sm">
          <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Real-world usage:</div>
          <ul className="space-y-1 text-gray-600 dark:text-gray-400">
            <li>→ AWS ALB (Application LB) = L7, AWS NLB (Network LB) = L4</li>
            <li>→ Nginx, HAProxy, and Envoy can operate at both layers</li>
            <li>→ Most production systems use L7 for HTTP services and L4 for raw TCP (databases, gRPC, WebSockets)</li>
          </ul>
        </div>
      </section>

      {/* Interview Tips */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h2 className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>The load balancer itself can become a SPOF. Mention active-passive LB pairs or DNS-level load balancing (Route 53 health checks) for high availability.</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>For API gateway scenarios (different paths to different microservices), always use L7. For a raw TCP multiplexer (e.g., routing to database replicas), L4 is simpler and faster.</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Zero-downtime deployments work because the LB can be configured to drain connections from a server before taking it out of rotation — allowing running requests to finish.</li>
          <li className="flex gap-2"><span className="text-indigo-500 flex-shrink-0">→</span>Mention that modern service meshes (Istio, Linkerd) implement load balancing at the sidecar proxy level, enabling mTLS, circuit breaking, and detailed per-service metrics.</li>
        </ul>
      </section>
    </div>
  );
}
