import { lazy, Suspense, type ComponentType } from 'react';
import { motion } from 'framer-motion';

export interface SystemPageProps {
  systemId: number;
  onProgress: (id: number) => void;
}

type LazySystem = ReturnType<typeof lazy<ComponentType<SystemPageProps>>>;

const systemComponents: Record<number, LazySystem> = {
  1: lazy(() => import('./System_Twitter')),
  2: lazy(() => import('./System_YouTube')),
  3: lazy(() => import('./System_WhatsApp')),
  4: lazy(() => import('./System_Uber')),
  5: lazy(() => import('./System_RateLimiter')),
  6: lazy(() => import('./System_Notifications')),
  7: lazy(() => import('./System_MessageQueue')),
  8: lazy(() => import('./System_GoogleDrive')),
  9: lazy(() => import('./System_WebCrawler')),
  10: lazy(() => import('./System_Payments')),
  11: lazy(() => import('./System_Instagram')),
  12: lazy(() => import('./System_TinyURL')),
  13: lazy(() => import('./System_Dropbox')),
  14: lazy(() => import('./System_SearchEngine')),
  15: lazy(() => import('./System_Discord')),
};

function Skeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-6">
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
