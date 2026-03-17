import type { ComponentType } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import ChapterFooter from './components/ChapterFooter';
import { useProgress } from './hooks/useProgress';
import { chapters } from './data/chapters';
import { systems } from './data/systems';
import Chapter1 from './chapters/Chapter1_Scalability';
import Chapter2 from './chapters/Chapter2_CAP';
import Chapter3 from './chapters/Chapter3_Latency';
import Chapter4 from './chapters/Chapter4_Caching';
import Chapter5 from './chapters/Chapter5_LoadBalancing';
import Chapter6 from './chapters/Chapter6_Databases';
import Chapter7 from './chapters/Chapter8_Networking';
import Chapter8 from './chapters/Chapter9_APIDesign';
import Chapter9 from './chapters/Chapter10_DNS';
import Chapter10 from './chapters/Chapter11_CDN';
import Chapter11 from './chapters/Chapter12_StorageSystems';
import Chapter12 from './chapters/Chapter13_Replication';
import Chapter13 from './chapters/Chapter14_Sharding';
import Chapter14 from './chapters/Chapter15_ConsistencyModels';
import Chapter15 from './chapters/Chapter16_MessageQueues';
import Chapter16 from './chapters/Chapter17_Proxies';
import Chapter17 from './chapters/Chapter18_Microservices';
import Chapter18 from './chapters/Chapter19_Security';
import Chapter19 from './chapters/Chapter20_Monitoring';
import Chapter20 from './chapters/Chapter21_Estimation';
import SystemPage from './systems/SystemPage';

type ChapterProps = { onProgress: (id: number) => void };

const chapterComponents: Record<number, ComponentType<ChapterProps>> = {
  1: Chapter1, 2: Chapter2, 3: Chapter3, 4: Chapter4, 5: Chapter5, 6: Chapter6,
  7: Chapter7, 8: Chapter8, 9: Chapter9, 10: Chapter10, 11: Chapter11, 12: Chapter12,
  13: Chapter13, 14: Chapter14, 15: Chapter15, 16: Chapter16, 17: Chapter17, 18: Chapter18,
  19: Chapter19, 20: Chapter20,
};

// Build a unified ordered list of all pages for prev/next navigation
const allPages = [
  ...chapters.map(c => ({ path: `/chapter/${c.id}`, label: c.title, progressId: c.id })),
  ...systems.map(s => ({ path: `/system/${s.id}`, label: s.title, progressId: 70 + s.id })),
];

export default function App() {
  const { progress, markInProgress, markCompleted, getOverallPercent } = useProgress();
  const totalItems = chapters.length + systems.length;

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar overallPercent={getOverallPercent(totalItems)} />
        <Sidebar progress={progress} />
        <main className="ml-60 mt-14 min-h-[calc(100vh-3.5rem)]">
          <Routes>
            <Route path="/" element={<Navigate to="/chapter/1" replace />} />
            {chapters.map((chapter, idx) => {
              const ChapterComponent = chapterComponents[chapter.id];
              const pageIdx = idx; // chapters come first in allPages
              const prev = pageIdx > 0 ? allPages[pageIdx - 1] : undefined;
              const next = pageIdx < allPages.length - 1 ? allPages[pageIdx + 1] : undefined;
              return ChapterComponent ? (
                <Route
                  key={chapter.id}
                  path={`/chapter/${chapter.id}`}
                  element={
                    <>
                      <ChapterComponent
                        onProgress={() => markInProgress(chapter.id)}
                      />
                      <ChapterFooter
                        isCompleted={progress[chapter.id] === 'completed'}
                        onComplete={() => markCompleted(chapter.id)}
                        prevPath={prev?.path}
                        prevLabel={prev?.label}
                        nextPath={next?.path}
                        nextLabel={next?.label}
                      />
                    </>
                  }
                />
              ) : null;
            })}
            {systems.map((system, idx) => {
              const pageIdx = chapters.length + idx; // systems come after chapters
              const prev = pageIdx > 0 ? allPages[pageIdx - 1] : undefined;
              const next = pageIdx < allPages.length - 1 ? allPages[pageIdx + 1] : undefined;
              return (
                <Route
                  key={system.id}
                  path={`/system/${system.id}`}
                  element={
                    <>
                      <SystemPage
                        systemId={system.id}
                        onProgress={() => markInProgress(70 + system.id)}
                      />
                      <ChapterFooter
                        isCompleted={progress[70 + system.id] === 'completed'}
                        onComplete={() => markCompleted(70 + system.id)}
                        prevPath={prev?.path}
                        prevLabel={prev?.label}
                        nextPath={next?.path}
                        nextLabel={next?.label}
                      />
                    </>
                  }
                />
              );
            })}
            <Route path="*" element={<Navigate to="/chapter/1" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
