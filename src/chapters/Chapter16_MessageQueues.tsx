import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChapterProps { onProgress: (id: number) => void; onComplete: (id: number) => void; }

/* ── Message Delivery Animation ── */
function DeliveryDemo() {
  const [mode, setMode] = useState<'at-most' | 'at-least' | 'exactly'>('at-least');
  const [step, setStep] = useState(0);

  const scenarios = {
    'at-most': { steps: ['Producer sends msg', 'Broker receives', 'Consumer processes', 'If ACK lost → message is NOT redelivered', '⚠️ Message may be lost'], color: '#f59e0b' },
    'at-least': { steps: ['Producer sends msg', 'Broker receives', 'Consumer processes', 'If ACK lost → Broker redelivers', '⚠️ Consumer sees duplicate — must be idempotent'], color: '#0ea5e9' },
    'exactly': { steps: ['Producer sends with idempotence key', 'Broker deduplicates', 'Consumer processes', 'Offset committed atomically', '✅ Exactly-once (transactional)'], color: '#10b981' },
  };
  const s = scenarios[mode];
  useEffect(() => { const t = setInterval(() => setStep(p => (p + 1) % (s.steps.length + 1)), 1000); return () => clearInterval(t); }, [mode]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['at-most', 'at-least', 'exactly'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setStep(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${mode === m ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
            style={mode === m ? { backgroundColor: scenarios[m].color } : {}}>
            {m === 'at-most' ? 'At-Most-Once' : m === 'at-least' ? 'At-Least-Once' : 'Exactly-Once'}
          </button>
        ))}
      </div>
      <div className="space-y-1.5">
        {s.steps.map((st, i) => (
          <motion.div key={`${mode}-${i}`}
            animate={{ opacity: i < step ? 1 : 0.15 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
            style={{ backgroundColor: i < step ? `${s.color}11` : 'transparent' }}>
            <span className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: i < step ? s.color : '#d1d5db' }}>{i + 1}</span>
            <span className="text-gray-700 dark:text-gray-300">{st}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Kafka Partition Visualizer ── */
function KafkaPartitionViz() {
  const [messages, setMessages] = useState<{ partition: number; offset: number }[]>([
    { partition: 0, offset: 0 }, { partition: 1, offset: 0 }, { partition: 2, offset: 0 },
    { partition: 0, offset: 1 }, { partition: 2, offset: 1 }, { partition: 1, offset: 1 },
    { partition: 0, offset: 2 },
  ]);

  const addMessage = () => {
    const partition = Math.floor(Math.random() * 3);
    const maxOffset = messages.filter(m => m.partition === partition).length;
    setMessages(prev => [...prev, { partition, offset: maxOffset }]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={addMessage} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all">
          + Produce Message
        </button>
        <span className="text-[10px] text-gray-500">Messages are distributed across partitions by key hash</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map(p => (
          <div key={p} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Partition {p}</div>
            <div className="flex flex-wrap gap-1">
              {messages.filter(m => m.partition === p).map((m, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-7 h-7 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono flex items-center justify-center border border-indigo-200 dark:border-indigo-700">
                  {m.offset}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Chapter16_MessageQueues({ onProgress, onComplete }: ChapterProps) {
  useEffect(() => { onProgress(16); const t = setTimeout(() => onComplete(16), 12000); return () => clearTimeout(t); }, []);
  const fadeUp = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-14">
      <motion.div {...fadeUp}>
        <div className="text-xs font-mono text-indigo-500 uppercase tracking-widest mb-1">Chapter 15</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📬 Message Queues</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Decoupling services with asynchronous messaging — pub/sub, delivery guarantees, and backpressure.</p>
      </motion.div>

      {/* Why Queues */}
      <motion.section {...fadeUp} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">🧠 Why Message Queues Are Fundamental</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Without queues, Service A calls Service B directly (synchronous). If Service B is down or slow, Service A fails too. This creates <strong className="text-gray-800 dark:text-gray-200">tight coupling</strong> — the entire system is only as reliable as its weakest link.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          A message queue is like a <strong className="text-gray-800 dark:text-gray-200">postal mailbox between services</strong>. Service A drops a letter (message) into the mailbox and walks away — it doesn't wait for Service B to read it. Service B checks the mailbox at its own pace. Even if Service B goes down for an hour, the messages pile up safely in the mailbox and get processed when it comes back.
        </p>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          This pattern is so important that nearly every large-scale system uses it. Amazon processes orders via SQS queues. Netflix uses Kafka for event streaming. Uber uses Kafka for trip events. Any system design that involves <em>asynchronous processing</em> (sending emails, processing payments, generating notifications) should use a queue.
        </p>
      </motion.section>

      {/* Benefits Grid */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">1</span>
          Core Benefits of Asynchronous Messaging
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: '🔗 Decoupling', desc: 'Producer and consumer don\'t know about each other. You can replace, scale, or redeploy either side independently. This is the #1 benefit — it enables independent team velocity.' },
              { name: '📊 Load Leveling (Buffering)', desc: 'During traffic spikes (Black Friday), the queue absorbs the burst. Consumers process at a steady rate. Without a queue, your servers would crash under the spike.' },
              { name: '🔄 Reliable Retry + DLQ', desc: 'If a consumer fails processing a message, the broker automatically retries. After N failures, the message goes to a Dead Letter Queue (DLQ) for manual inspection — never lost.' },
              { name: '📡 Fan-out (Pub/Sub)', desc: 'One event → multiple consumers. When a user signs up, the "user-created" event triggers: welcome email, analytics tracking, fraud check, CRM update — all independently.' },
            ].map(b => (
              <div key={b.name} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">{b.name}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* P2P vs Pub/Sub */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">2</span>
          Point-to-Point vs Pub/Sub
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          These are two fundamental messaging patterns. The choice depends on whether you want <strong className="text-gray-800 dark:text-gray-200">one consumer per message</strong> (task distribution) or <strong className="text-gray-800 dark:text-gray-200">all consumers per message</strong> (event broadcasting).
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 mb-2">📨 Point-to-Point (Queue)</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Each message is consumed by exactly ONE consumer. Multiple consumers compete for messages, distributing the workload.</p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>→ <strong className="text-gray-800 dark:text-gray-200">One producer → one consumer</strong> per message</li>
              <li>→ Message removed after consumption (acknowledged)</li>
              <li>→ Multiple consumers = competing workers (parallel processing)</li>
              <li>→ <strong>Analogy:</strong> A ticket counter — each customer is served by ONE teller</li>
              <li className="text-indigo-600 font-semibold pt-1">Use: Task queues, job processing, order fulfillment</li>
              <li className="text-gray-500">Tools: SQS, RabbitMQ, Celery, BullMQ</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-2">📡 Pub/Sub (Topic)</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Each message is broadcast to ALL subscribers. Every subscriber gets a copy. Messages are retained for replay.</p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li>→ <strong className="text-gray-800 dark:text-gray-200">Publisher → all subscribers</strong> receive a copy</li>
              <li>→ Messages retained for a configurable period</li>
              <li>→ Consumers track their own offset/position</li>
              <li>→ <strong>Analogy:</strong> A radio broadcast — everyone tuned in hears the same thing</li>
              <li className="text-indigo-600 font-semibold pt-1">Use: Event streaming, CDC, analytics, notifications</li>
              <li className="text-gray-500">Tools: Kafka, SNS, Google Pub/Sub, Redis Streams</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Delivery Guarantees */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">3</span>
          Delivery Guarantees — The Hardest Problem
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          In a distributed system, networks can fail at any point. After a consumer processes a message, the acknowledgment (ACK) might get lost. This creates a dilemma: <strong className="text-gray-800 dark:text-gray-200">did the consumer process it or not?</strong> The broker can't know. This is why exactly-once delivery is so hard — it requires cooperation between producer, broker, AND consumer.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <DeliveryDemo />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Guarantee</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Risk</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Use Case</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Impl. Complexity</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
              <tr><td className="py-2 pr-4 font-semibold text-amber-600">At-Most-Once</td><td>Message loss</td><td>Metrics, logs, analytics (losing one data point is OK)</td><td className="text-emerald-500">Simple — fire and forget</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-blue-600">At-Least-Once</td><td>Duplicate processing</td><td>Most apps — but consumers MUST be idempotent</td><td>Moderate — need ACK + retry logic</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-emerald-600">Exactly-Once</td><td>Performance overhead</td><td>Payments, inventory — where duplicates are catastrophic</td><td className="text-red-500">Hard — needs transactional consumer</td></tr>
            </tbody>
          </table>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>🎯 The practical answer:</strong> Use <strong>at-least-once delivery + idempotent consumers</strong>. This means designing your consumer so that processing the same message twice has no additional effect. Example: use a unique transaction ID — if the payment was already processed with that ID, skip it. This is how Stripe, Amazon, and most production systems handle it.
          </p>
        </div>
      </motion.section>

      {/* Kafka Architecture */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">4</span>
          Kafka Architecture Deep Dive
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
          Apache Kafka is the most popular distributed event streaming platform. It handles <strong className="text-gray-800 dark:text-gray-200">trillions of events per day</strong> at companies like LinkedIn, Netflix, and Uber. Understanding its architecture is essential for system design interviews.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { term: 'Topic', def: 'A named category/feed of messages. Like a database table. Producers write to topics, consumers read from them. Example: "order-events", "user-signups".' },
              { term: 'Partition', def: 'Each topic is split into ordered, append-only partitions. This is how Kafka achieves parallelism — more partitions = more consumers can read concurrently.' },
              { term: 'Offset', def: 'A sequential position number within a partition. Like a bookmark. Each consumer group tracks its offset independently, enabling replay from any point.' },
              { term: 'Consumer Group', def: 'A logical group of consumers. Each partition is assigned to exactly one consumer in the group, preventing duplicate processing while enabling parallelism.' },
              { term: 'Replication Factor', def: 'Number of copies of each partition across brokers. RF=3 means the data exists on 3 different servers. One is the leader (handles reads/writes), others are followers.' },
              { term: 'Broker', def: 'A single Kafka server in the cluster. A production cluster typically has 3-12 brokers. Each broker stores leaders + follower replicas of various partitions.' },
            ].map(k => (
              <div key={k.term} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="font-semibold text-indigo-600 dark:text-indigo-400">{k.term}</div>
                <div className="text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{k.def}</div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">🔧 Interactive: Kafka Partition Visualizer</h3>
          <KafkaPartitionViz />
        </div>
      </motion.section>

      {/* When to Use What */}
      <motion.section {...fadeUp} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">5</span>
          Kafka vs SQS vs RabbitMQ — Decision Guide
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Feature</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">Kafka</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">SQS</th>
              <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300 text-xs">RabbitMQ</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-xs text-gray-600 dark:text-gray-400">
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Model</td><td>Log-based pub/sub</td><td>Queue (point-to-point)</td><td>Both (queue + exchange)</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Ordering</td><td className="text-emerald-600 font-semibold">Per-partition</td><td>Best-effort (FIFO option)</td><td>Per-queue</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Replay</td><td className="text-emerald-600 font-semibold">✅ Yes (offset reset)</td><td className="text-red-500">❌ No</td><td className="text-red-500">❌ No</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Throughput</td><td className="text-emerald-600 font-semibold">Millions/sec</td><td>Moderate</td><td>Moderate</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Ops complexity</td><td className="text-red-500">High (Zookeeper/KRaft)</td><td className="text-emerald-600 font-semibold">None (managed)</td><td>Moderate</td></tr>
              <tr><td className="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Best for</td><td className="font-semibold text-indigo-600">Event streaming, CDC, logs</td><td className="font-semibold">Task queues (AWS)</td><td className="font-semibold">Flexible routing</td></tr>
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Interview Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6">
        <h3 className="text-base font-bold text-indigo-800 dark:text-indigo-300 mb-3">🎯 Interview Key Points</h3>
        <ul className="space-y-2">
          {[
            'Default to at-least-once delivery with idempotent consumers. This handles 95% of use cases and is simplest to reason about.',
            'Kafka for event streaming (high throughput, replay, ordering). SQS for task queues (managed, simple, per-message ACK). RabbitMQ for complex routing patterns.',
            'Message ordering: Kafka guarantees order within a partition. To order all messages for a user, use user_id as partition key (all that user\'s events go to the same partition).',
            'Dead Letter Queue (DLQ): Messages that fail N retries go to a separate DLQ for manual inspection. NEVER drop messages silently in production.',
            'Backpressure: When consumers are slow, the queue grows. Monitor queue depth. Autoscale consumers based on lag. If lag is catastrophic, consider sampling non-critical messages.',
            'Idempotency key pattern: Consumer stores processed message IDs in a DB. Before processing, check if ID already exists. If yes, skip. This makes at-least-once behave like exactly-once.',
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
