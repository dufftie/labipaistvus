import { supabase, type Tables } from '@labipaistvus/database';

type Article = Tables<'articles'>;

export class ArticleStorage {
  /**
   * Insert or update article in a database using upsert
   */
  async insertOrUpdateArticle(article: Article): Promise<Article> {
    const {data, error} = await supabase
    .from('articles')
    .insert(article)
    .select()
    .single();

    if (error) throw new Error(`Failed to insert article: ${ error.message }`);

    return data;
  }

  /**
   * Get the highest article_id for a media across all sub_media to resume from
   * Note: article_id is shared across sub_media, so we get the max from all of them
   */
  async getHighestArticleId(mediaId: number): Promise<number> {
    const {data, error} = await supabase
    .from('articles')
    .select('article_id')
    .eq('media_id', mediaId)
    .order('article_id', {ascending: false})
    .single();

    if (error) throw new Error(`Failed to get max article_id: ${ error.message }`);
    return data?.article_id || 0;
  }

  /**
   * Get a list of article IDs that already exist in a database for a given media
   * Useful for batch processing to avoid requesting articles we already have
   */
  async getExistingArticleIds(mediaId: number, articleIds: number[]): Promise<number[]> {
    if (articleIds.length === 0) {
      return [];
    }

    const {data, error} = await supabase
    .from('articles')
    .select('article_id')
    .eq('media_id', mediaId)
    .in('article_id', articleIds);

    if (error) {
      throw new Error(`Failed to get existing article IDs: ${ error.message }`);
    }

    return data?.map((row) => row.article_id) || [];
  }
}