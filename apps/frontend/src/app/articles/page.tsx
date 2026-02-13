import React, { cache } from 'react';
import { fetchData } from '@/src/lib/services/api';
import ArticlesLayout from '@/src/components/layouts/articles-layout/articles-layout';
import ErrorResult from '@/src/components/error/error-result';

interface ArticlesStats {
  total_articles: number;
  total_sentiments: number;
}

const getArticlesStats = cache(async () => {
  return fetchData<ArticlesStats>(
    `/articles/stats`,
    undefined,
    { next: { revalidate: 3600 } }
  );
});

export default async function ArticlesPage() {
  try {
    const stats = await getArticlesStats();
    return <ArticlesLayout {...stats} />;
  } catch (error) {
    console.error('Error fetching articles stats:', error);
    return (
      <ErrorResult
        status="error"
        title="Failed to load articles data"
        subTitle="There was an error loading the articles data. Please try again later."
      />
    );
  }
}
