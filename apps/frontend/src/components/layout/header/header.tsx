'use client';

import Link from 'next/link';
import SupportButton from '@/components/support-button';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import styles from './header.module.scss';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  // TODO: Refactor this to be more smoother and more modern
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Ä
        </Link>
        <div className={styles.menu}>
          <Link href="/articles">
            <Button type="text">Articles</Button>
          </Link>
          <Link href="/media">
            <Button type="text">Media</Button>
          </Link>
          <Link href="/about">
            <Button type="text">About</Button>
          </Link>
        </div>
        <SupportButton />
      </div>
    </header>
  );
}
