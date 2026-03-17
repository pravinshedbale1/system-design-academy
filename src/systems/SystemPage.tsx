import { lazy, Suspense, type ComponentType } from 'react';
import { motion } from 'framer-motion';

export interface SystemPageProps {
  systemId: number;
  onProgress: (id: number) => void;
  onComplete: (id: number) => void;
}

type LazySystem = ReturnType<typeof lazy<ComponentType<SystemPageProps>>>;

const systemComponents: Record<number, LazySystem> = {
  1: lazy(() => import('./S01_Twitter')),
  2: lazy(() => import('./S02_YouTube')),
  3: lazy(() => import('./S03_WhatsApp')),
  4: lazy(() => import('./S04_Uber')),
  5: lazy(() => import('./S05_RateLimiter')),
  6: lazy(() => import('./S06_Notifications')),
  7: lazy(() => import('./S07_MessageQueue')),
  8: lazy(() => import('./S08_GoogleDrive')),
  9: lazy(() => import('./S09_WebCrawler')),
  10: lazy(() => import('./S10_Payments')),
  11: lazy(() => import('./S11_Instagram')),
  12: lazy(() => import('../chapters/Chapter7_URLShortener')),
  13: lazy(() => import('./S13_Dropbox')),
  14: lazy(() => import('./S14_SearchEngine')),
  15: lazy(() => import('./S15_Discord')),
};

function Skeleton() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export default function SystemPage({ systemId, onProgress, onComplete }: SystemPageProps) {
  console.log('SystemPage rendered with systemId:', systemId, typeof systemId);
  const SystemComponent = systemComponents[systemId];

  if (!SystemComponent) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        System not found.
      </div>
    );
  }

  return (
    <Suspense fallback={<Skeleton />}>
      <SystemComponent systemId={systemId} onProgress={onProgress} onComplete={onComplete} />
    </Suspense>
  );
}
