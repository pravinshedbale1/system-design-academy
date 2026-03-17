import { useEffect } from 'react';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems.find(s => s.id === 11)!;

export default function S11_Instagram({ onProgress, onComplete }: SystemPageProps) {
  useEffect(() => { onProgress(81); const t = setTimeout(() => onComplete(81), 8000); return () => clearTimeout(t); }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Requirements & Scale" note="Instagram serves 2B+ monthly active users with 100M+ photos uploaded per day.">
        <div className="grid grid-cols-2 gap-4">
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

      <Section step={2} title="High-Level Architecture">
        <TheoryBox title="Core Services" icon="🏗️">
          <div className="grid grid-cols-3 gap-3 text-xs text-gray-600 dark:text-gray-400">
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
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
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
