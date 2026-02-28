-- Article relevancy classification table
-- Binary classification: relevant or irrelevant for political analysis

CREATE TABLE article_relevancy (
    id SERIAL PRIMARY KEY,
    ref_id INTEGER NOT NULL UNIQUE REFERENCES articles(id) ON DELETE CASCADE,

    is_relevant BOOLEAN NOT NULL,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX ix_article_relevancy_is_relevant ON article_relevancy(is_relevant);
CREATE INDEX ix_article_relevancy_created_at ON article_relevancy(created_at DESC);

COMMENT ON TABLE article_relevancy IS 'Binary classification: relevant or irrelevant for political analysis';