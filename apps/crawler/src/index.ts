#!/usr/bin/env node
import "dotenv/config";
import { Configuration } from "crawlee";
import {
  PostimeesBaseCrawler,
  ErrBaseCrawler,
  type BaseCrawler, DelfiBaseCrawler,
} from "./crawlers";
import { getMediaConfig, MEDIA_SLUG, MediaConfig } from "./utils/config.js";

// Configure Crawlee to use memory storage instead of files
Configuration.getGlobalConfig().set("purgeOnStart", true);
Configuration.getGlobalConfig().set("persistStorage", false);

/**
 * Factory function to create the appropriate crawler based on media slug
 */
function createCrawler(
  mediaSlug: MEDIA_SLUG,
  config: MediaConfig,
  options?: any,
): BaseCrawler {
  switch (mediaSlug) {
    case "delfi":
      return new DelfiBaseCrawler(config, options);
    case "postimees":
      return new PostimeesBaseCrawler(config, options);
    case "err":
      return new ErrBaseCrawler(config, options);
    default:
      throw new Error(
        `Unknown media slug: ${mediaSlug}. Supported: postimees, err`,
      );
  }
}

async function main() {
  const args = process.argv.slice(2);

  const mediaArg = args.find((arg) => arg.startsWith("--media="));
  if (!mediaArg) {
    console.error("Error: --media parameter is required");
    console.log(
      "Usage: pnpm crawl --media=<slug> [--start=<article_id>] [--reverse] [--max-failures=<number>]",
    );
    process.exit(1);
  }

  const mediaSlug = mediaArg.split("=")[1] as MEDIA_SLUG;
  const startArg = args.find((arg) => arg.startsWith("--start="));
  const startFromId = startArg ? parseInt(startArg.split("=")[1]) : undefined;
  const reverse = args.includes("--reverse");
  const maxFailuresArg = args.find((arg) => arg.startsWith("--max-failures="));
  const maxConsecutiveFailures = maxFailuresArg
    ? parseInt(maxFailuresArg.split("=")[1])
    : undefined;

  console.log(`Starting crawler for media: ${mediaSlug}`);
  if (startFromId) {
    console.log(`Starting from article ID: ${startFromId}`);
  }
  if (reverse) {
    console.log(`Mode: Reverse crawling (newest to oldest)`);
  }
  if (maxConsecutiveFailures) {
    console.log(`Max consecutive failures: ${maxConsecutiveFailures}`);
  }

  try {
    // Load media config from database
    const config = await getMediaConfig(mediaSlug);

    // Create the appropriate crawler based on media type
    const crawlerOptions = {
      maxConsecutiveFailures,
    };
    const crawler = createCrawler(mediaSlug, config, crawlerOptions);
    await crawler.run(startFromId, reverse);
  } catch (error) {
    console.error("Crawler failed:", error);
    process.exit(1);
  }
}

main();
