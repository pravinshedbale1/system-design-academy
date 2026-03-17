import { useEffect } from 'react';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems.find(s => s.id === 15)!;

export default function S15_Discord({ onProgress, onComplete }: SystemPageProps) {
  useEffect(() => { onProgress(85); const t = setTimeout(() => onComplete(85), 8000); return () => clearTimeout(t); }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Requirements & Scale" note="Discord handles 150M+ MAU, 4B+ messages/day, millions of concurrent voice users.">
        <div className="grid grid-cols-2 gap-4">
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

      <Section step={2} title="Message System Architecture">
        <TheoryBox title="How Messages Flow" icon="💬">
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>1. Client sends message via <strong>WebSocket</strong> to Gateway server</p>
            <p>2. Gateway publishes to <strong>Kafka topic</strong> (partitioned by channel_id)</p>
            <p>3. <strong>Message Service</strong> consumes, validates, stores in <strong>Cassandra</strong> (partition key = channel_id)</p>
            <p>4. <strong>Fan-out Service</strong> identifies all online members in that channel</p>
            <p>5. Publishes to each member's Gateway server via <strong>internal pub/sub</strong> (Redis Pub/Sub or NATS)</p>
            <p>6. Gateway pushes message to client via their WebSocket</p>
          </div>
        </TheoryBox>
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
        <div className="grid grid-cols-2 gap-4">
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
