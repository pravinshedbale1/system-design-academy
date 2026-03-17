import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable, KeyValueGrid } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems[5]; // Notifications

const CHANNELS = ['Push (iOS/Android)', 'Email', 'SMS', 'In-App'];
const channelColors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b'];

function NotificationFlowDiagram() {
  const [activeChannel, setActiveChannel] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {CHANNELS.map((c, i) => (
          <button key={c} onClick={() => setActiveChannel(i)}
            className={`flex-1 py-1.5 text-xs rounded-lg font-medium border transition-all ${activeChannel === i ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
            style={{ backgroundColor: activeChannel === i ? channelColors[i] : undefined }}>
            {c}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 560 220" className="w-full">
        <defs>
          <marker id="nfar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={channelColors[activeChannel]} />
          </marker>
        </defs>
        {/* Nodes */}
        {[
          { label: 'Event\nTrigger', x: 20, y: 80, w: 70 },
          { label: 'Notification\nService', x: 140, y: 80, w: 90 },
          { label: 'Message\nQueue', x: 290, y: 80, w: 80 },
          { label: 'Worker', x: 420, y: 80, w: 70 },
          { label: activeChannel === 0 ? 'APNs / FCM' : activeChannel === 1 ? 'SendGrid' : activeChannel === 2 ? 'Twilio' : 'WebSocket', x: 480, y: 160, w: 80 },
        ].map((n, i) => (
          <g key={n.label}>
            <motion.rect x={n.x} y={n.y} width={n.w} height={40} rx="8"
              fill={`${channelColors[activeChannel]}22`} stroke={channelColors[activeChannel]} strokeWidth="1.5"
              animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
            {n.label.split('\n').map((l, li) => (
              <text key={li} x={n.x + n.w / 2} y={n.y + 16 + li * 12} textAnchor="middle" fontSize="9"
                fill={channelColors[activeChannel]} fontWeight="700">{l}</text>
            ))}
          </g>
        ))}
        {/* Lines */}
        {[[105, 100, 140, 100], [230, 100, 290, 100], [370, 100, 420, 100], [455, 110, 480, 165]].map(([x1, y1, x2, y2], i) => (
          <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={channelColors[activeChannel]} strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7"
            animate={{ strokeDashoffset: [0, -12] }} transition={{ duration: 1, repeat: Infinity }}
            markerEnd="url(#nfar)"
          />
        ))}
        {/* User device */}
        <text x="520" y="195" textAnchor="middle" fontSize="20">📱</text>
        <text x="520" y="210" textAnchor="middle" fontSize="8" fill="#94a3b8">User Device</text>
      </svg>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
        {[
          { label: 'Priority', val: activeChannel === 0 ? 'High (instant)' : activeChannel === 1 ? 'Low (seconds)' : activeChannel === 2 ? 'High (SMS)' : 'Realtime' },
          { label: 'Cost', val: activeChannel === 0 ? '~$0' : activeChannel === 1 ? '$0.001/email' : activeChannel === 2 ? '$0.0075/SMS' : '~$0' },
          { label: 'Provider', val: activeChannel === 0 ? 'Apple/Google' : activeChannel === 1 ? 'SendGrid' : activeChannel === 2 ? 'Twilio' : 'WebSocket' },
          { label: 'Open Rate', val: activeChannel === 0 ? '~4%' : activeChannel === 1 ? '~20%' : activeChannel === 2 ? '~98%' : '~60%' },
        ].map(m => (
          <div key={m.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
            <div className="text-gray-400 text-[10px]">{m.label}</div>
            <div className="font-semibold text-gray-700 dark:text-gray-300 text-xs mt-0.5">{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function S06_Notifications({ onProgress }: SystemPageProps) {
  useEffect(() => {
    onProgress(76);  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Scale Estimation">
        <KeyValueGrid items={[
          { label: 'Push notifications/day', value: '10B (115K QPS)' },
          { label: 'Email/day', value: '1B' },
          { label: 'SMS/day', value: '100M' },
          { label: 'Delivery latency target', value: '< 30 seconds' },
        ]} />
      </Section>

      <Section step={2} title="Multi-Channel Flow"
        note="Click each channel to see its dedicated delivery pipeline, provider, cost, and open rate.">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <NotificationFlowDiagram />
        </div>
      </Section>

      <Section step={3} title="Architecture Deep Dive">
        <TheoryBox title="Key Design Decisions" icon="🏗️">
          <CompareTable
            headers={['Component', 'Role', 'Why Async?']}
            rows={[
              ['Notification Service', 'Validates, deduplicates, and enqueues notifications', 'Must not block the triggering service'],
              ['Priority Queues', 'High-priority (OTP, payment alerts) vs. Low-priority (promos)', 'Prevent promo blasts from delaying OTPs'],
              ['Channel Workers', 'Separate consumers per channel (push, email, SMS)', 'Different throughput and retry patterns'],
              ['Delivery Tracking', 'Track sent/delivered/failed + retries', 'APNs/FCM give delivery receipts — store them'],
            ]}
          />
        </TheoryBox>
      </Section>

      <Section step={4} title="Reliability: Retries & Deduplication">
        <TheoryBox title="The Hard Problems" icon="⚠️">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-semibold text-gray-700 dark:text-gray-300">Retry Strategy</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-xs">
                <li>→ APNs/FCM may fail transiently</li>
                <li>→ Exponential backoff: 5s, 30s, 5min, 1hr</li>
                <li>→ Max 3 retries then DLQ (Dead Letter Queue)</li>
                <li>→ Alert on-call if DLQ grows</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="font-semibold text-gray-700 dark:text-gray-300">Deduplication</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-xs">
                <li>→ Queue retries can cause duplicate sends</li>
                <li>→ Assign idempotency_key to each notification</li>
                <li>→ Check Redis SET before sending: SETNX</li>
                <li>→ Key TTL = 24 hours</li>
              </ul>
            </div>
          </div>
        </TheoryBox>
      </Section>

      <InterviewTips tips={[
        'Use separate priority queues: a promo notification should NEVER delay an OTP. Consumer groups pull from different queues.',
        'Push notifications require device tokens (APNs for iOS, FCM for Android). Store and refresh these — they expire when users log out or reinstall.',
        'Notification preferences must be stored per user: opt-out of promos but keep security alerts. Always respect unsubscribes.',
        'At 10B push/day, you\'re calling APNs/FCM directly. Both support bulk batch APIs — use them instead of individual requests.',
        'Analytics matter: track delivery_rate, open_rate, click_rate per notification type. Drop campaigns with < 1% open rate to protect your sender reputation.',
      ]} />
    </div>
  );
}
