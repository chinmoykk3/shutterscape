'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  DayArcTheme,
  DayArcMetadata,
  DAY_ARC_PRESETS,
  calculateCurrentDayArc,
} from '@/lib/dayArc';

interface DayArcContextValue {
  theme: DayArcTheme;
  isAuto: boolean;
  metadata: DayArcMetadata;
  setTheme: (theme: DayArcTheme | 'auto') => void;
  toggleSunMoon: () => void;
  isLight: boolean;
  toggleTheme: () => void;
}

const DayArcContext = createContext<DayArcContextValue | undefined>(undefined);

const THEME_CLASSES = ['theme-dawn', 'theme-daylight', 'theme-golden', 'theme-night'];

export function DayArcProvider({ children }: { children: React.ReactNode }) {
  const [theme, setInternalTheme] = useState<DayArcTheme>('night');
  const [isAuto, setIsAuto] = useState<boolean>(true);

  // Initialize theme from localStorage or system time
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem('shutterscape_theme') ||
        localStorage.getItem('shutterscape_day_arc');

      if (stored === 'light' || stored === 'daylight') {
        setInternalTheme('daylight');
        setIsAuto(false);
      } else if (stored === 'dark' || stored === 'night') {
        setInternalTheme('night');
        setIsAuto(false);
      } else if (stored && stored !== 'auto' && stored in DAY_ARC_PRESETS) {
        setInternalTheme(stored as DayArcTheme);
        setIsAuto(false);
      } else {
        const current = calculateCurrentDayArc();
        setInternalTheme(current);
        setIsAuto(true);
      }
    } catch {
      setInternalTheme(calculateCurrentDayArc());
    }
  }, []);

  // Synchronize CSS class with HTML root element
  useEffect(() => {
    const root = document.documentElement;
    THEME_CLASSES.forEach((cls) => root.classList.remove(cls));
    root.classList.add(`theme-${theme}`);
    root.setAttribute('data-day-arc', theme);

    if (theme === 'daylight') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  // Recalculate if on auto mode every 5 minutes
  useEffect(() => {
    if (!isAuto) return;

    const interval = setInterval(() => {
      const nextTheme = calculateCurrentDayArc();
      setInternalTheme((prev) => (prev !== nextTheme ? nextTheme : prev));
    }, 1000 * 60 * 5);

    return () => clearInterval(interval);
  }, [isAuto]);

  const setTheme = useCallback((newTheme: DayArcTheme | 'auto') => {
    if (newTheme === 'auto') {
      const computed = calculateCurrentDayArc();
      setInternalTheme(computed);
      setIsAuto(true);
      try {
        localStorage.setItem('shutterscape_theme', 'auto');
        localStorage.setItem('shutterscape_day_arc', 'auto');
      } catch {
        // storage disabled
      }
    } else {
      setInternalTheme(newTheme);
      setIsAuto(false);
      try {
        localStorage.setItem('shutterscape_theme', newTheme === 'daylight' ? 'light' : 'dark');
        localStorage.setItem('shutterscape_day_arc', newTheme);
      } catch {
        // storage disabled
      }
    }
  }, []);

  const isLight = theme === 'daylight';

  const toggleTheme = useCallback(() => {
    if (theme === 'daylight') {
      setTheme('night');
    } else {
      setTheme('daylight');
    }
  }, [theme, setTheme]);

  const toggleSunMoon = toggleTheme;

  const value = useMemo(
    () => ({
      theme,
      isAuto,
      metadata: DAY_ARC_PRESETS[theme],
      setTheme,
      toggleSunMoon,
      isLight,
      toggleTheme,
    }),
    [theme, isAuto, setTheme, toggleSunMoon, isLight, toggleTheme]
  );

  return <DayArcContext.Provider value={value}>{children}</DayArcContext.Provider>;
}

export function useDayArc() {
  const context = useContext(DayArcContext);
  if (!context) {
    throw new Error('useDayArc must be used within a DayArcProvider');
  }
  return context;
}
