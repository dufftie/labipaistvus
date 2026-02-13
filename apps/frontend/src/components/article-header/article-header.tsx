import React from 'react';

import ArticlePreview from '@/src/components/article-preview';
import { ArticleData } from '@/src/types/article';
import styles from './article-header.module.scss';

interface ArticleHeaderProps {
  article: ArticleData;
}

export default function ArticleHeader({ article }: ArticleHeaderProps) {
  const { title, url, preview_url } = article;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.header}>
      <article>
        <span className={styles.title}>{title}</span>
        <ArticlePreview preview_url={preview_url} />
      </article>
    </a>
  );
}
