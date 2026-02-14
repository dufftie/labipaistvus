-- Fix unique constraint on articles table
-- Change from (article_id, media_id, sub_media) to (media_id, article_id)

-- Drop the old constraint that includes sub_media
ALTER TABLE articles DROP CONSTRAINT IF EXISTS uq_article_media_sub;

-- Add new unique constraint on just (media_id, article_id)
ALTER TABLE articles ADD CONSTRAINT uq_media_article UNIQUE (media_id, article_id);