import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable, KeyValueGrid } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems[7]; // Google Drive

function ChunkUploadVisual() {
  const [uploadedChunks, setUploadedChunks] = useState<boolean[]>(Array(8).fill(false));
  const [uploading, setUploading] = useState(false);

  async function startUpload() {
    if (uploading) return;
    setUploading(true);
    setUploadedChunks(Array(8).fill(false));
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 350));
      setUploadedChunks(prev => {
        const n = [...prev]; n[i] = true; return n;
      });
    }
    setUploading(false);
  }

  const done = uploadedChunks.every(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">large_file.mp4 (400MB)</span>
        <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">Split into 8 × 50MB chunks</span>
      </div>
      <div className="flex gap-2">
        {uploadedChunks.map((done, i) => (
          <motion.div
            key={i}
            className="flex-1 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold"
            animate={{
              borderColor: done ? '#10b981' : '#e5e7eb',
              backgroundColor: done ? '#10b98122' : '#f9fafb',
              color: done ? '#10b981' : '#9ca3af',
            }}
            transition={{ duration: 0.3 }}
          >
            {done ? '✓' : `C${i + 1}`}
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            animate={{ width: `${(uploadedChunks.filter(Boolean).length / 8) * 100}%` }}
          />
        </div>
        <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
          {uploadedChunks.filter(Boolean).length * 50}MB / 400MB
        </span>
      </div>
      <button onClick={startUpload} disabled={uploading}
        className={`w-full py-2 rounded-xl font-semibold text-sm transition-colors ${uploading ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
        {done ? '✅ Upload Complete — Assembled in S3' : uploading ? '⬆️ Uploading (parallel chunks)...' : '⬆️ Start Chunked Upload'}
      </button>
    </div>
  );
}

export default function S08_GoogleDrive({ onProgress }: SystemPageProps) {
  useEffect(() => {
    onProgress(78);  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Scale Estimation">
        <KeyValueGrid items={[
          { label: 'Google Drive users', value: '1B' },
          { label: 'Avg storage per user', value: '15GB (free tier)' },
          { label: 'Total storage', value: '15 Exabytes (15M TB)', color: 'text-red-500' },
          { label: 'Daily uploads', value: '2B files/day' },
        ]} />
      </Section>

      <Section step={2} title="Chunked Upload Architecture"
        note="Large files can't be uploaded in a single HTTP request — network interruptions would require restarting from scratch. Solution: split into chunks.">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <ChunkUploadVisual />
        </div>
        <TheoryBox title="How Chunking Works" icon="✂️">
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>→ Client splits file into 5-50MB chunks and hashes each with SHA-256</li>
            <li>→ Sends chunk hashes to server first: "do you already have chunk X?" (deduplication!)</li>
            <li>→ Only uploads missing chunks — saves bandwidth when re-uploading edited files</li>
            <li>→ Chunks uploaded to presigned S3 URLs in parallel (multipart upload API)</li>
            <li>→ Client notifies server when all chunks uploaded → server assembles manifest</li>
          </ul>
        </TheoryBox>
      </Section>

      <Section step={3} title="Delta Sync — Only Upload Changes">
        <TheoryBox title="Block-Level Differential Sync" icon="🔄">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            When you edit a 1GB Word document, Dropbox doesn't re-upload 1GB. It tracks which 4MB blocks changed and uploads only those.
          </p>
          <CompareTable
            headers={['Approach', 'Transfer on edit', 'Complexity']}
            rows={[
              ['Full file upload', '100% of file', 'Simple but wasteful'],
              ['File-level delta', 'Changed files only', 'Medium — works per file'],
              ['Block-level delta (Dropbox)', 'Changed 4MB blocks', 'Complex — saves 95%+ for large files'],
            ]}
          />
        </TheoryBox>
      </Section>

      <Section step={4} title="Storage Hierarchy">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <CompareTable
            headers={['Layer', 'What\'s Stored', 'Technology']}
            rows={[
              ['Hot storage', 'Recently accessed files', 'SSD-backed S3 Standard'],
              ['Warm storage', 'Files not accessed in 30 days', 'S3 Infrequent Access (-40% cost)'],
              ['Cold/Archive', 'Files not accessed in 1 year', 'S3 Glacier (-80% cost)'],
              ['Metadata DB', 'File names, paths, permissions, chunk hashes', 'PostgreSQL + caching'],
            ]}
          />
        </div>
      </Section>

      <InterviewTips tips={[
        'Content-addressable storage: store chunks by hash(content). If two users upload the same file, only one copy is stored. This is how Dropbox deduplication works.',
        'Presigned S3 URLs: the upload service generates time-limited S3 upload URLs. Client uploads directly to S3 — your servers never touch the file data.',
        'Conflict resolution for sync: use vector clocks or last-write-wins per device. When conflicts exist, show both versions (like Dropbox \'conflicted copy\').',
        'The metadata database (file names, folder structure, permissions) is much smaller than the file data — it fits fully in memory with Redis caching.',
        'CDN for downloads: files are served from CloudFront/CDN edge nodes near the user — not directly from S3. Set long max-age Cache-Control headers on immutable chunks.',
      ]} />
    </div>
  );
}
