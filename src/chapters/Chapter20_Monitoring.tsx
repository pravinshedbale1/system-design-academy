import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps { onProgress: (id: number) => void; }

/* ── SLO Budget Calculator ── */
function SLOCalc() {
  const [nines, setNines] = useState(3);
  const vals: Record<number, { pct: string; down: string; mo: string }> = {
    1: { pct: '90%', down: '36.5 days/yr', mo: '72h/mo' },
    2: { pct: '99%', down: '3.65 days/yr', mo: '7.3h/mo' },
    3: { pct: '99.9%', down: '8.77h/yr', mo: '43.8 min/mo' },
    4: { pct: '99.99%', down: '52.6 min/yr', mo: '4.38 min/mo' },
    5: { pct: '99.999%', down: '5.26 min/yr', mo: '26.3 sec/mo' },
  };
  const v = vals[nines];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nines:</label>
        <input type="range" min={1} max={5} value={nines} onChange={e => setNines(Number(e.target.value))} className="flex-1 accent-indigo-500" />
        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-lg">{v.pct}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
          <div className="text-xs text-gray-500">Yearly downtime</div>
          <div className="font-mono font-bold text-sm text-red-500">{v.down}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
          <div className="text-xs text-gray-500">Monthly downtime</div>
          <div className="font-mono font-bold text-sm text-amber-600">{v.mo}</div>
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
        Each additional "nine" is ~10× harder and more expensive to achieve. Going from 99.9% to 99.99% requires fundamentally different architecture (multi-region, automated failover, chaos engineering).
      </div>
    </div>
  );
}

export default function Chapter20_Monitoring({ onProgress }: ChapterProps) {
  useEffect(() => { onProgress(20); }, []);
  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 19</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📊 Monitoring & Observability</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Three pillars of observability, SLI/SLO/SLA, and alerting strategies.</p>
      </motion.div>

      {/* Why Monitoring */}
      <motion.section {...fadeUp} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 Why Observability Is Non-Negotiable</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          "You can't fix what you can't see." In a monolith, you could SSH into a server, tail logs, and debug. But in a distributed system with 50+ microservices across multiple regions, a single request might touch 10 different services. <strong className="text-gray-800 dark:text-gray-200">Without observability, debugging is like finding a needle in a haystack — blindfolded.</strong>
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          <strong className="text-gray-800 dark:text-gray-200">Monitoring vs Observability:</strong> Monitoring tells you <em>when</em> something is wrong (dashboard turns red). Observability tells you <em>why</em> it's wrong (you can ask arbitrary questions about your system's state). A system is "observable" when you can understand its internal state from its external outputs (logs, metrics, traces).
        </p>
      </motion.section>

      {/* Three Pillars */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          Three Pillars of Observability
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          You need ALL three pillars working together. Metrics tell you something is wrong, logs tell you what happened, and traces tell you where in the chain it happened. Missing any one of these creates blind spots.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Logs', icon: '📝', desc: 'Discrete timestamped events. Answer "What happened?" Use structured JSON format (not plaintext) so they are queryable. Always include: timestamp, service_name, request_id, user_id, level, message.', tools: 'ELK Stack (Elasticsearch + Logstash + Kibana), Grafana Loki, CloudWatch Logs', color: '#6366f1', tip: 'Never log PII (emails, credit cards). Rotate and expire old logs to control costs.' },
            { name: 'Metrics', icon: '📈', desc: 'Numeric measurements over time. Answer "How much?" Two key frameworks: RED (Rate, Errors, Duration) for services. USE (Utilization, Saturation, Errors) for infrastructure (CPU, memory, disk).', tools: 'Prometheus + Grafana (gold standard), Datadog, CloudWatch Metrics', color: '#10b981', tip: 'Track P50, P95, P99 latency — not averages. Averages hide tail latency that destroys user experience.' },
            { name: 'Traces', icon: '🔗', desc: 'End-to-end path of a request across services. Answer "Where in the chain is it slow?" A trace is a tree of spans — each span represents one service call with timing data.', tools: 'Jaeger, Zipkin, OpenTelemetry (standard), AWS X-Ray', color: '#f59e0b', tip: 'Inject trace_id at the API gateway, propagate through all service calls via headers.' },
          ].map(p => (
            <div key={p.name} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
              <h3 className="font-bold text-sm" style={{ color: p.color }}>{p.icon} {p.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{p.desc}</p>
              <div className="text-[10px] text-gray-500"><strong>Tools:</strong> {p.tools}</div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 italic">💡 {p.tip}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* SLI/SLO/SLA */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          SLI / SLO / SLA — The Reliability Framework
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          These three concepts form a hierarchy: <strong className="text-gray-800 dark:text-gray-200">SLIs are what you measure, SLOs are your internal targets, SLAs are external contracts with customers</strong>. Google popularized this framework. In interviews, showing that you think about reliability in terms of SLOs demonstrates mature engineering thinking.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
              <div className="font-bold text-indigo-600 mb-1">SLI (Service Level Indicator)</div>
              <p className="text-gray-600 dark:text-gray-400">The metric you measure. A quantitative measurement of a specific aspect of service quality.</p>
              <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Example: "P99 response latency = 150ms"</p>
            </div>
            <div className="rounded-xl p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <div className="font-bold text-emerald-600 mb-1">SLO (Service Level Objective)</div>
              <p className="text-gray-600 dark:text-gray-400">Your internal target for the SLI. Tighter than your SLA to provide a safety margin.</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Example: "P99 {'<'} 200ms for 99.9% of requests"</p>
            </div>
            <div className="rounded-xl p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="font-bold text-red-600 mb-1">SLA (Service Level Agreement)</div>
              <p className="text-gray-600 dark:text-gray-400">External contract with customers. Breach triggers consequences (service credits, refunds).</p>
              <p className="text-red-600 dark:text-red-400 font-semibold mt-1">Example: "99.9% uptime or 10% credit"</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800 text-xs text-gray-700 dark:text-gray-300">
            <strong>Error Budget:</strong> If your SLO is 99.9% uptime, you have 0.1% "error budget" per month (~43.8 minutes). Teams can "spend" this budget on deploying risky changes. When the budget is burned, freeze deployments and focus on reliability. This creates a balanced incentive between shipping features and maintaining stability.
          </div>
        </div>
      </motion.section>

      {/* SLO Calculator */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          Interactive: SLO Budget Calculator
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">Drag the slider to see how much downtime each "nines" level allows. Notice how dramatically the budget shrinks with each additional nine.</p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <SLOCalc />
        </div>
      </motion.section>

      {/* Alerting */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Alerting Best Practices
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          Bad alerting is worse than no alerting — it creates <strong className="text-gray-800 dark:text-gray-200">alert fatigue</strong>. When on-call engineers get 200 alerts per night, they start ignoring them. Good alerting is actionable, symptom-based, and tiered by severity.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { rule: '🎯 Alert on Symptoms', desc: 'Alert on user-facing impact: "Response time > 500ms" or "Error rate > 1%". NOT on causes: "CPU > 80%" (who cares if CPU is high but users are happy?).' },
              { rule: '🪟 Multi-Window Alerting', desc: 'Use short + long windows to avoid noise: "Error > 1% for 5min AND > 0.5% for 1hr." This catches real incidents while ignoring brief spikes.' },
              { rule: '🚦 Severity Tiers', desc: 'P1 (Critical): Page on-call immediately. P2 (High): Create ticket, fix in 24h. P3 (Low): Log only, investigate next sprint. P4: Dashboard only.' },
              { rule: '📋 Runbooks', desc: 'Every alert links to a runbook with: diagnosis steps, remediation actions, escalation path. On-call should never have to "figure it out" at 3 AM.' },
            ].map(a => (
              <div key={a.rule} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="font-semibold text-gray-800 dark:text-gray-200">{a.rule}</div>
                <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Observability Stack */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          Common Observability Stacks
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Stack</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Components</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Best For</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Prometheus + Grafana</td><td>Prometheus (metrics), Grafana (dashboards), Alertmanager (alerts)</td><td className="text-emerald-600 font-semibold">K8s-native, open-source, industry standard</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">ELK Stack</td><td>Elasticsearch (storage), Logstash (pipeline), Kibana (visualization)</td><td>Log aggregation and full-text search</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Grafana LGTM</td><td>Loki (logs), Grafana (viz), Tempo (traces), Mimir (metrics)</td><td className="text-indigo-600 font-semibold">All 3 pillars in one platform (modern choice)</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Datadog / New Relic</td><td>Fully managed SaaS — metrics, logs, traces, APM</td><td>Teams that don't want to manage infra</td></tr>
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Interview Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h3>
        <ul className="space-y-2">
          {[
            'Three pillars: Logs (what happened), Metrics (how much), Traces (where in the chain). You need all three for true observability.',
            'Error budget = (1 - SLO) × time period. When burned, freeze deploys and focus on reliability. This creates healthy tension between feature velocity and stability.',
            'RED for services (Rate, Errors, Duration). USE for infrastructure (Utilization, Saturation, Errors). These frameworks ensure you measure what matters.',
            'Distributed tracing with OpenTelemetry: inject trace_id at the API gateway → propagate through all downstream calls via headers → visualize in Jaeger/Zipkin.',
            'Alert on symptoms, not causes. "5xx rate > 1% for 5 minutes" is actionable. "CPU > 80%" is not (CPU might be high during a normal batch job).',
            'Every structured log line should include: timestamp, service_name, request_id, user_id, severity, message. This enables correlation across services.',
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
