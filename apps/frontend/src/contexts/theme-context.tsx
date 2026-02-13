'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Set dark theme for main page (root path)
    if (pathname === '/') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, [pathname]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 