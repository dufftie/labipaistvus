import type { CheerioAPI } from 'cheerio';
import { serializeTextProp } from '../utils/helpers.js';
import type { MediaConfig } from '../utils/config.js';
import { trim } from 'lodash-es';
import type { Database } from '@labipaistvus/database';
import { BaseCrawler, type MediaParserConfig, type CrawlerOptions } from './BaseCrawler.js';

type ArticleInsert = Database['public']['Tables']['articles']['Insert'];

// Whitelisted sub-media types for ERR
export type ErrSubMedia = 'news' | 'rus' | null; // null = main err.ee (Estonian)

export class ErrBaseCrawler extends BaseCrawler<ErrSubMedia> {
  protected readonly ALLOWED_SUB_MEDIA: readonly ErrSubMedia[] = [null, 'news', 'rus'];

  constructor(config: MediaConfig, options?: CrawlerOptions) {
    super(config, options);
  }

  /**
   * Get ERR-specific parser configuration
   */
  protected getParserConfig(): MediaParserConfig {
    return {
      baseDomain: 'err.ee',
      urlTemplate: 'https://www.err.ee/{id}', // ERR auto-routes to correct subdomain
    };
  }

  /**
   * Get allowed sub-media types for ERR
   */
  protected getAllowedSubMedia(): readonly ErrSubMedia[] {
    return this.ALLOWED_SUB_MEDIA;
  }

  /**
   * Extract sub_media from URL (after auto-routing redirect)
   * Returns null if URL doesn't match our whitelisted sub_media exactly
   */
  protected extractSubMedia(url: string): ErrSubMedia | undefined {
    // Check for exact matches only
    if (url.match(/^https?:\/\/(www\.)?err\.ee\//)) {
      return null; // Main site - Estonian (with or without www)
    }
    if (url.match(/^https?:\/\/news\.err\.ee\//)) {
      return 'news'; // English version
    }
    if (url.match(/^https?:\/\/rus\.err\.ee\//)) {
      return 'rus'; // Russian version
    }
    // If it's any other subdomain, return undefined
    return undefined;
  }

  /**
   * Parse article page and extract content using ERR-specific selectors
   * Based on analysis of news.err.ee, rus.err.ee, and www.err.ee articles
   */
  protected parseArticle(
    $: CheerioAPI,
    url: string,
    articleId: number,
    subMedia: ErrSubMedia
  ): ArticleInsert | null {
    // Check for "Article not found" page
    // ERR returns HTTP 200 but shows "Artiklit ei leitud" message
    const bodyText = $('body').text();
    if (bodyText.includes('Artiklit ei leitud')) {
      console.log(`✗ Article ${articleId} not found (ERR 404 page)`);
      return null;
    }

    // Date time - ERR uses JSON-LD schema markup
    // Extract from script tag with type="application/ld+json"
    let date_time: string | null = null;
    $('script[type="application/ld+json"]').each((_: number, element: any) => {
      try {
        const jsonText = $(element).html();
        if (jsonText) {
          const jsonData = JSON.parse(jsonText);
          if (jsonData.datePublished) {
            date_time = jsonData.datePublished;
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    });

    if (!date_time) {
      console.warn(`Parse error - No date_time found for: ${url}`);
      return null;
    }

    // Title - ERR uses simple h1 tag
    const title = trim($('h1').first().text()) || null;

    if (!title) {
      console.warn(`No title found for: ${url}`);
      return null;
    }

    // Authors - ERR lists editors in elements with class "editor" or "editor-design"
    // Split on comma and trim each name
    const editorText = trim($('.editor').text()) || trim($('.editor-design').text());
    const authors = editorText
      ? (() => {
          const cleanedText = editorText.replace(/^(?:Editor|Редактор|Toimetaja):\s*/i, '');
          const authorsList = cleanedText.split(',').map((name) => trim(name)).filter((name) => name.length > 0);
          return authorsList.length > 0 ? authorsList : null;
        })()
      : null;

    // Paywall - ERR is a public broadcaster, no paywall
    const paywall = false;

    // Category - extract from breadcrumb links with pattern /k/...
    let category: string | null = null;
    $('a[href^="/k/"]').each((_: number, element: any) => {
      const text = trim($(element).text());
      if (text) {
        // Take the last category found (most specific)
        category = text;
      }
    });

    // Preview image - look for img tags hosted on s.err.ee or og:image meta tag
    const preview_url =
      $('img[src*="s.err.ee"]').first().attr('src') ||
      $('meta[property="og:image"]').attr('content') ||
      null;

    // Body text - ERR uses simple p tags
    const bodyParts: string[] = [];

    // Boilerplate phrases to exclude (footer content)
    const excludePatterns = [
      /^Follow ERR News/i,
      /^ERR News is the English-language service/i,
      /^Staff, contacts & comments/i,
      /^To read up on ERR News/i,
      /Следите за ERR/i, // Russian equivalent
      /^ERR-i uudiste/i, // Estonian equivalent
    ];

    // Find all p tags that contain substantial text
    $('p').each((_: number, element: any) => {
      const text = trim($(element).text());

      // Skip if too short, is editor line, or matches boilerplate patterns
      if (!text || text.length < 20) {
        return;
      }

      if (text.match(/^(?:Editor|Редактор|Toimetaja):/i)) {
        return;
      }

      // Check if it matches any exclude pattern
      const isBoilerplate = excludePatterns.some((pattern) => pattern.test(text));
      if (isBoilerplate) {
        return;
      }

      bodyParts.push(text);
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