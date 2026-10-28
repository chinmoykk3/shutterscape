// File: components/providers/StoryModeProvider.tsx
'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

export type StoryMode = 'story' | 'quick';

interface StoryModeContextValue {
  mode: StoryMode;
  isReducedMotion: boolean;
  setMode: (mode: StoryMode) => void;
  toggleMode: () => void;
}

const StoryModeContext = createContext<StoryModeContextValue | undefined>(undefined);

export function StoryModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setInternalMode] = useState<StoryMode>('story');
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mediaQuery.matches);

      // Clear old legacy key if present so user is not trapped in static mode
      if (localStorage.getItem('shutterscape_story_mode')) {
        localStorage.removeItem('shutterscape_story_mode');
      }

      const stored = localStorage.getItem('shutterscape_story_mode_v2');
      if (stored === 'quick' || stored === 'story') {
        setInternalMode(stored);
      } else {
        setInternalMode('story');
        localStorage.setItem('shutterscape_story_mode_v2', 'story');
      }

      const handleChange = (e: MediaQueryListEvent) => {
        setIsReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch {
      // Ignore in non-browser environments
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-story-mode', mode);
  }, [mode]);

  const setMode = useCallback((newMode: StoryMode) => {
    setInternalMode(newMode);
    try {
      localStorage.setItem('shutterscape_story_mode_v2', newMode);
    } catch {
      // LocalStorage disabled
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'story' ? 'quick' : 'story');
  }, [mode, setMode]);

  const value = useMemo(
    () => ({
      mode,
      isReducedMotion,
      setMode,
      toggleMode,
    }),
    [mode, isReducedMotion, setMode, toggleMode]
  );

  return (
    <StoryModeContext.Provider value={value}>
      {children}
    </StoryModeContext.Provider>
  );
}

export function useStoryMode() {
  const context = useContext(StoryModeContext);
  if (!context) {
    throw new Error('useStoryMode must be used within a StoryModeProvider');
  }
  return context;
}
