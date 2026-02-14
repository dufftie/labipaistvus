import { supabase, type Tables } from '@labipaistvus/database';

type ArticleInsert = Tables<'articles'>['Insert'];
type ArticleRow = Tables<'articles'>['Row'];

export class ArticleStorage {
  /**
   * Insert or update article in database using upsert
   */
  async insertOrUpdateArticle(article: ArticleInsert): Promise<ArticleRow> {
    const { data, error } = await supabase
      .from('articles')
      .insert(article)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert article: ${error.message}`);
    }

    return data;
  }

  /**
   * Check if article exists by URL
   */
  async articleExists(url: string): Promise<boolean> {
    const { data } = await supabase
      .from('articles')
      .select('id')
      .eq('url', url)
      .limit(1)
      .maybeSingle();

    return data !== null;
  }

  /**
   * Get highest article_id for a media across all sub_media to resume from
   * Note: article_id is shared across sub_media, so we get the max from all of them
   */
  async getMaxArticleId(mediaId: number): Promise<number> {
    const { data, error } = await supabase
      .from('articles')
      .select('article_id')
      .eq('media_id', mediaId)
      .order('article_id', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get max article_id: ${error.message}`);
    }

    return data?.article_id || 0;
  }

  /**
   * Get list of article IDs that already exist in database for a given media
   * Useful for batch processing to avoid requesting articles we already have
   */
  async getExistingArticleIds(mediaId: number, articleIds: number[]): Promise<number[]> {
    if (articleIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('articles')
      .select('article_id')
      .eq('media_id', mediaId)
      .in('article_id', articleIds);

    if (error) {
      throw new Error(`Failed to get existing article IDs: ${error.message}`);
    }

    return data?.map((row) => row.article_id) || [];
  }
}