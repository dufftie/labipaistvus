import React, { cache } from 'react';
import { fetchData } from '@/lib/services/api';
import { MediaData } from '@/types/article';
import LandingLayout from '@/components/layouts/landing-layout';

const getMediaList = cache(async () => {
  return fetchData<{
    media: MediaData[];
  }>(
    `/media`,
    undefined,
    { next: { revalidate: 3600 } }
  );
});

const getArticlesStats = cache(async () => {
  return fetchData<{
    total_articles: number;
    total_sentiments: number;
  }>(
    `/articles/stats`,
    undefined,
    { next: { revalidate: 3600 } }
  );
});

export default async function Home() {
  try {
    const [mediaResponse, stats] = await Promise.all([
      getMediaList(),
      getArticlesStats()
    ]);

    return <LandingLayout stats={stats} media={mediaResponse.media} />;
  } catch (error) {
    console.error('Error fetching data:', error);
    return <div>Failed to load data</div>;
  }
}
