'use client';

import React from 'react';
import { useTheme } from '@/src/contexts/theme-context';
import { ConfigProvider } from 'antd';
import antDesignTheme from '@/src/config/antDesignTheme';
import darkTheme from '@/src/config/darkTheme';
import styles from './theme-wrapper.module.scss';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

const ThemeWrapper = ({ children }: ThemeWrapperProps) => {
  const { theme } = useTheme();

  return (
    <div className={`${styles.themeWrapper} ${styles[theme]}`}>
      <ConfigProvider theme={theme === 'dark' ? darkTheme : antDesignTheme}>
        {children}
      </ConfigProvider>
    </div>
  );
};

export default ThemeWrapper; 