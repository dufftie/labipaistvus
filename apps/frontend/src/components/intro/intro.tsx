'use client';

import React from 'react';
import styles from './intro.module.scss';
import BlurText from '@/components/blur-text';

const Intro = () => {
  return (
    <div className={styles.intro}>
      <BlurText
        text="Läbipaistvus"
        delay={10}
        animateBy="letters"
        direction="top"
        className={styles.title}
      />

      <BlurText
        text="an independent non-profit organization focused on making media biases in Estonia transparent."
        delay={50}
        animateBy="words"
        direction="top"
        className={styles.description}
      />
    </div>
  );
};

export default Intro;
