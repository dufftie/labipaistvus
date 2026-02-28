import type { CheerioAPI } from "crawlee";
import { serializeTextProp } from "../utils/helpers.js";
import type { MediaConfig } from "../utils/config.js";
import { trim } from "lodash-es";
import type { Database } from "@labipaistvus/database";
import {
  BaseCrawler,
  type MediaParserConfig,
  type CrawlerOptions,
} from "./base-crawler.js";

type ArticleInsert = Database["public"]["Tables"]["articles"]["Insert"];

// Whitelisted sub-media types for Delfi
export type DelfiSubMedia = "rus" | "arvamus" | "ekspress" | null; // null = main delfi.ee (Estonian)

export class DelfiBaseCrawler extends BaseCrawler<DelfiSubMedia> {
  protected readonly ALLOWED_SUB_MEDIA: readonly DelfiSubMedia[] = [
    null,
    "rus",
    "arvamus",
    "ekspress",
  ];

  constructor(config: MediaConfig, options?: CrawlerOptions) {
    super(config, options);
  }

  /**
   * Get Delfi-specific parser configuration
   */
  protected getParserConfig(): MediaParserConfig {
    return {
      baseDomain: "delfi.ee",
      urlTemplate: "https://delfi.ee/{id}", // Delfi auto-routes to correct subdomain
    };
  }

  /**
   * Get allowed sub-media types for Delfi
   */
  protected getAllowedSubMedia(): readonly DelfiSubMedia[] {
    return this.ALLOWED_SUB_MEDIA;
  }

  /**
   * Extract sub_media from URL (after auto-routing redirect)
   * Returns undefined if URL doesn't match our whitelisted sub_media exactly
   */
  protected extractSubMedia(url: string): DelfiSubMedia | undefined {
    if (url.match(/^https?:\/\/(www\.)?delfi\.ee\//)) {
      return null; // Main site - Estonian (with or without www)
    }
    if (url.match(/^https?:\/\/rus\.delfi\.ee\//)) {
      return "rus"; // Russian version
    }
    if (url.match(/^https?:\/\/arvamus\.delfi\.ee\//)) {
      return "arvamus"; // Opinion section
    }
    if (url.match(/^https?:\/\/ekspress\.delfi\.ee\//)) {
      return "ekspress"; // Opinion section
    }
    // Any other subdomain (sport, auto, naine, etc.) - return undefined
    return undefined;
  }

  /**
   * Parse article page and extract content using Delfi-specific selectors
   * Based on analysis of www.delfi.ee, rus.delfi.ee, and arvamus.delfi.ee articles
   */
  protected parseArticle(
    $: CheerioAPI,
    url: string,
    articleId: number,
    subMedia: DelfiSubMedia,
  ): ArticleInsert | null {
    // Date time - Delfi embeds ISO 8601 publish time in cXenseParse meta tag
    const date_time =
      $('meta[name="cXenseParse:recs:publishtime"]').attr("content") || null;
    if (!date_time) {
      console.warn(`No date_time found for: ${url}`);
      return null;
    }

    // Title - Delfi uses h1.article-info__title
    const title = trim($("h1.article-info__title").text()) || null;
    if (!title) {
      console.warn(`No title found for: ${url}`);
      return null;
    }

    // Authors - cXenseParse:author meta tag (comma-separated)
    const authorsContent = $('meta[name="cXenseParse:author"]').attr("content");
    let authors: string[] | null = null;
    if (authorsContent) {
      const authorsList = authorsContent
        .split(",")
        .map((name) => trim(name))
        .filter((name) => name.length > 0);
      authors = authorsList.length > 0 ? authorsList : null;
    }

    // Paywall - presence of .article-paywall div
    const paywall = $(".article-paywall").length > 0;

    // Category - cXenseParse:recs:category meta tag
    const category =
      $('meta[name="cXenseParse:recs:category"]').attr("content") || null;

    // Preview image - og:image meta tag
    const preview_url =
      $('meta[property="og:image"]').attr("content") || null;

    // Body text - Delfi wraps paragraphs in .fragment-html--paragraph divs
    const bodyParts: string[] = [];
    $(".fragment-html--paragraph p").each((_: number, element: any) => {
      const text = trim($(element).text());
      if (text && text.length >= 20) {
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