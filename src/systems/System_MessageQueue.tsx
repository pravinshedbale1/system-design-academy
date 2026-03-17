import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable, KeyValueGrid } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems[6]; // Kafka

function KafkaTopicVisual() {
  const [producing, setProducing] = useState(false);
  const [offsets, setOffsets] = useState([0, 0, 0]);
  const [messages, setMessages] = useState<number[]>([1, 2, 3, 4, 5]);
  const partitionColors = ['#6366f1', '#0ea5e9', '#10b981'];

  function produce() {
    if (producing) return;
    setProducing(true);
    setMessages(m => [...m, m.length + 1]);
    setTimeout(() => setProducing(false), 600);
  }

  function consume(partition: number) {
    setOffsets(prev => {
      const next = [...prev];
      next[partition] = Math.min(next[partition] + 1, 4);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[0, 1, 2].map(p => (
          <div key={p}>
            <div className="text-center text-xs font-semibold mb-2" style={{ color: partitionColors[p] }}>
              Partition {p}
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  className="flex-1 h-10 rounded border-2 flex items-center justify-center text-xs font-mono font-bold"
                  style={{
                    borderColor: partitionColors[p],
                    backgroundColor: i < offsets[p] ? `${partitionColors[p]}33` : `${partitionColors[p]}11`,
                    color: partitionColors[p],
                    opacity: i < offsets[p] ? 0.5 : 1,
                  }}
                  animate={{ scale: (p * 5 + i) === messages.length - 1 && producing ? [1, 1.15, 1] : 1 }}
                >
                  {p * 5 + i + 1}
                </motion.div>
              ))}
            </div>
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              Offset: {offsets[p]} consumed
            </div>
            <button onClick={() => consume(p)}
              className="w-full mt-1 py-1 text-xs font-medium rounded-lg transition-colors"
              style={{ backgroundColor: `${partitionColors[p]}22`, color: partitionColors[p], border: `1px solid ${partitionColors[p]}` }}>
              Consume +1
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={produce}
          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors">
          📤 Produce Message
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Messages are appended to partitions (append-only log). Consumers track their own offset — they can replay historical messages.
      </p>
    </div>
  );
}

export default function S07_MessageQueue({ onProgress }: SystemPageProps) {
  useEffect(() => {
    onProgress(77);  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Scale Estimation">
        <KeyValueGrid items={[
          { label: 'Messages/day (LinkedIn)', value: '7 trillion' },
          { label: 'Throughput', value: '>1M msgs/sec per broker' },
          { label: 'Retention', value: '7 days (log compaction)' },
          { label: 'Replication factor', value: '3 (1 leader + 2 followers)', color: 'text-emerald-600' },
        ]} />
      </Section>

      <Section step={2} title="Interactive: Kafka Topics & Partitions"
        note="Produce messages and consume them per partition. Note that consumers track their own offset independently.">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <KafkaTopicVisual />
        </div>
      </Section>

      <Section step={3} title="Core Architecture Concepts">
        <TheoryBox title="Why Kafka is Different from RabbitMQ" icon="⚡">
          <CompareTable
            headers={['Feature', 'Kafka', 'RabbitMQ']}
            rows={[
              ['Storage', 'Durable append-only log', 'Messages deleted after consumption'],
              ['Consumers', 'Each group tracks own offset', 'Message deleted from queue on ack'],
              ['Replay', 'Yes — seek to any offset', 'No — gone once consumed'],
              ['Throughput', '>1M msg/sec', '~100K msg/sec'],
              ['Use case', 'Event streaming, audit log, analytics', 'Task queues, RPC, transient messages'],
            ]}
          />
        </TheoryBox>
        <TheoryBox title="Consumer Groups for Horizontal Scale" icon="👥">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Multiple consumers in a group share the partition workload. Each partition is consumed by exactly one consumer in a group. Add more consumers to scale horizontally — but never more than the number of partitions.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 font-mono text-xs">
            <div className="text-indigo-600 dark:text-indigo-400">// Partition assignment</div>
            <div className="text-gray-600 dark:text-gray-400">3 partitions + 3 consumers → 1 partition/consumer ✓</div>
            <div className="text-gray-600 dark:text-gray-400">3 partitions + 2 consumers → 1 consumer gets 2 partitions</div>
            <div className="text-gray-600 dark:text-gray-400">3 partitions + 5 consumers → 2 consumers are idle! ✗</div>
          </div>
        </TheoryBox>
      </Section>

      <InterviewTips tips={[
        'At-least-once delivery is Kafka\'s default. For exactly-once, use idempotent producers (enable.idempotence=true) + transactional APIs.',
        'Partition count determines max parallelism. Set it high (e.g., 100) upfront — reducing partitions later requires rebalancing, which is painful.',
        'Use compacted topics for "latest state" semantics (e.g., user profile updates). Kafka retains only the latest message per key.',
        'Consumer lag (offset behind producer) is your key metric — alert when lag grows. It means consumers are slower than producers.',
        'Kafka is NOT a database and NOT suitable as a request-response system. Use it for event streaming, audit logs, data pipelines.',
      ]} />
    </div>
  );
}
