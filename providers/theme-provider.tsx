'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeStyle, ThemeMode } from '@/lib/cycle/types';
import { useCycleSettings } from '@/lib/hooks/use-cycle';

interface ThemeContextType {
  themeStyle: ThemeStyle;
  setThemeStyle: (style: ThemeStyle) => void;
  autoComfortMode: boolean;
  setAutoComfortMode: (enabled: boolean) => Promise<void>;
  effectiveCycleState: ThemeMode;
  previewState: ThemeMode | null;
  setPreviewState: (state: ThemeMode | null) => void;
  isComfortMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeStyle, setThemeStyleState] = useState<ThemeStyle>('warm-minimal');
  const [previewState, setPreviewState] = useState<ThemeMode | null>(null);

  // Consume database settings as the source of truth for autoComfortMode (auto_theme)
  const { settings, updateSettings } = useCycleSettings();
  const autoComfortMode = settings.auto_theme ?? true;

  useEffect(() => {
    // Read persisted theme style preference from localStorage cache on initial render
    const savedStyle = localStorage.getItem('lunara-style-pref') as ThemeStyle | null;
    if (savedStyle) {
      setThemeStyleState(savedStyle);
    }
  }, []);

  const setThemeStyle = (newStyle: ThemeStyle) => {
    setThemeStyleState(newStyle);
    localStorage.setItem('lunara-style-pref', newStyle);
  };

  const setAutoComfortMode = async (enabled: boolean) => {
    await updateSettings({ auto_theme: enabled });
  };

  // Determine effective cycle state for the UI
  // Note: We leave phase determination to the cycle engine/hooks in components,
  // but allow preview overrides when user toggles previews in Settings.
  const activeCycleState: ThemeMode = previewState || 'normal';
  const isComfortMode = activeCycleState === 'comfort';

  useEffect(() => {
    // Set DOM attributes for CSS styling
    const root = document.documentElement;
    root.setAttribute('data-style', themeStyle);
    root.setAttribute('data-cycle-state', activeCycleState);

    // Backward compatibility for existing data-theme attribute
    if (activeCycleState === 'comfort') {
      root.setAttribute('data-theme', 'comfort');
    } else if (activeCycleState !== 'normal') {
      root.setAttribute('data-theme', activeCycleState);
    } else {
      root.removeAttribute('data-theme');
    }
  }, [themeStyle, activeCycleState]);

  return (
    <ThemeContext.Provider
      value={{
        themeStyle,
        setThemeStyle,
        autoComfortMode,
        setAutoComfortMode,
        effectiveCycleState: activeCycleState,
        previewState,
        setPreviewState,
        isComfortMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
