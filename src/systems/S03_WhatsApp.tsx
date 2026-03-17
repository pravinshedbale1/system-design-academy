import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable, KeyValueGrid } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems[2]; // WhatsApp

function WebSocketFlow() {
  const [msgStep, setMsgStep] = useState(0);
  const steps = [
    { label: 'Alice types message', color: '#6366f1' },
    { label: 'Client sends over WebSocket', color: '#8b5cf6' },
    { label: 'Chat server A receives', color: '#0ea5e9' },
    { label: 'Stored in Cassandra', color: '#f59e0b' },
    { label: 'Bob is on server B → enqueue', color: '#10b981' },
    { label: 'Bob receives in real-time', color: '#ef4444' },
  ];

  useEffect(() => {
    const t = setInterval(() => setMsgStep(s => (s + 1) % steps.length), 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 600 240" className="w-full">
        {/* Alice phone */}
        <rect x="20" y="60" width="80" height="120" rx="12" fill="#6366f122" stroke="#6366f1" strokeWidth="1.5" />
        <text x="60" y="100" textAnchor="middle" fontSize="20">📱</text>
        <text x="60" y="115" textAnchor="middle" fontSize="10" fill="#6366f1" fontWeight="700">Alice</text>

        {/* Server A */}
        <rect x="200" y="40" width="80" height="50" rx="8" fill={msgStep >= 2 ? '#0ea5e922' : '#f3f4f6'} stroke={msgStep >= 2 ? '#0ea5e9' : '#d1d5db'} strokeWidth="1.5" />
        <text x="240" y="63" textAnchor="middle" fontSize="9" fill="#0ea5e9" fontWeight="700">Chat Server A</text>
        <text x="240" y="75" textAnchor="middle" fontSize="8" fill="#94a3b8">WebSocket pool</text>

        {/* Cassandra */}
        <ellipse cx="290" cy="155" rx="50" ry="22" fill={msgStep >= 3 ? '#f59e0b22' : '#f3f4f6'} stroke={msgStep >= 3 ? '#f59e0b' : '#d1d5db'} strokeWidth="1.5" />
        <text x="290" y="158" textAnchor="middle" fontSize="9" fill="#f59e0b" fontWeight="700">Cassandra</text>

        {/* Message Queue */}
        <rect x="350" y="40" width="70" height="50" rx="8" fill={msgStep >= 4 ? '#10b98122' : '#f3f4f6'} stroke={msgStep >= 4 ? '#10b981' : '#d1d5db'} strokeWidth="1.5" />
        <text x="385" y="64" textAnchor="middle" fontSize="9" fill="#10b981" fontWeight="700">Msg Queue</text>
        <text x="385" y="76" textAnchor="middle" fontSize="8" fill="#94a3b8">delivery</text>

        {/* Server B */}
        <rect x="440" y="40" width="80" height="50" rx="8" fill={msgStep >= 4 ? '#10b98122' : '#f3f4f6'} stroke={msgStep >= 4 ? '#10b981' : '#d1d5db'} strokeWidth="1.5" />
        <text x="480" y="63" textAnchor="middle" fontSize="9" fill="#10b981" fontWeight="700">Chat Server B</text>
        <text x="480" y="75" textAnchor="middle" fontSize="8" fill="#94a3b8">(Bob's server)</text>

        {/* Bob phone */}
        <rect x="500" y="120" width="80" height="100" rx="12" fill="#10b98122" stroke="#10b981" strokeWidth={msgStep >= 5 ? 2.5 : 1} />
        <text x="540" y="160" textAnchor="middle" fontSize="20">📱</text>
        <text x="540" y="175" textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="700">Bob</text>

        {/* Arrows */}
        {msgStep >= 1 && (
          <motion.path d="M 100 110 L 200 70" stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="4 2"
            animate={{ strokeDashoffset: [0, -12] }} transition={{ duration: 1, repeat: Infinity }} />
        )}
        {msgStep >= 2 && (
          <motion.path d="M 240 90 L 270 133" stroke="#0ea5e9" strokeWidth="2" fill="none" />
        )}
        {msgStep >= 3 && (
          <motion.path d="M 310 135 L 360 70" stroke="#f59e0b" strokeWidth="2" fill="none" />
        )}
        {msgStep >= 4 && (
          <motion.path d="M 420 65 L 440 65" stroke="#10b981" strokeWidth="2" fill="none" />
        )}
        {msgStep >= 5 && (
          <motion.path d="M 480 90 L 530 133" stroke="#10b981" strokeWidth="2" fill="none"
            animate={{ opacity: [0, 1] }} />
        )}

        {/* Message bubble */}
        {msgStep >= 1 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <rect x="100" y="88" width="90" height="22" rx="8" fill="#6366f1" />
            <text x="145" y="103" textAnchor="middle" fontSize="9" fill="white">Hello! 👋</text>
          </motion.g>
        )}
      </svg>
      <AnimatePresence mode="wait">
        <motion.div
          key={msgStep}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-sm text-center text-gray-600 dark:text-gray-400"
        >
          <span style={{ color: steps[msgStep].color }}>Step {msgStep + 1}:</span> {steps[msgStep].label}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function S03_WhatsApp({ onProgress }: SystemPageProps) {
  useEffect(() => {
    onProgress(73);  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Scale Estimation">
        <KeyValueGrid items={[
          { label: 'Daily Active Users', value: '2B' },
          { label: 'Messages/day', value: '100B (1.16M QPS)' },
          { label: 'Groups (avg 100 members)', value: '100M groups' },
          { label: 'Online users at peak', value: '500M concurrent', color: 'text-red-500' },
        ]} />
      </Section>

      <Section step={2} title="Real-time Messaging: WebSocket Architecture"
        note="HTTP doesn't work for real-time — you can't push from server to client. WebSockets maintain a persistent bidirectional connection.">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <WebSocketFlow />
        </div>
      </Section>

      <Section step={3} title="The Cross-Server Delivery Problem">
        <TheoryBox title="User Presence Service" icon="🟢">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Alice is connected to Chat Server A, Bob to Chat Server B. When Alice sends a message to Bob, Server A must know <em>which</em> server Bob is on, and forward the message there.
          </p>
          <CompareTable
            headers={['Component', 'Purpose', 'Implementation']}
            rows={[
              ['Service Discovery', 'Which server is the user connected to?', 'Redis: user_id → server_id mapping'],
              ['Message Routing', 'Forward from server A to B', 'Internal pub/sub or direct gRPC'],
              ['Offline Delivery', 'User not connected', 'Queue message; push notification via APNs/FCM'],
              ['Message Status', 'Sent/Delivered/Read ticks', 'Ack from recipient\'s server; status event back to sender'],
            ]}
          />
        </TheoryBox>
      </Section>

      <Section step={4} title="Group Messages at Scale">
        <TheoryBox title="Fan-out for Groups" icon="👥">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            For a 100M-member group (like a community), you cannot fan-out synchronously. WhatsApp caps groups at 1,024 members for this reason. For larger audiences, it uses a broadcast model similar to Twitter's fan-out on read.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
              <div className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Small groups (&lt;1K)</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fan-out on write to all member servers. Fast delivery.</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <div className="font-semibold text-amber-700 dark:text-amber-400 mb-1">Large channels</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Store once, pull on connection. Batch fan-out via Kafka consumer groups.</p>
            </div>
          </div>
        </TheoryBox>
      </Section>

      <Section step={5} title="End-to-End Encryption">
        <TheoryBox title="Signal Protocol (Used by WhatsApp)" icon="🔐">
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>→ Each device generates a public/private key pair on first install</li>
            <li>→ Public keys uploaded to WhatsApp key server</li>
            <li>→ When Alice wants to message Bob, she fetches Bob's public key and derives a shared secret</li>
            <li>→ Messages encrypted on Alice's device; WhatsApp servers <em>never see plaintext</em></li>
            <li>→ <strong className="text-gray-800 dark:text-gray-200">Double Ratchet algorithm</strong> generates new encryption key per message for forward secrecy</li>
          </ul>
        </TheoryBox>
      </Section>

      <InterviewTips tips={[
        'WebSocket connections are stateful and expensive. At 500M concurrent users, you need ~500K servers (1K connections per server). Use connection multiplexing.',
        'Never poll for new messages — use WebSocket push for online users, push notifications (APNs/FCM) for offline users.',
        'Cassandra is perfect for message storage: partition key = conversation_id, clustering key = message_id (time-sorted). Enables efficient "load last 100 messages" queries.',
        'Message deduplication: use client-generated UUIDs and idempotency keys to prevent duplicate sends on retries.',
        'The online/offline status "last seen" feature uses a heartbeat: client pings every 30s. Timeout = offline. Store in Redis with TTL.',
      ]} />
    </div>
  );
}
