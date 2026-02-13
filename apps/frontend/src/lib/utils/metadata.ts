import { Metadata } from 'next';

export interface PageMetadataProps {
  title: string;
  description?: string;
  image?: string;
}

export const generatePageMetadata = async ({
  title,
  description,
  image,
}: PageMetadataProps): Promise<Metadata> => {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}; 