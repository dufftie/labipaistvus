import type { CheerioAPI } from 'cheerio';
import { serializeTextProp } from '../utils/helpers.js';
import type { MediaConfig } from '../utils/config.js';
import { trim } from 'lodash-es';
import type { Database } from '@labipaistvus/database';
import { BaseCrawler, type MediaParserConfig, type CrawlerOptions } from './BaseCrawler.js';

type ArticleInsert = Database['public']['Tables']['articles']['Insert'];

// Whitelisted sub-media types for Postimees
export type PostimeesSubMedia = 'rus' | 'arvamus' | null; // null = main postimees.ee

export class PostimeesBaseCrawler extends BaseCrawler<PostimeesSubMedia> {
  protected readonly ALLOWED_SUB_MEDIA: readonly PostimeesSubMedia[] = [null, 'rus', 'arvamus'];

  constructor(config: MediaConfig, options?: CrawlerOptions) {
    super(config, options);
  }

  /**
   * Get Postimees-specific parser configuration
   */
  protected getParserConfig(): MediaParserConfig {
    return {
      baseDomain: 'postimees.ee',
      urlTemplate: 'https://postimees.ee/{id}',
    };
  }

  /**
   * Get allowed sub-media types for Postimees
   */
  protected getAllowedSubMedia(): readonly PostimeesSubMedia[] {
    return this.ALLOWED_SUB_MEDIA;
  }

  /**
   * Extract sub_media from URL (after auto-routing redirect)
   * Returns null if URL doesn't match our whitelisted sub_media exactly
   */
  protected extractSubMedia(url: string): PostimeesSubMedia | undefined {
    // Check for exact matches only
    if (url.match(/^https?:\/\/(www\.)?postimees\.ee\//)) {
      return null; // Main site (with or without www)
    }
    if (url.match(/^https?:\/\/rus\.postimees\.ee\//)) {
      return 'rus';
    }
    if (url.match(/^https?:\/\/arvamus\.postimees\.ee\//)) {
      return 'arvamus';
    }
    // If it's any other subdomain (kultuur, sport, etc.), return undefined
    return undefined;
  }

  /**
   * Parse article page and extract content using Postimees-specific selectors
   */
  protected parseArticle(
    $: CheerioAPI,
    url: string,
    articleId: number,
    subMedia: PostimeesSubMedia
  ): ArticleInsert | null {
    // Date time
    const date_time = $('.article__publish-date').attr('content');
    if (!date_time) {
      console.warn(`No date_time found for: ${url}`);
      return null;
    }

    // Title (try two selectors)
    let title = trim($('.article__headline').text()) || null;
    if (!title) {
      title = trim($('.article-superheader__headline').text()) || null;
    }
    if (!title) {
      console.warn(`No title found for: ${url}`);
      return null;
    }

    // Authors
    const authors = trim($('.author .author__name').text()) || null;

    // Paywall (presence check - detects premium badge in breadcrumb)
    const paywall = $('section.root.breadcrumb ul.breadcrumb__items .button-m--premium').length > 0;

    // Category
    const category = trim($('ul.breadcrumb__items li.breadcrumb-item:last-child a').text()) || null;

    // Preview image
    const preview_url = $('.figure__image-wrapper img').attr('src') || null;

    // Body text
    const bodyParts: string[] = [];
    $('.article-body-content p').each((_: number, element: any) => {
      const text = $(element).text();
      if (text) {
        bodyParts.push(text);
      }
    });
    const body = serializeTextProp(bodyParts);

    if (!body) {
      console.warn(`No body content found for: ${url}`);
      return null;
    }

    return {
      article_id: articleId,
      media_id: this.config.id,
      sub_media: subMedia,
      url,
      title,
      date_time,
      authors,
      paywall,
      category,
      preview_url,
      body,
    };
  }
}