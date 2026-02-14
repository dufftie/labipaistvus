-- Initial schema migration - Focus on scraping only
-- Creates tables for news media sources and articles

-- Create news_media table
CREATE TABLE news_media (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    base_url VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    language_code VARCHAR(8)
);

-- Create articles table
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL,
    media_id INTEGER NOT NULL REFERENCES news_media(id),
    sub_media VARCHAR(50),
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    authors TEXT[],
    paywall BOOLEAN NOT NULL,
    category VARCHAR(100),
    preview_url VARCHAR(255),
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_article_media_sub UNIQUE (article_id, media_id, sub_media)
);

COMMENT ON COLUMN articles.sub_media IS 'Subdomain/language edition: NULL for main postimees.ee, "rus" for rus.postimees.ee, "arvamus" for arvamus.postimees.ee';

-- Create index on articles title for faster searches
CREATE INDEX ix_articles_title ON articles(title);

-- Create index on articles date_time for sorting
CREATE INDEX ix_articles_date_time ON articles(date_time DESC);

-- Insert initial media source (Postimees with sub-media support)
INSERT INTO news_media (id, title, base_url, slug, language_code, description) VALUES
(1, 'Postimees', 'https://postimees.ee', 'postimees', 'et', 'Estonian news media with multiple language editions (main site, rus, arvamus)');
