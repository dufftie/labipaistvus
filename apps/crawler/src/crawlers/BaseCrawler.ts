import { CheerioCrawler } from 'crawlee';
import type { CheerioAPI } from 'cheerio';
import { ArticleStorage } from '../storage/ArticleStorage.js';
import type { MediaConfig } from '../utils/config.js';
import type { Database } from '@labipaistvus/database';

type ArticleInsert = Database['public']['Tables']['articles']['Insert'];

/**
 * Result of processing a single article
 */
export interface ArticleProcessResult {
  success: boolean;
  skipped: boolean; // Article exists or irrelevant
  skipReason?: 'exists' | 'irrelevant' | 'wrong_domain';
  articleId: number;
  error?: string;
}

/**
 * Configuration for media-specific parsing
 */
export interface MediaParserConfig {
  /** Base domain for the media (e.g., 'postimees.ee', 'err.ee') */
  baseDomain: string;
  /** URL template for article IDs (e.g., 'https://postimees.ee/{id}') */
  urlTemplate: string;
}

/**
 * Configuration options for crawler behavior
 */
export interface CrawlerOptions {
  maxConsecutiveFailures?: number;
  batchSize?: number;
}

/**
 * Abstract base crawler for Estonian news media
 * Handles common crawling logic while allowing media-specific implementations
 */
export abstract class BaseCrawler<TSubMedia extends string | null = string | null> {
  protected storage: ArticleStorage;
  protected config: MediaConfig;
  protected consecutiveFailures = 0;
  protected readonly MAX_CONSECUTIVE_FAILURES: number;
  protected readonly BATCH_SIZE: number;

  constructor(config: MediaConfig, options: CrawlerOptions = {}) {
    this.config = config;
    this.storage = new ArticleStorage();
    this.MAX_CONSECUTIVE_FAILURES = options.maxConsecutiveFailures ?? 20;
    this.BATCH_SIZE = options.batchSize ?? 20;
  }

  /**
   * Get media-specific parser configuration
   */
  protected abstract getParserConfig(): MediaParserConfig;

  /**
   * Get allowed sub-media types for this media
   */
  protected abstract getAllowedSubMedia(): readonly TSubMedia[];

  /**
   * Extract sub_media from URL (after auto-routing redirect)
   * @returns sub_media value, or undefined if URL doesn't match allowed sub-media
   */
  protected abstract extractSubMedia(url: string): TSubMedia | undefined;

  /**
   * Parse article page and extract content
   * @returns ArticleInsert object or null if parsing failed
   */
  protected abstract parseArticle(
    $: CheerioAPI,
    url: string,
    articleId: number,
    subMedia: TSubMedia
  ): ArticleInsert | null;

  /**
   * Check if URL is on the correct domain (after redirects)
   */
  protected isCorrectDomain(url: string): boolean {
    const config = this.getParserConfig();
    const domainPattern = config.baseDomain.replace(/\./g, '\\.');
    const regex = new RegExp(`https?://(?:[\\w-]+\\.)?${domainPattern}`);
    return regex.test(url);
  }

  /**
   * Generate URL for article ID
   */
  protected getArticleUrl(articleId: number): string {
    const config = this.getParserConfig();
    return config.urlTemplate.replace('{id}', articleId.toString());
  }

  /**
   * Process a batch of article IDs
   */
  protected async processBatch(startId: number, batchSize: number): Promise<{
    successCount: number;
    skipCount: number;
    failureCount: number;
  }> {
    // Check which articles already exist in database
    const articleIds = Array.from({ length: batchSize }, (_, i) => startId + i);
    const existingIds = await this.storage.getExistingArticleIds(this.config.id, articleIds);
    const existingIdsSet = new Set(existingIds);

    // Generate URLs only for articles that don't exist
    const requests: Array<{ url: string; articleId: number; skipReason?: string }> = [];

    for (let i = 0; i < batchSize; i++) {
      const articleId = startId + i;

      if (existingIdsSet.has(articleId)) {
        // Mark as skipped (we'll count it but not request it)
        requests.push({
          url: '', // Empty URL since we won't request it
          articleId,
          skipReason: 'exists',
        });
      } else {
        requests.push({
          url: this.getArticleUrl(articleId),
          articleId,
        });
      }
    }

    let successCount = 0;
    let skipCount = 0;
    let failureCount = 0;

    // Process skipped articles (already exist)
    const skippedRequests = requests.filter((r) => r.skipReason === 'exists');
    skipCount += skippedRequests.length;
    if (skippedRequests.length > 0) {
      const skippedIds = skippedRequests.map((r) => r.articleId).join(', ');
      console.log(`⊙ Skipped ${skippedRequests.length} existing articles: ${skippedIds}`);
    }

    // Filter out skipped requests
    const requestsToProcess = requests.filter((r) => !r.skipReason);

    if (requestsToProcess.length === 0) {
      // All articles already exist
      return { successCount, skipCount, failureCount };
    }

    // Bind this context for use in requestHandler
    const self = this;

    const crawler = new CheerioCrawler({
      maxConcurrency: 5, // Reduce concurrency to avoid rate limiting
      maxRequestRetries: 2,
      useSessionPool: true, // Enable session management for better Cloudflare handling
      persistCookiesPerSession: true,
      requestHandlerTimeoutSecs: 60,

      // Add browser-like headers to avoid bot detection
      preNavigationHooks: [
        async ({ request }) => {
          request.headers = {
            ...request.headers,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,et;q=0.8,ru;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
          };
        },
      ],

      async requestHandler({ $, request, response }) {
        const { articleId } = request.userData as any;

        // Check for 404 or similar errors
        if (response?.statusCode && response.statusCode >= 400) {
          failureCount++;
          console.log(`✗ Article ${articleId} not found (${response.statusCode})`);
          return;
        }

        // Extract final URL (after auto-routing redirects)
        const finalUrl = response?.url || request.url;

        // Check if URL is still on correct domain
        if (!self.isCorrectDomain(finalUrl)) {
          // Redirected to a different domain, skip but don't count as failure
          const domain = finalUrl.match(/https?:\/\/([^/]+)/)?.[1] || 'unknown';
          console.log(`⊘ Article ${articleId} redirected to different domain: ${domain}`);
          skipCount++;
          return;
        }

        const subMedia = self.extractSubMedia(finalUrl);

        // Check if the sub_media is whitelisted (undefined means not whitelisted)
        if (subMedia === undefined) {
          // Article belongs to a subdomain we're not interested in - skip but don't count as failure
          const subdomain = finalUrl.match(/https?:\/\/([^.]+)\./)?.[1] || 'unknown';
          console.log(`⊘ Article ${articleId} on irrelevant subdomain: ${subdomain}`);
          skipCount++;
          return;
        }

        if (!self.getAllowedSubMedia().includes(subMedia)) {
          // This shouldn't happen given the extractSubMedia logic, but keep as safety check
          skipCount++;
          return;
        }

        // Parse article
        const articleData = self.parseArticle($, finalUrl, articleId, subMedia);
        if (articleData) {
          try {
            await self.storage.insertOrUpdateArticle(articleData);
            successCount++;
            const subMediaLabel = subMedia === null ? 'main' : subMedia;
            console.log(`✓ Saved article ${articleId} [${subMediaLabel}]: ${articleData.title}`);
          } catch (error) {
            console.error(`Failed to save article ${articleId}: ${error}`);
            failureCount++;
          }
        } else {
          // Parse failed - this is a real failure
          failureCount++;
          console.log(`✗ Failed to parse article ${articleId}`);
        }
      },

      failedRequestHandler({ request }) {
        const { articleId } = request.userData as any;
        failureCount++;
        console.log(`✗ Request failed for article ${articleId}`);
      },
    });

    await crawler.run(
      requestsToProcess.map(({ url, articleId }) => ({
        url,
        userData: { articleId },
      }))
    );

    // Update consecutive failures counter
    // Only count as consecutive failure if ALL non-skipped requests failed
    const totalProcessed = requestsToProcess.length;
    if (totalProcessed > 0 && failureCount === totalProcessed) {
      this.consecutiveFailures += failureCount;
    } else if (successCount > 0) {
      // Reset on any success
      this.consecutiveFailures = 0;
    }

    return { successCount, skipCount, failureCount };
  }

  /**
   * Start crawling from specified ID or resume from last known article ID
   * @param startFromId - Starting article ID
   * @param reverse - If true, crawl backwards (decrementing IDs)
   */
  async run(startFromId?: number, reverse: boolean = false): Promise<void> {
    console.log(`Starting crawler for: ${this.config.title}`);
    console.log(`Direction: ${reverse ? 'Reverse (newest to oldest)' : 'Forward (oldest to newest)'}`);

    let currentId: number;

    if (startFromId !== undefined) {
      currentId = startFromId;
      console.log(`Starting from specified article ID: ${currentId}`);
    } else {
      // Fall back to highest article_id from database
      const maxArticleId = await this.storage.getMaxArticleId(this.config.id);
      currentId = maxArticleId > 0 ? maxArticleId + 1 : 1;
      console.log(`Resuming from database, article ID: ${currentId}`);
    }

    let totalScraped = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    while (this.consecutiveFailures < this.MAX_CONSECUTIVE_FAILURES && currentId > 0) {
      console.log(`\n📦 Processing batch starting at ID ${currentId}...`);

      const { successCount, skipCount, failureCount } = await this.processBatch(
        currentId,
        this.BATCH_SIZE
      );

      totalScraped += successCount;
      totalSkipped += skipCount;
      totalFailed += failureCount;

      console.log(
        `Batch complete: ${successCount} saved, ${skipCount} skipped, ${failureCount} failed`
      );
      console.log(`Consecutive failures: ${this.consecutiveFailures}/${this.MAX_CONSECUTIVE_FAILURES}`);

      // Move to next batch (forward or reverse)
      if (reverse) {
        currentId -= this.BATCH_SIZE;
      } else {
        currentId += this.BATCH_SIZE;
      }

      // Delay between batches to avoid rate limiting (2-4 seconds)
      const delay = 2000 + Math.random() * 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const stopReason = this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES
      ? `${this.MAX_CONSECUTIVE_FAILURES} consecutive failures`
      : 'Reached ID 0 or below';

    console.log(`\n✅ Crawler finished!`);
    console.log(`Total articles saved: ${totalScraped}`);
    console.log(`Total articles skipped: ${totalSkipped}`);
    console.log(`Total failures: ${totalFailed}`);
    console.log(`Last processed batch started at ID: ${reverse ? currentId + this.BATCH_SIZE : currentId - this.BATCH_SIZE}`);
    console.log(`Reason for stopping: ${stopReason}`);
  }
}