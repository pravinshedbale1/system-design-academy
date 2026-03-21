import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems.find(s => s.id === 15)!;

function DiscordMessageFlowDiagram() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: 'User sends message via WebSocket', color: '#6366f1' },
    { label: 'Gateway publishes to Kafka (by channel_id)', color: '#8b5cf6' },
    { label: 'Message Service stores in Cassandra', color: '#0ea5e9' },
    { label: 'Fan-out Service finds online channel members', color: '#f59e0b' },
    { label: 'Redis Pub/Sub routes to target Gateways', color: '#10b981' },
    { label: 'Other users receive message in real-time', color: '#ef4444' },
  ];

  const nodes = [
    { id: 'userA', label: 'User A', x: 20, y: 100, color: '#6366f1', w: 65 },
    { id: 'gwA', label: 'Gateway A', x: 120, y: 100, color: '#8b5cf6', w: 75 },
    { id: 'kafka', label: 'Kafka', x: 230, y: 100, color: '#a855f7', w: 65 },
    { id: 'msgSvc', label: 'Msg Service', x: 330, y: 40, color: '#0ea5e9', w: 80 },
    { id: 'cassandra', label: 'Cassandra', x: 330, y: 170, color: '#64748b', w: 80 },
    { id: 'fanout', label: 'Fan-out Svc', x: 440, y: 100, color: '#f59e0b', w: 80 },
    { id: 'redis', label: 'Redis PubSub', x: 550, y: 100, color: '#10b981', w: 85 },
    { id: 'gwB', label: 'Gateway B', x: 550, y: 190, color: '#ef4444', w: 75 },
    { id: 'userB', label: 'User B', x: 650, y: 190, color: '#ef4444', w: 65 },
  ];
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  const flowEdges = [
    ['userA', 'gwA'], ['gwA', 'kafka'], ['kafka', 'msgSvc'],
    ['msgSvc', 'cassandra'], ['kafka', 'fanout'], ['fanout', 'redis'],
    ['redis', 'gwB'], ['gwB', 'userB'],
  ];

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <svg viewBox="0 0 740 240" className="w-full">
          <defs>
            <marker id="dc-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={steps[step].color} />
            </marker>
          </defs>
          {flowEdges.map(([a, b], i) => {
            const na = nodeMap[a]; const nb = nodeMap[b];
            const active = step >= i;
            const current = step === i;
            return (
              <motion.line key={`${a}-${b}`}
                x1={na.x + na.w / 2} y1={na.y + 20} x2={nb.x + nb.w / 2} y2={nb.y + 20}
                stroke={active ? steps[Math.min(i, steps.length - 1)].color : '#e5e7eb'}
                strokeWidth={current ? 2.5 : active ? 1.5 : 1}
                strokeDasharray="5 3" opacity={active ? (current ? 0.9 : 0.45) : 0.2}
                markerEnd={current ? 'url(#dc-ar)' : undefined}
                animate={active ? { strokeDashoffset: [0, -16] } : {}}
                transition={active ? { duration: 1.2, repeat: Infinity, ease: 'linear' } : {}}
              />
            );
          })}
          {nodes.map(n => {
            const idx = ['userA', 'gwA', 'kafka', 'msgSvc', 'cassandra', 'fanout', 'redis', 'gwB', 'userB'].indexOf(n.id);
            const active = step >= Math.max(0, Math.floor(idx * 0.75));
            const current = step === Math.floor(idx * 0.75);
            return (
              <g key={n.id}>
                {current && (
                  <motion.rect x={n.x - 3} y={n.y - 3} width={n.w + 6} height={46} rx="10"
                    fill="none" stroke={n.color} strokeWidth="1.5" opacity={0.3}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <rect x={n.x} y={n.y} width={n.w} height={40} rx="8"
                  fill={active ? `${n.color}22` : '#f9fafb'} stroke={active ? n.color : '#e5e7eb'}
                  strokeWidth={current ? 2 : active ? 1.5 : 1}
                  style={{ transition: 'all 0.3s ease' }}
                />
                <text x={n.x + n.w / 2} y={n.y + 24} textAnchor="middle" fontSize="8.5"
                  fontWeight="600" fill={active ? n.color : '#9ca3af'}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-sm text-center text-gray-600 dark:text-gray-400">
          <span style={{ color: steps[step].color }}>Step {step + 1}:</span> {steps[step].label}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function S15_Discord({ onProgress }: SystemPageProps) {
  useEffect(() => { onProgress(85); }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Requirements & Scale" note="Discord handles 150M+ MAU, 4B+ messages/day, millions of concurrent voice users.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TheoryBox title="Functional Requirements" icon="📋">
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>→ Real-time text messaging in channels</li>
              <li>→ Voice & video chat (WebRTC)</li>
              <li>→ Server → channels hierarchy</li>
              <li>→ User presence (online/offline/idle/DnD)</li>
              <li>→ Message history with search</li>
              <li>→ Role-based permissions per channel</li>
            </ul>
          </TheoryBox>
          <TheoryBox title="Scale Challenges" icon="⚡">
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>→ Messages: <span className="font-mono text-indigo-600">~50K/sec</span> sustained</li>
              <li>→ Concurrent WebSocket connections: <span className="font-mono text-indigo-600">10M+</span></li>
              <li>→ Large servers: <span className="font-mono text-indigo-600">1M+ members</span> (like Fortnite)</li>
              <li>→ Presence updates: <span className="font-mono text-indigo-600">millions/sec</span></li>
              <li>→ Voice: <span className="font-mono text-indigo-600">millions concurrent</span> (SFU)</li>
            </ul>
          </TheoryBox>
        </div>
      </Section>

      <Section step={2} title="Message System Architecture"
        note="Watch how a message flows from sender through the distributed system to all channel members.">
        <DiscordMessageFlowDiagram />
      </Section>

      <Section step={3} title="Data Storage">
        <CompareTable
          headers={['Data', 'Storage', 'Why']}
          rows={[
            ['Messages', 'Cassandra (partition: channel_id, cluster: message_id)', 'Ordered by time within channel. High write throughput. Discord migrated from MongoDB to Cassandra.'],
            ['User data & servers', 'PostgreSQL (sharded)', 'Relational data with ACID guarantees.'],
            ['Presence status', 'Redis (ephemeral)', 'In-memory with TTL. user_id → {status, last_seen}. Pub/Sub for broadcasts.'],
            ['Message search', 'Elasticsearch', 'Full-text search across message history.'],
            ['Voice state', 'In-memory on SFU servers', 'Real-time WebRTC routing, no persistence needed.'],
          ]}
        />
      </Section>

      <Section step={4} title="Presence & Voice">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TheoryBox title="Presence System" icon="🟢">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Heartbeat every 30s via WebSocket. If no heartbeat for 60s → mark offline. Store in Redis with TTL=60s. On status change, publish to all servers where the user's friends are connected. For large servers (1M+ members), only track presence for visible members in the user's channel list.
            </p>
          </TheoryBox>
          <TheoryBox title="Voice Architecture" icon="🎤">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Uses <strong>Selective Forwarding Unit (SFU)</strong> — each participant sends one stream to server, server forwards to all others. Much more efficient than mesh (P2P). For a 25-person voice channel: mesh = 600 streams, SFU = 50 streams. WebRTC for the actual media transport. ICE/STUN/TURN for NAT traversal.
            </p>
          </TheoryBox>
        </div>
      </Section>

      <InterviewTips tips={[
        'Discord uses WebSocket for real-time messaging. Each Gateway server handles 1M+ connections. Horizontally scaled with consistent hashing.',
        'Messages stored in Cassandra, partitioned by channel_id. This keeps all messages for a channel on the same partition for ordered reads.',
        'Presence is the hardest problem at Discord\'s scale. For servers with 1M+ members, lazy-load presence only for visible users.',
        'Voice uses SFU (not mesh P2P). This reduces bandwidth from O(n²) to O(n). Janus or Mediasoup as the SFU server.',
        'Discord migrated messages from MongoDB to Cassandra when they hit 100M+ stored messages. Cassandra handles their write-heavy workload better.',
      ]} />
    </div>
  );
}
