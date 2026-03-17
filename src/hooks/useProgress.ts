import { useState, useEffect } from 'react';

export type ChapterStatus = 'not-started' | 'in-progress' | 'completed';

interface Progress {
  [chapterId: number]: ChapterStatus;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      const stored = localStorage.getItem('sda-progress');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('sda-progress', JSON.stringify(progress));
  }, [progress]);

  const markInProgress = (id: number) => {
    setProgress(prev => {
      if (prev[id] === 'completed') return prev;
      return { ...prev, [id]: 'in-progress' };
    });
  };

  const markCompleted = (id: number) => {
    setProgress(prev => ({ ...prev, [id]: 'completed' }));
  };

  const getOverallPercent = (total: number) => {
    const completed = Object.values(progress).filter(s => s === 'completed').length;
    return Math.round((completed / total) * 100);
  };

  return { progress, markInProgress, markCompleted, getOverallPercent };
}
