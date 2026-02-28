CREATE VIEW article_relevancy_preview AS
SELECT
    a.id,
    a.title,
    a.body,
    ar.is_relevant AS is_relevant,
    ar.created_at AS classified_at
FROM articles a
LEFT JOIN article_relevancy ar ON ar.ref_id = a.id;