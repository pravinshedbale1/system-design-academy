import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems.find(s => s.id === 13)!;

function DropboxSyncDiagram() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: 'File changed on Device A', color: '#6366f1' },
    { label: 'Block Server splits into 4MB chunks', color: '#8b5cf6' },
    { label: 'Changed blocks uploaded to S3', color: '#f59e0b' },
    { label: 'Metadata DB updated (version, blocks)', color: '#0ea5e9' },
    { label: 'Sync Service notifies other devices', color: '#10b981' },
    { label: 'Device B downloads changed blocks', color: '#ef4444' },
  ];

  const nodes = [
    { id: 'devA', label: 'Device A', x: 20, y: 100, color: '#6366f1', w: 75 },
    { id: 'block', label: 'Block Server', x: 140, y: 100, color: '#8b5cf6', w: 85 },
    { id: 's3', label: 'S3 Storage', x: 280, y: 40, color: '#f59e0b', w: 80 },
    { id: 'meta', label: 'Metadata DB', x: 280, y: 160, color: '#0ea5e9', w: 80 },
    { id: 'sync', label: 'Sync Service', x: 420, y: 100, color: '#10b981', w: 85 },
    { id: 'devB', label: 'Device B', x: 550, y: 100, color: '#ef4444', w: 75 },
  ];
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  const flowEdges = [
    ['devA', 'block'], ['block', 's3'], ['block', 'meta'], ['meta', 'sync'], ['sync', 'devB'],
  ];

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <svg viewBox="0 0 650 220" className="w-full">
          <defs>
            <marker id="db-ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
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
                stroke={active ? steps[i].color : '#e5e7eb'} strokeWidth={current ? 2.5 : active ? 1.5 : 1}
                strokeDasharray="5 3" opacity={active ? (current ? 0.9 : 0.5) : 0.2}
                markerEnd={current ? 'url(#db-ar)' : undefined}
                animate={active ? { strokeDashoffset: [0, -16] } : {}}
                transition={active ? { duration: 1.2, repeat: Infinity, ease: 'linear' } : {}}
              />
            );
          })}
          {nodes.map(n => {
            const idx = ['devA', 'block', 's3', 'meta', 'sync', 'devB'].indexOf(n.id);
            const active = step >= Math.max(0, idx - 1);
            const current = step === idx || (idx <= 1 && step === 0);
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
                <text x={n.x + n.w / 2} y={n.y + 24} textAnchor="middle" fontSize="9"
                  fontWeight="600" fill={active ? n.color : '#9ca3af'}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-sm text-center text-gray-600 dark:text-gray-400">
        <span style={{ color: steps[step].color }}>Step {step + 1}:</span> {steps[step].label}
      </div>
    </div>
  );
}

export default function S13_Dropbox({ onProgress }: SystemPageProps) {
  useEffect(() => { onProgress(83); }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Core Architecture" note="Dropbox syncs 1.2B+ files per day across 700M users. Watch the sync flow animation below.">
        <DropboxSyncDiagram />
        <TheoryBox title="System Components" icon="🏗️">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600 dark:text-gray-400">
            {[
              { name: 'Block Server', desc: 'Splits files into 4MB chunks. Computes SHA256 hash per block. Only uploads changed blocks (delta sync).' },
              { name: 'Metadata Service', desc: 'Stores file tree: path, version, block list, permissions. PostgreSQL with strong consistency.' },
              { name: 'Block Storage', desc: 'S3 for block blobs. Content-addressed (hash → blob). Deduplication: same hash = same block (store once).' },
              { name: 'Sync Service', desc: 'Long-polling / WebSocket for real-time change notifications. Clients poll for changes, receive delta updates.' },
              { name: 'Notification Service', desc: 'Broadcasts file change events to all devices of the owner + shared users.' },
              { name: 'Chunk Queue', desc: 'Upload queue for reliability. Client queues blocks → workers upload to S3 in parallel.' },
            ].map(s => (
              <div key={s.name} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                <div className="font-semibold text-gray-800 dark:text-gray-200">{s.name}</div>
                <p className="mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </TheoryBox>
      </Section>

      <Section step={2} title="Chunking & Deduplication">
        <TheoryBox title="Why Chunk Files?" icon="🧩">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Instead of uploading entire files, split into 4MB blocks. On edit, only upload changed blocks (delta sync). SHA256 hash of each block enables deduplication across all users.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 font-mono text-xs space-y-1">
            <div className="text-emerald-600">File: report.pdf (12MB)</div>
            <div className="text-gray-600 dark:text-gray-400">  Block 1: sha256=abc... (4MB) ← unchanged</div>
            <div className="text-gray-600 dark:text-gray-400">  Block 2: sha256=def... (4MB) ← unchanged</div>
            <div className="text-amber-600">  Block 3: sha256=NEW... (4MB) ← CHANGED → upload only this block</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            <strong>Dedup savings:</strong> If 100 users have the same PDF, the blocks are stored once in S3. Metadata tracks which users reference which blocks.
          </p>
        </TheoryBox>
      </Section>

      <Section step={3} title="Sync Protocol & Conflict Resolution">
        <CompareTable
          headers={['Scenario', 'Resolution']}
          rows={[
            ['Same file edited on 2 devices (offline)', 'Keep both versions. Rename conflicted copy: "file (conflicted copy).pdf"'],
            ['Same file edited concurrently (online)', 'Server timestamps determine winner. Loser saved as conflict copy.'],
            ['Delete on one device, edit on another', 'Edit wins. File is kept with the edit.'],
            ['Folder renamed + file added inside', 'Operational transform: apply rename first, then add file to renamed folder.'],
          ]}
        />
      </Section>

      <Section step={4} title="Version History & Undo">
        <TheoryBox title="How Version History Works" icon="📜">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Each file version stores: <code className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">(file_id, version, block_list[], timestamp, user_id)</code>. Blocks are immutable and content-addressed. To restore version N, just reassemble blocks from that version's block list. Old versions share unchanged blocks → minimal extra storage.
          </p>
        </TheoryBox>
      </Section>

      <InterviewTips tips={[
        'Delta sync is the key insight: chunk files into 4MB blocks, hash each block, only upload changed blocks. This reduces bandwidth by 90%+ for edits.',
        'Content-addressed storage (hash → blob) enables global deduplication. Same block across any user = stored once.',
        'Use long-polling (not WebSocket) for sync notifications. It\'s simpler, works through proxies, and Dropbox uses it in production.',
        'Metadata must be strongly consistent (PostgreSQL with leader replication). Block storage can be eventually consistent (S3).',
        'Conflict resolution: "last writer wins" is too aggressive. Keep conflicted copies and let the user decide. This is what Dropbox does.',
      ]} />
    </div>
  );
}
