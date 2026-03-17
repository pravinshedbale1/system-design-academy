import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps { onProgress: (id: number) => void; }

/* ── Circuit Breaker State Machine ── */
function CircuitBreaker() {
  const [state, setState] = useState<'closed' | 'open' | 'half-open'>('closed');
  const [failures, setFailures] = useState(0);
  const threshold = 3;

  const simulateCall = (success: boolean) => {
    if (state === 'open') return;
    if (success) {
      if (state === 'half-open') { setState('closed'); setFailures(0); }
    } else {
      const f = failures + 1;
      setFailures(f);
      if (f >= threshold) setState('open');
    }
  };

  const tryReset = () => { setState('half-open'); setFailures(0); };

  const colors = { closed: '#10b981', open: '#ef4444', 'half-open': '#f59e0b' };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="px-4 py-2 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: colors[state] }}>
          State: {state.toUpperCase()}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">Failures: {failures}/{threshold}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => simulateCall(true)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">✅ Success Call</button>
        <button onClick={() => simulateCall(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">❌ Failed Call</button>
        {state === 'open' && <button onClick={tryReset} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">🔄 Try Half-Open</button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
        {[
          { s: 'CLOSED', desc: 'Normal operation. Requests pass through. Failure counter tracks errors.', from: 'Failures < threshold' },
          { s: 'OPEN', desc: 'All requests immediately fail-fast. No calls to the downstream service.', from: `Failures ≥ ${threshold}` },
          { s: 'HALF-OPEN', desc: 'Allow one test request. Success → CLOSED. Failure → OPEN again.', from: 'After timeout expires' },
        ].map(x => (
          <div key={x.s} className={`rounded-xl p-2.5 border ${state === x.s.toLowerCase() ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="font-semibold text-gray-800 dark:text-gray-200">{x.s}</div>
            <div className="text-gray-500 dark:text-gray-400 mt-0.5">{x.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Chapter18_Microservices({ onProgress }: ChapterProps) {
  useEffect(() => { onProgress(18); }, []);
  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-14">
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 17</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🏗️ Microservices Architecture</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Service decomposition, circuit breakers, saga pattern, and when monolith is actually better.</p>
      </motion.div>

      {/* Why Microservices */}
      <motion.section {...fadeUp} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 The Core Idea Behind Microservices</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          A monolith is like a <strong className="text-gray-800 dark:text-gray-200">single giant restaurant kitchen</strong> where everyone — chefs, bakers, sushi makers — shares the same stove, fridge, and counter space. When the restaurant is small, this works great. But as you grow, people bump into each other, one broken oven stops everyone, and you can't easily add more sushi stations without expanding the entire kitchen.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Microservices split that kitchen into <strong className="text-gray-800 dark:text-gray-200">independent food stations</strong>: a sushi bar, a grill station, a bakery. Each has its own equipment, staff, and menu. They communicate by sending orders (messages) to each other. If the grill goes down, the sushi bar keeps serving. You can upgrade the bakery's oven without touching the grill.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          However, this independence comes at a cost: <strong className="text-gray-800 dark:text-gray-200">coordination becomes harder</strong>. You need a system to route orders between stations, handle failures, and ensure the final meal is complete. This is why microservices require infrastructure: API gateways, service discovery, circuit breakers, message queues, and distributed tracing.
        </p>
      </motion.section>

      {/* Monolith vs Microservices */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          Monolith vs Microservices — Honest Comparison
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          The industry has over-hyped microservices. The truth is: <strong className="text-gray-800 dark:text-gray-200">most startups should start with a monolith</strong>. Microservices make sense when your organization needs independent team autonomy. It's an organizational pattern as much as a technical one.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">🏢 Monolith</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>✅ Simple to develop, test, and deploy — one repo, one CI/CD pipeline</li>
              <li>✅ Local function calls (no network latency between components)</li>
              <li>✅ Easy debugging — single process, single stack trace</li>
              <li>✅ ACID transactions are straightforward (one database)</li>
              <li>❌ Scaling requires scaling EVERYTHING (can't scale just the payment module)</li>
              <li>❌ One team's bug can crash the entire system</li>
              <li>❌ Technology lock-in — one language, one framework</li>
              <li>❌ Large codebase becomes hard to reason about over time</li>
              <li className="text-indigo-600 font-semibold pt-1">Best for: Startups, &lt;10 engineers, MVP, iterating quickly</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">🧩 Microservices</h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>✅ Independent scaling per service (scale only what's hot)</li>
              <li>✅ Independent deployment — teams ship without coordinating</li>
              <li>✅ Technology diversity — each team picks the best tool</li>
              <li>✅ Fault isolation — one service failure doesn't crash everything</li>
              <li>❌ Network complexity — every call can fail, timeout, or be slow</li>
              <li>❌ Data consistency is HARD (no cross-service ACID transactions)</li>
              <li>❌ Operational overhead — K8s, service mesh, observability, CI/CD per service</li>
              <li>❌ Distributed debugging is painful (need distributed tracing)</li>
              <li className="text-indigo-600 font-semibold pt-1">Best for: &gt;50 engineers, clear team boundaries, different scaling needs</li>
            </ul>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>🎯 The right answer in interviews:</strong> "I'd start with a well-structured monolith using clean module boundaries. As the team grows and scaling needs diverge, I'd extract hot-path modules into independent services. This is what Amazon, Netflix, and Airbnb all did — they didn't start with microservices."
          </p>
        </div>
      </motion.section>

      {/* Decomposition Strategies */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          How to Decompose — Service Boundaries
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          The hardest part of microservices isn't the technology — it's <strong className="text-gray-800 dark:text-gray-200">deciding where to draw the boundaries</strong>. Get this wrong, and you'll have chatty services that constantly call each other (distributed monolith). Get it right, and each service is autonomous.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {[
              { name: '🏢 By Business Domain (DDD)', desc: 'Align services with business capabilities: Order Service, Payment Service, Inventory Service. Each owns its data. This is the recommended approach — inspired by Domain-Driven Design (DDD) bounded contexts.' },
              { name: '📊 By Data Ownership', desc: 'Each service owns its own database. No shared databases. If Service A needs Service B\'s data, it calls an API. This prevents coupling at the data layer.' },
              { name: '⚖️ By Scaling Needs', desc: 'If the search component needs 10x more compute than the user profile component, separate them. Scale independently based on actual load.' },
              { name: '👥 By Team Ownership', desc: 'Conway\'s Law: system architecture mirrors organizational structure. One team owns one service. This is often the strongest signal for where boundaries should be.' },
            ].map(s => (
              <div key={s.name} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="font-semibold text-gray-800 dark:text-gray-200">{s.name}</div>
                <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Circuit Breaker */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          Interactive: Circuit Breaker Pattern
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          When Service A calls Service B and B is down, A's threads pile up waiting for timeouts — eventually A crashes too. This is a <strong className="text-gray-800 dark:text-gray-200">cascading failure</strong>. The circuit breaker prevents this by "tripping" after a threshold of failures, causing all subsequent calls to <strong className="text-gray-800 dark:text-gray-200">fail immediately</strong> (fast-fail) instead of waiting. It's named after electrical circuit breakers — they trip to prevent a house fire.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <CircuitBreaker />
        </div>
      </motion.section>

      {/* Saga Pattern */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Saga Pattern — Distributed Transactions
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          In a monolith, you wrap multiple operations in a database transaction — if any step fails, everything rolls back. But in microservices, <strong className="text-gray-800 dark:text-gray-200">there's no cross-service transaction</strong>. Each service has its own database. The Saga pattern solves this by breaking the transaction into a sequence of <strong className="text-gray-800 dark:text-gray-200">local transactions</strong>, each with a compensating (undo) action.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-gray-800 dark:text-gray-200">Example — E-commerce Order:</strong> If payment fails at step 3, the saga runs compensating actions backward: release inventory (step 2 undo) and cancel order (step 1 undo).
          </p>
          <div className="space-y-1">
            {[
              { step: '1. Create Order', compensate: 'Cancel Order', service: 'Order Service' },
              { step: '2. Reserve Inventory', compensate: 'Release Inventory', service: 'Inventory Service' },
              { step: '3. Charge Payment', compensate: 'Refund Payment', service: 'Payment Service' },
              { step: '4. Schedule Delivery', compensate: 'Cancel Delivery', service: 'Delivery Service' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 text-xs">
                <span className="text-emerald-600 font-semibold flex-shrink-0 w-36">{s.step}</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-500 dark:text-gray-400 flex-1">{s.service}</span>
                <span className="text-gray-400">|</span>
                <span className="text-red-500 flex-shrink-0">⟲ {s.compensate}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
              <div className="font-semibold text-blue-700 dark:text-blue-400 mb-1">Choreography (Event-Driven)</div>
              <div className="text-gray-600 dark:text-gray-400">Each service emits events, and the next service reacts. No central coordinator. Simple for 2-3 services, but becomes a tangled web with more. Debugging is hard — no single place to see the saga's state.</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
              <div className="font-semibold text-purple-700 dark:text-purple-400 mb-1">Orchestration (Coordinator)</div>
              <div className="text-gray-600 dark:text-gray-400">A central "saga orchestrator" service directs each step, handles failures, and triggers compensations. Easier to monitor and debug. The orchestrator is a single point of failure (needs HA).</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Resilience Patterns */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          Key Resilience Patterns
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {[
              { name: '⚡ Circuit Breaker', desc: 'After N failures, stop calling the downstream service. Fast-fail instead of waiting. Prevents cascading failures.', tool: 'Resilience4j, Hystrix, Envoy' },
              { name: '🚢 Bulkhead', desc: 'Isolate resources into pools (like ship compartments). A slow payment service shouldn\'t exhaust threads for the user service.', tool: 'Thread pools, connection pools' },
              { name: '🔄 Retry with Backoff', desc: 'Retry failed requests with exponential backoff + jitter. Prevents thundering herd when a service recovers.', tool: 'Built into most HTTP clients' },
              { name: '⏱️ Timeout', desc: 'Set aggressive timeouts on every external call. A hanging request is worse than a failed one — it consumes resources silently.', tool: 'P99 latency × 2 is a good baseline' },
            ].map(p => (
              <div key={p.name} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="font-semibold text-gray-800 dark:text-gray-200">{p.name}</div>
                <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{p.desc}</p>
                <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-1">{p.tool}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Service Discovery */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">6</span>
          Service Discovery
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          In microservices, service instances are ephemeral — they start, stop, move, and scale dynamically. Hardcoding IP addresses doesn't work. <strong className="text-gray-800 dark:text-gray-200">Service discovery</strong> is the mechanism that lets services find each other dynamically.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {[
              { name: 'Client-Side Discovery', desc: 'Client queries a service registry (e.g., Eureka, Consul) for available instances, then load-balances locally. The client is aware of all instances.', ex: 'Netflix Eureka + Ribbon' },
              { name: 'Server-Side Discovery', desc: 'Client sends to a load balancer or DNS name. The infrastructure (K8s Service, AWS ALB) routes to a healthy instance. Client is unaware of individual instances.', ex: 'Kubernetes Service, AWS ALB, Consul Connect' },
            ].map(d => (
              <div key={d.name} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="font-semibold text-gray-800 dark:text-gray-200">{d.name}</div>
                <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{d.desc}</p>
                <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-1">{d.ex}</p>
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
            '"Start with a monolith and extract services only when you have clear team/scaling boundaries." This is the correct answer 90% of the time in interviews.',
            'Circuit breaker prevents cascading failures. After N failures, fast-fail for a timeout period, then probe with a single request (half-open state).',
            'Saga for distributed transactions: each step has a compensating action. Choreography for 2-3 services, orchestration for complex multi-step flows.',
            'Bulkhead pattern: isolate services into resource pools (like ship compartments). If one pool is exhausted, others continue functioning.',
            'Key decomposition question: "Can this component scale independently? Does a different team own it? Does it have a different failure mode?" If yes → good microservice boundary.',
            'Always mention distributed tracing (Jaeger, Zipkin) — without it, debugging across 50 services is impossible. Every request gets a unique trace ID.',
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
