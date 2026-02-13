import MediaSelect from '@/components/media-select/media-select';
import { fetchData } from '@/lib/services/api';
import { MediaData } from '@/types/article';

export default async function Home() {
  const { media } = await fetchData<{
    media: MediaData[];
  }>(`/media`);

  return (
    <div className='medias-layout'>
      <MediaSelect media={media} primary />
    </div>
  );
}
