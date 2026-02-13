import React, { cache } from 'react';
import { fetchData } from '@/src/lib/services/api';
import { MediaData } from '@/src/types/article';
import { Metadata } from 'next';
import MediaLayout from '@/src/components/layouts/media-layout/media-layout';
import ErrorResult from '@/src/components/error/error-result';
import { generatePageMetadata } from '@/src/lib/utils/metadata';

const getMediaData = cache(async (media_slug: string) => {
  return fetchData<{
    media: MediaData;
    analyzed_count: number;
    total_count: number;
  }>(`/media/${media_slug}`, undefined, {
    next: { revalidate: 3600 },
  });
});

export async function generateMetadata({ params }: {
  params: Promise<{ media_slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  
  try {
    const { media } = await getMediaData(resolvedParams.media_slug);
    if (!media) return {};

    return generatePageMetadata({
      title: media.title,
    });
  } catch (error) {
    console.error('Error fetching media data for metadata:', error);
    return {};
  }
}

export default async function MediaDetailPage({ params }: { 
  params: Promise<{ media_slug: string }>;
}) {
  const { media_slug } = await params;

  try {
    const response = await getMediaData(media_slug);

    if (!response) {
      return <ErrorResult 
        status="404" 
        title="Media not found" 
        subTitle="The media you are looking for does not exist."
      />;
    }

    return <MediaLayout {...response} />;
  } catch (error) {
    console.error('Error fetching media data:', error);
    return <ErrorResult 
      status="error" 
      title="Failed to load media data" 
      subTitle="There was an error loading the media data. Please try again later."
    />;
  }
}
