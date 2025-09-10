'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      return '🖥️';
    } else if (theme === 'light') {
      return '☀️';
    } else {
      return '🌙';
    }
  };

  const getThemeLabel = () => {
    if (theme === 'system') {
      return `System (${resolvedTheme})`;
    } else if (theme === 'light') {
      return 'Light';
    } else {
      return 'Dark';
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={cycleTheme}
      className="flex items-center gap-2"
      title={`Current theme: ${getThemeLabel()}`}
    >
      <span className="text-lg">{getThemeIcon()}</span>
      <span className="hidden sm:inline text-sm">{getThemeLabel()}</span>
    </Button>
  );
};
