import React from 'react';
import styles from './footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.container}>
      <div className={styles.menu}>
        <a href="/how">How do we analyse articles?</a>
        <a href="/about">About us</a>
        <a href="/support">Support</a>
        <a href="/contribute">We are open source!</a>
      </div>
      <div className={styles.logo}>
        Läbipaistvus <span>MTÜ</span>
        <div className={styles.gradient} />
      </div>
    </footer>
  );
}
