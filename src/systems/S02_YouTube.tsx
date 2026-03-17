import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable, KeyValueGrid } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems[1]; // YouTube

function TranscodingPipeline() {
  const [activeStage, setActiveStage] = useState(0);
  const stages = [
    { label: 'Upload', icon: '⬆️', color: '#6366f1', desc: 'User uploads raw .mp4 to a dedicated upload service (S3 multipart)' },
    { label: 'Validation', icon: '✅', color: '#8b5cf6', desc: 'Check format, codec, bitrate. Reject corrupt files.' },
    { label: 'Splitting', icon: '✂️', color: '#0ea5e9', desc: 'Split video into GOP-aligned 10-second chunks for parallel processing' },
    { label: 'Transcoding', icon: '⚙️', color: '#f59e0b', desc: 'Transcode each chunk to 360p, 480p, 720p, 1080p, 4K in parallel' },
    { label: 'Merging', icon: '🔗', color: '#10b981', desc: 'Reassemble transcoded chunks into final HLS/DASH manifest files' },
    { label: 'CDN Push', icon: '🌐', color: '#ef4444', desc: 'Push segments to global CDN edge nodes. Video goes live.' },
  ];

  useEffect(() => {
    const t = setInterval(() => setActiveStage(s => (s + 1) % stages.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        {stages.map((s, i) => (
          <div key={s.label} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              className="w-full h-10 rounded-lg flex items-center justify-center text-xs font-semibold"
              animate={{
                backgroundColor: activeStage === i ? `${s.color}33` : '#f9fafb',
                borderColor: activeStage === i ? s.color : '#e5e7eb',
                scale: activeStage === i ? 1.05 : 1,
              }}
              style={{ border: '1.5px solid', borderColor: '#e5e7eb' }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-base">{s.icon}</span>
            </motion.div>
            <span className="text-[9px] text-gray-500 text-center">{s.label}</span>
            {i < stages.length - 1 && (
              <div className="absolute" style={{ marginLeft: '100%' }}>→</div>
            )}
          </div>
        ))}
      </div>
      <motion.div
        key={activeStage}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-sm text-gray-600 dark:text-gray-400 text-center"
      >
        <strong style={{ color: stages[activeStage].color }}>{stages[activeStage].label}:</strong> {stages[activeStage].desc}
      </motion.div>
    </div>
  );
}

function StreamingDiagram() {
  const [quality, setQuality] = useState<'360p' | '720p' | '1080p' | '4K'>('720p');
  const bitrates = { '360p': 0.5, '720p': 2.5, '1080p': 8, '4K': 25 };
  const br = bitrates[quality];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600 dark:text-gray-400">Quality:</span>
        {(['360p', '720p', '1080p', '4K'] as const).map(q => (
          <button
            key={q}
            onClick={() => setQuality(q)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${quality === q ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
          >
            {q}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-1">Bitrate</div>
          <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{br} Mbps</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-1">Bandwidth needed</div>
          <div className="font-mono font-bold text-amber-600 dark:text-amber-400">{(br * 1000 / 8).toFixed(0)} KB/s</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-1">1M concurrent users</div>
          <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{(br * 1000000 / 1000).toFixed(0)} Gbps</div>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        This is why YouTube uses HLS/DASH Adaptive Bitrate Streaming — your client automatically switches quality based on available bandwidth, preventing buffering.
      </p>
    </div>
  );
}

export default function S02_YouTube({ onProgress, onComplete }: SystemPageProps) {
  useEffect(() => {
    onProgress(72);
    const t = setTimeout(() => onComplete(72), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Scale Estimation">
        <KeyValueGrid items={[
          { label: 'Daily Active Users', value: '2.7B' },
          { label: 'Videos watched/day', value: '5B (58K QPS read)' },
          { label: 'Uploads/day', value: '500 hours/min' },
          { label: 'Storage added/day', value: '~100TB (3min avg, 720p)', color: 'text-red-500' },
        ]} />
      </Section>

      <Section step={2} title="The Core Problem: Video Processing"
        note="Raw video can't be served directly. It must be transcoded into multiple resolutions and formats before streaming.">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <TranscodingPipeline />
        </div>
      </Section>

      <Section step={3} title="Adaptive Bitrate Streaming"
        note="HLS (HTTP Live Streaming) and DASH (Dynamic Adaptive Streaming) split video into 6-second segments and dynamically switch quality.">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <StreamingDiagram />
        </div>
      </Section>

      <Section step={4} title="System Architecture">
        <TheoryBox title="Two Separate Systems: Upload Path vs. View Path" icon="🏗️">
          <CompareTable
            headers={['Path', 'Components', 'SLA']}
            rows={[
              ['Upload', 'Client → Upload Service → S3 → Message Queue → Transcoding Workers', 'Async; minutes OK'],
              ['View', 'Client → CDN Edge → Origin (S3 segments)', 'Sync; < 2s start'],
              ['Metadata', 'Client → API gateway → PostgreSQL (titles, tags, views)', '< 100ms P99'],
            ]}
          />
        </TheoryBox>
        <TheoryBox title="Storage Architecture" icon="💾">
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>→ <strong className="text-gray-700 dark:text-gray-300">Raw uploads:</strong> S3 standard (uploaded, then deleted after transcoding)</li>
            <li>→ <strong className="text-gray-700 dark:text-gray-300">Transcoded segments:</strong> S3 standard → replicated to CDN edge servers globally</li>
            <li>→ <strong className="text-gray-700 dark:text-gray-300">Thumbnails:</strong> CDN-cached, served from edge</li>
            <li>→ <strong className="text-gray-700 dark:text-gray-300">Video metadata:</strong> PostgreSQL (sharded by channel_id)</li>
            <li>→ <strong className="text-gray-700 dark:text-gray-300">View counts:</strong> Redis incr + async batch flush to DB</li>
          </ul>
        </TheoryBox>
      </Section>

      <InterviewTips tips={[
        'Upload and view are completely separate systems. Never conflate them — they have different reliability requirements.',
        'Transcoding is the bottleneck. Split video into chunks and transcode in parallel across multiple workers. LinkedIn reduced transcoding time 70% with this.',
        'For resume upload (large files), use HTTP range requests and S3 multipart API — upload in 5MB chunks, merge on S3.',
        'View counts don\'t need to be exact. Use Redis INCR counters, flush to DB every 30 seconds. Users don\'t notice 1234 vs 1235 views.',
        'Content-aware encoding — dark action scenes need more bits. Netflix uses per-title encoding that saves 20% bandwidth.',
      ]} />
    </div>
  );
}
