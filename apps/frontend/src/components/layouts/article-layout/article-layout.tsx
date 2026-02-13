'use client';

import React, { useState } from 'react';
import { Descriptions } from 'antd';
import { formatDate } from '@/src/lib/utils/helpers';
import ArticlePartySentimentBarchart from '@/src/components/graphs/article-party-sentiment-barchart';
import PoliticianBarChart from '@/src/components/graphs/politician-bar-chart';
import AnalysisWidget from '@/src/components/analysis-widget';
import ModelSelect from '@/src/components/model-select';
import styles from './article-layout.module.scss';
import { ArticleData, MediaData, SentimentData } from '@/src/types/article';
import ArticleHeader from '../../article-header';
import ArticleAnalysis from '../../article-analysis';

export interface ArticleLayoutProps {
  article: ArticleData;
  media: MediaData;
  sentiments: SentimentData[];
}

export interface MetaItem {
  label: string;
  children: React.ReactNode;
}

export default function ArticleLayout({ article, media, sentiments }: ArticleLayoutProps) {
  const [selectedSentiment, setSelectedSentiment] = useState(sentiments[0] || null);

  const handleModelChange = (sentiment: typeof selectedSentiment) => {
    setSelectedSentiment(sentiment);
  };

  const partyData = selectedSentiment?.sentiment.parties || [];
  const politiciansData = selectedSentiment?.sentiment.politicians || [];
  const articleSentiment = selectedSentiment?.sentiment.article;

  const metaItems: MetaItem[] = [
    { label: 'Author', children: article.authors },
    {
      label: 'Publisher',
      children: (
        <a href={`/media/${media.slug}`} target="_blank" rel="noopener noreferrer">
          {media.title}
        </a>
      ),
    },
    { label: 'Category', children: article.category },
    { label: 'Published at', children: formatDate(article.date_time) },
    { label: 'Scanned at', children: formatDate(article.created_at) },
  ];

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <div className={styles.articleHeader}>
          <ArticleHeader article={article} />
        </div>

        <div className={styles.meta}>
          <Descriptions column={1} items={metaItems} />
          <ModelSelect
            sentiments={sentiments}
            selectedSentiment={selectedSentiment}
            onModelChange={handleModelChange}
          />
        </div>
      </div>

      {articleSentiment && (
        <div className={styles.analysis}>
          <ArticleAnalysis
            title_score={articleSentiment.title_score}
            title_explanation={articleSentiment.title_explanation}
            body_score={articleSentiment.body_score}
            body_explanation={articleSentiment.body_explanation}
          />
        </div>
      )}

      <div className={styles.analysis}>
        <AnalysisWidget
          title="Parties sentiment"
          data={partyData}
          chart={<ArticlePartySentimentBarchart parties={partyData} />}
        />
        <AnalysisWidget
          title="Politicians sentiment"
          data={politiciansData}
          chart={<PoliticianBarChart politicians={politiciansData} />}
        />
      </div>
    </div>
  );
}
