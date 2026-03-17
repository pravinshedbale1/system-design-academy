import { lazy, Suspense, type ComponentType } from 'react';
import { motion } from 'framer-motion';

export interface SystemPageProps {
  systemId: number;
  onProgress: (id: number) => void;
}

type LazySystem = ReturnType<typeof lazy<ComponentType<SystemPageProps>>>;

const systemComponents: Record<number, LazySystem> = {
  1: lazy(() => import('./Twitter')),
  2: lazy(() => import('./YouTube')),
  3: lazy(() => import('./WhatsApp')),
  4: lazy(() => import('./Uber')),
  5: lazy(() => import('./RateLimiter')),
  6: lazy(() => import('./Notifications')),
  7: lazy(() => import('./MessageQueue')),
  8: lazy(() => import('./GoogleDrive')),
  9: lazy(() => import('./WebCrawler')),
  10: lazy(() => import('./Payments')),
  11: lazy(() => import('./Instagram')),
  12: lazy(() => import('./TinyURL')),
  13: lazy(() => import('./Dropbox')),
  14: lazy(() => import('./SearchEngine')),
  15: lazy(() => import('./Discord')),
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

export default function SystemPage({ systemId, onProgress }: SystemPageProps) {
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
      <SystemComponent systemId={systemId} onProgress={onProgress} />
    </Suspense>
  );
}
