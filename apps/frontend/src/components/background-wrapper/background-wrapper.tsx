'use client';

import React from 'react';
import { useTheme } from '@/src/contexts/theme-context';
import Beams from '@/components/beams';
import styles from './background-wrapper.module.scss';

export default function BackgroundWrapper() {
  const { theme } = useTheme();

  if (theme !== 'dark') {
    return null;
  }

  return (
    <div className={styles.background}>
      <Beams
        beamWidth={15}
        beamHeight={15}
        beamNumber={5}
        lightColor="#bbdbf5"
        speed={4}
        rotation={260}
      />
    </div>
  );
} 