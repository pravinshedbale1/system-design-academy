import { useEffect } from 'react';
import { systems } from '../data/systems';
import { SystemHeader, Section, TheoryBox, InterviewTips, CompareTable } from './SystemLayout';
import type { SystemPageProps } from './SystemPage';

const sys = systems.find(s => s.id === 13)!;

export default function S13_Dropbox({ onProgress, onComplete }: SystemPageProps) {
  useEffect(() => { onProgress(83); const t = setTimeout(() => onComplete(83), 8000); return () => clearTimeout(t); }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
      <SystemHeader sys={sys} />

      <Section step={1} title="Core Architecture" note="Dropbox syncs 1.2B+ files per day across 700M users.">
        <TheoryBox title="System Components" icon="🏗️">
          <div className="grid grid-cols-3 gap-3 text-xs text-gray-600 dark:text-gray-400">
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
