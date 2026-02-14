# Labipaistvus Crawler

Web crawler for scraping Estonian news articles using Crawlee.

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Ensure database has media records:**
   - Media should exist in `news_media` table with proper slugs (e.g., 'rus-postimees')

## Usage

### Local Development

Run crawler for any media by slug:
```bash
# Russian Postimees
pnpm crawl --media=rus-postimees

# Estonian Postimees (when implemented)
pnpm crawl --media=postimees

# With starting article ID
pnpm crawl --media=rus-postimees --start=8415550
```

### Development with Watch Mode

```bash
pnpm dev -- --media=rus-postimees
```

### Production

Build and run:
```bash
pnpm build
node dist/index.js --media=rus-postimees --start=8415550
```

## Architecture

- **PostimeesBaseCrawler** - Abstract base class for Postimees sites
- **RusPostimeesCrawler** - Russian Postimees implementation
- **ArticleStorage** - Database operations via Supabase
- **Config** - Loads media configuration from database

## How It Works

Instead of scraping search pages, the crawler uses **incremental article IDs**:

1. Queries database for highest `article_id` for the media
2. Starts from that ID + 1
3. Generates URLs directly: `https://rus.postimees.ee/{articleId}`
4. Processes 20 articles concurrently per batch
5. Stops after 20 consecutive failures (404s)

## Features

- ✅ **Incremental crawling** - Resumes from last scraped article
- ✅ **Batch processing** - 20 articles at a time in parallel
- ✅ **Auto-stop** - Stops after 20 consecutive 404s
- ✅ **Duplicate detection** - Upserts with conflict resolution
- ✅ **Concurrent requests** - 20 per batch
- ✅ **Automatic retries** - 2x per request

## Configuration

Minimal configuration needed in `news_media` table:
- `slug` - Media identifier (e.g., 'rus-postimees')
- `id` - Used to track which articles belong to which media
- `title` - Display name