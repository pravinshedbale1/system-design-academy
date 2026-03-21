import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems.find(s => s.id === 11)!;

function InstagramArchDiagram() {
  const [activeStep, setActiveStep] = useState(0);
  const nodes = [
    { id: 'client', label: 'Client App', x: 20, y: 110, color: '#6366f1', w: 80 },
    { id: 'lb', label: 'API Gateway', x: 140, y: 110, color: '#8b5cf6', w: 80 },
    { id: 'upload', label: 'Upload Svc', x: 270, y: 40, color: '#f59e0b', w: 80 },
    { id: 'feed', label: 'Feed Svc', x: 270, y: 180, color: '#0ea5e9', w: 80 },
    { id: 'media', label: 'Media Proc', x: 400, y: 40, color: '#ef4444', w: 80 },
    { id: 'redis', label: 'Redis Cache', x: 400, y: 180, color: '#10b981', w: 80 },
    { id: 's3', label: 'S3 + CDN', x: 530, y: 40, color: '#f97316', w: 80 },
    { id: 'db', label: 'PostgreSQL', x: 530, y: 180, color: '#6366f1', w: 80 },
    { id: 'fanout', label: 'Fan-out', x: 530, y: 110, color: '#ec4899', w: 80 },
  ];
  const edges: [string, string][] = [
    ['client', 'lb'], ['lb', 'upload'], ['lb', 'feed'],
    ['upload', 'media'], ['media', 's3'], ['upload', 'fanout'],
    ['feed', 'redis'], ['redis', 'db'], ['fanout', 'redis'],
  ];
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  const paths = [
    { name: '📤 Upload Path', color: '#f59e0b', highlight: ['client', 'lb', 'upload', 'media', 's3', 'fanout'] },
    { name: '📥 Feed Read Path', color: '#0ea5e9', highlight: ['client', 'lb', 'feed', 'redis', 'db'] },
  ];

  const activeHighlight = paths[activeStep].highlight;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-2">
        {paths.map((p, i) => (
          <button key={p.name} onClick={() => setActiveStep(i)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${activeStep === i ? 'text-white border-transparent' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
            style={{ backgroundColor: activeStep === i ? p.color : undefined }}>
            {p.name}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <svg viewBox="0 0 640 240" className="w-full">
          <defs>
            <marker id="ig-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill={paths[activeStep].color} />
            </marker>
          </defs>
          {edges.map(([a, b]) => {
            const na = nodeMap[a]; const nb = nodeMap[b];
            const inPath = activeHighlight.includes(a) && activeHighlight.includes(b);
            return (
              <motion.line key={`${a}-${b}`}
                x1={na.x + na.w / 2} y1={na.y + 20} x2={nb.x + nb.w / 2} y2={nb.y + 20}
                stroke={inPath ? paths[activeStep].color : '#e5e7eb'} strokeWidth={inPath ? 2 : 1}
                strokeDasharray="5 3" opacity={inPath ? 0.8 : 0.25}
                markerEnd={inPath ? 'url(#ig-ar)' : undefined}
                animate={inPath ? { strokeDashoffset: [0, -16] } : {}}
                transition={inPath ? { duration: 1.5, repeat: Infinity, ease: 'linear' } : {}}
              />
            );
          })}
          {nodes.map(n => {
            const active = activeHighlight.includes(n.id);
            return (
              <g key={n.id}>
                <rect x={n.x} y={n.y} width={n.w} height={40} rx="8"
                  fill={active ? `${n.color}22` : '#f9fafb'} stroke={active ? n.color : '#e5e7eb'} strokeWidth={active ? 2 : 1}
                  style={{ transition: 'all 0.4s ease' }}
                />
                <text x={n.x + n.w / 2} y={n.y + 24} textAnchor="middle" fontSize="9"
                  fontWeight="600" fill={active ? n.color : '#9ca3af'}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {activeStep === 0
          ? 'Upload Path: Client → Media Processing → S3/CDN storage → Fan-out to followers\' feed caches'
          : 'Read Path: Client → Feed Service → Redis cache (pre-computed) → PostgreSQL fallback'}
      </div>
    </div>
  );
}

export default function S11_Instagram({ onProgress }: SystemPageProps) {
  useEffect(() => { onProgress(81); }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Requirements & Scale" note="Instagram serves 2B+ monthly active users with 100M+ photos uploaded per day.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TheoryBox title="Functional Requirements" icon="📋">
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>→ Upload photos/videos with captions</li>
              <li>→ Follow/unfollow users</li>
              <li>→ Generate personalized news feed</li>
              <li>→ Like, comment, share posts</li>
              <li>→ Stories (24h ephemeral content)</li>
              <li>→ Explore/discover tab</li>
            </ul>
          </TheoryBox>
          <TheoryBox title="Scale Estimates" icon="📊">
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div>DAU: <span className="font-mono text-indigo-600 dark:text-indigo-400">500M</span></div>
              <div>Photos/day: <span className="font-mono text-indigo-600 dark:text-indigo-400">100M (~2GB avg = 200TB/day)</span></div>
              <div>Read:Write ratio: <span className="font-mono text-indigo-600 dark:text-indigo-400">100:1 (read-heavy)</span></div>
              <div>Feed QPS: <span className="font-mono text-indigo-600 dark:text-indigo-400">~60K req/sec avg</span></div>
              <div>Storage (5 years): <span className="font-mono text-indigo-600 dark:text-indigo-400">~400 PB</span></div>
            </div>
          </TheoryBox>
        </div>
      </Section>

      <Section step={2} title="High-Level Architecture"
        note="Toggle between Upload and Feed paths to see how data flows through the system.">
        <InstagramArchDiagram />
        <TheoryBox title="Core Services" icon="🏗️">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600 dark:text-gray-400">
            {[
              { name: 'Upload Service', desc: 'Receives media, generates thumbnails (multiple resolutions), stores in S3. Returns CDN URL.' },
              { name: 'Feed Service', desc: 'Pre-computed feed stored in Redis/Memcached. Updated on new posts via fan-out (same as Twitter design).' },
              { name: 'User Service', desc: 'Profile data, follow graph (stored in graph DB or adjacency list in Cassandra).' },
              { name: 'Media Service', desc: 'Processes images (resize, filter, compress). Puts to S3 + CDN. Uses ffmpeg for video transcoding.' },
              { name: 'Notification Service', desc: 'Push notifications for likes, comments, follows. Kafka → FCM/APNs.' },
              { name: 'Search/Explore', desc: 'ML-based content ranking. Elasticsearch for hashtag/user search. Recommendation engine for Explore tab.' },
            ].map(s => (
              <div key={s.name} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="font-semibold text-gray-800 dark:text-gray-200">{s.name}</div>
                <p className="mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </TheoryBox>
      </Section>

      <Section step={3} title="Data Model & Storage">
        <CompareTable
          headers={['Data', 'Storage', 'Why']}
          rows={[
            ['User profiles', 'PostgreSQL (sharded by user_id)', 'Structured data, ACID for profile updates'],
            ['Follow graph', 'Cassandra / Neo4j', 'Billions of edges, partition by follower_id'],
            ['Photos/Videos', 'S3 + CloudFront CDN', 'Object storage for blobs, CDN for low-latency delivery'],
            ['Feed cache', 'Redis (sorted set per user)', 'Pre-computed feed, O(1) reads, TTL-based eviction'],
            ['Activity (likes, comments)', 'Cassandra (write-optimized)', 'High write throughput, partition by post_id'],
          ]}
        />
      </Section>

      <Section step={4} title="Feed Generation: Hybrid Fan-out">
        <TheoryBox title="Fan-out Strategy" icon="📡">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Same hybrid approach as Twitter: fan-out-on-write for regular users, fan-out-on-read for celebrities.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
              <div className="font-semibold text-blue-700 dark:text-blue-400">Regular user posts</div>
              <p className="mt-0.5">Push to all followers' feed caches (Redis ZADD). Fast reads, more writes.</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
              <div className="font-semibold text-amber-700 dark:text-amber-400">Celebrity posts (10K+ followers)</div>
              <p className="mt-0.5">Don't fan out. Merge at read time from celebrity timeline + pre-computed feed.</p>
            </div>
          </div>
        </TheoryBox>
      </Section>

      <InterviewTips tips={[
        'Instagram is read-heavy (100:1). Optimize for reads: pre-compute feeds, aggressive caching, CDN for all media.',
        'Storage is the main challenge. Use S3 with lifecycle policies: hot → warm → cold (Glacier) after 6 months.',
        'Feed ranking isn\'t just chronological. ML model scores posts by: engagement probability, recency, relationship closeness, content type.',
        'Stories are ephemeral (24h TTL). Store in Redis with TTL. No need for permanent storage.',
        'Media processing pipeline: Upload → S3 → Lambda/SQS → Resize (3 sizes) → CDN. Return thumbnail URL immediately, full-res async.',
      ]} />
    </div>
  );
}
