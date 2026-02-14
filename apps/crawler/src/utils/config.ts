import 'dotenv/config';
import { supabase, type Tables } from '@labipaistvus/database';

export type MediaConfig = Tables<'news_media'>['Row'];

/**
 * Load media configuration from database by slug
 */
export async function getMediaConfig(slug: string): Promise<MediaConfig> {
  const { data, error } = await supabase
    .from('news_media')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    throw new Error(`Media not found for slug: ${slug}. Error: ${error?.message}`);
  }

  return data;
}